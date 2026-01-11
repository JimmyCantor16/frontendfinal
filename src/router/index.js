import { createRouter, createWebHistory } from 'vue-router';
import LoginForm from '@/components/LoginForm.vue'; // usa @ en lugar de ../
import UserList from '@/components/UserList.vue';

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
    meta: { requiresAuth: true } // requiere token
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guard global para proteger rutas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');

  if (to.meta.requiresAuth && !token) {
    // si la ruta requiere autenticación y no hay token
    return next('/'); // redirige a login
  }

  next(); // continuar si hay token o no se requiere autenticación
});

export default router;
