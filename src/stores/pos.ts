/**
 * POS Store
 *
 * Store para manejo del estado del POS (Point of Sale)
 * - Items del carrito
 * - Métodos de pago
 * - Cálculos de totales
 * - Estado de la venta
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCustomerStore } from './customer'
import type {
  SaleItem,
  PaymentMethodItem,
  SaleItemType
} from '@/types/pos'
import { PaymentMethod } from '@/types/pos'
import { salesService } from '@/services/pos'

interface CartItem {
  id: string
  type: SaleItemType
  product_id?: string
  name: string
  description?: string
  details?: string // Additional notes from product
  unit_price: string
  quantity: number
  total: string
  variable_price?: boolean // If price is editable
  additional?: string // Additional amount field
}

interface PaymentItem {
  method: PaymentMethod
  amount: string
  enabled: boolean
}

export const usePOSStore = defineStore('pos', () => {
  // Get customer store reference
  const customerStore = useCustomerStore()
  // State
  const cartItems = ref<CartItem[]>([])
  const paymentMethods = ref<PaymentItem[]>([
    { method: PaymentMethod.CASH, amount: '0.00', enabled: false },
    { method: PaymentMethod.CARD, amount: '0.00', enabled: false },
    { method: PaymentMethod.TRANSFER, amount: '0.00', enabled: false },
    { method: PaymentMethod.LOYALTY_POINTS, amount: '0.00', enabled: false }
  ])
  const discountAmount = ref<string>('0.00')
  const loyaltyPointsRate = ref<number>(0.10) // 10% default rate
  const isProcessingSale = ref<boolean>(false)

  // Getters
  const subtotal = computed(() => {
    const sum = cartItems.value.reduce((sum, item) => {
      const itemTotal = parseFloat(item.unit_price) * item.quantity
      return sum + itemTotal
    }, 0)
    return sum.toFixed(2)
  })

  const adjustmentsTotal = computed(() => {
    const sum = cartItems.value.reduce((sum, item) => {
      const additional = parseFloat(item.additional || '0')
      return sum + additional
    }, 0)
    return sum.toFixed(2)
  })

  const totalAmount = computed(() => {
    const sub = parseFloat(subtotal.value)
    const adj = parseFloat(adjustmentsTotal.value)
    const disc = parseFloat(discountAmount.value)
    return Math.max(0, sub + adj - disc).toFixed(2)
  })

  const loyaltyPointsGenerated = computed(() => {
    const total = parseFloat(totalAmount.value)
    return Math.floor(total * loyaltyPointsRate.value)
  })

  const totalPaymentAmount = computed(() => {
    const sum = paymentMethods.value
      .filter(pm => pm.enabled)
      .reduce((sum, pm) => sum + (parseFloat(pm.amount) || 0), 0)
    return sum.toFixed(2)
  })

  const isPaymentValid = computed(() => {
    const total = parseFloat(totalAmount.value)
    const paid = parseFloat(totalPaymentAmount.value)
    return Math.abs(total - paid) < 0.01 // Allow for rounding errors
  })

  const canProcessSale = computed(() => {
    return customerStore.hasCustomer &&
           cartItems.value.length > 0 &&
           isPaymentValid.value &&
           !isProcessingSale.value
  })

  // Actions
  const addItem = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...item,
      additional: item.additional || '0' // Initialize additional field
    }
    cartItems.value.push(newItem)
  }

  const removeItem = (itemId: string) => {
    const index = cartItems.value.findIndex(item => item.id === itemId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
    }
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    const item = cartItems.value.find(item => item.id === itemId)
    if (item && quantity > 0) {
      item.quantity = quantity
      const unitPrice = parseFloat(item.unit_price)
      item.total = (unitPrice * quantity).toFixed(2)
    }
  }

  const updateItemPrice = (itemId: string, newPrice: string) => {
    const item = cartItems.value.find(item => item.id === itemId)
    if (item && item.variable_price) {
      const price = parseFloat(newPrice)
      if (!isNaN(price) && price >= 0) {
        item.unit_price = price.toFixed(2)
        item.total = (price * item.quantity).toFixed(2)
      }
    }
  }

  const updatePaymentMethod = (method: PaymentMethod, amount: string, enabled: boolean) => {
    console.log('STORE updatePaymentMethod called:', { method, amount, enabled })
    const payment = paymentMethods.value.find(pm => pm.method === method)
    console.log('Found payment:', payment)
    if (payment) {
      payment.amount = amount
      payment.enabled = enabled
      console.log('After update:', { payment, allMethods: paymentMethods.value })
      console.log('Computed totalPaymentAmount:', totalPaymentAmount.value)
    } else {
      console.error('Payment method not found:', method)
    }
  }

  const clearCart = () => {
    cartItems.value = []
    paymentMethods.value.forEach(pm => {
      pm.amount = '0.00'
      pm.enabled = false
    })
    discountAmount.value = '0.00'
  }

  const processSale = async (customerId: string, staffId: string) => {
    if (!canProcessSale.value) {
      throw new Error('Cannot process sale - invalid state')
    }

    isProcessingSale.value = true

    try {
      // Convert cart items to API format
      const saleItems: SaleItem[] = cartItems.value.map(item => {
        // Calculate item total: (unit_price * quantity) + additional
        const baseTotal = parseFloat(item.unit_price) * item.quantity
        const additional = parseFloat(item.additional || '0')
        const itemTotal = (baseTotal + additional).toFixed(2)

        return {
          type: item.type,
          product_id: item.product_id,
          name: item.name,
          description: item.description || item.details || '', // Backend requires description
          unit_price: item.unit_price,
          quantity: item.quantity,
          total: itemTotal
        }
      })

      // Convert payment methods to API format
      const salePaymentMethods: PaymentMethodItem[] = paymentMethods.value
        .filter(pm => pm.enabled && parseFloat(pm.amount) > 0)
        .map(pm => ({
          method: pm.method,
          amount: pm.amount
        }))

      // Prepare sale request payload
      const salePayload = {
        customer_id: customerId,
        staff_id: staffId,
        items: saleItems,
        subtotal: subtotal.value,
        discount_amount: discountAmount.value,
        total_amount: totalAmount.value,
        loyalty_points_generated: loyaltyPointsGenerated.value,
        payment_methods: salePaymentMethods
      }

      console.log('Creating sale with payload:', JSON.stringify(salePayload, null, 2))

      // Create sale via API
      const sale = await salesService.createSale(salePayload)

      // Clear cart after successful sale
      clearCart()

      return sale
    } finally {
      isProcessingSale.value = false
    }
  }

  return {
    // State
    cartItems: computed(() => cartItems.value),
    paymentMethods: computed(() => paymentMethods.value),
    discountAmount: computed(() => discountAmount.value),
    loyaltyPointsRate: computed(() => loyaltyPointsRate.value),
    isProcessingSale: computed(() => isProcessingSale.value),

    // Getters
    subtotal,
    adjustmentsTotal,
    totalAmount,
    loyaltyPointsGenerated,
    totalPaymentAmount,
    isPaymentValid,
    canProcessSale,

    // Actions
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemPrice,
    updatePaymentMethod,
    clearCart,
    processSale
  }
})