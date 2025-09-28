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
          redirect: '/sale'
        },
        {
          path: 'sale',
          name: 'pos-sale',
          component: POSPage,
          meta: {
            title: 'Punto de Venta'
          }
        },
        {
          path: 'products',
          name: 'products-admin',
          component: ProductsAdminView,
          meta: {
            title: 'Gestión de Productos'
          }
        },
        {
          path: 'tickets',
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
      redirect: '/sale'
    }
  ],
})

// Navigation guards with authentication
router.beforeEach(async (to, from, next) => {
  // Set page title
  if (to.meta?.title) {
    document.title = `${to.meta.title} - POS Agent Hub`
  } else {
    document.title = 'POS Agent Hub'
  }

  const authStore = useAuthStore()

  // Initialize authentication on first navigation
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // User is not authenticated, redirect to main system
    console.log('POS access denied: User not authenticated. Redirecting to main system.')

    // Get the domain from the current URL to redirect to the main system
    const currentHost = window.location.host
    const protocol = window.location.protocol
    const mainSystemUrl = `${protocol}//${currentHost}/`

    // Redirect to main system
    window.location.href = mainSystemUrl
    return
  }

  // User is authenticated, continue navigation
  next()
})

export default router
