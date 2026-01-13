import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '@/components/LoginForm.vue';
import UserList from '@/components/UserList.vue';
import { useAuthStore } from '@/stores/auth';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginForm },
  { 
    path: '/users', 
    component: UserList,
    beforeEnter: (to, from, next) => {
      const auth = useAuthStore();
      if (!auth.isAuthenticated) return next('/login');
      next();
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
