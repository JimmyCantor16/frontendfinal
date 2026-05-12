import type { RouteRecordRaw } from 'vue-router'

// Rutas del módulo Business.
// - /businesses          : pantalla de administración (layout default, requiere auth)
// - /onboarding/business : formulario standalone para crear el primer negocio
//   (layout `auth` para que no se renderice el sidebar/appbar del shell principal).
const routes: RouteRecordRaw[] = [
  {
    path: '/businesses',
    name: 'businesses',
    component: () => import('./views/BusinessListView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/onboarding/business',
    name: 'business-onboarding',
    component: () => import('./views/BusinessOnboardingView.vue'),
    meta: { requiresAuth: true, layout: 'auth' },
  },
]

export { routes }
export default routes
