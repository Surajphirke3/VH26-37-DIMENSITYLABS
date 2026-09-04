# Authentication API — MechMind

MechMind uses JWT-based authentication with short-lived access tokens and rotating refresh tokens. User accounts are created by administrators — self-registration is not available. This design reflects the factory floor deployment model where every user is a known employee.

---

## Security Design

### Password Storage

Passwords are hashed using **bcrypt** with a work factor of 12. The plaintext password is never logged, returned in responses, or stored anywhere other than in memory during the hash computation.

### Token Architecture

| Token | Lifetime | Transport | Storage |
|---|---|---|---|
| Access token (JWT) | 30 minutes | `Authorization: Bearer` header | Client memory only |
| Refresh token (opaque random string) | 7 days | HTTP-only, `Secure`, `SameSite=Strict` cookie | Server-side Redis (hashed) |

The access token is a signed JWT containing `user_id`, `email`, `role`, and `exp`. It is stateless — the server validates the signature without a database lookup on every request.

The refresh token is an opaque 256-bit random value. It is stored in Redis as `sha256(token)` → `user_id` with a TTL of 7 days. The raw token is stored in an HTTP-only cookie and never appears in a JSON response body.

### Refresh Token Rotation

Each call to `POST /auth/refresh` issues a **new** refresh token and immediately revokes the old one in Redis. If the same refresh token is presented twice (replay attack), the server detects the double-use (the token no longer exists in Redis) and invalidates all refresh tokens for that user, forcing a full re-login.

### Token Revocation on Logout

`POST /auth/logout` deletes the refresh token from Redis and clears the cookie. Access tokens cannot be revoked (stateless), so the 30-minute TTL is the effective revocation window. If immediate revocation of access tokens is required (e.g., compromised account), the admin can rotate the JWT signing secret, which invalidates all existing access tokens globally.

---

## POST /api/v1/auth/register

Create a new user account. Only administrators may invoke this endpoint — technicians cannot self-register.

**Authentication:** Required — `admin` role only

### Request

```
POST /api/v1/auth/register
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "email": "jane.doe@factory.com",
  "password": "SecureP@ssw0rd!",
  "full_name": "Jane Doe",
  "role": "technician"
}
```

#### Request Schema

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `email` | string | Yes | Valid email format, max 255 chars, must be unique | User's work email address |
| `password` | string | Yes | Min 12 chars, must contain uppercase, lowercase, digit, and special character | Initial password |
| `full_name` | string | No | Max 255 chars | Display name |
| `role` | string | No | One of: `technician`, `manager`, `admin`. Default: `technician` | User's authorization role |

### Response

```
HTTP 201 Created
```

```json
{
  "success": true,
  "data": {
    "user_id": "f6a7b8c9-d0e1-2345-fabc-678901234567",
    "email": "jane.doe@factory.com",
    "full_name": "Jane Doe",
    "role": "technician",
    "is_active": true,
    "created_at": "2026-09-04T10:00:00Z"
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

**Note:** The password is never returned in any response.

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Password does not meet complexity requirements |
| 400 | `VALIDATION_ERROR` | Email format invalid |
| 401 | `AUTH_TOKEN_EXPIRED` | Admin token expired |
| 403 | `AUTH_INSUFFICIENT_PERMISSION` | Caller is not an admin |
| 409 | `VALIDATION_ERROR` | Email address already registered |
| 422 | `VALIDATION_ERROR` | JSON schema validation failure |

---

## POST /api/v1/auth/login

Authenticate with email and password. Returns a short-lived access token in the response body and sets a refresh token cookie.

**Authentication:** None required

### Request

```
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "jane.doe@factory.com",
  "password": "SecureP@ssw0rd!"
}
```

#### Request Schema

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | Yes | Registered email address |
| `password` | string | Yes | Account password |

### Response

```
HTTP 200 OK
Set-Cookie: refresh_token=<opaque_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/api/v1/auth
```

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 1800,
    "user": {
      "user_id": "f6a7b8c9-d0e1-2345-fabc-678901234567",
      "email": "jane.doe@factory.com",
      "full_name": "Jane Doe",
      "role": "technician",
      "is_active": true,
      "last_login": "2026-09-03T14:22:00Z"
    }
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

**Cookie details:**
- `HttpOnly`: JavaScript cannot read the refresh token
- `Secure`: Only sent over HTTPS
- `SameSite=Strict`: Not sent on cross-site requests
- `Max-Age=604800`: 7 days in seconds
- `Path=/api/v1/auth`: Cookie only sent to auth endpoints

`last_login` shows the timestamp of the previous successful login (not the current one), useful for detecting unexpected access.

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_INVALID_CREDENTIALS` | Email not found or password incorrect. **Same error message for both cases** (prevents email enumeration) |
| 403 | `AUTH_INSUFFICIENT_PERMISSION` | Account exists but `is_active = false` |
| 422 | `VALIDATION_ERROR` | Email or password field missing |
| 429 | `RATE_LIMIT_EXCEEDED` | 10 failed attempts from the same IP in 15 minutes |

