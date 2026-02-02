import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/DashboardView.vue'
import LogsView from '@/views/LogsView.vue'
import PinnedAreasView from '@/views/PinnedAreasView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/logs',
      name: 'logs',
      component: LogsView,
    },
    {
      path: '/pinned-areas',
      name: 'pinned-areas',
      component: PinnedAreasView,
    },
  ],
})

export default router
