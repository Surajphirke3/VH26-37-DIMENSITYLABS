# Loading, Error, and Empty States — MechMind

Every surface of the MechMind UI must handle three non-happy-path conditions: loading (data is in flight), error (something failed), and empty (data exists but there is nothing to show). This document enumerates every occurrence, what triggers it, what the UI shows, and what action — if any — the user can take.

A guiding principle: factory technicians use this tool when a machine has stopped. They are under pressure. States must be instantly understandable, never ambiguous, and always indicate whether the user should wait, retry, or contact someone.

---

## Loading States

### L1: Initial Page Load

**Trigger:** User navigates to any authenticated route for the first time in a session, or after a hard refresh.

**What the UI shows:**

```
┌────────────────────────────────────────────────┐
│                                                │
│            ⊙  MechMind                         │
│                                                │
│         Loading your workspace...             │
│                                                │
└────────────────────────────────────────────────┘
```

A centered full-page layout with the MechMind logo and a single animated spinner. No skeleton — the entire page is blank except for the loader. This avoids layout shift when the data arrives.

**Duration:** Typically < 500ms (session restore from cookie + machines list fetch). If it exceeds 3 seconds, the message changes to "Taking longer than expected..." with a "Refresh" link.

**User action:** None. Wait.

---

### L2: Query Processing

**Trigger:** User submits a query via the chat input (`POST /conversations/{id}/messages`). The network request is in flight and the RAG pipeline is running.

**What the UI shows:**

The query input and Send button are disabled. The Send button label changes to a spinner with "Thinking..." text. In the message list, a placeholder "answer bubble" appears immediately in the left-aligned position with an animated three-dot pulse:

```
┌─────────────────────────────────────────┐
│  ···                                    │
│  (answer loading)                       │
└─────────────────────────────────────────┘
```

The three-dot animation uses the same color as the brand primary. No skeleton card is shown — the answer structure is not known until it arrives, so a skeleton would shift the layout.

**Duration:** p50 ~800ms, p95 ~3.5 seconds. If the request exceeds 10 seconds, the UI transitions to the Query Timeout error state (E2).

**User action:** None while loading. The user cannot cancel an in-flight query (cancellation would leave the conversation in a partial state).

---

### L3: Manual Uploading

**Trigger:** User submits the `ManualUploadForm` with a PDF file selected. The multipart POST is in progress.

**What the UI shows:**

A full-overlay progress indicator on the upload form:

```
┌────────────────────────────────────┐
│                                    │
│   Uploading haas_vf2_service.pdf  │
│                                    │
│   ████████████░░░░░░░░  62%       │
│   9.7 MB of 15.7 MB               │
│                                    │
│   [Cancel]                         │
│                                    │
└────────────────────────────────────┘
```

