<!--
SaleCart Component - Simplificado

Carrito simple que muestra:
- Nombre del item
- Cantidad
- Total del item
- Concepto libre con ajustes +/-
-->

<template>
  <div class="sale-cart">
    <!-- Cart Items -->
    <div v-if="cartItems.length > 0 || customConcept" class="cart-items">
      <v-list density="compact">
        <!-- Products/Services Items -->
        <template v-for="(item, index) in cartItems" :key="item.id">
          <v-divider v-if="index > 0" />

          <v-list-item class="cart-item pa-2">
            <div class="d-flex align-center justify-space-between w-100">
              <!-- Item name, details and quantity -->
              <div class="flex-grow-1 mr-3">
                <div class="font-weight-medium">{{ item.name }}</div>
                <div v-if="item.details" class="text-caption text-warning">
                  {{ item.details }}
                </div>
                <div class="d-flex align-center gap-2 mt-1">
                  <span class="text-caption text-on-surface-variant">Precio:</span>
                  <v-text-field
                    v-if="item.variable_price"
                    :model-value="item.unit_price"
                    @update:model-value="(val) => updatePrice(item, val)"
                    type="number"
                    step="0.01"
                    min="0"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="price-field"
                    prepend-inner-icon="mdi-currency-usd"
                    :disabled="!canModifyCart"
                  />
                  <span v-else class="text-caption font-weight-bold text-primary">
                    ${{ parseFloat(item.unit_price).toFixed(2) }}
                  </span>
                  <span class="text-caption text-on-surface-variant">× {{ item.quantity }}</span>
                </div>
              </div>

              <!-- Total -->
              <div class="text-right">
                <div class="font-weight-bold text-primary">
                  ${{ parseFloat(item.total).toFixed(2) }}
                </div>

                <!-- Quantity Controls -->
                <div class="d-flex align-center mt-1">
                  <v-btn
                    size="x-small"
                    variant="text"
                    color="error"
                    @click="decreaseQuantity(item)"
                    :disabled="item.quantity <= 1 || !canModifyCart"
                  >
                    <v-icon size="small">mdi-minus</v-icon>
                  </v-btn>

                  <span class="mx-1 text-caption">{{ item.quantity }}</span>

                  <v-btn
                    size="x-small"
                    variant="text"
                    color="success"
                    @click="increaseQuantity(item)"
                    :disabled="!canModifyCart"
                  >
                    <v-icon size="small">mdi-plus</v-icon>
                  </v-btn>

                  <v-btn
                    size="x-small"
                    variant="text"
                    color="error"
                    class="ml-1"
                    @click="removeItem(item)"
                    :disabled="!canModifyCart"
                  >
                    <v-icon size="small">mdi-delete</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </v-list-item>
        </template>

        <!-- Custom Concept Item -->
        <template v-if="customConcept && customConcept.amount !== 0">
          <v-divider v-if="cartItems.length > 0" />

          <v-list-item class="cart-item pa-2">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="flex-grow-1 mr-3">
                <div class="font-weight-medium">{{ customConcept.description || 'Concepto' }}</div>
                <div class="text-caption text-on-surface-variant">Ajuste manual</div>
              </div>

              <div class="text-right">
                <div class="font-weight-bold" :class="customConcept.amount >= 0 ? 'text-success' : 'text-error'">
                  {{ customConcept.amount >= 0 ? '+' : '' }}${{ Math.abs(customConcept.amount).toFixed(2) }}
                </div>

                <v-btn
                  size="x-small"
                  variant="text"
                  color="error"
                  class="mt-1"
                  @click="removeConcept"
                  :disabled="!canModifyCart"
                >
                  <v-icon size="small">mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>
          </v-list-item>
        </template>
      </v-list>

      <!-- Add Custom Concept -->
      <div v-if="canModifyCart" class="pa-3 border-t">
        <v-text-field
          v-model="newConcept.description"
          label="Concepto (opcional)"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-2"
        />

        <div class="d-flex align-center gap-2">
          <v-text-field
            v-model="newConcept.amount"
            label="Ajuste (+100 / -50)"
            variant="outlined"
            density="compact"
            hide-details
            placeholder="ej: +100 o -50"
            class="flex-grow-1"
          />

          <v-btn
            color="primary"
            variant="flat"
            @click="addConcept"
            :disabled="!newConcept.amount"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
      </div>
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { usePOSStore } from '@/stores/pos'
import { useCustomerStore } from '@/stores/customer'

const posStore = usePOSStore()
const customerStore = useCustomerStore()

// Reactive data for custom concept
const newConcept = ref({
  description: '',
  amount: ''
})

const customConcept = ref<{ description: string; amount: number } | null>(null)

// Computed
const cartItems = computed(() => posStore.cartItems)
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

const updatePrice = (item: any, newPrice: string) => {
  if (newPrice && !isNaN(parseFloat(newPrice))) {
    posStore.updateItemPrice(item.id, newPrice)
  }
}

const addConcept = () => {
  const amount = parseFloat(newConcept.value.amount.replace(/[+\s]/g, ''))

  if (!isNaN(amount) && amount !== 0) {
    customConcept.value = {
      description: newConcept.value.description || 'Ajuste manual',
      amount: amount
    }

    // Clear form
    newConcept.value.description = ''
    newConcept.value.amount = ''
  }
}

const removeConcept = () => {
  customConcept.value = null
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

/* Price field styling */
.price-field {
  max-width: 120px;
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