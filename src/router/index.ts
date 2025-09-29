import { createRouter, createWebHistory } from 'vue-router'
import POSLayout from '@/layouts/POSLayout.vue'
import POSPage from '@/views/POSPage.vue'
import ProductsAdminView from '@/views/ProductsAdminView.vue'
import SalesHistoryView from '@/views/SalesHistoryView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: POSLayout,
      children: [
        {
          path: '',
          redirect: '/pos/sale'
        },
        {
          path: 'pos/sale',
          name: 'pos-sale',
          component: POSPage,
          meta: {
            title: 'Punto de Venta'
          }
        },
        {
          path: 'pos/productos',
          name: 'products-admin',
          component: ProductsAdminView,
          meta: {
            title: 'Gestión de Productos'
          }
        },
        {
          path: 'pos/tickets',
          name: 'sales-history',
          component: SalesHistoryView,
          meta: {
            title: 'Historial de Ventas'
          }
        }
      ]
    },
    // Redirect any unmatched routes to main POS
    {
      path: '/:pathMatch(.*)*',
      redirect: '/pos/sale'
    }
  ],
})

// Navigation guards with simple authentication
router.beforeEach((to, from, next) => {
  // Set page title
  if (to.meta?.title) {
    document.title = `${to.meta.title} - POS Agent Hub`
  } else {
    document.title = 'POS Agent Hub'
  }

  const authStore = useAuthStore()

  // Check if user has token in localStorage
  if (!authStore.isAuthenticated) {
    // No token found, redirect to main system for authentication
    console.log('POS access denied: No authentication token. Redirecting to main system.')

    // Get the domain from the current URL to redirect to the main system
    const currentHost = window.location.host
    const protocol = window.location.protocol
    const mainSystemUrl = `${protocol}//${currentHost}/`

    // Redirect to main system
    window.location.href = mainSystemUrl
    return
  }

  // Token exists, continue navigation
  // Backend will validate token in actual API calls
  next()
})

export default router
