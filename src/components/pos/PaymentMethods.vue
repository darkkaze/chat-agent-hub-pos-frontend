<!--
PaymentMethods Component

Componente para gestionar los métodos de pago de la venta.
Incluye validación de montos y límites del monedero del cliente.

Props: ninguno
Emits: ninguno
-->

<template>
  <v-card elevation="0" class="h-100 d-flex flex-column">
    <v-card-title class="pa-3 bg-surface-variant">
      <v-icon class="me-2 text-primary">mdi-credit-card</v-icon>
      <span class="font-weight-bold">Métodos de Pago</span>
    </v-card-title>

    <v-card-text class="pa-3 flex-grow-1">
      <div class="payment-methods">
        <!-- Cash Payment -->
        <div class="payment-method mb-3">
          <v-checkbox
            v-model="payments.cash.enabled"
            :disabled="!canModifyPayments"
            color="success"
            density="compact"
            hide-details
          >
            <template #label>
              <div class="d-flex align-center w-100">
                <v-icon class="me-2" color="success">mdi-cash</v-icon>
                <span class="font-weight-medium">Efectivo</span>
              </div>
            </template>
          </v-checkbox>

          <v-text-field
            v-if="payments.cash.enabled"
            v-model="payments.cash.amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            prefix="$"
            variant="outlined"
            density="compact"
            :disabled="!canModifyPayments"
            class="mt-2"
            @update:model-value="updatePayment('cash', $event)"
          />
        </div>

        <!-- Card Payment -->
        <div class="payment-method mb-3">
          <v-checkbox
            v-model="payments.card.enabled"
            :disabled="!canModifyPayments"
            color="primary"
            density="compact"
            hide-details
          >
            <template #label>
              <div class="d-flex align-center w-100">
                <v-icon class="me-2" color="primary">mdi-credit-card</v-icon>
                <span class="font-weight-medium">Tarjeta</span>
              </div>
            </template>
          </v-checkbox>

          <v-text-field
            v-if="payments.card.enabled"
            v-model="payments.card.amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            prefix="$"
            variant="outlined"
            density="compact"
            :disabled="!canModifyPayments"
            class="mt-2"
            @update:model-value="updatePayment('card', $event)"
          />
        </div>

        <!-- Transfer Payment -->
        <div class="payment-method mb-3">
          <v-checkbox
            v-model="payments.transfer.enabled"
            :disabled="!canModifyPayments"
            color="info"
            density="compact"
            hide-details
          >
            <template #label>
              <div class="d-flex align-center w-100">
                <v-icon class="me-2" color="info">mdi-bank-transfer</v-icon>
                <span class="font-weight-medium">Transferencia</span>
              </div>
            </template>
          </v-checkbox>

          <v-text-field
            v-if="payments.transfer.enabled"
            v-model="payments.transfer.amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            prefix="$"
            variant="outlined"
            density="compact"
            :disabled="!canModifyPayments"
            class="mt-2"
            @update:model-value="updatePayment('transfer', $event)"
          />
        </div>

        <!-- Loyalty Points Payment -->
        <div class="payment-method mb-4">
          <v-checkbox
            v-model="payments.loyalty_points.enabled"
            :disabled="!canModifyPayments || !hasLoyaltyPoints"
            color="warning"
            density="compact"
            hide-details
          >
            <template #label>
              <div class="d-flex align-center justify-space-between w-100">
                <div class="d-flex align-center">
                  <v-icon class="me-2" color="warning">mdi-wallet</v-icon>
                  <span class="font-weight-medium">Monedero</span>
                </div>
                <span class="text-body-2 text-on-surface-variant">
                  ${{ customerLoyaltyPoints.toFixed(2) }} Max
                </span>
              </div>
            </template>
          </v-checkbox>

          <v-text-field
            v-if="payments.loyalty_points.enabled"
            v-model="payments.loyalty_points.amount"
            type="number"
            step="0.01"
            min="0"
            :max="customerLoyaltyPoints"
            placeholder="0.00"
            prefix="$"
            variant="outlined"
            density="compact"
            :disabled="!canModifyPayments"
            :error="isLoyaltyAmountInvalid"
            :error-messages="loyaltyErrorMessage"
            class="mt-2"
            @update:model-value="updatePayment('loyalty_points', $event)"
          />
        </div>
      </div>

      <!-- Payment Summary -->
      <v-card
        variant="outlined"
        :color="isPaymentValid ? 'success' : 'error'"
        class="payment-summary"
      >
        <v-card-text class="pa-3">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="font-weight-medium">Total a Pagar:</span>
            <span class="font-weight-bold text-h6">${{ totalAmount }}</span>
          </div>

          <div class="d-flex justify-space-between align-center mb-2">
            <span class="font-weight-medium">Total Pagado:</span>
            <span class="font-weight-bold text-h6" :class="paymentStatusColor">
              ${{ totalPaymentAmount }}
            </span>
          </div>

          <v-divider class="my-2" />

          <div class="d-flex justify-space-between align-center">
            <span class="font-weight-bold">Diferencia:</span>
            <span class="font-weight-bold text-h6" :class="differenceColor">
              ${{ paymentDifference }}
            </span>
          </div>

          <!-- Payment Status -->
          <v-alert
            v-if="!isPaymentValid && hasAnyPayment"
            :type="parseFloat(paymentDifference) > 0 ? 'warning' : 'error'"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            {{ parseFloat(paymentDifference) > 0 ? 'Falta dinero por pagar' : 'Hay un exceso en el pago' }}
          </v-alert>

          <v-alert
            v-else-if="isPaymentValid && hasAnyPayment"
            type="success"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            <v-icon start>mdi-check-circle</v-icon>
            Pago completo y correcto
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- Helper Text -->
      <div v-if="!canModifyPayments" class="text-caption text-error mt-2">
        ⚠️ Agrega productos al carrito para configurar pagos
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PaymentMethod } from '@/types/pos'
import { usePOSStore } from '@/stores/pos'
import { useCustomerStore } from '@/stores/customer'