The progress bar reflects the HTTP upload progress (using `XMLHttpRequest` `progress` events or the Fetch API's `ReadableStream`). The filename is shown for confirmation.

**User action:** The "Cancel" button aborts the upload via `AbortController`. If cancelled, no manual record is created.

---

### L4: Manual Processing (Ingestion Polling)

**Trigger:** After a successful upload, the ingestion job starts. The admin is on the `/admin/manuals` page or the manual detail view. The `processing_status` is `pending` or `processing`.

**What the UI shows:**

In the `ManualTable`, the row for the processing manual shows an `IngestProgressBar` component:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  Haas VF-2 Service Manual  │  processing  │  ████████░░░░  67% (209/312 pages)  │  Service  │
└──────────────────────────────────────────────────────────────────────────┘
```

- Status badge shows "Processing" in an amber pill.
- Progress bar fills from left to right.
- Page count shows `pages_processed` / `page_count`.
- The row auto-updates via polling every 3 seconds (TanStack Query with `refetchInterval: 3000`, active only while `processing_status` is `processing` or `pending`).

**User action:** None required. Polling stops automatically when status reaches `completed` or `failed`. If the admin navigates away, polling stops (the component unmounts). It resumes if they return to the page.

---

### L5: Conversation History Loading

**Trigger:** User opens `/conversations` or navigates to a specific conversation at `/conversations/[id]`.

**What the UI shows:**

A skeleton list where each item shows a gray placeholder bar in place of the conversation title and timestamp:

```
┌────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░  ░░░░░░░             │
│  ░░░░░░░░░░░░░░░░░░░          ░░░░░░░░░░░          │
│  ░░░░░░░░░░░░░░░              ░░░░░░               │
└────────────────────────────────────────────────────────────┘
```

For a specific conversation (`/conversations/[id]`), each message bubble in the thread is represented by a skeleton bubble of proportional height (shorter for user messages, taller for assistant messages).

**Duration:** Typically < 300ms (single DB query, small payload). Skeleton is shown immediately on navigation.

**User action:** None. The skeleton is replaced by real content when data arrives.

---

### L6: Citation Details Loading

**Trigger:** User expands the citation panel on an answer for the first time. Citation data is included in the initial answer response, so this state only applies if citations are loaded lazily (e.g., the full excerpt is fetched on demand).

**What the UI shows:**

Inside the expanded citation panel, each citation row that is loading shows an inline spinner replacing the excerpt text:

```
[1] Haas VF-2 Service Manual Rev 4.2
    Chapter 6 > Error Codes > E101 | Pages 142–144
    ⊙ Loading excerpt...
```

**User action:** None. The excerpt loads and replaces the spinner within ~200ms.

---

## Error States

### E1: LLM Unavailable

**Trigger:** `POST /query` or `POST /conversations/{id}/messages` returns HTTP 503 with `error.code = "LLM_UNAVAILABLE"` or `"EMBEDDING_UNAVAILABLE"`.

**What the UI shows:**

In the message list, the pending answer bubble is replaced by an error card:

```
┌─────────────────────────────────────────────────────────┐
│  ⚠  AI service temporarily unavailable                  │
│                                                         │
│  The diagnostic service is experiencing issues.         │
│  Please try again in a moment.                          │
│                                                         │
│  [Try Again]     Request ID: 7f3a1b2c...               │
└─────────────────────────────────────────────────────────┘
```

"Try Again" re-submits the same query. The `request_id` is shown in 11px gray for use in support tickets.

**User action:** Click "Try Again" to retry. If retrying fails repeatedly, the user should contact an administrator who can check the Gemini API status.

---

### E2: Query Timeout

**Trigger:** The query response has not arrived within 10 seconds. The frontend abandons the pending request via `AbortController`.

**What the UI shows:**

```
┌─────────────────────────────────────────────────────────┐
│  ⏱  Query timed out                                     │
│                                                         │
│  The response took too long. This can happen during     │
│  periods of high demand.                                │
│                                                         │
│  [Try Again]                                            │
└─────────────────────────────────────────────────────────┘
```

**User action:** Click "Try Again." The query input is re-enabled with the previous query text pre-filled. The user can modify it or submit as-is.

---

### E3: Manual Upload Failed

**Trigger:** `POST /manuals/upload` returns an error. Specific sub-cases:

**E3a: Invalid Format** (`MANUAL_INVALID_FORMAT`)

```
┌────────────────────────────────────────────────────────┐
│  ✕  Invalid file format                               │
│                                                        │
│  Only PDF files can be uploaded.                      │
│  The file "report.docx" is not a valid PDF.           │
│                                                        │
│  [Choose a different file]                             │
└────────────────────────────────────────────────────────┘
```

**E3b: File Too Large** (`MANUAL_TOO_LARGE`)

```
┌────────────────────────────────────────────────────────┐
│  ✕  File too large                                    │
│                                                        │
│  The maximum file size is 100 MB.                     │
│  "haas_parts_catalog.pdf" is 127 MB.                  │
│                                                        │
│  [Choose a different file]                             │
└────────────────────────────────────────────────────────┘
```

**E3c: Duplicate File** (`MANUAL_DUPLICATE`)

```
┌────────────────────────────────────────────────────────┐
│  ℹ  Duplicate file                                    │
│                                                        │
│  This file has already been uploaded:                 │
│  "Haas VF-2 Service Manual Rev 4.2"                   │
│                                                        │
│  If this is a new revision, delete the existing       │
│  manual first, then re-upload.                        │
│                                                        │
│  [View existing manual]  [Upload different file]       │
└────────────────────────────────────────────────────────┘
```

The duplicate state provides a link directly to the existing manual's detail page.

**User action:** Each sub-case shows a specific corrective action. The upload form is reset and the file input is cleared so the user can select a new file.

---

### E4: Manual Processing Failed

**Trigger:** The ingestion job polling detects `status = "failed"` in the `ingestion_jobs` response.

**What the UI shows:**

In the `ManualTable`, the status badge changes to a red "Failed" pill. The progress bar is replaced with an error message:

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  Haas VF-2 Service Manual  │  ✕ failed  │  PDF parsing error: file is encrypted  │  [Retry]  │
└────────────────────────────────────────────────────────────────────────────────┘
```

The error summary from `ingestion_jobs.error_message` is shown inline (truncated to 80 chars). A "Retry" button triggers `POST /manuals/{id}/reindex`.

For encrypted PDFs, the suggestion text reads: "This PDF is password-protected. Please upload an unprotected version."

**User action:** Click "Retry" to attempt re-ingestion. If the error persists, the admin should check the error detail and address the root cause (decrypt the PDF, repair the file, etc.).

---

### E5: Network Error

**Trigger:** Any API call fails with a network-level error (fetch throws, no response received). Caused by loss of Wi-Fi, VPN disconnection, or the server being unreachable.

**What the UI shows:**

A persistent banner at the top of the page, below the navigation:

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠  No connection — Working in offline mode. Queries disabled.  │
└─────────────────────────────────────────────────────────────────┘
```

The query input is disabled. The banner includes a subtle animated indicator (pulsing dot) that automatically resolves to green and disappears when connectivity is restored (the app periodically retries a lightweight health check).

**User action:** Wait for connection to restore. The banner is cleared automatically. No page refresh is required.

---

### E6: Session Expired

**Trigger:** Any authenticated API call returns HTTP 401 (`AUTH_TOKEN_EXPIRED`) and the subsequent token refresh via `POST /auth/refresh` also fails (refresh token expired or revoked).

**What the UI shows:**

A modal dialog overlaid on the current page (no redirect, so the user does not lose their place):

```
┌────────────────────────────────────────────────┐
│                                                │
│  Your session has expired                      │
│                                                │
│  For your security, you have been logged out   │
│  after a period of inactivity.                 │
│                                                │
│  [Log In Again]                                │
│                                                │
└────────────────────────────────────────────────┘
```

Clicking "Log In Again" redirects to `/login` with a `?return_to=/dashboard` (or the current path) query parameter, so after successful login the user is returned to where they were.

**User action:** Click "Log In Again" and authenticate. The current conversation history is preserved in the database and will be accessible after re-login.

---

## Empty States

### N1: No Manuals Indexed (Admin View)

**Trigger:** Admin navigates to `/admin/manuals` and `GET /manuals` returns an empty list.

**What the UI shows:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    📄  No manuals yet                               │
│                                                                     │
│      Start by uploading a machine manual in PDF format.             │
│      Once indexed, technicians can query it for error codes         │
│      and troubleshooting guidance.                                  │
│                                                                     │
│                  [Upload First Manual]                              │
│                                                                     │
│      Need to add machines first?  [Go to Machines →]               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

The "Upload First Manual" button navigates to `/admin/manuals/upload`. If no machines have been created yet, the secondary link "Go to Machines" takes the admin to `/admin/machines` first.

**User action:** Upload a manual (admin) or add machines first.

---

### N2: No Manuals Indexed (Technician View)

**Trigger:** Technician opens `/dashboard` and the system detects that no manuals have been indexed (the machine list is empty, or the selected machine has no completed manuals).

**What the UI shows:**

The chat interface is displayed but the query input is disabled. A message appears in place of the message list:

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│          No machine manuals are available yet.                      │
│                                                                     │
│   Contact your system administrator to upload machine manuals       │
│   before using MechMind for troubleshooting.                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

There is no CTA button — technicians cannot upload manuals. The message is informational only. The query input shows a disabled placeholder: "Queries disabled — no manuals indexed. Contact your administrator."

**User action:** Contact the system administrator.

---

### N3: No Conversations Yet

**Trigger:** User opens `/conversations` and has no conversation history.

**What the UI shows:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│             💬  No conversations yet                                │
│                                                                     │
│      Your troubleshooting history will appear here                  │
│      after your first query.                                        │
│                                                                     │
│                  [Start a new query →]                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

"Start a new query" navigates to `/dashboard`.

**User action:** Navigate to the dashboard and submit a query.

---

### N4: No Machines Configured

**Trigger:** Admin opens `/admin/machines` and no machines have been created.

**What the UI shows:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│               ⚙  No machines configured                             │
│                                                                     │
│      Add your first machine to start organizing manuals             │
│      and enabling targeted troubleshooting.                         │
│                                                                     │
│                   [Add First Machine]                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

"Add First Machine" opens the `MachineForm` in a modal.

**User action:** Create a machine record.

---

### N5: No Search Results in Admin Tables

**Trigger:** Admin applies filters (by machine, status, or type) in the manual or machine list and no records match.

**What the UI shows:**

Inline within the table area (not replacing the full page):

```
┌─────────────────────────────────────────────────────────────────────┐
│  No manuals match the selected filters.                             │
│  [Clear filters]                                                    │
└─────────────────────────────────────────────────────────────────────┘
```

"Clear filters" resets all filter controls to their default (no filter) state and reloads the full list.

**User action:** Clear filters or adjust the search criteria.

---

### N6: Conversation Has No Messages

**Trigger:** A conversation record exists but has zero messages. This can theoretically occur if `POST /conversations` succeeded but the `initial_query` request immediately failed. Rare but must be handled.

**What the UI shows:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│          This conversation has no messages yet.                     │
│          Type your question below to get started.                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

The query input is enabled and focused. The technician can begin immediately.

**User action:** Type a query in the input and submit.

---

## State Priority Rules

When multiple conditions could apply simultaneously, the following priority order governs which state is shown:

1. **Network error** (E5) — overrides everything. If there is no connection, no other state is relevant.
2. **Session expired** (E6) — shown as a modal overlay regardless of what is behind it.
3. **Loading** — shown while any page-critical data is in flight.
4. **Error** — replaces the loading state when a request fails.
5. **Empty** — shown only when loading has completed and there is genuinely no data.

For example: if the user opens `/conversations` and the session is expired (E6), the session expired modal is shown, not the conversation loading skeleton (L5).

---

## Accessibility for Non-Happy-Path States

- All error and empty state messages use `role="alert"` or `aria-live="assertive"` to announce themselves to screen readers without requiring focus.
- Loading spinners include `aria-label="Loading"` and `role="status"`.
- Empty state CTAs (buttons and links) are keyboard-focusable and have descriptive `aria-label` attributes (e.g., `aria-label="Upload your first manual"`).
- Color is never the only indicator of a state. Error states use both red color and an `✕` icon. Warning states use amber and a `⚠` icon. Success states use green and a `✓` icon.
