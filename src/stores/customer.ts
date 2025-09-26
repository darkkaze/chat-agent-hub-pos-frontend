/**
 * Customer Store
 *
 * Store para manejo del cliente actual en el POS
 * - Cliente seleccionado
 * - Búsqueda de clientes
 * - Creación rápida de clientes
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Customer } from '@/types/pos'
import { customersService } from '@/services/pos'

export const useCustomerStore = defineStore('customer', () => {
  // State
  const currentCustomer = ref<Customer | null>(null)
  const isSearching = ref<boolean>(false)
  const isCreating = ref<boolean>(false)

  // Getters
  const hasCustomer = computed(() => !!currentCustomer.value)
  const customerLoyaltyPoints = computed(() => {
    return currentCustomer.value ? parseFloat(currentCustomer.value.loyalty_points) : 0
  })

  // Actions
  const searchCustomers = async (phone: string) => {
    isSearching.value = true
    try {
      const response = await customersService.searchCustomers(phone)
      return response.customers
    } finally {
      isSearching.value = false
    }
  }

  const setCurrentCustomer = (customer: Customer) => {
    currentCustomer.value = customer
  }

  const clearCurrentCustomer = () => {
    currentCustomer.value = null
  }

  const createCustomer = async (customerData: { phone: string; name?: string }) => {
    isCreating.value = true
    try {
      const customer = await customersService.createCustomer(customerData)
      setCurrentCustomer(customer)
      return customer
    } finally {
      isCreating.value = false
    }
  }

  const updateCustomerWallet = async (loyaltyPoints: string) => {
    if (!currentCustomer.value) {
      throw new Error('No customer selected')
    }

    try {
      await customersService.updateCustomerWallet(currentCustomer.value.id, {
        loyalty_points: loyaltyPoints
      })

      // Update local customer data
      currentCustomer.value.loyalty_points = loyaltyPoints
    } catch (error) {
      throw error
    }
  }

  const refreshCurrentCustomer = async () => {
    if (!currentCustomer.value) return

    try {
      const updatedCustomer = await customersService.getCustomer(currentCustomer.value.id)
      setCurrentCustomer(updatedCustomer)
    } catch (error) {
      console.error('Error refreshing customer:', error)
      // Don't clear customer on refresh error, just log it
    }
  }

  return {
    // State
    currentCustomer: computed(() => currentCustomer.value),
    isSearching: computed(() => isSearching.value),
    isCreating: computed(() => isCreating.value),

    // Getters
    hasCustomer,
    customerLoyaltyPoints,

    // Actions
    searchCustomers,
    setCurrentCustomer,
    clearCurrentCustomer,
    createCustomer,
    updateCustomerWallet,
    refreshCurrentCustomer
  }
})