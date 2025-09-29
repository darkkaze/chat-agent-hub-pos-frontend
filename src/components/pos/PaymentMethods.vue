<!--
PaymentMethods Component

Componente para gestionar los métodos de pago de la venta.
Incluye validación de montos y límites del monedero del cliente.

Props: ninguno
Emits: ninguno
-->

<template>
  <v-card elevation="0" class="h-100 d-flex flex-column">
    <v-card-title class="pa-2 bg-primary">
      <v-icon class="me-2 text-white">mdi-credit-card</v-icon>
      <span class="text-white font-weight-bold">Métodos de Pago</span>
    </v-card-title>

    <v-card-text class="pa-3 flex-grow-1">
      <div class="payment-methods">
        <!-- Cash Payment -->
        <div class="payment-method mb-2">
          <div class="d-flex align-center gap-3">
            <div class="d-flex align-center payment-label">
              <v-icon class="me-2" color="success" size="large">mdi-cash</v-icon>
              <span class="font-weight-medium">Efectivo</span>
            </div>
            <v-text-field
              v-model="payments.cash.amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              prefix="$"
              variant="outlined"
              density="compact"
              class="payment-input"
              :disabled="!canModifyPayments"
              @update:model-value="updatePayment('cash', $event)"
            />
          </div>
        </div>

        <!-- Card Payment -->
        <div class="payment-method mb-2">
          <div class="d-flex align-center gap-3">
            <div class="d-flex align-center payment-label">
              <v-icon class="me-2" color="primary" size="large">mdi-credit-card</v-icon>
              <span class="font-weight-medium">Tarjeta</span>
            </div>
            <v-text-field
              v-model="payments.card.amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              prefix="$"
              variant="outlined"
              density="compact"
              class="payment-input"
              :disabled="!canModifyPayments"
              @update:model-value="updatePayment('card', $event)"
            />
          </div>
        </div>

        <!-- Transfer Payment -->
        <div class="payment-method mb-2">
          <div class="d-flex align-center gap-3">
            <div class="d-flex align-center payment-label">
              <v-icon class="me-2" color="info" size="large">mdi-bank-transfer</v-icon>
              <span class="font-weight-medium">Transferencia</span>
            </div>
            <v-text-field
              v-model="payments.transfer.amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              prefix="$"
              variant="outlined"
              density="compact"
              class="payment-input"
              :disabled="!canModifyPayments"
              @update:model-value="updatePayment('transfer', $event)"
            />
          </div>
        </div>

        <!-- Loyalty Points Payment -->
        <div class="payment-method mb-3">
          <div class="d-flex align-center gap-3">
            <div class="d-flex align-center payment-label">
              <v-icon class="me-2" color="warning" size="large">mdi-wallet</v-icon>
              <span class="font-weight-medium">Monedero</span>
            </div>
            <div class="flex-grow-1">
              <v-text-field
                v-model="payments.loyalty_points.amount"
                type="number"
                step="0.01"
                min="0"
                :max="customerLoyaltyPoints"
                placeholder="0.00"
                prefix="$"
                variant="outlined"
                density="compact"
                class="payment-input"
                :disabled="!canModifyPayments || !hasLoyaltyPoints"
                :error="isLoyaltyAmountInvalid"
                :error-messages="loyaltyErrorMessage"
                @update:model-value="updatePayment('loyalty_points', $event)"
              >
                <template #append-inner>
                  <span class="text-caption text-on-surface-variant">
                    Máx: ${{ customerLoyaltyPoints.toFixed(2) }}
                  </span>
                </template>
              </v-text-field>
            </div>
          </div>
        </div>

        <!-- Staff Selection -->
        <div class="staff-selection mb-4">
          <div class="d-flex align-center mb-2">
            <v-icon class="me-2" color="secondary" size="large">mdi-account-tie</v-icon>
            <span class="font-weight-medium">Personal</span>
          </div>
          <v-select
            v-model="staffStore.currentStaff"
            :items="staffStore.activeStaff"
            item-title="name"
            item-value="id"
            return-object
            label="Seleccionar personal"
            placeholder="Quien está atendiendo"
            variant="outlined"
            density="compact"
            :disabled="!canModifyPayments"
            :loading="staffStore.isLoading"
            :error="!staffStore.hasCurrentStaff && hasAnyPayment"
            :error-messages="!staffStore.hasCurrentStaff && hasAnyPayment ? 'Debe seleccionar el personal que atiende' : undefined"
          >
            <template #prepend-item>
              <v-list-item v-if="staffStore.activeStaff.length === 0" disabled>
                <v-list-item-title class="text-caption">
                  No hay personal disponible
                </v-list-item-title>
              </v-list-item>
            </template>
          </v-select>
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

      <!-- Register Sale Button -->
      <div class="mt-4">
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
          <span class="font-weight-bold">REGISTRAR VENTA</span>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { PaymentMethod } from '@/types/pos'
