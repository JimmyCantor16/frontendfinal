# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run serve      # Dev server with hot-reload (localhost:8080)
npm run build      # Production build to /dist
npm run lint       # ESLint (config in package.json eslintConfig)
```

No test framework is configured.

## Architecture

Vue 3 frontend (Vue CLI 5) that authenticates against a Laravel Sanctum backend at `http://127.0.0.1:8000/api`.

### Key layers

- **Router** (`src/router/index.js`): Vue Router with `beforeEach` guard that checks Pinia auth store for token and role-based access (`meta.requiresAuth`, `meta.role`). Unauthenticated or unauthorized requests redirect to `/login`.
- **State** (`src/stores/auth.js`): Pinia store managing `user`, `token`, and `isAuthenticated`. Persists to localStorage. Handles login, logout, and inactivity auto-logout (warning at 50s, logout at 60s via window event listeners).
- **API** (`src/services/api.js`): Axios instance with request interceptor (attaches Bearer token) and response interceptor (clears auth on 401). This is the primary HTTP client — `services/axios.js` and `services/axios.ts` are unused legacy files.
- **Components** (`src/components/`): Vue 3 `<script setup>` SFCs. `LoginForm.vue` handles auth, `UserList.vue` is an admin-protected view.

### Auth flow

1. `LoginForm` → `authStore.login()` → `POST /api/login` → stores `access_token` + `user` in localStorage
2. Axios interceptor auto-attaches `Bearer {token}` to every request
3. Router guard checks token + user roles before allowing navigation
4. Inactivity control starts on login, logs out after 60s idle

### Routes

| Path | Component | Auth | Role |
|------|-----------|------|------|
| `/login` | LoginForm | No | — |
| `/users` | UserList | Yes | admin |
| `/*` | redirect → /login | — | — |

## Conventions

- Components use Vue 3 Composition API with `<script setup>`
- Scoped CSS in SFCs, no preprocessor
- Spanish-language comments and UI strings
- Path alias: `@/` maps to `src/` (configured in `jsconfig.json`)
- SweetAlert2 for user notifications
- Vuelidate available (`@vuelidate/core`) but not currently used in components
- ESLint extends `plugin:vue/vue3-essential` + `eslint:recommended`; `lintOnSave` is disabled in `vue.config.js`
