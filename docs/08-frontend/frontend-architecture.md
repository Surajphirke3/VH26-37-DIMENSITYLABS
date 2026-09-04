# Frontend Architecture — MechMind

The MechMind frontend is a Next.js 14 application using the App Router. It is a specialized industrial tool, not a general-purpose chat interface. Every design decision prioritizes speed of diagnosis on the factory floor, clarity under pressure, and minimal cognitive load for technicians who may not be regular technology users.

---

## Technology Stack

| Concern | Technology | Notes |
|---|---|---|
| Framework | Next.js 14 (App Router) | React Server Components for static/layout content; Client Components for interactive chat UI |
| Language | TypeScript 5 | Strict mode enabled |
| Styling | Tailwind CSS | No component library dependency; custom design tokens for industrial color palette |
| State — Server | TanStack Query (React Query v5) | All API data fetching, caching, polling, and mutation handling |
| State — Client | Zustand | Lightweight client state: active machine, session, sidebar open/closed |
| API Client | Auto-generated from OpenAPI spec | `openapi-typescript-codegen` run as part of build pipeline |
| Forms | React Hook Form + Zod | Type-safe form validation matching backend schemas |
| Real-time | Server-Sent Events (SSE) | Optional streaming for long-running LLM responses |

---

## Page Route Structure

