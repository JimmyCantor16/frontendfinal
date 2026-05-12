# Jamz Frontend

> SPA del POS multi-tenant Jamz. Consume la API REST del backend Laravel y ofrece login, dashboard, catalogo, inventario, compras, facturas, POS, caja, reportes y administracion.

## Stack

| Tecnologia | Version | Proposito |
|------------|---------|-----------|
| Vue | 3.2+ | Framework SPA (Composition API + `<script setup>`) |
| TypeScript | 5.x | Tipado estatico (strict) |
| Vuetify | 3.x | Sistema de componentes UI (Material) |
| Pinia | 3.x | State management por modulo |
| Vue Router | 4.x | Ruteo + guards de auth/rol |
| Axios | 1.x | Cliente HTTP con interceptores |
| Vuelidate | 2.x | Validacion de formularios |
| SweetAlert2 | 11.x | Notificaciones / confirmaciones |
| Vue CLI | 5.x | Build tooling |
| Vitest | 4.x | Tests unitarios |
| TestCafe | 3.x | Tests E2E |

## Requisitos previos

- Node 18+ (LTS).
- npm 9+ (o yarn/pnpm equivalente).
- Backend Jamz corriendo (por defecto en `http://localhost:8000`).

## Setup local

```bash
# 1. Dependencias (usar --legacy-peer-deps si npm se queja)
npm install

# 2. Variables de entorno
cp .env.example .env   # en Windows: copy .env.example .env

# 3. Servidor de desarrollo en http://localhost:8080
npm run serve
```

## Variables de entorno

Vue CLI solo expone al cliente variables con prefijo `VUE_APP_`.

| Variable | Descripcion | Ejemplo | Requerido |
|----------|-------------|---------|-----------|
| `VUE_APP_API_URL` | URL base del backend (sin `/api`) | `http://localhost:8000` | si |
| `VUE_APP_RECAPTCHA_SITE_KEY` | Site key publico de reCAPTCHA v3 | `6Lc...` | si (login) |

> El cliente axios concatena `/api` al `VUE_APP_API_URL` y agrega los headers `Authorization: Bearer {token}` y `X-Business-Id: {id}` en cada request autenticada.

## Comandos comunes

| Comando | Que hace |
|---------|----------|
| `npm run serve` | Dev server con HMR en `:8080` |
| `npm run build` | Build de produccion a `dist/` |
| `npm run lint` | ESLint + autofix |
| `npm test` | Tests unitarios (Vitest, modo run) |
| `npm run test:watch` | Vitest en watch |
| `npm run test:coverage` | Cobertura V8 |
| `npm run test:e2e` | Tests E2E con TestCafe (Chrome headless) |
| `npm run testcafe:dev` | E2E con Chrome visible (debug) |

## Arquitectura

SPA modular por dominio. Cada modulo encapsula su `types/`, `services/`, `views/`, `routes.ts` y, si aplica, `store/` y `components/`.

```
src/
  main.ts                  -> Entry point (Pinia + Router + Vuetify)
  App.vue                  -> Shell dinamico (selecciona layout segun meta.layout)
  env.d.ts, shims-vue.d.ts -> Tipos de entorno y SFC

  app/
    layouts/               -> DefaultLayout (AppBar+Sidebar), AuthLayout (centrado)
    components/            -> AppBar, AppSidebar

  core/
    api/client.ts          -> Instancia axios + interceptores (Bearer, X-Business-Id, 401)
    types/models.ts        -> Interfaces compartidas (User, Product, Order, Invoice...)
    types/api.ts           -> ApiResponse<T>, PaginatedResponse<T>
    utils/format.ts        -> formatCOP(), formatDate()
    utils/notify.ts        -> Wrappers de SweetAlert2 (success/error/confirm)
    utils/recaptcha.ts     -> getRecaptchaToken()
    composables/useCrud.ts -> Composable generico para listas CRUD
    plugins/vuetify.ts     -> Tema y registro de Vuetify
    plugins/inactivity.ts  -> Timer de inactividad (50s warning, 60s logout)
    router/index.ts        -> Router agregador de rutas por modulo
    router/guards.ts       -> Guards de auth y rol

  modules/
    auth/                  -> Login, store de auth (user/token/business), service
    dashboard/             -> KPIs (ventas, stock, alertas)
    catalog/               -> Categorias, Proveedores, Clientes (CRUD)
    inventory/             -> Productos (CRUD) + Movimientos de inventario
    purchases/             -> Ordenes de compra (lista + detalle)
    invoices/              -> Facturas de venta (lista + detalle, cancelar)
    pos/                   -> Punto de venta multi-orden con carrito en vivo
    cash-register/         -> Apertura/cierre de caja, reporte de turno
    reports/               -> Reporte diario (totales, metodos de pago, top productos)
    admin/                 -> Gestion de usuarios (solo admin)
    settings/              -> Configuracion del negocio
    business/              -> (stub) Onboarding multi-tenant
    subscription/          -> (stub) Billing / planes Stripe
```

