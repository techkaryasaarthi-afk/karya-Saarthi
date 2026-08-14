# Karyasaarthi Admin App Architecture

This document serves as the primary technical reference for the Karyasaarthi Admin mobile application. It outlines the architectural decisions, module structure, and integration patterns used to achieve feature parity with the web-based Next.js administration panel. **This file should be referenced by any AI coding assistant before proposing structural changes.**

---

## 1. Tech Stack Overview

- **Framework**: Expo / React Native
- **Routing**: Expo Router (`app/` directory for file-based routing)
- **State Management**:
  - Global UI/Auth State: `Zustand` (`stores/`)
  - Server State & Caching: `TanStack React Query` (`@tanstack/react-query`)
- **Networking**: `Axios` with robust interceptors (Token injection, 401 refresh handling)
- **Styling**: `StyleSheet` via React Native with a centralized Theme hook (`utils/theme.ts`)
- **Backend**: Next.js API Routes connecting to Supabase PostgreSQL.

---

## 2. Directory Structure

```text
karyasaarthi-admin/
├── app/                  # Expo Router file-based routing
│   ├── (auth)/           # Unauthenticated screens (login, signup)
│   └── (admin)/          # Authenticated admin panels (Protected)
├── components/           # Reusable UI components (Avatars, Modals, Loaders)
├── services/             # Axios instances and API route definitions
├── stores/               # Zustand state stores (authStore, themeStore)
├── utils/                # Constants, Theme colors, Async storage helpers
├── assets/               # Local fonts and images
└── ARCHITECTURE.md       # (This file) Architecture reference
```

---

## 3. Data & Networking Flow

The app enforces a strict separation of concerns regarding data fetching:

1. **Services (`services/api.ts`)**: 
   An Axios instance configures the base URL, injects the Bearer token from secure storage, and adds a `X-Platform: mobile` header. It also intercepts 401s to automatically handle token refreshing without logging the user out abruptly.
2. **Queries (`useQuery` / `useMutation`)**: 
   Components rarely call `api.*` directly. They use TanStack Query to manage loading states (`isPending`), refetching (`isRefetching` with `RefreshControl`), and cache invalidation.
3. **Endpoints (`utils/constants.ts`)**: 
   All API routes are centralized in the `ADMIN_ENDPOINTS` object. 

*Rule of thumb for AI Assistants:* **Never hardcode `/api/admin/...` paths in UI components.** Always define them in `utils/constants.ts` and call them via Axios inside a TanStack Query/Mutation.

---

## 4. Implemented Modules & Feature Parity

The following modules were ported from the web application to the mobile app, ensuring 100% feature parity. They connect directly to the existing Next.js backend.

### Project & Operations
- **Projects Board (`projects.tsx`)**: Displays projects in List, Kanban, and custom Gantt chart views. Gantt chart is built purely with React Native Views (no heavy SVG/D3 dependencies).
- **Project Detail (`project-detail.tsx`)**: Tabbed interface (Info, Tasks, Communication, Checklist, Billing). Integrates full CRUD for sub-tasks and project-specific communications.

### CRM & Marketing
- **CRM (`crm.tsx`)**: Lead management pipeline. Includes stage filtering, pipeline value KPIs, and drag-to-update stage capabilities (PATCH `/api/admin/crm`).
- **Marketing (`marketing.tsx`)**: Sub-tabs for Campaigns (Calendar), Events, Competitors, and Referrals. Maps to `/api/admin/marketing/sub`.

### Organization & HR
- **Board Dashboard (`board.tsx`)**: Executive view restricted to `super_admin` and `board_member`. Shows revenue trends, top projects, pipeline conversion rates, and automated risk alerts.
- **Staff Directory (`staff.tsx`)**: View and search all employees. Super Admins can update roles, designations, and departments (PATCH `/api/admin/users/[id]`).
- **Staff Requests (`staff-requests.tsx`)**: Queue for approving new employee registrations.

### Finance & Assets
- **Finance (`finance.tsx`)**: High-level revenue and collections dashboard.
- **Invoices (`invoices.tsx`)**: Invoice generation with dynamic line items, automated 18% GST calculation, and status tracking (Draft -> Sent -> Paid).
- **Workspace (`workspace.tsx`)**: Centralized repository for SOPs, internal wikis, and pinned legal documents.

---

## 5. Security & Authorization

Routing access is controlled by the user's role, managed by `authStore`.
- **Role Hierarchy**: `super_admin` > `board_member` > `admin` > `pillar_member`.
- UI elements (like the `+ Add` button or specific navigation menu items in `more.tsx`) conditionally render based on the user's role.
- For example, the Board Panel and Staff Directory editing are strictly locked to `super_admin` and `board_member`.

---

## 6. Guidelines for Future AI Modifications

When modifying or adding new panels to this app, AI assistants must adhere to the following checklist:

1. **Verify Backend First**: Before creating a screen, confirm the exact response schema of the Next.js API route. Use `api.get()` to test data structures if necessary.
2. **Use TanStack Query**: Never use `useEffect` for data fetching. Always use `useQuery` for fetching and `useMutation` for POST/PATCH/DELETE actions.
3. **Respect the Theme**: Do not hardcode colors like `#ffffff` or `#000000`. Always import `useAppTheme` from `@/utils/theme` and use `T.background`, `T.surfaceContainer`, `T.ink`, and `T.muted`.
4. **Offline & Refresh**: Always implement `RefreshControl` inside ScrollViews wrapping `useQuery.refetch` to allow pull-to-refresh.
5. **No Heavy Packages**: When building complex UI (like the Gantt chart or Kanban board), prefer using native `<ScrollView>` and absolute positioned `<View>` elements over installing heavy third-party charting libraries, as this minimizes the Expo bundle size and prevents native-module linking issues.
