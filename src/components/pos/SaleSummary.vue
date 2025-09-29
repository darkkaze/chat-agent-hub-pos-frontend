<!--
SaleSummary Component - Simplificado

Resumen simple de venta con solo el total y botón de cobrar.
-->

<template>
  <div class="sale-summary pa-3">
    <!-- Simple Total Display -->
    <div class="total-section mb-4">
      <div class="d-flex justify-space-between align-center">
        <span class="font-weight-bold text-h5">TOTAL:</span>
        <span class="font-weight-bold text-h3 text-success">${{ totalAmount }}</span>
      </div>
    </div>

    <!-- Action Button -->
    <div class="action-section">
      <v-btn
        color="success"
        variant="flat"
        size="large"
        block
        :disabled="!canProcessSale"
        :loading="isProcessingSale"
        @click="handleProcessSale"
      >
        <v-icon start size="large">mdi-cash-register</v-icon>
        <span class="font-weight-bold">COBRAR</span>
      </v-btn>

      <!-- Status Messages -->
      <div class="mt-3">
        <v-alert
          v-if="!hasCustomer"
          type="info"
          variant="tonal"
          density="compact"
        >
          Selecciona un cliente para comenzar
        </v-alert>

        <v-alert
          v-else-if="!hasItems"
          type="info"
          variant="tonal"
          density="compact"
        >
          Agrega productos al carrito
        </v-alert>

        <v-alert
          v-else-if="!isPaymentValid"
          type="warning"
          variant="tonal"
          density="compact"
        >
          Configura el método de pago
        </v-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePOSStore } from '@/stores/pos'
import { useCustomerStore } from '@/stores/customer'

interface Emits {
  (e: 'saleCompleted', sale: any): void
}

const emit = defineEmits<Emits>()

const posStore = usePOSStore()
const customerStore = useCustomerStore()

// Computed
const totalAmount = computed(() => posStore.totalAmount)
const isPaymentValid = computed(() => posStore.isPaymentValid)
const canProcessSale = computed(() => posStore.canProcessSale)
const isProcessingSale = computed(() => posStore.isProcessingSale)
const hasCustomer = computed(() => customerStore.hasCustomer)
const hasItems = computed(() => posStore.cartItems.length > 0)

// Methods
const handleProcessSale = async () => {
  if (!canProcessSale.value || !customerStore.currentCustomer) {
    return
  }

  try {
    const sale = await posStore.processSale(customerStore.currentCustomer.id)
    await customerStore.refreshCurrentCustomer()
    emit('saleCompleted', sale)
  } catch (error) {
    console.error('Error processing sale:', error)
  }
}
</script>

<style scoped>
.total-section {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 16px;
}

.v-btn--size-large {
  min-height: 60px !important;
}
</style>