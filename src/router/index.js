import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import UserList from '../components/UserList.vue';

const routes = [
  { path: '/', name: 'Login', component: LoginForm },
  { path: '/users', name: 'Users', component: UserList, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 🔑 Navigation Guard
router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user');

  if (to.meta.requiresAuth && !user) {
    next({ path: '/' });
  } else {
    next();
  }
});

export default router;
