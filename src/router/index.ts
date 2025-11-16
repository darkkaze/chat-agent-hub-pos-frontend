import { createRouter, createWebHistory } from 'vue-router'
import POSLayout from '@/layouts/POSLayout.vue'
import POSPage from '@/views/POSPage.vue'
import ProductsAdminView from '@/views/ProductsAdminView.vue'
import SalesHistoryView from '@/views/SalesHistoryView.vue'
import SignalsAdminView from '@/views/SignalsAdminView.vue'
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
            title: 'Punto de Venta',
            requiresAuth: true // Available to all authenticated users
          }
        },
        {
          path: 'productos',
          name: 'products-admin',
          component: ProductsAdminView,
          meta: {
            title: 'Gestión de Productos',
            requiresAuth: true,
            requiresAdmin: true // Only for ADMIN users
          }
        },
        {
          path: 'tickets',
          name: 'sales-history',
          component: SalesHistoryView,
          meta: {
            title: 'Historial de Ventas',
            requiresAuth: true,
            requiresAdmin: true // Only for ADMIN users
          }
        },
        {
          path: 'signals',
          name: 'signals-admin',
          component: SignalsAdminView,
          meta: {
            title: 'Gestión de Signals',
            requiresAuth: true,
            requiresAdmin: true // Only for ADMIN users
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

// Navigation guards with authentication and authorization
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

  // Token exists, check role-based access
  if (to.meta?.requiresAdmin && !authStore.isAdmin) {
    // User doesn't have admin role, redirect to sale view
    console.log(`Access denied to ${to.path}: User role is ${authStore.userRole}, ADMIN required. Redirecting to /sale`)
    next('/sale')
    return
  }

  // User is authenticated and authorized
  next()
})

export default router
