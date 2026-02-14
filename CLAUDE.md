# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies (use --legacy-peer-deps if needed)
npm run serve      # Dev server with hot-reload (localhost:8080)
npm run build      # Production build to /dist
npm run lint       # ESLint (config in package.json eslintConfig)
```

No test framework is configured.

## Architecture

Vue 3 + TypeScript + Vuetify 3 frontend (Vue CLI 5) that authenticates against a Laravel Sanctum backend at `http://127.0.0.1:8000/api`. Modular SaaS architecture organized by business domain with multi-tenant support (each business has its own config, caja, users, branding).

### Directory structure

```
src/
  main.ts                     # App entry point (Pinia + Router + Vuetify)
  App.vue                     # Dynamic layout shell (v-app)
  shims-vue.d.ts              # Vue SFC type declarations
  env.d.ts                    # Environment variable types
  app/
    layouts/                  # DefaultLayout (app bar + sidebar) / AuthLayout (centered)
    components/               # AppBar, AppSidebar (Vuetify navigation-drawer)
  core/
    api/client.ts             # Axios instance + interceptors (Bearer token, 401 handling)
    types/models.ts           # Shared TypeScript interfaces (User, Product, Order, etc.)
    types/api.ts              # ApiResponse<T>, PaginatedResponse<T>
    utils/format.ts           # formatCOP(), formatDate()
    utils/notify.ts           # SweetAlert2 wrappers (notifySuccess, notifyError, confirmAction)
    utils/recaptcha.ts        # getRecaptchaToken()
    plugins/vuetify.ts        # Vuetify 3 config with custom theme colors
    plugins/inactivity.ts     # Inactivity timer (50s warning, 60s logout)
    composables/useCrud.ts    # Generic CRUD composable for list views
    router/index.ts           # Central router aggregating all module routes
    router/guards.ts          # Auth + role navigation guards
  modules/
    auth/                     # Login, auth store, auth service
    dashboard/                # Dashboard stats view
    catalog/                  # Categories, Suppliers, Clients CRUD views
    inventory/                # Products CRUD + Inventory movements
    purchases/                # Purchase orders list + detail
    invoices/                 # Invoices list + detail
    pos/                      # Point of Sale (multi-order, real-time cart)
    cash-register/            # Cash register (open/close caja, POS requires open caja)
    admin/                    # User list (admin-only)
    reports/                  # Daily sales report (totals, payment methods, top products)
    settings/                 # Business settings (name, NIT, logo, plan info)
    business/                 # (stub) Future onboarding/multi-tenant logic
    subscription/             # (stub) Future billing/plan management
```

Each module contains: `types/`, `services/`, `views/`, `routes.ts`, `index.ts` (and optionally `store/`, `components/`).

### Key layers

- **Router** (`src/core/router/index.ts`): Vue Router with `beforeEach` guard. Route meta supports `requiresAuth`, `role`, `layout` ('default'|'auth'), `fullscreen`.
- **State**: Pinia stores per module. Auth store (persists `user`, `token`, `business`), POS store (multi-order state), Inventory store (products/categories), Cash Register store (caja state). POS store reads cash register store to enforce open caja before payment.
- **API** (`src/core/api/client.ts`): Axios instance with Bearer token interceptor and 401 redirect.
- **Layouts**: `DefaultLayout` (AppBar + Sidebar + v-main), `AuthLayout` (centered content). POS uses `fullscreen` meta to hide sidebar.

### Auth flow

1. `LoginView` → `authStore.login()` → `POST /api/login` → stores `access_token` + `user` in localStorage
2. Axios interceptor auto-attaches `Bearer {token}` to every request
3. Router guard checks token + user roles before allowing navigation
4. Inactivity control starts on login, logs out after 60s idle

### POS flow

1. User must open a cash register (`POST /cash-registers/open`) before operating POS
2. POS loads open orders from `GET /orders/open` and products from inventory store
3. User creates orders, clicks products to add via `POST /orders/{id}/add-item`
4. Multiple orders open as tabs, switch between them
5. Cobrar opens payment dialog (cash/card/transfer/qr) → `POST /orders/{id}/close` (blocked if no caja open)
6. Cancel returns stock → `POST /orders/{id}/cancel`
7. At end of shift, close caja (`POST /cash-registers/{id}/close`) with summary

### SaaS / Multi-business

- Auth store persists `business` object (name, logo, plan, subscription_status) alongside user/token
- AppBar displays business name/logo and plan tier
- Each business is scoped by the authenticated user's token (backend handles tenant isolation)
- Settings view allows editing business info (name, NIT, address, phone, email)
- `business/` and `subscription/` modules are stubs prepared for future billing/onboarding

### Routes

| Path | View | Auth | Role | Layout |
|------|------|------|------|--------|
| `/login` | LoginView | No | — | auth |
| `/dashboard` | DashboardView | Yes | — | default |
| `/categories` | CategoryListView | Yes | — | default |
| `/suppliers` | SupplierListView | Yes | — | default |
| `/clients` | ClientListView | Yes | — | default |
| `/products` | ProductListView | Yes | — | default |
| `/inventory` | InventoryMovementListView | Yes | — | default |
| `/purchase-orders` | PurchaseOrderListView | Yes | — | default |
| `/purchase-orders/:id` | PurchaseOrderDetailView | Yes | — | default |
| `/invoices` | InvoiceListView | Yes | — | default |
| `/invoices/:id` | InvoiceDetailView | Yes | — | default |
| `/pos` | PosView | Yes | — | fullscreen |
| `/cash-register` | CashRegisterView | Yes | — | default |
| `/users` | UserListView | Yes | admin | default |
| `/reports/daily` | DailyReportView | Yes | — | default |
| `/settings` | SettingsView | Yes | — | default |

## Conventions

- TypeScript strict mode (`tsconfig.json`)
- Components use Vue 3 Composition API with `<script setup lang="ts">`
- Vuetify 3 components for all UI (v-card, v-data-table, v-dialog, v-btn, etc.)
- Path aliases: `@/` → `src/`, `@core/` → `src/core/`, `@modules/` → `src/modules/`
- Spanish-language UI strings
- SweetAlert2 for notifications (wrapped in `core/utils/notify.ts`)
- `useCrud` composable for standard CRUD list views
- ESLint extends `plugin:vue/vue3-essential` + `eslint:recommended`; `lintOnSave` disabled
