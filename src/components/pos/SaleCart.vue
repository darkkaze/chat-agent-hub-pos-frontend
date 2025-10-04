<!--
SaleCart Component - Table Layout

Carrito con diseño de tabla:
- Columnas: Producto | Costo Unitario | Cantidad | Adicional | Total
- Botón trash para eliminar
- Detalles del producto bajo el nombre
-->

<template>
  <div class="sale-cart">
    <!-- Cart Table -->
    <div v-if="cartItems.length > 0" class="cart-table">
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left text-uppercase font-weight-bold" style="width: 40px;"></th>
            <th class="text-left text-uppercase font-weight-bold">Producto</th>
            <th class="text-center text-uppercase font-weight-bold" style="width: 140px;">Costo Unitario</th>
            <th class="text-center text-uppercase font-weight-bold" style="width: 160px;">Cantidad</th>
            <th class="text-center text-uppercase font-weight-bold" style="width: 140px;">Adicional</th>
            <th class="text-right text-uppercase font-weight-bold" style="width: 120px;">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cartItems" :key="item.id" class="cart-row">
            <!-- Delete Button -->
            <td>
              <v-btn
                icon
                size="small"
                variant="text"
                color="on-surface-variant"
                @click="removeItem(item)"
                :disabled="!canModifyCart"
              >
                <v-icon size="20">mdi-delete-outline</v-icon>
              </v-btn>
            </td>

            <!-- Product Name & Details -->
            <td>
              <div class="product-info">
                <div class="product-name font-weight-bold">{{ item.name }}</div>
                <div v-if="item.details" class="product-details text-caption text-medium-emphasis">
                  {{ item.details }}
                </div>
              </div>
            </td>

            <!-- Unit Price -->
            <td class="text-center">
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
                prefix="$"
                :disabled="!canModifyCart"
                class="unit-price-field"
              />
              <span v-else class="font-weight-medium">${{ parseFloat(item.unit_price).toFixed(2) }}</span>
            </td>

            <!-- Quantity Controls -->
            <td class="text-center">
              <div class="d-flex align-center justify-center quantity-controls">
                <v-btn
                  icon
                  size="small"
                  variant="outlined"
                  @click="decreaseQuantity(item)"
                  :disabled="item.quantity <= 1 || !canModifyCart"
                >
                  <v-icon size="16">mdi-minus</v-icon>
                </v-btn>

                <span class="mx-3 font-weight-medium">{{ item.quantity }}</span>

                <v-btn
                  icon
                  size="small"
                  variant="outlined"
                  @click="increaseQuantity(item)"
                  :disabled="!canModifyCart"
                >
                  <v-icon size="16">mdi-plus</v-icon>
                </v-btn>
              </div>
            </td>

            <!-- Additional Amount -->
            <td class="text-center">
              <v-text-field
                v-model="item.additional"
                variant="outlined"
                density="compact"
                hide-details
                placeholder="0.00"
                :disabled="!canModifyCart"
                class="additional-field"
                @update:model-value="updateAdditional(item)"
              />
            </td>

            <!-- Total -->
            <td class="text-right">
              <span class="font-weight-bold text-h6">${{ calculateItemTotal(item).toFixed(2) }}</span>
            </td>
          </tr>
        </tbody>
      </v-table>
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
import { computed } from 'vue'
import { usePOSStore } from '@/stores/pos'
import { useCustomerStore } from '@/stores/customer'

const posStore = usePOSStore()
const customerStore = useCustomerStore()

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

const updateAdditional = (item: any) => {
  // Additional field is bound directly to item.additional
  // The value is used in calculateItemTotal
}

const calculateItemTotal = (item: any): number => {
  const baseTotal = parseFloat(item.unit_price) * item.quantity
  const additional = parseFloat(item.additional) || 0
  return baseTotal + additional
}
</script>

<style scoped>
.sale-cart {
  height: 100%;
  overflow-y: auto;
}

.cart-table {
  width: 100%;
}

.empty-cart {
  min-height: 400px;
}

/* Product Info */
.product-info {
  padding: 8px 0;
}

.product-name {
  font-size: 0.95rem;
  line-height: 1.4;
}

.product-details {
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: 2px;
  line-height: 1.3;
}

/* Input Fields */
.unit-price-field,
.additional-field {
  max-width: 120px;
  margin: 0 auto;
}

.unit-price-field :deep(.v-field__input) {
  text-align: center;
}

.additional-field :deep(.v-field__input) {
  text-align: center;
}

/* Quantity Controls */
.quantity-controls {
  gap: 8px;
}

/* Table Styling */
.cart-row {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.cart-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

/* Table Headers */
thead th {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  padding: 12px 8px !important;
  border-bottom: 2px solid rgba(var(--v-theme-on-surface), 0.12) !important;
}

/* Table Cells */
tbody td {
  padding: 12px 8px !important;
  vertical-align: middle;
}

/* Custom scrollbar */
.sale-cart {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

.sale-cart::-webkit-scrollbar {
  width: 6px;
}

.sale-cart::-webkit-scrollbar-track {
  background: transparent;
}

.sale-cart::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

.sale-cart::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}
</style>