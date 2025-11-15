<!--
SaleDetailsModal Component

Modal para mostrar los detalles completos de una venta.
Incluye información del cliente, items, métodos de pago y totales.

Props:
- modelValue: boolean - Estado del modal
- sale: Sale - Venta a mostrar

Emits:
- update:modelValue: boolean - Actualizar estado del modal
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="800"
    scrollable
  >
    <v-card elevation="8">
      <v-card-title class="d-flex align-center pa-4 bg-primary">
        <v-icon class="me-3 text-white">mdi-receipt</v-icon>
        <div class="text-white">
          <div class="font-weight-bold">Detalles de Venta</div>
          <div v-if="sale" class="text-caption opacity-90">
            {{ sale.id }}
          </div>
        </div>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          color="white"
          @click="$emit('update:modelValue', false)"
        />
      </v-card-title>

      <v-card-text v-if="sale" class="pa-0">
        <div class="pa-6">
          <!-- Sale Summary -->
          <div class="sale-summary mb-6">
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="h-100">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center mb-3">
                      <v-icon color="primary" class="me-2">mdi-information</v-icon>
                      <span class="font-weight-bold">Información General</span>
                    </div>

                    <div class="info-row">
                      <span class="label">ID de Venta:</span>
                      <span class="value font-family-monospace text-primary">{{ sale.id }}</span>
                    </div>

                    <div class="info-row">
                      <span class="label">Fecha:</span>
                      <span class="value">{{ formatDateTime(sale.created_at) }}</span>
                    </div>

                    <div class="info-row">
                      <span class="label">Subtotal:</span>
                      <span class="value">${{ parseFloat(sale.subtotal).toFixed(2) }}</span>
                    </div>

                    <div v-if="parseFloat(sale.discount_amount || '0') > 0" class="info-row">
                      <span class="label">Descuento:</span>
                      <span class="value text-warning">-${{ parseFloat(sale.discount_amount || '0').toFixed(2) }}</span>
                    </div>

                    <v-divider class="my-3" />

                    <div class="info-row">
                      <span class="label font-weight-bold">Total:</span>
                      <span class="value font-weight-bold text-primary text-h6">
                        ${{ parseFloat(sale.total_amount).toFixed(2) }}
                      </span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col cols="12" md="6">
                <v-card variant="outlined" class="h-100">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center mb-3">
                      <v-icon color="success" class="me-2">mdi-account</v-icon>
                      <span class="font-weight-bold">Cliente</span>
                    </div>

                    <div class="d-flex align-center mb-3">
                      <v-avatar color="success" size="large" class="me-3">
                        <v-icon color="white">mdi-account</v-icon>
                      </v-avatar>
                      <div>
                        <div class="font-weight-medium text-h6">
                          {{ sale.customer?.name || 'Sin nombre' }}
                        </div>
                        <div class="text-body-2 text-on-surface-variant">
                          {{ sale.customer?.phone || 'Sin teléfono' }}
                        </div>
                      </div>
                    </div>

                    <div v-if="sale.loyalty_points_generated" class="loyalty-points">
                      <v-alert
                        type="info"
                        variant="tonal"
                        density="compact"
                      >
                        <div class="d-flex align-center">
                          <v-icon color="warning" class="me-2">mdi-star</v-icon>
                          <span>
                            <strong>{{ sale.loyalty_points_generated }}</strong>
                            puntos de lealtad generados
                          </span>
                        </div>
                      </v-alert>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Staff/Vendor Info -->
            <v-row v-if="sale.staff" class="mt-3">
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="h-100">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center mb-3">
                      <v-icon color="info" class="me-2">mdi-account-tie</v-icon>
                      <span class="font-weight-bold">Vendedor</span>
                    </div>

                    <div class="d-flex align-center">
                      <v-avatar color="info" size="large" class="me-3">
                        <v-icon color="white">mdi-account-tie</v-icon>
                      </v-avatar>
                      <div>
                        <div class="font-weight-medium text-h6">
                          {{ sale.staff.name }}
                        </div>
                        <div v-if="sale.staff.is_active" class="text-body-2 text-success">
                          Activo
                        </div>
                        <div v-else class="text-body-2 text-error">
                          Inactivo
                        </div>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>

          <!-- Sale Items -->
          <div class="sale-items mb-6">
            <div class="section-title mb-4">
              <v-icon color="secondary" class="me-2">mdi-package-variant</v-icon>
              <span class="font-weight-bold">Items de la Venta</span>
            </div>

            <v-card variant="outlined">
              <v-list density="compact">
                <template v-for="(item, index) in saleItems" :key="index">
                  <v-divider v-if="index > 0" />
                  <v-list-item class="px-4 py-3">
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

                    <div class="flex-grow-1">
                      <div class="d-flex justify-space-between align-center mb-1">
                        <div class="font-weight-medium">{{ item.name }}</div>
                        <div class="font-weight-bold text-primary">
                          ${{ parseFloat(item.total).toFixed(2) }}
                        </div>
                      </div>

                      <div v-if="item.description" class="text-body-2 text-on-surface-variant mb-2">
                        {{ item.description }}
                      </div>

                      <div class="text-body-2 text-on-surface-variant">
                        ${{ parseFloat(item.unit_price).toFixed(2) }} × {{ item.quantity }}
                        <span v-if="item.product_id" class="ml-2 font-family-monospace">
                          ({{ item.product_id }})
                        </span>
                      </div>
                    </div>
                  </v-list-item>
                </template>
              </v-list>
            </v-card>
          </div>

          <!-- Payment Methods -->
          <div class="payment-methods">
            <div class="section-title mb-4">
              <v-icon color="info" class="me-2">mdi-credit-card</v-icon>
              <span class="font-weight-bold">Métodos de Pago</span>
            </div>

            <v-row>
              <v-col
                v-for="(payment, index) in paymentMethods"
                :key="index"
                cols="12"
                sm="6"
                md="4"
              >
                <v-card variant="outlined" class="payment-card">
                  <v-card-text class="pa-3 text-center">
                    <v-icon
                      :color="getPaymentColor(payment.method)"
                      size="large"
                      class="mb-2"
                    >
                      {{ getPaymentIcon(payment.method) }}
                    </v-icon>

                    <div class="font-weight-medium">
                      {{ getPaymentName(payment.method) }}
                    </div>

                    <div class="font-weight-bold text-h6 text-primary">
                      ${{ parseFloat(payment.amount).toFixed(2) }}
                    </div>

                    <div v-if="payment.reference" class="text-caption text-on-surface-variant mt-1">
                      {{ payment.reference }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-card-text>

      <div v-else class="pa-6 text-center">
        <v-icon size="80" color="on-surface-variant" class="mb-4">
          mdi-alert-circle
        </v-icon>
        <h3 class="text-h6 text-on-surface-variant">
          No se pudo cargar la información de la venta
        </h3>
      </div>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn
          color="primary"
          variant="flat"
          @click="$emit('update:modelValue', false)"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Sale, SaleItemType, PaymentMethod } from '@/types/pos'

