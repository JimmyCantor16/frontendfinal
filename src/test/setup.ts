/**
 * Test helpers for Vue component tests.
 *
 * Provides factory helpers to mount Vue 3 components with the same plugins
 * the app uses at runtime: Vuetify 3, Pinia, vue-router (in-memory).
 *
 * NOTE: This file is intentionally NOT registered as a Vitest `setupFiles`
 * entry. The global setup lives in `tests/setup.ts` (which mocks
 * localStorage, sweetalert2, recaptcha and stubs Vuetify components for the
 * pre-existing service/store/util tests). Component tests import the helpers
 * below explicitly so they can opt-in to a real Vuetify instance.
 */
import { vi } from 'vitest'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export function makeVuetify() {
  return createVuetify({ components, directives })
}

export function makePinia(): Pinia {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

export function makeRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/login', component: { template: '<div />' } },
      { path: '/dashboard', component: { template: '<div />' } },
      { path: '/cash-register', component: { template: '<div />' } },
      { path: '/invoices/:id', component: { template: '<div />' } },
    ],
  })
}

export interface TestPlugins {
  vuetify: ReturnType<typeof createVuetify>
  pinia: Pinia
  router: Router
}

export function makeTestPlugins(): TestPlugins {
  return {
    vuetify: makeVuetify(),
    pinia: makePinia(),
    router: makeRouter(),
  }
}

/**
 * Axios mock factory shaped like the real `@core/api/client` default export.
 * Use inside `vi.mock('@core/api/client', ...)`.
 */
export function makeAxiosMock() {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    },
  }
}
