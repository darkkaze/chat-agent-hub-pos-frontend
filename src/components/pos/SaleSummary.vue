<!--
SaleSummary Component

Componente que muestra el resumen final de la venta incluyendo
totales, loyalty points y botón para registrar la venta.

Props: ninguno
Emits: saleCompleted - Cuando se completa una venta exitosamente
-->

<template>
  <v-card elevation="0" class="h-100 d-flex flex-column">
    <!-- Summary Header -->
    <v-card-title class="pa-3 bg-primary">
      <v-icon class="me-2 text-white">mdi-calculator</v-icon>
      <span class="text-white font-weight-bold">Resumen Venta</span>
    </v-card-title>

    <v-card-text class="pa-3 flex-grow-1 d-flex flex-column">
      <!-- Totals Section -->
      <div class="totals-section mb-4">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="font-weight-medium">Subtotal:</span>
          <span class="font-weight-bold text-h6">${{ subtotal }}</span>
        </div>

        <div v-if="parseFloat(discountAmount) > 0" class="d-flex justify-space-between align-center mb-2 text-warning">
          <span>Descuento:</span>
          <span>-${{ discountAmount }}</span>
        </div>

        <v-divider class="my-3" />

        <div class="d-flex justify-space-between align-center mb-4">
          <span class="font-weight-bold text-h5">TOTAL:</span>
          <span class="font-weight-bold text-h4 text-primary">${{ totalAmount }}</span>
        </div>
      </div>

      <!-- Loyalty Points Section -->
      <div class="loyalty-section mb-4">
        <v-card variant="outlined" color="warning" class="loyalty-card">
          <v-card-text class="pa-3">
            <div class="d-flex align-center mb-2">
              <v-icon color="warning" class="me-2">mdi-star</v-icon>
              <span class="font-weight-bold">Loyalty Points</span>
            </div>

            <div class="d-flex align-center justify-space-between">
              <v-select
                v-model="selectedLoyaltyRate"
                :items="loyaltyRateOptions"
                item-title="label"
                item-value="value"
                density="compact"
                variant="outlined"
                style="max-width: 120px;"
                :disabled="!canModifyLoyalty"
              />

              <div class="text-end">
                <div class="font-weight-bold text-h6 text-warning">
                  = {{ loyaltyPointsGenerated }} puntos
                </div>
                <div class="text-caption text-on-surface-variant">
                  por esta compra
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Payment Status -->
      <div class="payment-status mb-4">
        <v-alert
          v-if="!isPaymentValid && hasItems"
          type="error"
          variant="tonal"
          density="compact"
        >
          <v-icon start>mdi-alert-circle</v-icon>
          Configura los métodos de pago correctamente
        </v-alert>

        <v-alert
          v-else-if="isPaymentValid && hasItems"
          type="success"
          variant="tonal"
          density="compact"
        >
          <v-icon start>mdi-check-circle</v-icon>
          Listo para procesar venta
        </v-alert>

        <v-alert
          v-else-if="!hasCustomer"
          type="info"
          variant="tonal"
          density="compact"
        >
          <v-icon start>mdi-account-search</v-icon>
          Selecciona un cliente para comenzar
        </v-alert>

        <v-alert
          v-else
          type="info"
          variant="tonal"
          density="compact"
        >
          <v-icon start>mdi-cart</v-icon>
          Agrega productos al carrito
        </v-alert>
      </div>

      <!-- Spacer -->
      <div style="flex-grow: 1;"></div>

      <!-- Action Button -->
      <div class="action-section">
        <v-btn
          color="primary"
          variant="flat"
          size="large"
          block
          :disabled="!canProcessSale"
          :loading="isProcessingSale"
          @click="handleProcessSale"
        >
          <v-icon start size="large">mdi-cash-register</v-icon>
          <span class="font-weight-bold text-h6">REGISTRAR VENTA</span>
        </v-btn>

        <!-- Sale Status -->
        <div v-if="isProcessingSale" class="text-center mt-2">
          <div class="text-body-2 text-primary">
            Procesando venta, por favor espera...
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePOSStore } from '@/stores/pos'
import { useCustomerStore } from '@/stores/customer'

interface Emits {
  (e: 'saleCompleted', sale: any): void
}

const emit = defineEmits<Emits>()

const posStore = usePOSStore()
const customerStore = useCustomerStore()

// Local state
const selectedLoyaltyRate = ref<number>(0.10)

// Loyalty rate options
const loyaltyRateOptions = [
  { label: '5%', value: 0.05 },
  { label: '10%', value: 0.10 },
  { label: '15%', value: 0.15 },
  { label: '20%', value: 0.20 }
]

// Computed
const subtotal = computed(() => posStore.subtotal)
const discountAmount = computed(() => posStore.discountAmount)
const totalAmount = computed(() => posStore.totalAmount)
const loyaltyPointsGenerated = computed(() => posStore.loyaltyPointsGenerated)
const isPaymentValid = computed(() => posStore.isPaymentValid)
const canProcessSale = computed(() => posStore.canProcessSale)
const isProcessingSale = computed(() => posStore.isProcessingSale)

const hasCustomer = computed(() => customerStore.hasCustomer)
const hasItems = computed(() => posStore.cartItems.length > 0)

const canModifyLoyalty = computed(() => {
  return hasCustomer.value && hasItems.value && !isProcessingSale.value
})

// Methods
const handleProcessSale = async () => {
  if (!canProcessSale.value || !customerStore.currentCustomer) {
    return
  }

  try {
    const sale = await posStore.processSale(customerStore.currentCustomer.id)

    // Refresh customer data to get updated loyalty points
    await customerStore.refreshCurrentCustomer()

    emit('saleCompleted', sale)

    // Show success feedback (could be improved with toast notifications)
    console.log('Sale completed successfully:', sale)

  } catch (error) {
    console.error('Error processing sale:', error)
    // Error handling could be improved with toast notifications
  }
}

// Watch loyalty rate changes (if needed for future enhancements)
watch(selectedLoyaltyRate, (newRate) => {
  // For now, loyalty rate is handled by the backend
  // This could be extended to allow custom rates
  console.log('Loyalty rate changed to:', newRate)
})
</script>

<style scoped>
.totals-section {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 16px;
}

.loyalty-section .loyalty-card {
  background: rgba(var(--v-theme-warning), 0.1);
}

.payment-status {
  flex-shrink: 0;
}

.action-section {
  flex-shrink: 0;
}

/* Make the register button more prominent */
.v-btn--size-large {
  min-height: 60px !important;
}

.v-btn--size-large .v-icon {
  font-size: 2rem !important;
}

/* Custom styling for totals */
.totals-section .v-divider {
  border-color: rgba(var(--v-theme-primary), 0.3);
  border-width: 1px;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .d-flex.justify-space-between.align-center {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .loyalty-section .d-flex.justify-space-between {
    flex-direction: column;
    gap: 12px;
  }

  .loyalty-section .v-select {
    max-width: none !important;
  }

  .loyalty-section .text-end {
    text-align: center !important;
  }
}

/* Animation for processing state */
.v-btn--loading {
  pointer-events: none;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.v-btn--loading {
  animation: pulse 1.5s infinite;
}
</style>