interface Props {
  modelValue: boolean
  sale: Sale | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// Computed
const saleItems = computed(() => {
  if (!props.sale?.items) return []

  try {
    if (typeof props.sale.items === 'string') {
      return JSON.parse(props.sale.items)
    }
    return Array.isArray(props.sale.items) ? props.sale.items : []
  } catch (error) {
    console.error('Error parsing sale items:', error)
    return []
  }
})

const paymentMethods = computed(() => {
  if (!props.sale?.payment_methods) return []

  try {
    if (typeof props.sale.payment_methods === 'string') {
      return JSON.parse(props.sale.payment_methods)
    }
    return Array.isArray(props.sale.payment_methods) ? props.sale.payment_methods : []
  } catch (error) {
    console.error('Error parsing payment methods:', error)
    return []
  }
})

// Methods
const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Fecha inválida'
  }
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

const getPaymentIcon = (method: PaymentMethod): string => {
  switch (method) {
    case 'cash':
      return 'mdi-cash'
    case 'card':
      return 'mdi-credit-card'
    case 'transfer':
      return 'mdi-bank-transfer'
    case 'loyalty_points':
      return 'mdi-wallet'
    default:
      return 'mdi-currency-usd'
  }
}

const getPaymentColor = (method: PaymentMethod): string => {
  switch (method) {
    case 'cash':
      return 'success'
    case 'card':
      return 'primary'
    case 'transfer':
      return 'info'
    case 'loyalty_points':
      return 'warning'
    default:
      return 'primary'
  }
}

const getPaymentName = (method: PaymentMethod): string => {
  switch (method) {
    case 'cash':
      return 'Efectivo'
    case 'card':
      return 'Tarjeta'
    case 'transfer':
      return 'Transferencia'
    case 'loyalty_points':
      return 'Monedero'
    default:
      return method
  }
}
</script>

<style scoped>
.v-card-title {
  background: rgb(var(--v-theme-primary)) !important;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.info-row .label {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.9rem;
}

.info-row .value {
  font-weight: 500;
}

.payment-card {
  height: 100%;
  transition: transform 0.2s ease;
}

.payment-card:hover {
  transform: translateY(-2px);
}

.loyalty-points {
  margin-top: 16px;
}

/* Monospace font for IDs */
.font-family-monospace {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* Custom spacing for list items */
.v-list-item {
  min-height: auto !important;
  padding: 12px 16px !important;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-row .value {
    font-size: 1rem;
  }

  .section-title {
    font-size: 1rem;
  }
}

/* Ensure proper card heights */
.v-card.h-100 {
  height: 100% !important;
}

/* Custom scrollbar */
.v-card-text {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

.v-card-text::-webkit-scrollbar {
  width: 6px;
}

.v-card-text::-webkit-scrollbar-track {
  background: transparent;
}

.v-card-text::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

.v-card-text::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}
</style>