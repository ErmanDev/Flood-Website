import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import LogsView from '@/views/LogsView.vue'
import PinnedAreasView from '@/views/PinnedAreasView.vue'
import UserManagementView from '@/views/UserManagementView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/logs',
      name: 'logs',
      component: LogsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/pinned-areas',
      name: 'pinned-areas',
      component: PinnedAreasView,
      meta: { requiresAuth: true }
    },
    {
      path: '/user-management',
      name: 'user-management',
      component: UserManagementView,
      meta: { requiresAuth: true }
    }
  ],
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router