### Convenciones

- TypeScript en strict mode. Evitar `any` (warning de ESLint activo).
- Componentes SFC con Composition API: `<script setup lang="ts">`.
- UI siempre con Vuetify 3 (`v-card`, `v-data-table`, `v-dialog`, etc.).
- Path aliases (configurados en `tsconfig.json` y `vue.config.js`):
  - `@/`        -> `src/`
  - `@core/`    -> `src/core/`
  - `@modules/` -> `src/modules/`
- Strings de UI en espanol.
- Notificaciones via `core/utils/notify.ts` (no llamar SweetAlert2 directo).
- Para listas CRUD estandar, usar `useCrud` en lugar de duplicar logica.
- Cada modulo expone su `routes.ts` y se agrega en `core/router/index.ts`.

### Cliente HTTP

`src/core/api/client.ts` define un singleton de axios con:

- `baseURL = ${VUE_APP_API_URL}/api`.
- Interceptor de request: inyecta `Authorization: Bearer {token}` y `X-Business-Id: {business.id}` leyendo del auth store / localStorage.
- Interceptor de response: en `401` limpia auth y redirige a `/login`.

### Auth y multi-tenant

1. `LoginView` -> `authStore.login()` -> `POST /api/login` con `email`, `password` y token reCAPTCHA.
2. La respuesta trae `access_token`, `user` y `business` activo; se persisten en localStorage.
3. Axios anexa `Authorization` y `X-Business-Id` en cada request.
4. El router guard chequea token + roles antes de navegar.
5. El plugin de inactividad cierra sesion tras 60s idle (warning a los 50s).

### Flujo POS

1. Abrir caja en `/cash-register` (requisito para cobrar).
2. Entrar a `/pos`: carga productos (inventory store) y ordenes abiertas.
3. Crear nuevas ordenes como pestanas; click en producto agrega item.
4. "Cobrar" abre dialog (efectivo/tarjeta/transferencia/QR) -> `POST /orders/{id}/close`.
5. "Cancelar" devuelve stock -> `POST /orders/{id}/cancel`.
6. Al cierre de turno, cerrar caja para totalizar y generar reporte.

## Modulos / Features

| Modulo | Rol minimo | Responsabilidad |
|--------|-----------|-----------------|
| `auth` | publico | Login, sesion, store de usuario/negocio |
| `dashboard` | autenticado | KPIs principales |
| `catalog` | autenticado | Categorias, proveedores, clientes |
| `inventory` | autenticado | Productos y movimientos de stock |
| `purchases` | autenticado | Ordenes de compra (crear, recibir, cancelar) |
| `invoices` | autenticado | Facturas de venta (ver, anular) |
| `pos` | autenticado | Carrito multi-orden y cobro |
| `cash-register` | autenticado | Apertura, cierre y reporte de caja |
| `reports` | autenticado | Reporte diario y otros |
| `admin` | admin | Gestion de usuarios del negocio |
| `settings` | autenticado | Datos del negocio (nombre, NIT, logo, plan) |
| `business` | (stub) | Multi-tenant / onboarding |
| `subscription` | (stub) | Billing / planes Stripe |

## Rutas

| Path | Vista | Auth | Rol | Layout |
|------|-------|------|-----|--------|
| `/login` | LoginView | No | - | auth |
| `/dashboard` | DashboardView | Si | - | default |
| `/categories` | CategoryListView | Si | - | default |
| `/suppliers` | SupplierListView | Si | - | default |
| `/clients` | ClientListView | Si | - | default |
| `/products` | ProductListView | Si | - | default |
| `/inventory` | InventoryMovementListView | Si | - | default |
| `/purchase-orders[/:id]` | PurchaseOrder(List|Detail) | Si | - | default |
| `/invoices[/:id]` | Invoice(List|Detail) | Si | - | default |
| `/pos` | PosView | Si | - | fullscreen |
| `/cash-register` | CashRegisterView | Si | - | default |
| `/users` | UserListView | Si | admin | default |
| `/reports/daily` | DailyReportView | Si | - | default |
| `/settings` | SettingsView | Si | - | default |

## Testing

```bash
# Unitarios (Vitest)
npm test
npm run test:watch
npm run test:coverage

# E2E (TestCafe) - requiere backend y frontend corriendo
npm run test:e2e        # headless
npm run testcafe:dev    # visible para debug
```

Especificaciones unitarias junto a los modulos o en `tests/`. E2E en `tests/e2e/`.

## Proximos pasos

- Completar modulos `business` y `subscription` (onboarding multi-tenant + Stripe).
- Cobertura de tests por modulo (objetivo: smoke E2E del flujo POS completo).
- Migracion progresiva de Vue CLI a Vite (vitest ya esta en Vite).
- Carga diferida (`defineAsyncComponent`) en vistas pesadas (reportes, POS).
