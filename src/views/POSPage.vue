<!--
POSPage - Vista Principal del POS

Vista principal del sistema POS que combina todos los componentes:
- Búsqueda de clientes
- Gestión de productos y carrito
- Métodos de pago y resumen de venta

Layout responsive con diseño 2/3 + 1/3 siguiendo las especificaciones.
-->

<template>
  <div class="pos-page">
    <!-- Customer Search Section -->
    <div class="customer-section">
      <CustomerSearch />
    </div>

    <!-- Main POS Content -->
    <div class="pos-content">
      <!-- Products Section (2/3) -->
      <div class="products-section">
        <v-card elevation="2" class="h-100 d-flex flex-column">
          <v-card-title class="d-flex align-center pa-2 bg-primary">
            <v-icon class="me-2 text-white">mdi-package-variant</v-icon>
            <span class="text-white font-weight-bold">Productos</span>
          </v-card-title>

          <v-card-text class="pa-3 flex-grow-1 overflow-auto">
            <!-- Product Search -->
            <div class="product-search-section mb-4">
              <ProductSearch />
            </div>

            <!-- Cart Display -->
            <div class="cart-section">
              <SaleCart />
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Summary Section (1/3) -->
      <div class="summary-section">
        <v-card elevation="2" class="h-100 d-flex flex-column">
          <v-card-title class="d-flex align-center pa-2 bg-primary">
            <v-icon class="me-2 text-white">mdi-calculator</v-icon>
            <span class="text-white font-weight-bold">Resumen Venta</span>
          </v-card-title>

          <v-card-text class="pa-0 flex-grow-1 d-flex flex-column">
            <!-- Sale Summary -->
            <div class="sale-summary-section flex-grow-1">
              <SaleSummary @sale-completed="handleSaleCompleted" />
            </div>

            <!-- Payment Methods -->
            <div class="payment-methods-section">
              <PaymentMethods />
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- Success Dialog -->
    <v-dialog
      v-model="showSuccessDialog"
      max-width="500"
      persistent
    >
      <v-card elevation="8">
        <v-card-title class="d-flex align-center pa-4 bg-success">
          <v-icon class="me-3 text-white" size="large">mdi-check-circle</v-icon>
          <span class="text-white font-weight-bold text-h6">¡Venta Registrada!</span>
        </v-card-title>

        <v-card-text class="pa-6 text-center">
          <v-icon size="120" color="success" class="mb-4">
            mdi-cash-register
          </v-icon>

          <h2 class="text-h5 mb-3">Venta completada exitosamente</h2>

          <div v-if="lastSale" class="sale-details mb-4">
            <v-card variant="outlined" class="pa-3">
              <div class="d-flex justify-space-between mb-2">
                <span class="font-weight-medium">ID Venta:</span>
                <span class="font-family-monospace text-primary">{{ lastSale.id }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="font-weight-medium">Cliente:</span>
                <span>{{ lastSale.customer?.name || 'Sin nombre' }}</span>
              </div>
              <div class="d-flex justify-space-between mb-2">
                <span class="font-weight-medium">Total:</span>
                <span class="font-weight-bold text-success text-h6">
                  ${{ parseFloat(lastSale.total_amount).toFixed(2) }}
                </span>
              </div>
              <div class="d-flex justify-space-between">
                <span class="font-weight-medium">Puntos Generados:</span>
                <span class="font-weight-bold text-warning">
                  {{ lastSale.loyalty_points_generated || 0 }} puntos
                </span>
              </div>
            </v-card>
          </div>

          <p class="text-body-1 text-on-surface-variant">
            La venta se ha registrado correctamente y los puntos de lealtad
            han sido actualizados en la cuenta del cliente.
          </p>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn
            color="primary"
            variant="flat"
            size="large"
            @click="startNewSale"
          >
            <v-icon start>mdi-plus</v-icon>
            Nueva Venta
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCustomerStore } from '@/stores/customer'
import { usePOSStore } from '@/stores/pos'
import type { Sale } from '@/types/pos'

// Components
import CustomerSearch from '@/components/pos/CustomerSearch.vue'
import ProductSearch from '@/components/pos/ProductSearch.vue'
import SaleCart from '@/components/pos/SaleCart.vue'
import PaymentMethods from '@/components/pos/PaymentMethods.vue'
import SaleSummary from '@/components/pos/SaleSummary.vue'

const customerStore = useCustomerStore()
const posStore = usePOSStore()

// Reactive state
const showSuccessDialog = ref<boolean>(false)
const lastSale = ref<Sale | null>(null)

// Computed
const hasCustomer = computed(() => customerStore.hasCustomer)

// Methods
const handleSaleCompleted = (sale: Sale) => {
  lastSale.value = sale
  showSuccessDialog.value = true
}

const startNewSale = () => {
  // Reset sale dialog
  showSuccessDialog.value = false
  lastSale.value = null

  // Clear current customer (user can select the same or different customer)
  customerStore.clearCurrentCustomer()

  // Cart should already be cleared by the store after successful sale
  // but let's ensure it's clean
  posStore.clearCart()
}
</script>

<style scoped>
/* Main POS layout with 2/3 + 1/3 grid */
.pos-page {
  height: 100vh;
  background: rgb(var(--v-theme-background));
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Customer search section */
.customer-section {
  flex-shrink: 0;
  margin-bottom: 16px;
}

/* Main content area with 2/3 + 1/3 grid */
.pos-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  flex-grow: 1;
  min-height: 0;
}

/* Products section (2/3) */
.products-section {
  min-height: 0;
}

/* Summary section (1/3) */
.summary-section {
  min-height: 0;
}


/* Success dialog styling */
.sale-details {
  max-width: 300px;
  margin: 0 auto;
}

/* Responsive design */
@media (max-width: 1200px) {
  .pos-content {
    grid-template-columns: 1.8fr 1.2fr;
  }
}

@media (max-width: 959px) {
  .pos-content {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
    gap: 12px;
  }

  .summary-section {
    max-height: 50vh;
  }

  .customer-section {
    padding: 12px;
    padding-bottom: 0;
  }

  .pos-content {
    padding: 12px;
  }
}

@media (max-width: 599px) {
  .pos-page {
    height: calc(100vh - 64px); /* Account for app bar height */
  }

  .pos-content {
    grid-template-rows: auto 1fr;
    gap: 8px;
    padding: 8px;
  }

  .summary-section {
    order: -1; /* Show summary first on mobile */
    max-height: none;
  }

  .products-section {
    order: 1;
  }
}

/* Ensure proper card heights */
.v-card.h-100 {
  height: 100% !important;
}

/* Custom scrollbar for payment methods section */
.payment-methods-section {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

.payment-methods-section::-webkit-scrollbar {
  width: 4px;
}

.payment-methods-section::-webkit-scrollbar-track {
  background: transparent;
}

.payment-methods-section::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 2px;
}

.payment-methods-section::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

/* Ensure proper flex behavior */
.d-flex.flex-column.h-100 {
  height: 100% !important;
}


/* Monospace font for sale ID */
.font-family-monospace {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}
</style>