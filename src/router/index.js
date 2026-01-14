import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '@/components/LoginForm.vue';
import UserList from '@/components/UserList.vue';
import { useAuthStore } from '@/stores/auth';

const routes = [
  { path: '/login', component: LoginForm },
  {
    path: '/users',
    component: UserList,
    meta: { requiresAuth: true, role: 'admin' }
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  // Si hay token pero no usuario, traerlo
  if (auth.token && !auth.user) {
    await auth.fetchUser();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login');
  }

  if (to.meta.role) {
    const hasRole = auth.user?.roles?.some(
      r => r.name === to.meta.role
    );

    if (!hasRole) return next('/login');
  }

  next();
});

export default router;
