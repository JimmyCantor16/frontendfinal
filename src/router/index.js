import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import UserList from '../components/UserList.vue';

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginForm
  },
  {
    path: '/users',
    name: 'users',
    component: UserList,
    meta: { requiresAuth: true } // 👈 AQUÍ
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 🔐 Guard global
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    next('/');
  } else {
    next();
  }
});

export default router;