The App Router directory structure maps directly to URL paths:

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx                   → /login
│
├── (app)/
│   ├── layout.tsx                     → AppLayout (sidebar + nav)
│   │
│   ├── dashboard/
│   │   └── page.tsx                   → /dashboard  (primary chat interface)
│   │
│   ├── conversations/
│   │   ├── page.tsx                   → /conversations  (history list)
│   │   └── [id]/
│   │       └── page.tsx               → /conversations/[id]  (specific conversation)
│   │
│   └── admin/
│       ├── layout.tsx                 → AdminLayout
│       ├── page.tsx                   → /admin  (admin dashboard + stats)
│       ├── manuals/
│       │   ├── page.tsx               → /admin/manuals  (manual list and status)
│       │   └── upload/
│       │       └── page.tsx           → /admin/manuals/upload
│       └── machines/
│           └── page.tsx               → /admin/machines
│
└── page.tsx                           → / (redirects to /dashboard or /login)
```

### Route Access Control

Route protection is handled by a Next.js middleware file (`middleware.ts`) that runs on every request before rendering:

- Unauthenticated users accessing any `(app)` route are redirected to `/login`.
- Technicians accessing any `/admin/*` route receive a 403 page.
- Authenticated users hitting `/` are redirected to `/dashboard`.
- Authenticated users hitting `/login` are redirected to `/dashboard`.

The middleware reads the access token from memory (passed via a short-lived cookie during SSR hydration) and verifies its `exp` claim without hitting the server.

---

## Component Hierarchy

### Layout Components

```
AppLayout
├── Sidebar                         (desktop navigation, collapsible)
│   ├── UserMenu                    (avatar, role badge, logout)
│   ├── MachineSelector             (global machine context picker)
│   └── ConversationList            (recent conversations, abbreviated)
└── MobileNav                       (bottom navigation bar on mobile)

AuthLayout
└── (centers the login card, no navigation)

AdminLayout
├── AppLayout (inherits)
└── AdminSidebar                    (admin-specific sub-navigation)
```

### Core UI Primitives

These are purpose-built components with no external UI library dependency:

| Component | Purpose |
|---|---|
| `Button` | Variants: primary, secondary, ghost, danger. Sizes: sm, md, lg. Supports loading spinner state. |
| `Input` | Text input with label, helper text, error state, and icon slot |
| `Textarea` | Multi-line text input. Used for the main query input with auto-resize. |
| `Badge` | Small label pill. Variants: success (green), warning (amber), error (red), neutral (gray). |
| `Spinner` | Animated loading indicator. Sizes: sm (inline), md (section), lg (full-page). |
| `Modal` | Accessible dialog with focus trap and escape-to-close |
| `Toast` | Ephemeral notification. Position: top-right. Auto-dismisses after 5s. |
| `Tooltip` | Hover tooltip for icon buttons and abbreviated text |

### Chat Components

The `ChatInterface` is the primary view for technicians. Its internal component tree:

```
ChatInterface
├── MachineContextBanner            (top bar: selected machine, "Change Machine" button)
├── MessageList                     (scrollable message history)
│   └── MessageBubble[]             (per message)
│       ├── [role=user]  → plain bubble
│       └── [role=assistant]
│           ├── StructuredAnswer
│           │   ├── ErrorMeaningCard
│           │   ├── ProbableCausesList
│           │   ├── CorrectiveStepsList
│           │   │   └── StepItem (with optional WarningBadge)
│           │   └── ConfidenceBadge
│           ├── CitationPanel       (collapsible)
│           │   └── CitationBadge[] (each [1], [2] reference)
│           ├── DisambiguationCard  (shown instead of StructuredAnswer)
│           └── RefusalMessage      (shown instead of StructuredAnswer)
├── FollowUpSuggestions             (clickable chips below assistant message)
└── MessageInput
    ├── Textarea                    (main query input)
    ├── QueryTypeIndicator          (auto-detected: Error Code / Natural Language)
    └── SendButton
```

### Admin Components

```
AdminDashboard
├── StatsGrid                       (total manuals, machines, queries today)
└── RecentIngestionJobs             (live status of recent uploads)

ManualTable
├── ManualRow[]
│   ├── ProcessingStatus            (badge: pending/processing/completed/failed)
│   └── IngestProgressBar           (only visible during processing)
└── ManualActions                   (reindex, delete buttons — admin only)

ManualUploadForm
├── FileDropzone                    (drag-and-drop PDF area)
├── MachineSelector                 (dropdown)
├── ManualTypeSelect
└── ProgressOverlay                 (shown after submission while job runs)

MachineTable
└── MachineRow[]

MachineForm
└── (create / edit machine record)
```

---

## State Management

### Server State: TanStack Query

TanStack Query manages all data that comes from the API. It handles caching, background refetching, optimistic updates, and polling.

| Query Key | Data | Stale Time | Refetch Strategy |
|---|---|---|---|
| `['machines']` | All machines list | 5 minutes | On window focus |
| `['machine', id]` | Single machine detail | 5 minutes | On window focus |
| `['manuals', filters]` | Filtered manual list | 1 minute | On window focus |
| `['manual', id, 'status']` | Ingestion job status | 0 (always fresh) | Polling every 3s while status is `processing` |
| `['conversations']` | Conversation list | 30 seconds | On window focus |
| `['conversation', id, 'messages']` | Message history | 0 | On new message (manual invalidation) |

Mutations (POST, PUT, DELETE) use TanStack Query's `useMutation` hook. After a successful mutation, the relevant query keys are invalidated to trigger a refetch.

### Client State: Zustand

Zustand stores UI state that does not need to be fetched from the server:

```typescript
interface MechMindStore {
  // Machine context
  activeMachineId: string | null;
  setActiveMachine: (machineId: string | null) => void;

  // Conversation
  activeConversationId: string | null;
  setActiveConversation: (conversationId: string | null) => void;

  // Session
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;

  // UI
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}
```

The `activeMachineId` in Zustand is the globally selected machine (set via the sidebar `MachineSelector`). When a technician switches machines, it updates this value and the next query in the chat interface automatically uses the new machine context.

---

## API Client

The frontend API client is TypeScript code generated from the FastAPI OpenAPI specification:

```
# Regenerate after backend changes
npm run generate:api
```

This command calls `openapi-typescript-codegen` pointing at `http://localhost:8000/openapi.json` and outputs typed service classes and model interfaces to `src/lib/api/generated/`.

All API calls in the application go through a hand-written wrapper (`src/lib/api/client.ts`) that:
1. Attaches the `Authorization: Bearer <token>` header from the Zustand store.
2. Intercepts 401 responses to attempt a token refresh via `POST /auth/refresh`.
3. Retries the original request once with the new token.
4. If the refresh also fails, clears the session and redirects to `/login`.
5. Surfaces the `request_id` from the response envelope for error display.

---

## Rendering Strategy

| Route | Strategy | Reason |
|---|---|---|
| `/login` | Static (SSG) | No dynamic data |
| `/dashboard` | Client Component | Real-time chat requires browser-side interactivity |
| `/conversations` | Server Component with streaming | Static list structure; data fetched server-side |
| `/conversations/[id]` | Mixed | Layout is RSC; message thread is Client Component |
| `/admin/manuals` | Server Component | Table data; Client Component for status polling |
| `/admin/manuals/upload` | Client Component | File drag-and-drop, multi-step form |
| `/admin/machines` | Server Component | Simple CRUD table |

---

## Error Boundary Strategy

Every major section of the UI is wrapped in a React Error Boundary with a domain-appropriate fallback:

- **Chat area**: Shows a "Something went wrong with this conversation. Refresh to try again." message with a reload button.
- **Admin tables**: Shows a table-level error with a retry button.
- **Entire page** (root boundary): Shows a generic error page with the `request_id` for support reference.

Errors caught by Error Boundaries are reported to the error tracking system (Sentry or equivalent) with the current user context and URL.

---

## Accessibility

The MechMind UI targets WCAG 2.1 AA compliance. Key considerations for the factory floor context:

- **High contrast mode**: Respects `prefers-contrast: high` media query. Error and warning badges use patterns in addition to color.
- **Keyboard navigation**: The entire chat interface is keyboard-navigable. Follow-up suggestion chips are reachable via Tab and activatable with Enter.
- **Focus management**: When a disambiguation card appears, focus moves to the first machine option. When an answer loads, focus moves to the answer heading.
- **Screen reader**: `aria-live="polite"` on the answer area so screen readers announce new answers without interrupting ongoing activity.
- **Touch targets**: All interactive elements meet the 44x44 px minimum touch target size for gloved-hand use on factory floors.
