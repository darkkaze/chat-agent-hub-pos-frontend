<!--
ProductsListModal Component

Modal con lista completa de productos del catálogo.
Permite búsqueda interna y selección rápida para agregar al carrito.

Props:
- modelValue (boolean): Control de visibilidad del modal

Emits:
- update:modelValue (boolean): Actualización de visibilidad
- product-selected (Product): Producto seleccionado para agregar
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="900px"
    scrollable
  >
    <v-card>
      <!-- Header -->
      <v-card-title class="d-flex align-center pa-4 bg-primary">
        <v-icon class="me-2 text-white" size="large">mdi-package-variant-closed</v-icon>
        <span class="text-white font-weight-bold text-h6">Catálogo de Productos</span>
        <v-spacer />
        <v-btn
          icon
          variant="text"
          @click="closeModal"
        >
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- Search Bar -->
      <v-card-text class="pa-4 pb-0">
        <v-text-field
          v-model="localSearchQuery"
          label="Buscar en catálogo..."
          placeholder="Filtrar por nombre o descripción"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="mb-4"
        />

        <!-- Product count -->
        <div class="text-caption text-on-surface-variant mb-2">
          {{ filteredProducts.length }} producto(s) encontrado(s)
        </div>
      </v-card-text>

      <!-- Products List -->
      <v-card-text class="pa-4 pt-0" style="max-height: 500px;">
        <!-- Loading State -->
        <div v-if="isLoading" class="d-flex justify-center align-center pa-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
          />
        </div>

        <!-- Products Table -->
        <v-table v-else-if="filteredProducts.length > 0" density="compact" hover>
          <thead>
            <tr>
              <th class="text-left">Producto</th>
              <th class="text-left">Descripción</th>
              <th class="text-center">Precio</th>
              <th class="text-center" style="width: 100px;">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="product in filteredProducts"
              :key="product.id"
              class="product-row"
              @click="selectProduct(product)"
            >
              <td class="font-weight-medium">{{ product.name }}</td>
              <td class="text-caption text-on-surface-variant">
                {{ product.description || product.details || 'Sin descripción' }}
              </td>
              <td class="text-center font-weight-bold text-primary">
                ${{ parseFloat(product.price).toFixed(2) }}
              </td>
              <td class="text-center">
                <v-btn
                  size="small"
                  color="primary"
                  variant="tonal"
                  @click.stop="selectProduct(product)"
                >
                  <v-icon size="small">mdi-plus</v-icon>
                  Agregar
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>

        <!-- Empty State -->
        <div v-else class="d-flex flex-column align-center justify-center pa-8">
          <v-icon size="80" color="on-surface-variant" class="mb-4">
            mdi-package-variant-closed-remove
          </v-icon>
          <h3 class="text-h6 text-on-surface-variant mb-2">
            No se encontraron productos
          </h3>
          <p class="text-body-2 text-on-surface-variant text-center">
            {{ localSearchQuery ? `No hay productos que coincidan con "${localSearchQuery}"` : 'El catálogo está vacío' }}
          </p>
        </div>
      </v-card-text>

      <!-- Footer -->
      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn
          color="primary"
          variant="outlined"
          @click="closeModal"
        >
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Product } from '@/types/pos'
import { productsService } from '@/services/pos'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'product-selected', product: Product): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive state
const products = ref<Product[]>([])
const isLoading = ref<boolean>(false)
const localSearchQuery = ref<string>('')

// Computed
const filteredProducts = computed(() => {
  if (!localSearchQuery.value) {
    return products.value
  }

  const query = localSearchQuery.value.toLowerCase().trim()
  return products.value.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(query)
    const descMatch = product.description?.toLowerCase().includes(query) || false
    const detailsMatch = product.details?.toLowerCase().includes(query) || false
    return nameMatch || descMatch || detailsMatch
  })
})

// Methods
const loadProducts = async () => {
  isLoading.value = true
  try {
    const response = await productsService.getProducts()
    products.value = response.products
  } catch (error) {
    console.error('Error loading products:', error)
    products.value = []
  } finally {
    isLoading.value = false
  }
}

const selectProduct = (product: Product) => {
  emit('product-selected', product)
  closeModal()
}

const closeModal = () => {
  emit('update:modelValue', false)
  // Reset search on close
  localSearchQuery.value = ''
}

// Watch for modal open to load products
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    loadProducts()
  }
})
</script>

<style scoped>
.product-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.product-row:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

/* Table styling */
thead th {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
  padding: 12px 8px !important;
  border-bottom: 2px solid rgba(var(--v-theme-on-surface), 0.12) !important;
}

tbody td {
  padding: 12px 8px !important;
  vertical-align: middle;
}
</style>
