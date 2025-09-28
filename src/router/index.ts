import { createRouter, createWebHistory } from 'vue-router'
import POSLayout from '@/layouts/POSLayout.vue'
import POSPage from '@/views/POSPage.vue'
import ProductsAdminView from '@/views/ProductsAdminView.vue'
import SalesHistoryView from '@/views/SalesHistoryView.vue'

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

// Navigation guards for future authentication
router.beforeEach((to, from, next) => {
  // Set page title
  if (to.meta?.title) {
    document.title = `${to.meta.title} - POS Agent Hub`
  } else {
    document.title = 'POS Agent Hub'
  }

  // For now, allow all navigation
  // TODO: Add authentication checks when needed
  next()
})

export default router
