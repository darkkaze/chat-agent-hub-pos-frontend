<!--
CustomerSearch Component

Componente para búsqueda de clientes por número de teléfono.
Incluye selector de código de país (+521), búsqueda por últimos 10 dígitos,
y modal para crear cliente si no existe.

Props: ninguno
Emits: ninguno
-->

<template>
  <v-card elevation="2" class="mb-4">
    <v-card-title class="d-flex align-center pa-2 bg-primary">
      <v-icon class="me-2 text-white">mdi-phone-search</v-icon>
      <span class="text-white font-weight-bold">Búsqueda Cliente</span>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Search Form -->
      <div class="d-flex gap-2 mb-4">
        <!-- Country Code (Fixed) -->
        <v-select
          :model-value="countryCode"
          :items="countryCodeOptions"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="compact"
          readonly
          class="country-code-select"
          style="max-width: 100px; min-width: 100px;"
        />

        <!-- Phone Input -->
        <v-text-field
          v-model="phoneInput"
          label="Número de teléfono"
          placeholder="1234567890"
          variant="outlined"
          density="compact"
          :loading="isSearching"
          :disabled="isSearching"
          maxlength="10"
          class="flex-grow-1"
          @input="handlePhoneInput"
          @keyup.enter="handleSearch"
        />

        <!-- Search Button -->
        <v-btn
          color="primary"
          variant="flat"
          :loading="isSearching"
          :disabled="!canSearch"
          @click="handleSearch"
        >
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </div>

      <!-- Search Results -->
      <div v-if="searchResults.length > 0" class="mb-4">
        <v-list density="compact" class="bg-surface rounded border">
          <v-list-item
            v-for="customer in searchResults"
            :key="customer.id"
            @click="selectCustomer(customer)"
            class="customer-result-item"
          >
            <template #prepend>
              <v-avatar color="primary" size="small">
                <v-icon color="white">mdi-account</v-icon>
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium">
              {{ customer.name || 'Cliente sin nombre' }}
            </v-list-item-title>

            <v-list-item-subtitle>
              {{ customer.phone }}
            </v-list-item-subtitle>

            <template #append>
              <v-chip
                size="small"
                color="success"
                variant="tonal"
              >
                ${{ customer.loyalty_points }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </div>

      <!-- No Results + Create Customer -->
      <div v-else-if="hasSearched && searchResults.length === 0" class="mb-4">
        <v-alert
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-3"
        >
          <div class="d-flex align-center justify-space-between">
            <span>No se encontró cliente con ese teléfono</span>
            <v-btn
              size="small"
              color="primary"
              variant="flat"
              @click="showCreateModal = true"
            >
              <v-icon start>mdi-account-plus</v-icon>
              Crear
            </v-btn>
          </div>
        </v-alert>
      </div>

      <!-- Current Customer Display -->
      <div v-if="currentCustomer" class="current-customer">
        <v-card
          color="success"
          variant="tonal"
          elevation="0"
        >
          <v-card-text class="pa-3">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-avatar color="success" size="small" class="me-3">
                  <v-icon color="white">mdi-account-check</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-bold text-on-surface">
                    Cliente: {{ currentCustomer.name || 'Sin nombre' }}
                  </div>
                  <div class="text-caption text-on-surface-variant">
                    {{ currentCustomer.phone }}
                  </div>
                </div>
              </div>

              <div class="text-end">
                <div class="font-weight-bold text-on-surface">
                  Monedero: ${{ parseFloat(currentCustomer.loyalty_points).toFixed(2) }}
                </div>
                <v-btn
                  size="small"
                  variant="text"
                  color="error"
                  @click="clearCustomer"
                >
                  <v-icon>mdi-close</v-icon>
                  Cambiar
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Search Helper Text -->
      <div v-if="!currentCustomer" class="text-caption text-on-surface-variant">
        💡 Busca por los últimos 10 dígitos del teléfono
      </div>
    </v-card-text>

    <!-- Create Customer Modal -->
    <CustomerModal
      v-model="showCreateModal"
      :phone="phoneInput"
      @customer-created="handleCustomerCreated"
    />
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Customer } from '@/types/pos'
import { useCustomerStore } from '@/stores/customer'
import CustomerModal from '@/components/common/CustomerModal.vue'

const customerStore = useCustomerStore()

// Reactive state
const phoneInput = ref<string>('')
const searchResults = ref<Customer[]>([])
const hasSearched = ref<boolean>(false)
const showCreateModal = ref<boolean>(false)

// Country code options (fixed to Mexico +521)
const countryCode = '+521'
const countryCodeOptions = [
  { label: '+521', value: '+521' }
]

// Computed
const isSearching = computed(() => customerStore.isSearching)
const currentCustomer = computed(() => customerStore.currentCustomer)

const canSearch = computed(() => {
  const phone = phoneInput.value.replace(/\D/g, '')
  return phone.length >= 10 && !isSearching.value
})

// Methods
const handlePhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/\D/g, '') // Only digits
  phoneInput.value = value.slice(0, 10) // Max 10 digits

  // Clear previous results when typing
  if (hasSearched.value) {
    searchResults.value = []
    hasSearched.value = false
  }
}

const handleSearch = async () => {
  if (!canSearch.value) return

  const phone = phoneInput.value.replace(/\D/g, '')
  if (phone.length < 10) return

  try {
    // Search with full phone number including country code
    const fullPhone = `${countryCode}${phone}`
    const customers = await customerStore.searchCustomers(fullPhone)

    searchResults.value = customers
    hasSearched.value = true
  } catch (error) {
    console.error('Error searching customers:', error)
    searchResults.value = []
    hasSearched.value = true
  }
}

const selectCustomer = (customer: Customer) => {
  customerStore.setCurrentCustomer(customer)
  searchResults.value = []
  hasSearched.value = false
  phoneInput.value = ''
}

const clearCustomer = () => {
  customerStore.clearCurrentCustomer()
  searchResults.value = []
  hasSearched.value = false
  phoneInput.value = ''
}

const handleCustomerCreated = (customer: Customer) => {
  // Customer is already set in store by the modal
  searchResults.value = []
  hasSearched.value = false
  phoneInput.value = ''
}
</script>

<style scoped>
.country-code-select {
  flex-shrink: 0;
}

.customer-result-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.customer-result-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.current-customer {
  border: 2px solid rgba(var(--v-theme-success), 0.3);
  border-radius: 8px;
  overflow: hidden;
}

/* Gap utility */
.gap-2 > * + * {
  margin-left: 8px;
}

.d-flex.gap-2 {
  gap: 8px;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .d-flex.gap-2 {
    flex-direction: column;
    gap: 12px;
  }

  .country-code-select {
    max-width: none;
    min-width: auto;
  }
}
</style>