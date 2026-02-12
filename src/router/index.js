import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '@/components/LoginForm.vue'
import UserList from '@/components/UserList.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', component: LoginForm },
  {
    path: '/users',
    component: UserList,
    meta: { requiresAuth: true }
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.token) {
    return next('/login')
  }

  if (to.path === '/login' && auth.token) {
    return next('/users')
  }

  next()
})

export default router
