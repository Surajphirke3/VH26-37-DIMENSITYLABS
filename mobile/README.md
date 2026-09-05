# MEND-X Mobile

React Native / Expo mobile client for MEND-X — Industrial RAG Troubleshooting System.

## Stack
- Expo SDK 51 + expo-router v3 (file-based routing)
- React Native 0.74
- TypeScript
- SecureStore for token storage
- Same FastAPI backend (no changes)

## Setup
```bash
cd mobile
npm install
cp .env.example .env.local
# Set EXPO_PUBLIC_API_URL to your backend URL
npx expo start
```

## Screens (21 routes)

| Route | Screen | Description |
|---|---|---|
| `/(auth)/login` | Login | JWT login form; stores token in SecureStore |
| `/(tabs)/` | Dashboard | Active conversations + quick-action cards |
| `/(tabs)/search` | Search | Full-text knowledge base search |
| `/(tabs)/documents` | Documents | Paginated list of uploaded manuals |
| `/(tabs)/status` | Status | System health — vector DB, model, indexer |
| `/(tabs)/settings` | Settings | User preferences, API URL override, logout |
| `/chat/[id]` | Chat | Conversation thread with RAG responses |
| `/document/[id]` | Document Detail | Manual viewer with chunk highlights |
| `/models` | AI Models | Tiered model list (Nano / Standard / Expert) |
| `/models/[id]` | Model Detail | Per-model latency, cost, and capability info |
| `/workflow` | RAG Pipeline | Visual step-through of the retrieval pipeline |
| `/inspector` | KB Inspector | Browse and inspect knowledge base chunks |
| `/upload` | Upload | Pick and upload a PDF manual for indexing |
| `/admin` | Admin Panel | User management and system configuration |
| `/new-chat` | New Conversation | Machine selector + problem description to start a chat |
| `/problem` | The Problem | Marketing/onboarding screen explaining MEND-X |
| `/help` | Help & Docs | In-app documentation and support links |
| `/search-result` | Search Result | Detailed view of a single search result chunk |
| `/(auth)/_layout` | Auth Layout | Stack navigator wrapper for unauthenticated routes |
| `/(tabs)/_layout` | Tabs Layout | Bottom tab bar configuration |
| `/_layout` | Root Layout | Root layout with auth gate and theme provider |

## Project Structure
```
mobile/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout + auth gate
│   ├── (auth)/             # Unauthenticated screens
│   │   └── login.tsx
│   ├── (tabs)/             # Bottom tab navigator
│   │   ├── index.tsx       # Dashboard
│   │   ├── search.tsx      # Knowledge base search
│   │   ├── documents.tsx   # Manuals list
│   │   ├── status.tsx      # System status
│   │   └── settings.tsx    # Settings + logout
│   ├── chat/[id].tsx       # Conversation chat
│   ├── document/[id].tsx   # Manual detail
│   ├── models.tsx          # AI model tiers
│   ├── models/[id].tsx     # Model detail
│   ├── workflow.tsx        # RAG pipeline visualization
│   ├── inspector.tsx       # KB chunk inspector
│   ├── upload.tsx          # Manual upload
│   ├── admin.tsx           # Admin panel
│   ├── new-chat.tsx        # New conversation
│   ├── problem.tsx         # The Problem (marketing)
│   ├── help.tsx            # Help & docs
│   └── search-result.tsx   # Search result detail
├── src/
│   ├── lib/                # API client, auth, types, theme
│   ├── components/         # Reusable components
│   └── constants/          # Config constants
└── assets/                 # Icons, splash screen
```

## Backend
No backend changes needed. Set EXPO_PUBLIC_API_URL to the FastAPI server URL.
Same JWT auth, same REST endpoints.