const posStore = usePOSStore()
const customerStore = useCustomerStore()

// Local payment state
const payments = ref({
  cash: { enabled: false, amount: '0.00' },
  card: { enabled: false, amount: '0.00' },
  transfer: { enabled: false, amount: '0.00' },
  loyalty_points: { enabled: false, amount: '0.00' }
})

// Computed
const totalAmount = computed(() => posStore.totalAmount)
const totalPaymentAmount = computed(() => posStore.totalPaymentAmount)
const isPaymentValid = computed(() => posStore.isPaymentValid)
const customerLoyaltyPoints = computed(() => customerStore.customerLoyaltyPoints)

const canModifyPayments = computed(() => {
  return customerStore.hasCustomer &&
         posStore.cartItems.length > 0 &&
         !posStore.isProcessingSale
})

const hasLoyaltyPoints = computed(() => customerLoyaltyPoints.value > 0)

const hasAnyPayment = computed(() => {
  return Object.values(payments.value).some(p => p.enabled && parseFloat(p.amount) > 0)
})

const paymentDifference = computed(() => {
  const total = parseFloat(totalAmount.value)
  const paid = parseFloat(totalPaymentAmount.value)
  return Math.abs(total - paid).toFixed(2)
})

const paymentStatusColor = computed(() => {
  if (!hasAnyPayment.value) return 'text-on-surface-variant'
  return isPaymentValid.value ? 'text-success' : 'text-error'
})

const differenceColor = computed(() => {
  if (parseFloat(paymentDifference.value) === 0) return 'text-success'
  const total = parseFloat(totalAmount.value)
  const paid = parseFloat(totalPaymentAmount.value)
  return total > paid ? 'text-warning' : 'text-error'
})

const isLoyaltyAmountInvalid = computed(() => {
  const amount = parseFloat(payments.value.loyalty_points.amount)
  return amount > customerLoyaltyPoints.value
})

const loyaltyErrorMessage = computed(() => {
  if (isLoyaltyAmountInvalid.value) {
    return `El monto no puede exceder $${customerLoyaltyPoints.value.toFixed(2)}`
  }
  return ''
})

// Methods
const updatePayment = (method: string, amount: string | number) => {
  const numAmount = typeof amount === 'string' ? amount : amount.toString()
  const cleanAmount = parseFloat(numAmount) || 0

  // Update local state
  payments.value[method as keyof typeof payments.value].amount = cleanAmount.toFixed(2)

  // Validate loyalty points limit
  if (method === 'loyalty_points' && cleanAmount > customerLoyaltyPoints.value) {
    payments.value.loyalty_points.amount = customerLoyaltyPoints.value.toFixed(2)
  }

  // Update store
  const paymentMethod = method.toUpperCase() as PaymentMethod
  const finalAmount = payments.value[method as keyof typeof payments.value].amount
  const enabled = payments.value[method as keyof typeof payments.value].enabled

  posStore.updatePaymentMethod(paymentMethod, finalAmount, enabled && parseFloat(finalAmount) > 0)
}

// Watch for payment enabled/disabled changes
watch(() => payments.value, (newPayments) => {
  Object.entries(newPayments).forEach(([method, payment]) => {
    const paymentMethod = method.toUpperCase() as PaymentMethod
    posStore.updatePaymentMethod(
      paymentMethod,
      payment.amount,
      payment.enabled && parseFloat(payment.amount) > 0
    )
  })
}, { deep: true })

// Auto-fill remaining amount when only one payment method is enabled
const autoFillAmount = () => {
  const enabledMethods = Object.entries(payments.value).filter(([_, p]) => p.enabled)

  if (enabledMethods.length === 1) {
    const [method, payment] = enabledMethods[0]
    const total = parseFloat(totalAmount.value)

    if (method === 'loyalty_points') {
      const maxAmount = Math.min(total, customerLoyaltyPoints.value)
      payment.amount = maxAmount.toFixed(2)
    } else {
      payment.amount = total.toFixed(2)
    }

    updatePayment(method, payment.amount)
  }
}

// Watch for enabled method changes to auto-fill
watch(() => Object.values(payments.value).map(p => p.enabled), autoFillAmount)
</script>

<style scoped>
.payment-method {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 8px;
  padding: 12px;
  transition: border-color 0.2s ease;
}

.payment-method:hover {
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.payment-summary {
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

/* Ensure checkboxes align properly */
.v-checkbox :deep(.v-selection-control__wrapper) {
  height: auto;
}

/* Custom width for amount inputs */
.v-text-field {
  max-width: 150px;
  margin-left: 32px; /* Align with checkbox label */
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .payment-method {
    margin-bottom: 16px;
  }

  .v-text-field {
    max-width: none;
    margin-left: 0;
  }

  .d-flex.justify-space-between {
    flex-direction: column;
    gap: 4px;
  }
}
</style>