<!--
SaleCart Component

Componente para mostrar y gestionar los items del carrito de venta.
Permite modificar cantidades, eliminar items y ver el resumen.

Props: ninguno
Emits: ninguno
-->

<template>
  <div class="sale-cart">
    <v-card elevation="0" class="h-100 d-flex flex-column">
      <v-card-title class="d-flex align-center pa-3 bg-surface-variant">
        <v-icon class="me-2 text-primary">mdi-cart</v-icon>
        <span class="font-weight-bold">Productos en Venta</span>
        <v-chip
          v-if="cartItems.length > 0"
          size="small"
          color="primary"
          class="ml-2"
        >
          {{ cartItems.length }}
        </v-chip>
      </v-card-title>

      <v-card-text class="pa-0 flex-grow-1 overflow-auto">
        <!-- Cart Items -->
        <div v-if="cartItems.length > 0" class="cart-items">
          <v-list density="compact">
            <template v-for="(item, index) in cartItems" :key="item.id">
              <v-divider v-if="index > 0" />

              <v-list-item class="cart-item px-3 py-3">
                <!-- Item Icon -->
                <template #prepend>
                  <v-avatar
                    :color="getItemColor(item.type)"
                    size="small"
                  >
                    <v-icon color="white" size="small">
                      {{ getItemIcon(item.type) }}
                    </v-icon>
                  </v-avatar>
                </template>

                <!-- Item Details -->
                <div class="flex-grow-1">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <div class="font-weight-medium text-truncate mr-2">
                      {{ item.name }}
                    </div>
                    <div class="font-weight-bold text-primary">
                      ${{ parseFloat(item.total).toFixed(2) }}
                    </div>
                  </div>

                  <div v-if="item.description" class="text-caption text-on-surface-variant mb-2">
                    {{ item.description }}
                  </div>

                  <!-- Price and Quantity Info -->
                  <div class="d-flex align-center justify-space-between">
                    <div class="text-body-2 text-on-surface-variant">
                      ${{ parseFloat(item.unit_price).toFixed(2) }} x {{ item.quantity }}
                    </div>

                    <!-- Quantity Controls -->
                    <div class="d-flex align-center">
                      <v-btn
                        size="x-small"
                        variant="text"
                        color="error"
                        @click="decreaseQuantity(item)"
                        :disabled="item.quantity <= 1 || !canModifyCart"
                      >
                        <v-icon>mdi-minus</v-icon>
                      </v-btn>

                      <span class="mx-2 text-body-2 min-width-24 text-center">
                        {{ item.quantity }}
                      </span>

                      <v-btn
                        size="x-small"
                        variant="text"
                        color="success"
                        @click="increaseQuantity(item)"
                        :disabled="!canModifyCart"
                      >
                        <v-icon>mdi-plus</v-icon>
                      </v-btn>

                      <v-btn
                        size="x-small"
                        variant="text"
                        color="error"
                        class="ml-2"
                        @click="removeItem(item)"
                        :disabled="!canModifyCart"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-list-item>
            </template>
          </v-list>
        </div>

        <!-- Empty State -->
        <div v-else class="empty-cart d-flex flex-column align-center justify-center h-100 pa-6">
          <v-icon size="80" color="on-surface-variant" class="mb-4">
            mdi-cart-outline
          </v-icon>
          <h3 class="text-h6 text-on-surface-variant text-center mb-2">
            Carrito vacío
          </h3>
          <p class="text-body-2 text-on-surface-variant text-center">
            {{ canModifyCart ? 'Busca y agrega productos para comenzar la venta' : 'Selecciona un cliente para agregar productos' }}
          </p>
        </div>
      </v-card-text>

      <!-- Cart Summary (when has items) -->
      <div v-if="cartItems.length > 0" class="cart-summary border-t">
        <v-card-text class="pa-3">
          <div class="d-flex justify-space-between align-center">
            <span class="font-weight-medium">Subtotal:</span>
            <span class="font-weight-bold text-h6">${{ subtotal }}</span>
          </div>

          <div v-if="parseFloat(discountAmount) > 0" class="d-flex justify-space-between align-center text-warning">
            <span>Descuento:</span>
            <span>-${{ discountAmount }}</span>
          </div>

          <v-divider class="my-2" />

          <div class="d-flex justify-space-between align-center">
            <span class="font-weight-bold text-h6">Total:</span>
            <span class="font-weight-bold text-h5 text-primary">${{ totalAmount }}</span>
          </div>
        </v-card-text>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SaleItemType } from '@/types/pos'
import { usePOSStore } from '@/stores/pos'
import { useCustomerStore } from '@/stores/customer'

const posStore = usePOSStore()
const customerStore = useCustomerStore()

// Computed
const cartItems = computed(() => posStore.cartItems)
const subtotal = computed(() => posStore.subtotal)
const totalAmount = computed(() => posStore.totalAmount)
const discountAmount = computed(() => posStore.discountAmount)
const canModifyCart = computed(() => customerStore.hasCustomer && !posStore.isProcessingSale)

// Methods
const increaseQuantity = (item: any) => {
  posStore.updateItemQuantity(item.id, item.quantity + 1)
}

const decreaseQuantity = (item: any) => {
  if (item.quantity > 1) {
    posStore.updateItemQuantity(item.id, item.quantity - 1)
  }
}

const removeItem = (item: any) => {
  posStore.removeItem(item.id)
}

const getItemIcon = (type: SaleItemType): string => {
  switch (type) {
    case 'product':
      return 'mdi-package-variant'
    case 'service':
      return 'mdi-tools'
    default:
      return 'mdi-sale'
  }
}

const getItemColor = (type: SaleItemType): string => {
  switch (type) {
    case 'product':
      return 'primary'
    case 'service':
      return 'secondary'
    default:
      return 'warning'
  }
}
</script>

<style scoped>
.sale-cart {
  height: 100%;
}

.cart-items {
  min-height: 0;
}

.cart-item {
  min-height: auto !important;
}

.empty-cart {
  min-height: 200px;
}

.cart-summary {
  flex-shrink: 0;
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.min-width-24 {
  min-width: 24px;
}

.border-t {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

/* Custom scrollbar for cart items */
.cart-items {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

.cart-items::-webkit-scrollbar {
  width: 4px;
}

.cart-items::-webkit-scrollbar-track {
  background: transparent;
}

.cart-items::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 2px;
}

.cart-items::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .d-flex.align-center.justify-space-between {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}
</style>