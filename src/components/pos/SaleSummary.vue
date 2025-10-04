<!--
SaleSummary Component

Resumen de venta con subtotal, ajustes y total a pagar.
-->

<template>
  <div class="sale-summary">
    <!-- Header -->
    <div class="summary-header pa-4">
      <v-icon class="me-2">mdi-calculator</v-icon>
      <span class="text-h6 font-weight-bold">Resumen Venta</span>
    </div>

    <!-- Summary Details -->
    <div class="summary-details pa-4">
      <!-- Subtotal -->
      <div class="d-flex justify-space-between align-center mb-3">
        <span class="text-body-1">Subtotal</span>
        <span class="text-h6 font-weight-medium">${{ subtotal }}</span>
      </div>

      <!-- Ajustes -->
      <div class="d-flex justify-space-between align-center mb-4">
        <span class="text-body-1">Ajustes</span>
        <span
          class="text-h6 font-weight-medium"
          :class="adjustmentsAmount >= 0 ? 'text-success' : 'text-error'"
        >
          {{ adjustmentsAmount >= 0 ? '' : '-' }}${{ Math.abs(adjustmentsAmount).toFixed(2) }}
        </span>
      </div>

      <!-- Divider -->
      <v-divider class="mb-4" />

      <!-- Total a Pagar -->
      <div class="total-section pa-3">
        <div class="d-flex justify-space-between align-center">
          <span class="text-h6 font-weight-bold">Total a Pagar</span>
          <span class="text-h4 font-weight-bold text-primary">${{ totalAmount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePOSStore } from '@/stores/pos'

const posStore = usePOSStore()

// Computed
const subtotal = computed(() => posStore.subtotal)
const adjustmentsTotal = computed(() => posStore.adjustmentsTotal)
const totalAmount = computed(() => posStore.totalAmount)

const adjustmentsAmount = computed(() => parseFloat(adjustmentsTotal.value))
</script>

<style scoped>
.sale-summary {
  border-radius: 8px;
  overflow: hidden;
}

.summary-header {
  background: rgb(var(--v-theme-primary));
  color: white;
  display: flex;
  align-items: center;
}

.summary-details {
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.total-section {
  background: rgba(var(--v-theme-primary), 0.08);
  border-radius: 8px;
}
</style>