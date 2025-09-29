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

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePOSStore } from '@/stores/pos'

const posStore = usePOSStore()

// Computed
const totalAmount = computed(() => posStore.totalAmount)
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