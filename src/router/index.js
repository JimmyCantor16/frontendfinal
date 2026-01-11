import { createRouter, createWebHistory } from 'vue-router'
import LoginForm from '../components/LoginForm.vue'
import UserList from '../components/UserList.vue'

const routes = [
  { path: '/', component: LoginForm },
  { path: '/users', component: UserList, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) next('/')
  else next()
})

export default router
