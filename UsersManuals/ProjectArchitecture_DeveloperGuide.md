# POS Bar/Cantina — Developer & Architecture Manual

**Version:** 1.0
**Date:** February 14, 2026
**Stack:** Vue 3 + TypeScript + Vuetify 3 | Laravel 11 + MySQL

---

## Table of Contents

1. [General Architecture](#1-general-architecture)
2. [Backend Infrastructure (Laravel)](#2-backend-infrastructure-laravel)
3. [Database Model (ER Diagram)](#3-database-model)
4. [Frontend Infrastructure (Vue 3)](#4-frontend-infrastructure-vue-3)
5. [Module Pattern — Step-by-Step Guide](#5-module-pattern-step-by-step-guide)
6. [Parent-Child Component Relationships](#6-parent-child-component-relationships)
7. [Complete API Endpoints Reference](#7-complete-api-endpoints-reference)
8. [Route Map](#8-route-map)
9. [TypeScript Type Reference](#9-typescript-type-reference)

---

## 1. General Architecture

The system is a **SaaS-ready Point of Sale (POS)** application designed for bars and cantinas in Colombia. It uses a decoupled architecture:

```
┌─────────────────────────┐         ┌─────────────────────────┐
│      FRONTEND           │  HTTP   │       BACKEND           │
│   Vue 3 + Vuetify 3     │◄──────►│    Laravel 11           │
│   TypeScript + Pinia     │  JSON  │    Sanctum Auth         │
│   Port: 8080             │        │    Port: 8000           │
└─────────────────────────┘         └────────┬────────────────┘
                                             │
                                    ┌────────▼────────────────┐
                                    │       DATABASE          │
                                    │       MySQL 8           │
                                    │   Multi-tenant (SaaS)   │
                                    └─────────────────────────┘
```

### Communication Flow

1. **User** interacts with the Vue 3 frontend (SPA)
2. **Axios HTTP client** sends requests to `{API_URL}/api/*` with Bearer token
3. **Laravel Sanctum** validates the token and resolves the business (tenant)
4. **Eloquent ORM** queries MySQL and returns JSON responses
5. **Frontend** renders the response using Vuetify 3 components

### Key Principles

- **Multi-tenant**: Every record belongs to a `business_id` (tenant isolation)
- **Token-based auth**: Laravel Sanctum issues Bearer tokens
- **Modular frontend**: Each business domain is an independent module
- **Type-safe**: Full TypeScript coverage on the frontend
- **Responsive**: Vuetify 3 provides adaptive layouts

---

## 2. Backend Infrastructure (Laravel)

### Directory Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AuthController.php              # Login, me, logout
│   │   ├── DashboardController.php         # KPI stats
│   │   ├── CategoryController.php          # CRUD categories
│   │   ├── SupplierController.php          # CRUD suppliers
│   │   ├── ClientController.php            # CRUD clients
│   │   ├── ProductController.php           # CRUD products
│   │   ├── OrderController.php             # POS orders lifecycle
│   │   ├── PurchaseOrderController.php     # Purchase orders
│   │   ├── InvoiceController.php           # Sales invoices
│   │   ├── CashRegisterController.php      # Cash drawer management
│   │   ├── InventoryMovementController.php # Stock movements
│   │   ├── ReportController.php            # Daily reports
│   │   ├── BusinessSettingsController.php  # Business config + logo
│   │   └── UserController.php              # Admin user list
│   ├── Middleware/
│   │   └── EnsureBusiness.php              # Injects business_id scope
│   └── Requests/                           # Form validation rules
├── Models/
│   ├── User.php
│   ├── Business.php
│   ├── Category.php
│   ├── Supplier.php
│   ├── Client.php
│   ├── Product.php
│   ├── Order.php
│   ├── OrderItem.php
│   ├── PurchaseOrder.php
│   ├── PurchaseOrderItem.php
│   ├── Invoice.php
│   ├── InvoiceItem.php
│   ├── CashRegister.php
│   └── InventoryMovement.php
└── Services/                               # Business logic layer
    ├── OrderService.php                    # Stock validation, order lifecycle
    └── InventoryService.php                # Stock adjustments
```

### Authentication Flow (Laravel Sanctum)

```
POST /api/login
  ├── Validate credentials
  ├── Generate personal access token
  ├── Return: { access_token, user, business }
  └── Token stored in personal_access_tokens table

GET /api/me (with Bearer token)
  ├── Sanctum resolves user from token
  └── Return: { user, business }

Every subsequent request:
  ├── Header: Authorization: Bearer {token}
  ├── Header: X-Business-Id: {business_id}
  └── Middleware scopes queries to business_id
```

### Multi-Tenant Scoping

Every model uses a global scope that filters by `business_id`:

```php
// In each Model:
protected static function booted()
{
    static::addGlobalScope('business', function ($query) {
        if (auth()->check()) {
            $query->where('business_id', auth()->user()->business_id);
        }
    });
}
```

---

## 3. Database Model

### Entity-Relationship Diagram (Textual)

```
┌──────────────┐       ┌──────────────┐
│   businesses │       │    users     │
├──────────────┤       ├──────────────┤
│ id (PK)      │◄──┐   │ id (PK)      │
│ name         │   │   │ name         │
│ slug         │   │   │ email        │
│ nit          │   │   │ password     │
│ address      │   └───┤ business_id  │
│ phone        │       │ role         │
│ email        │       │ (admin|user) │
│ logo         │       └──────┬───────┘
│ subscription_│              │
│   plan       │              │ (user opens/closes)
│ subscription_│              │
│   status     │       ┌──────▼───────┐
│ trial_ends_at│       │cash_registers│
└──────┬───────┘       ├──────────────┤
       │               │ id (PK)      │
       │               │ user_id (FK) │
       │               │ business_id  │
       │               │ status       │
       │               │ opening_amt  │
       │               │ closing_amt  │
       │               │ total_sales  │
       │               │ total_cash   │
       │               │ total_card   │
       │               │ total_transfer│
       │               │ total_qr     │
       │               │ orders_closed│
       │               │ opened_at    │
       │               │ closed_at    │
       │               └──────────────┘
       │
       │  (business owns all data)
       │
       ├───────────────────────────────────────────────┐
       │                                               │
┌──────▼───────┐  ┌──────────────┐  ┌──────────────┐  │
│  categories  │  │  suppliers   │  │   clients     │  │
├──────────────┤  ├──────────────┤  ├──────────────┤  │
│ id (PK)      │  │ id (PK)      │  │ id (PK)      │  │
│ business_id  │  │ business_id  │  │ business_id  │  │
│ name         │  │ name         │  │ document_type│  │
│ description  │  │ nit          │  │ document_num │  │
└──────┬───────┘  │ phone        │  │ name         │  │
       │          │ email        │  │ phone        │  │
       │          │ contact_     │  │ email        │  │
       │          │   person     │  │ address      │  │
       │          │ is_active    │  └──────┬───────┘  │
       │          └──────┬───────┘         │          │
       │                 │                 │          │
┌──────▼───────┐         │          ┌──────▼───────┐  │
│   products   │         │          │   orders     │  │
├──────────────┤         │          ├──────────────┤  │
│ id (PK)      │         │          │ id (PK)      │  │
│ business_id  │         │          │ business_id  │  │
│ category_id  │         │          │ order_number │  │
│ sku          │         │          │ status       │◄─┘
│ name         │         │          │ (open|closed│
│ description  │         │          │  |cancelled) │
│ purchase_    │         │          │ payment_     │
│   price      │         │          │   method     │
│ sale_price   │         │          │ total        │
│ stock        │         │          │ user_id (FK) │
│ minimum_stock│         │          │ client_id(FK)│
│ is_active    │         │          └──────┬───────┘
└──┬───────┬───┘         │                 │
   │       │             │          ┌──────▼───────┐
   │       │             │          │ order_items  │
   │       │             │          ├──────────────┤
   │       │             │          │ id (PK)      │
   │       │             │          │ order_id(FK) │
   │       │             │          │ product_id   │
   │       │             │          │ quantity     │
   │       │             │          │ unit_price   │
   │       │             │          │ subtotal     │
   │       │             │          └──────────────┘
   │       │             │
   │       │      ┌──────▼───────┐   ┌──────────────┐
   │       │      │purchase_     │   │purchase_     │
   │       │      │  orders      │   │  order_items │
   │       │      ├──────────────┤   ├──────────────┤
   │       │      │ id (PK)      │──►│ id (PK)      │
   │       │      │ business_id  │   │ po_id (FK)   │
   │       │      │ supplier_id  │   │ product_id   │
   │       │      │ order_number │   │ quantity     │
   │       │      │ status       │   │ unit_cost    │
   │       │      │ subtotal     │   │ subtotal     │
   │       │      │ tax          │   └──────────────┘
   │       │      │ total        │
   │       │      └──────────────┘
   │       │
   │       │      ┌──────────────┐   ┌──────────────┐
   │       │      │  invoices    │   │invoice_items │
   │       │      ├──────────────┤   ├──────────────┤
   │       │      │ id (PK)      │──►│ id (PK)      │
   │       │      │ business_id  │   │ invoice_id   │
   │       │      │ client_id    │   │ product_id   │
   │       │      │ invoice_num  │   │ quantity     │
   │       │      │ status       │   │ unit_price   │
   │       │      │ subtotal     │   │ subtotal     │
   │       │      │ tax          │   └──────────────┘
   │       │      │ total        │
   │       │      └──────────────┘
   │       │
   │       └──────────────────────────────┐
   │                                      │
   │  ┌──────────────────┐                │
   │  │inventory_movements│               │
   │  ├──────────────────┤                │
   │  │ id (PK)          │                │
   │  │ product_id (FK)  │◄───────────────┘
   │  │ user_id (FK)     │
   │  │ type             │
   │  │ (purchase|sale|  │
   │  │  adjustment|     │
   │  │  cancellation)   │
   │  │ quantity         │
   │  │ stock_before     │
   │  │ stock_after      │
   │  │ reason           │
   │  └──────────────────┘
```

### Tables Summary

| Table | Description | Key Relations |
|-------|-------------|---------------|
| `businesses` | Tenant (company) data, plan, subscription | Parent of all data |
| `users` | System users with roles | belongs_to business |
| `categories` | Product classification | belongs_to business |
| `suppliers` | Product providers | belongs_to business |
| `clients` | Customer records (CC/NIT/CE/TI/PP) | belongs_to business |
| `products` | Inventory items with SKU, prices, stock | belongs_to category, business |
| `orders` | POS sales (open/closed/cancelled) | belongs_to user, client |
| `order_items` | Line items in a POS order | belongs_to order, product |
| `purchase_orders` | Supplier purchase orders | belongs_to supplier |
| `purchase_order_items` | Line items in purchase orders | belongs_to purchase_order, product |
| `invoices` | Sales invoices with IVA 19% | belongs_to client |
| `invoice_items` | Line items in invoices | belongs_to invoice, product |
| `cash_registers` | Cash drawer open/close records | belongs_to user, business |
| `inventory_movements` | Stock audit trail | belongs_to product, user |
| `personal_access_tokens` | Laravel Sanctum tokens | polymorphic to user |

### Key Data Types

| Field Pattern | MySQL Type | Notes |
|---------------|------------|-------|
| `*_price`, `*_cost`, `subtotal`, `total`, `tax` | `DECIMAL(12,2)` | Returned as strings by Laravel |
| `status` | `ENUM(...)` | Varies per table |
| `document_type` | `ENUM('CC','NIT','CE','TI','PP')` | Colombian ID types |
| `payment_method` | `ENUM('cash','card','transfer','qr')` | POS payment options |
| `*_at` | `TIMESTAMP` | ISO 8601 format |
| `business_id` | `BIGINT UNSIGNED` | FK to businesses.id |

---

## 4. Frontend Infrastructure (Vue 3)

### Directory Structure

```
src/
├── main.ts                          # App bootstrap (Pinia, Vuetify, Router)
├── App.vue                          # Root component (dynamic layouts)
├── env.d.ts                         # Environment type declarations
├── shims-vue.d.ts                   # Vue SFC type declarations
│
├── app/                             # Application shell
│   ├── layouts/
│   │   ├── DefaultLayout.vue        # Authenticated: AppBar + Sidebar + main
│   │   └── AuthLayout.vue           # Login: centered card
│   └── components/
│       ├── AppBar.vue               # Top navigation bar
│       └── AppSidebar.vue           # Side navigation drawer
│
├── core/                            # Shared infrastructure
│   ├── api/
│   │   └── client.ts               # Axios instance + interceptors
│   ├── composables/
│   │   └── useCrud.ts              # Generic CRUD composable
│   ├── plugins/
│   │   ├── vuetify.ts              # Vuetify 3 config + theme
│   │   └── inactivity.ts           # Auto-logout after 60s idle
│   ├── router/
│   │   ├── index.ts                # Central router (merges module routes)
│   │   └── guards.ts              # Auth + role guards
│   ├── types/
│   │   ├── models.ts              # All domain interfaces
│   │   └── api.ts                 # API response wrappers
│   └── utils/
│       ├── format.ts              # formatCOP(), formatDate()
│       ├── notify.ts              # SweetAlert2 helpers
│       └── recaptcha.ts           # reCAPTCHA v3
│
└── modules/                        # Feature modules
    ├── auth/                       # Login, auth store
    ├── dashboard/                  # KPI dashboard
    ├── catalog/                    # Categories, Suppliers, Clients
    ├── inventory/                  # Products, Stock movements
    ├── pos/                        # Point of Sale (main feature)
    ├── purchases/                  # Purchase orders
    ├── invoices/                   # Sales invoices
    ├── cash-register/              # Cash drawer management
    ├── reports/                    # Daily reports
    ├── settings/                   # Business configuration
    ├── admin/                      # User management
    ├── business/                   # Business domain (stub)
    └── subscription/               # Billing (stub)
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Vue 3 | Reactive UI framework |
| Language | TypeScript (strict) | Type safety |
| UI Library | Vuetify 3 | Material Design components |
| Icons | @mdi/font | Material Design Icons |
| State | Pinia | Centralized state management |
| Routing | Vue Router 4 | SPA navigation with guards |
| HTTP | Axios | API communication |
| Alerts | SweetAlert2 | Confirmation dialogs & notifications |
| Build | Vue CLI 5 (Webpack) | Bundling & dev server |
| Testing | Cypress | End-to-end testing |

### Path Aliases (tsconfig.json + vue.config.js)

```
@/        →  src/
@core/    →  src/core/
@modules/ →  src/modules/
```

### Axios Client Configuration

```typescript
// src/core/api/client.ts
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL + '/api',
  headers: { Accept: 'application/json' },
})

// Request: attach token + business ID
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  const biz = JSON.parse(localStorage.getItem('business'))
  if (biz?.id) config.headers['X-Business-Id'] = biz.id
  return config
})

// Response: auto-logout on 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 5. Module Pattern — Step-by-Step Guide

This section explains how to create a **new module from scratch**, using a fictional "Promotions" module as example.

### Step 1: Create the folder structure

```
src/modules/promotions/
├── index.ts
├── routes.ts
├── types/
│   └── promotions.types.ts
├── services/
│   └── promotion.service.ts
├── views/
│   └── PromotionListView.vue
└── components/
    └── PromotionFormDialog.vue
```

### Step 2: Define the TypeScript types

**File: `src/modules/promotions/types/promotions.types.ts`**

```typescript
export interface Promotion {
  id: number
  name: string
  discount_percent: number
  start_date: string
  end_date: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface PromotionFormPayload {
  name: string
  discount_percent: number
  start_date: string
  end_date: string
  is_active: boolean
}
```

> **Why types first?** TypeScript interfaces define the contract between frontend and backend. Every service, store, and component references these types.

### Step 3: Create the API service

**File: `src/modules/promotions/services/promotion.service.ts`**

```typescript
import api from '@core/api/client'
import type { Promotion, PromotionFormPayload } from '../types/promotions.types'

// GET /api/promotions
export async function fetchPromotions(): Promise<Promotion[]> {
  const { data } = await api.get('/promotions')
  return data.data ?? data  // Handle Laravel's { data: [...] } wrapper
}

// POST /api/promotions
export async function createPromotion(
  payload: PromotionFormPayload
): Promise<Promotion> {
  const { data } = await api.post('/promotions', payload)
  return data.data ?? data
}

// PUT /api/promotions/{id}
export async function updatePromotion(
  id: number,
  payload: PromotionFormPayload
): Promise<Promotion> {
  const { data } = await api.put(`/promotions/${id}`, payload)
  return data.data ?? data
}

// DELETE /api/promotions/{id}
export async function deletePromotion(id: number): Promise<void> {
  await api.delete(`/promotions/${id}`)
}
```

> **Important pattern:** Always use `data.data ?? data` because Laravel responses may or may not wrap the payload in a `data` key.

### Step 4: Create the parent view (PromotionListView)

**File: `src/modules/promotions/views/PromotionListView.vue`**

This is the **parent component**. It manages state, fetches data, and coordinates child components.

```html
<template>
  <v-container>
    <!-- Page header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h2 class="text-h5 text-primary">Promociones</h2>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openForm()">
        Nueva Promoción
      </v-btn>
    </div>

    <!-- Data table -->
    <v-card>
      <v-text-field
        v-model="search"
        label="Buscar"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        class="ma-4"
        style="max-width: 400px"
      />

      <v-data-table
        :headers="headers"
        :items="filteredItems"
        :loading="loading"
        density="compact"
      >
        <template #item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" size="small">
            {{ item.is_active ? 'Activa' : 'Inactiva' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn icon="mdi-pencil" size="small" variant="text"
            @click="editItem(item)" />
          <v-btn icon="mdi-delete" size="small" variant="text" color="error"
            @click="removeItem(item.id)" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Child component: Form Dialog -->
    <PromotionFormDialog
      v-model="showForm"
      :editing="editingItem"
      @saved="onSaved"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { notifySuccess, notifyApiError, confirmAction } from '@core/utils/notify'
import * as promotionService from '../services/promotion.service'
import type { Promotion } from '../types/promotions.types'
import PromotionFormDialog from '../components/PromotionFormDialog.vue'

// State
const items = ref<Promotion[]>([])
const loading = ref(false)
const search = ref('')
const showForm = ref(false)
const editingItem = ref<Promotion | null>(null)

// Table headers
const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Descuento %', key: 'discount_percent' },
  { title: 'Inicio', key: 'start_date' },
  { title: 'Fin', key: 'end_date' },
  { title: 'Estado', key: 'is_active' },
  { title: 'Acciones', key: 'actions', sortable: false },
]

// Computed: filtered items
const filteredItems = computed(() =>
  items.value.filter(p =>
    p.name.toLowerCase().includes(search.value.toLowerCase())
  )
)

// Actions
async function loadData() {
  loading.value = true
  try {
    items.value = await promotionService.fetchPromotions()
  } catch (err) {
    notifyApiError(err, 'Error al cargar promociones')
  } finally {
    loading.value = false
  }
}

function openForm() {
  editingItem.value = null
  showForm.value = true
}

function editItem(item: Promotion) {
  editingItem.value = item
  showForm.value = true
}

async function removeItem(id: number) {
  const confirmed = await confirmAction(
    '¿Eliminar promoción?',
    'Esta acción no se puede deshacer'
  )
  if (!confirmed) return
  try {
    await promotionService.deletePromotion(id)
    notifySuccess('Promoción eliminada')
    await loadData()
  } catch (err) {
    notifyApiError(err, 'Error al eliminar')
  }
}

function onSaved() {
  showForm.value = false
  loadData()
}

onMounted(loadData)
</script>
```

### Step 5: Create the child component (PromotionFormDialog)

**File: `src/modules/promotions/components/PromotionFormDialog.vue`**

This is a **child component**. It receives data via props, emits events to the parent, and handles its own form state.

```html
<template>
  <v-dialog :model-value="modelValue" max-width="500" persistent
    @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title>
        {{ editing ? 'Editar Promoción' : 'Nueva Promoción' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <v-text-field
            v-model="form.name"
            label="Nombre"
            :rules="[r => !!r || 'Requerido']"
            class="mb-2"
          />
          <v-text-field
            v-model.number="form.discount_percent"
            label="Descuento %"
            type="number"
            min="1"
            max="100"
            :rules="[r => r > 0 || 'Debe ser mayor a 0']"
            class="mb-2"
          />
          <v-text-field
            v-model="form.start_date"
            label="Fecha Inicio"
            type="date"
            :rules="[r => !!r || 'Requerido']"
            class="mb-2"
          />
          <v-text-field
            v-model="form.end_date"
            label="Fecha Fin"
            type="date"
            :rules="[r => !!r || 'Requerido']"
            class="mb-2"
          />
          <v-switch
            v-model="form.is_active"
            label="Activa"
            color="success"
          />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn color="primary" :loading="saving" @click="onSubmit">
          {{ editing ? 'Actualizar' : 'Crear' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { notifySuccess, notifyApiError } from '@core/utils/notify'
import * as promotionService from '../services/promotion.service'
import type { Promotion, PromotionFormPayload } from '../types/promotions.types'

// Props & Emits
const props = defineProps<{
  modelValue: boolean
  editing: Promotion | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

// Form state
const saving = ref(false)
const form = ref<PromotionFormPayload>({
  name: '',
  discount_percent: 0,
  start_date: '',
  end_date: '',
  is_active: true,
})

// Watch: populate form when editing
watch(() => props.editing, (val) => {
  if (val) {
    form.value = {
      name: val.name,
      discount_percent: val.discount_percent,
      start_date: val.start_date,
      end_date: val.end_date,
      is_active: val.is_active,
    }
  } else {
    form.value = {
      name: '',
      discount_percent: 0,
      start_date: '',
      end_date: '',
      is_active: true,
    }
  }
})

// Actions
async function onSubmit() {
  saving.value = true
  try {
    if (props.editing) {
      await promotionService.updatePromotion(props.editing.id, form.value)
      notifySuccess('Promoción actualizada')
    } else {
      await promotionService.createPromotion(form.value)
      notifySuccess('Promoción creada')
    }
    emit('saved')
  } catch (err) {
    notifyApiError(err, 'Error al guardar')
  } finally {
    saving.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}
</script>
```

### Step 6: Define the routes

**File: `src/modules/promotions/routes.ts`**

```typescript
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/promotions',
    name: 'promotions',
    component: () => import('./views/PromotionListView.vue'),
    meta: { requiresAuth: true },
  },
]

export default routes
```

> **Lazy loading:** `() => import(...)` ensures the component is only loaded when the user navigates to that route.

### Step 7: Create the barrel export

**File: `src/modules/promotions/index.ts`**

```typescript
export { default as routes } from './routes'
```

### Step 8: Register the module in the central router

**File: `src/core/router/index.ts`**

```typescript
// Add this import at the top:
import { routes as promotionRoutes } from '@modules/promotions'

// Add to the routes array:
const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...dashboardRoutes,
  ...promotionRoutes,    // ← ADD HERE
  // ... other routes
]
```

### Step 9: Add to the sidebar navigation

**File: `src/app/components/AppSidebar.vue`**

```html
<!-- Add inside the appropriate v-list-group: -->
<v-list-item
  prepend-icon="mdi-percent"
  title="Promociones"
  to="/promotions"
/>
```

### Summary: Module Creation Checklist

| Step | File | Purpose |
|------|------|---------|
| 1 | `types/{module}.types.ts` | TypeScript interfaces |
| 2 | `services/{entity}.service.ts` | API calls (GET/POST/PUT/DELETE) |
| 3 | `views/{Entity}ListView.vue` | Parent view (page component) |
| 4 | `components/{Component}.vue` | Child components (dialogs, cards) |
| 5 | `routes.ts` | Vue Router route definitions |
| 6 | `index.ts` | Barrel export |
| 7 | `core/router/index.ts` | Register routes in central router |
| 8 | `AppSidebar.vue` | Add navigation link |

---

## 6. Parent-Child Component Relationships

### Communication Patterns

```
┌─────────────────────────────────────────┐
│            PARENT VIEW                  │
│         (e.g., PosView.vue)             │
│                                         │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  Child A     │  │  Child B          │  │
│  │ ProductCard  │  │  CartPanel        │  │
│  │              │  │                   │  │
│  │ Props: ↓     │  │ Props: ↓          │  │
│  │  product     │  │  (reads store)    │  │
│  │  disabled    │  │                   │  │
│  │              │  │ Events: ↑          │  │
│  │ Events: ↑    │  │  open-payment     │  │
│  │  @add        │  │                   │  │
│  └─────────────┘  │ ┌──────────────┐  │  │
│                    │ │ Grandchild    │  │  │
│                    │ │ CartItem      │  │  │
│                    │ │               │  │  │
│                    │ │ Props: ↓      │  │  │
│                    │ │  item         │  │  │
│                    │ │               │  │  │
│                    │ │ Events: ↑     │  │  │
│                    │ │  @remove      │  │  │
│                    │ └──────────────┘  │  │
│                    └──────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  Child C: PaymentDialog          │   │
│  │                                   │   │
│  │  Props: ↓                         │   │
│  │   modelValue (v-model)            │   │
│  │   total                           │   │
│  │                                   │   │
│  │  Events: ↑                        │   │
│  │   @confirm(paymentMethod, client) │   │
│  │   @update:modelValue              │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Rules of Communication

| Direction | Mechanism | Example |
|-----------|-----------|---------|
| Parent → Child | **Props** | `:product="item"` `:disabled="!stock"` |
| Child → Parent | **Events (emit)** | `@add="onAddProduct"` `@remove="onRemove"` |
| Sibling → Sibling | **Pinia Store** | PosCartPanel reads `posStore.cartItems` |
| Deep Nesting | **Pinia Store** | Any component can `usePosStore()` |

### Real Example: POS Module Component Tree

```
PosView.vue (PARENT - orchestrator)
│
├── PosOrderTabs.vue
│   Props: orders, activeId
│   Emits: @select(orderId), @create
│
├── PosCategoryTabs.vue
│   Props: categories, modelValue
│   Emits: @update:modelValue(categoryId)
│
├── PosProductCard.vue (repeated in v-for)
│   Props: product, disabled
│   Emits: @add(product)
│
├── PosCartPanel.vue
│   Props: (reads posStore directly)
│   Emits: @open-payment
│   │
│   └── PosCartItem.vue (repeated in v-for)
│       Props: item
│       Emits: @remove(itemId)
│
└── PosPaymentDialog.vue
    Props: modelValue, total
    Emits: @update:modelValue, @confirm(method, clientId)
```

### When to Use Props vs Store

| Scenario | Use |
|----------|-----|
| Simple parent → child data | **Props** |
| Child notifies parent of action | **Emits** |
| Multiple components need same data | **Pinia Store** |
| Form dialog receives edit data | **Props** (editing item) |
| Global state (auth, cart, cash register) | **Pinia Store** |

---

## 7. Complete API Endpoints Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/login` | Login (returns token + user + business) |
| GET | `/api/me` | Get current user info |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Today's sales, month sales, invoice count, low stock |

### Catalog

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/{id}` | Update category |
| DELETE | `/api/categories/{id}` | Delete category |
| GET | `/api/suppliers` | List all suppliers |
| POST | `/api/suppliers` | Create supplier |
| PUT | `/api/suppliers/{id}` | Update supplier |
| DELETE | `/api/suppliers/{id}` | Delete supplier |
| GET | `/api/clients` | List all clients |
| POST | `/api/clients` | Create client |
| PUT | `/api/clients/{id}` | Update client |
| DELETE | `/api/clients/{id}` | Delete client |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| GET | `/api/inventory-movements` | List stock movements |
| POST | `/api/inventory-movements/adjust` | Manual stock adjustment |

### POS Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/open` | List open orders with items |
| POST | `/api/orders` | Create new order (generates ORD-XXXX) |
| POST | `/api/orders/{id}/add-item` | Add product to order (deducts stock) |
| DELETE | `/api/orders/{id}/remove-item/{itemId}` | Remove item (returns stock) |
| POST | `/api/orders/{id}/close` | Close order (set payment method) |
| POST | `/api/orders/{id}/cancel` | Cancel order (returns all stock) |

### Purchase Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/purchase-orders` | List purchase orders |
| GET | `/api/purchase-orders/{id}` | Get purchase order detail |
| POST | `/api/purchase-orders` | Create purchase order |
| PATCH | `/api/purchase-orders/{id}/receive` | Mark as received (adds stock) |
| PATCH | `/api/purchase-orders/{id}/cancel` | Cancel purchase order |

### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | List invoices |
| GET | `/api/invoices/{id}` | Get invoice detail |
| POST | `/api/invoices` | Create invoice |
| PATCH | `/api/invoices/{id}/cancel` | Cancel invoice |

### Cash Register

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cash-registers/current` | Get current open register |
| POST | `/api/cash-registers/open` | Open cash register |
| POST | `/api/cash-registers/{id}/close` | Close cash register |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Daily report (date optional) |

### Business & Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/business` | Get business info |
| GET | `/api/business/settings` | Get business settings |
| POST | `/api/business/settings` | Save settings + logo (multipart) |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (admin only) |

---

## 8. Route Map

| Path | Module | View Component | Auth | Role | Layout |
|------|--------|----------------|------|------|--------|
| `/login` | auth | LoginView | No | — | AuthLayout |
| `/dashboard` | dashboard | DashboardView | Yes | — | Default |
| `/categories` | catalog | CategoryListView | Yes | — | Default |
| `/suppliers` | catalog | SupplierListView | Yes | — | Default |
| `/clients` | catalog | ClientListView | Yes | — | Default |
| `/products` | inventory | ProductListView | Yes | — | Default |
| `/inventory` | inventory | InventoryMovementListView | Yes | — | Default |
| `/pos` | pos | PosView | Yes | — | Fullscreen |
| `/purchase-orders` | purchases | PurchaseOrderListView | Yes | — | Default |
| `/purchase-orders/:id` | purchases | PurchaseOrderDetailView | Yes | — | Default |
| `/invoices` | invoices | InvoiceListView | Yes | — | Default |
| `/invoices/:id` | invoices | InvoiceDetailView | Yes | — | Default |
| `/cash-register` | cash-register | CashRegisterView | Yes | — | Default |
| `/reports/daily` | reports | DailyReportView | Yes | — | Default |
| `/settings` | settings | SettingsView | Yes | — | Default |
| `/users` | admin | UserListView | Yes | admin | Default |
| `/*` | — | Redirect → /login | — | — | — |

---

## 9. TypeScript Type Reference

### Union Types (Enums)

```typescript
type SubscriptionStatus = 'active' | 'trial' | 'past_due' | 'cancelled'
type PlanTier           = 'free' | 'starter' | 'pro' | 'enterprise'
type PaymentMethod      = 'cash' | 'card' | 'transfer' | 'qr'
type OrderStatus        = 'open' | 'closed' | 'cancelled'
type PurchaseOrderStatus= 'pending' | 'received' | 'cancelled'
type InvoiceStatus      = 'completed' | 'cancelled'
type InventoryMovementType = 'purchase' | 'sale' | 'adjustment' | 'cancellation'
type CashRegisterStatus = 'open' | 'closed'
```

### Domain Interfaces

```typescript
interface Business {
  id: number; name: string; slug?: string
  logo?: string | null; logo_url?: string | null
  address?: string; phone?: string; email?: string; nit?: string
  plan?: PlanTier; subscription_plan?: string
  subscription_status: SubscriptionStatus
  plan_limits?: unknown; trial_ends_at?: string | null
}

interface User {
  id: number; name: string; email: string
  role: 'admin' | 'user'
  business_id?: number; business?: Business
}

interface Category {
  id: number; name: string; description?: string
}

interface Supplier {
  id: number; name: string; nit: string
  phone?: string; email?: string; contact_person?: string
  is_active: boolean
}

interface Client {
  id: number; document_type: 'CC'|'NIT'|'CE'|'TI'|'PP'
  document_number: string; name: string
  phone?: string; email?: string; address?: string
}

interface Product {
  id: number; sku: string; name: string; description?: string
  category_id: number; category?: Category
  purchase_price: number; sale_price: number
  stock: number; minimum_stock: number; is_active: boolean
}

interface Order {
  id: number; order_number: string; status: OrderStatus
  payment_method?: PaymentMethod; total: number
  items: OrderItem[]
  user_id?: number; user?: User
  client_id?: number | null; client?: Client | null
}

interface OrderItem {
  id: number; order_id: number; product_id: number
  product?: Product; quantity: number
  unit_price: number; subtotal: number
}

interface PurchaseOrder {
  id: number; order_number?: string
  supplier_id: number; supplier?: Supplier
  status: PurchaseOrderStatus
  subtotal: number; tax: number; total: number
  items: PurchaseOrderItem[]
}

interface Invoice {
  id: number; invoice_number?: string
  client_id: number; client?: Client
  status: InvoiceStatus
  subtotal: number; tax: number; total: number
  items: InvoiceItem[]
}

interface CashRegister {
  id: number; user_id: number; user?: User
  business_id: number; status: CashRegisterStatus
  opening_amount: number; closing_amount?: number | null
  total_sales?: number; total_cash?: number
  total_card?: number; total_transfer?: number; total_qr?: number
  orders_closed?: number; notes?: string | null
  opened_at: string; closed_at?: string | null
}

interface InventoryMovement {
  id: number; product_id: number; product?: Product
  user_id: number; user?: User
  type: InventoryMovementType; quantity: number
  stock_before: number; stock_after: number; reason?: string
}

interface DashboardStats {
  ventas_hoy: number; ventas_mes: number
  facturas_hoy: number; productos_stock_bajo: Product[]
}
```

---

**End of Manual**

*Generated: February 14, 2026*
*Project: POS Bar/Cantina — Frontend v2.0*