---

## POST /api/v1/auth/refresh

Exchange a valid refresh token (from the HTTP-only cookie) for a new access token. Also issues a new refresh token (rotation).

**Authentication:** Valid refresh token cookie required

### Request

```
POST /api/v1/auth/refresh
Cookie: refresh_token=<opaque_token>
```

No request body required.

### Response

```
HTTP 200 OK
Set-Cookie: refresh_token=<new_opaque_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=604800; Path=/api/v1/auth
```

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 1800
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Refresh token has expired (> 7 days) |
| 401 | `AUTH_INVALID_CREDENTIALS` | Refresh token cookie is missing, malformed, or revoked |
| 403 | `AUTH_INSUFFICIENT_PERMISSION` | User account has been deactivated since the refresh token was issued |

---

## POST /api/v1/auth/logout

Revoke the current refresh token and clear the cookie. The access token will continue to work until it expires (max 30 minutes).

**Authentication:** Valid refresh token cookie required

### Request

```
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
Cookie: refresh_token=<opaque_token>
```

No request body required.

### Response

```
HTTP 200 OK
Set-Cookie: refresh_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/api/v1/auth
```

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully."
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

The `Max-Age=0` in the `Set-Cookie` header instructs the browser to immediately delete the cookie.

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Access token expired (logout still proceeds; refresh token is cleared) |

---

## GET /api/v1/auth/me

Returns the currently authenticated user's profile.

**Authentication:** Required (any authenticated user)

### Request

```
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

### Response

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "user_id": "f6a7b8c9-d0e1-2345-fabc-678901234567",
    "email": "jane.doe@factory.com",
    "full_name": "Jane Doe",
    "role": "technician",
    "is_active": true,
    "created_at": "2026-09-04T10:00:00Z",
    "last_login": "2026-09-03T14:22:00Z"
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Access token expired |
| 401 | `AUTH_INVALID_CREDENTIALS` | Token is malformed |

---

## PUT /api/v1/auth/me

Update the current user's own profile. Users may only update their own `full_name`. Role and email changes require admin intervention.

**Authentication:** Required (any authenticated user)

### Request

```
PUT /api/v1/auth/me
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "full_name": "Jane M. Doe"
}
```

#### Request Schema

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `full_name` | string | No | Max 255 chars | Updated display name |

### Response

```
HTTP 200 OK
```

```json
{
  "success": true,
  "data": {
    "user_id": "f6a7b8c9-d0e1-2345-fabc-678901234567",
    "email": "jane.doe@factory.com",
    "full_name": "Jane M. Doe",
    "role": "technician",
    "updated_at": "2026-09-04T11:00:00Z"
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 401 | `AUTH_TOKEN_EXPIRED` | Token expired |
| 422 | `VALIDATION_ERROR` | Field fails length constraint |

---

## POST /api/v1/auth/change-password

Change the current user's password. Requires the current password for verification.

**Authentication:** Required (any authenticated user)

### Request

```
POST /api/v1/auth/change-password
Content-Type: application/json
Authorization: Bearer <access_token>
```

```json
{
  "current_password": "SecureP@ssw0rd!",
  "new_password": "NewSecureP@ss#2026",
  "confirm_new_password": "NewSecureP@ss#2026"
}
```

#### Request Schema

| Field | Type | Required | Constraints | Description |
|---|---|---|---|---|
| `current_password` | string | Yes | — | The user's existing password |
| `new_password` | string | Yes | Min 12 chars, complexity rules (see register) | The desired new password |
| `confirm_new_password` | string | Yes | Must match `new_password` | Confirmation field |

### Response

```
HTTP 200 OK
Set-Cookie: refresh_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/api/v1/auth
```

```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully. Please log in again with your new password."
  },
  "error": null,
  "request_id": "...",
  "timestamp": "..."
}
```

After a successful password change, all existing refresh tokens for the user are revoked and the current session's cookie is cleared. The user must log in again with the new password. This is standard practice to invalidate any sessions that may have been established under a compromised password.

### Error Responses

| HTTP Status | Error Code | Condition |
|---|---|---|
| 400 | `VALIDATION_ERROR` | `new_password` and `confirm_new_password` do not match |
| 400 | `VALIDATION_ERROR` | `new_password` does not meet complexity requirements |
| 400 | `VALIDATION_ERROR` | `new_password` is identical to `current_password` |
| 401 | `AUTH_INVALID_CREDENTIALS` | `current_password` is incorrect |
| 401 | `AUTH_TOKEN_EXPIRED` | Access token expired |
| 422 | `VALIDATION_ERROR` | Required fields missing |