import { usePOSStore } from '@/stores/pos'
import { useCustomerStore } from '@/stores/customer'
import { useStaffStore } from '@/stores/staff'

interface Emits {
  (e: 'saleCompleted', sale: any): void
}

const emit = defineEmits<Emits>()

const posStore = usePOSStore()
const customerStore = useCustomerStore()
const staffStore = useStaffStore()

// Local payment state - simplified without enabled flags
const payments = ref({
  cash: { amount: '' },
  card: { amount: '' },
  transfer: { amount: '' },
  loyalty_points: { amount: '' }
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

const canProcessSale = computed(() =>
  posStore.canProcessSale && staffStore.hasCurrentStaff
)
const isProcessingSale = computed(() => posStore.isProcessingSale)

const hasLoyaltyPoints = computed(() => customerLoyaltyPoints.value > 0)

const hasAnyPayment = computed(() => {
  return Object.values(payments.value).some(p => parseFloat(p.amount || '0') > 0)
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
  payments.value[method as keyof typeof payments.value].amount = cleanAmount > 0 ? cleanAmount.toFixed(2) : ''

  // Validate loyalty points limit
  if (method === 'loyalty_points' && cleanAmount > customerLoyaltyPoints.value) {
    payments.value.loyalty_points.amount = customerLoyaltyPoints.value.toFixed(2)
  }

  // Update store - method is enabled if amount > 0
  const paymentMethod = method.toUpperCase() as PaymentMethod
  const finalAmount = payments.value[method as keyof typeof payments.value].amount
  const isEnabled = parseFloat(finalAmount || '0') > 0

  posStore.updatePaymentMethod(paymentMethod, finalAmount, isEnabled)
}

// Watch for payment amount changes
watch(() => payments.value, (newPayments) => {
  Object.entries(newPayments).forEach(([method, payment]) => {
    const paymentMethod = method.toUpperCase() as PaymentMethod
    const isEnabled = parseFloat(payment.amount || '0') > 0
    posStore.updatePaymentMethod(
      paymentMethod,
      payment.amount,
      isEnabled
    )
  })
}, { deep: true })

// Auto-fill remaining amount when only one payment method has value
const autoFillAmount = () => {
  const methodsWithValue = Object.entries(payments.value).filter(([_, p]) => parseFloat(p.amount || '0') > 0)

  if (methodsWithValue.length === 1) {
    const [method, payment] = methodsWithValue[0]
    const total = parseFloat(totalAmount.value)
    const currentAmount = parseFloat(payment.amount || '0')

    // Only auto-fill if current amount is less than total
    if (currentAmount < total) {
      if (method === 'loyalty_points') {
        const maxAmount = Math.min(total, customerLoyaltyPoints.value)
        payment.amount = maxAmount.toFixed(2)
      } else {
        payment.amount = total.toFixed(2)
      }

      updatePayment(method, payment.amount)
    }
  }
}

// Watch for payment amount changes to auto-fill
watch(() => Object.values(payments.value).map(p => p.amount), autoFillAmount)

// Sale processing method
const handleProcessSale = async () => {
  if (!canProcessSale.value || !customerStore.currentCustomer || !staffStore.currentStaff) {
    return
  }

  try {
    const sale = await posStore.processSale(customerStore.currentCustomer.id, staffStore.currentStaff.id)
    await customerStore.refreshCurrentCustomer()
    emit('saleCompleted', sale)
  } catch (error) {
    console.error('Error processing sale:', error)
  }
}

// Load staff on component mount
onMounted(async () => {
  await staffStore.loadStaff()
})
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

/* Payment method label width */
.payment-label {
  min-width: 120px;
  flex-shrink: 0;
}

/* Payment input styling */
.payment-input {
  flex: 1;
}

/* Compact spacing for horizontal layout */
.payment-method {
  padding: 8px 12px;
}

/* Gap between label and input */
.gap-3 {
  gap: 12px;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .payment-method {
    margin-bottom: 16px;
  }

  .d-flex.justify-space-between {
    flex-direction: column;
    gap: 4px;
  }
}
</style>