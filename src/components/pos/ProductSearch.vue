<!--
ProductSearch Component

Componente para búsqueda de productos en tiempo real.
Permite buscar productos por nombre o descripción y agregarlos al carrito.

Props: ninguno
Emits: ninguno
-->

<template>
  <div class="product-search">
    <!-- Search Input -->
    <v-text-field
      v-model="searchQuery"
      label="Buscar producto..."
      placeholder="Nombre o descripción del producto"
      prepend-inner-icon="mdi-magnify"
      variant="outlined"
      density="compact"
      :loading="isSearching"
      :disabled="!canAddProducts"
      clearable
      class="mb-4"
      @update:model-value="handleSearch"
    />

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="search-results mb-4">
      <v-list density="compact" class="bg-surface rounded border">
        <v-list-item
          v-for="product in searchResults"
          :key="product.id"
          @click="addProductToCart(product)"
          class="product-result-item"
        >
          <template #prepend>
            <v-avatar color="secondary" size="small">
              <v-icon color="white">mdi-package-variant</v-icon>
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium">
            {{ product.name }}
          </v-list-item-title>

          <v-list-item-subtitle>
            {{ product.description || 'Sin descripción' }}
          </v-list-item-subtitle>

          <template #append>
            <div class="text-end">
              <div class="font-weight-bold text-primary">
                ${{ parseFloat(product.price).toFixed(2) }}
              </div>
              <v-btn
                size="x-small"
                color="primary"
                variant="tonal"
                @click.stop="addProductToCart(product)"
              >
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </div>

    <!-- No Results -->
    <div v-else-if="hasSearched && searchResults.length === 0 && searchQuery" class="mb-4">
      <v-alert
        type="info"
        variant="tonal"
        density="compact"
      >
        <div class="d-flex align-center justify-space-between">
          <span>No se encontraron productos para "{{ searchQuery }}"</span>
          <v-btn
            size="small"
            color="primary"
            variant="flat"
            @click="showCreateProductDialog"
          >
            <v-icon start>mdi-plus</v-icon>
            Crear
          </v-btn>
        </div>
      </v-alert>
    </div>


    <!-- Helper Text -->
    <div v-if="!canAddProducts" class="text-caption text-error mt-2">
      ⚠️ Selecciona un cliente para agregar productos
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Product, SaleItemType } from '@/types/pos'
import { useCustomerStore } from '@/stores/customer'
import { usePOSStore } from '@/stores/pos'
import { productsService } from '@/services/pos'

const customerStore = useCustomerStore()
const posStore = usePOSStore()

// Reactive state
const searchQuery = ref<string>('')
const searchResults = ref<Product[]>([])
const hasSearched = ref<boolean>(false)
const isSearching = ref<boolean>(false)
const searchTimeout = ref<number | null>(null)

// Computed
const canAddProducts = computed(() => customerStore.hasCustomer)

// Methods
const handleSearch = async (query: string | null) => {
  if (!query || query.trim().length < 2) {
    searchResults.value = []
    hasSearched.value = false
    return
  }

  // Clear existing timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // Debounce search
  searchTimeout.value = setTimeout(async () => {
    isSearching.value = true
    try {
      const response = await productsService.searchProducts(query.trim())
      searchResults.value = response.products
      hasSearched.value = true
    } catch (error) {
      console.error('Error searching products:', error)
      searchResults.value = []
      hasSearched.value = true
    } finally {
      isSearching.value = false
    }
  }, 300)
}

const addProductToCart = (product: Product) => {
  if (!canAddProducts.value) return

  posStore.addItem({
    type: 'product' as SaleItemType,
    product_id: product.id,
    name: product.name,
    description: product.description,
    unit_price: product.price,
    quantity: 1,
    total: product.price
  })

  // Clear search after adding
  searchQuery.value = ''
  searchResults.value = []
  hasSearched.value = false
}


const showCreateProductDialog = () => {
  // TODO: Implement product creation from search
  console.log('Show create product dialog for:', searchQuery.value)
}

// Watch for customer changes to clear search
watch(() => customerStore.currentCustomer, (customer) => {
  if (!customer) {
    searchQuery.value = ''
    searchResults.value = []
    hasSearched.value = false
  }
})

// Cleanup timeout on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})
</script>

<style scoped>
.product-search {
  height: 100%;
}

.product-result-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.product-result-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.search-results {
  max-height: 300px;
  overflow-y: auto;
}

</style>