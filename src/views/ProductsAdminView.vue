<!--
Products Admin View

Vista de administración de productos/servicios con CRUD completo:
- Tabla de productos existentes
- Crear, editar y eliminar productos
- Búsqueda y filtros
- Gestión de estado activo/inactivo

Ruta: /products
-->

<template>
  <div class="admin-view d-flex flex-column h-100">
    <!-- Header -->
    <div class="admin-header px-4 py-3 border-b d-flex align-center justify-space-between">
      <div>
        <h1 class="text-subtitle-1 font-weight-medium mb-1">
          Gestión de Productos
        </h1>
        <p class="text-caption text-on-surface-variant">
          Administra el catálogo de productos y servicios del POS
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-plus"
        size="small"
        @click="openCreateModal"
      >
        Agregar Producto
      </v-btn>
    </div>

    <!-- Search and Filters -->
    <div class="px-4 py-3 border-b">
      <v-row align="center" no-gutters>
        <v-col cols="12" md="6" class="pr-md-3">
          <v-text-field
            v-model="searchQuery"
            placeholder="Buscar productos por nombre o descripción"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="4" class="px-md-3">
          <v-select
            v-model="statusFilter"
            :items="statusOptions"
            placeholder="Filtrar por estado"
            variant="outlined"
            density="compact"
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="12" md="2" class="pl-md-3 text-right">
          <v-chip
            v-if="filteredProducts.length"
            color="primary"
            variant="outlined"
            size="small"
          >
            {{ filteredProducts.length }} producto{{ filteredProducts.length === 1 ? '' : 's' }}
          </v-chip>
        </v-col>
      </v-row>
    </div>

    <!-- Content -->
    <div class="admin-content flex-1-1 overflow-hidden">
      <!-- Products Table -->
      <v-data-table
        :headers="tableHeaders"
        :items="filteredProducts"
        :loading="isLoading"
        :no-data-text="noDataText"
        :items-per-page="-1"
        item-key="id"
        class="products-table h-100"
        density="compact"
        hide-default-footer
      >
        <!-- Name column -->
        <template #[`item.name`]="{ item }">
          <div class="d-flex align-center">
            <v-avatar color="secondary" size="small" class="me-2">
              <v-icon color="white" size="small">mdi-package-variant</v-icon>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.name }}</div>
              <div v-if="item.description" class="text-caption text-on-surface-variant text-truncate" style="max-width: 200px;">
                {{ item.description }}
              </div>
            </div>
          </div>
        </template>

        <!-- Price column -->
        <template #[`item.price`]="{ item }">
          <div>
            <div class="font-weight-bold text-primary">
              ${{ parseFloat(item.price).toFixed(2) }}
            </div>
            <v-chip
              v-if="item.variable_price"
              color="warning"
              size="x-small"
              variant="tonal"
              class="mt-1"
            >
              <v-icon start size="x-small">mdi-pencil</v-icon>
              Variable
            </v-chip>
          </div>
        </template>

        <!-- Category column -->
        <template #[`item.category`]="{ item }">
          <div v-if="item.category" class="text-caption">
            {{ item.category }}
          </div>
          <div v-else class="text-caption text-disabled">
            Sin categoría
          </div>
        </template>

        <!-- Status column -->
        <template #[`item.is_active`]="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'warning'"
            size="small"
            variant="tonal"
          >
            {{ item.is_active ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <!-- Actions column -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex gap-1 justify-center">
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              color="primary"
              @click="openEditModal(item)"
            />
            <v-btn
              :icon="item.is_active ? 'mdi-eye' : 'mdi-eye-off'"
              variant="text"
              size="small"
              :color="item.is_active ? 'success' : 'error'"
              @click="toggleProductStatus(item)"
            />
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="openDeleteDialog(item)"
            />
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Create Product Modal -->
    <CreateProductModal
      v-model="showCreateModal"
      @created="handleProductCreated"
    />

    <!-- Edit Product Modal -->
    <EditProductModal
      v-model="showEditModal"
      :product="selectedProduct"
      @updated="handleProductUpdated"
    />

    <!-- Delete Product Dialog -->
    <DeleteProductDialog
      v-model="showDeleteDialog"
      :product="selectedProduct"
      @deleted="handleProductDeleted"
    />

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      :timeout="4000"
      location="top"
    >
      {{ snackbarMessage }}
      <template #actions>
        <v-btn
          variant="text"
          @click="showSnackbar = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { productsService } from '@/services/pos'
import type { Product } from '@/types/pos'
import CreateProductModal from '@/components/admin/CreateProductModal.vue'
import EditProductModal from '@/components/admin/EditProductModal.vue'
import DeleteProductDialog from '@/components/admin/DeleteProductDialog.vue'

// State
const products = ref<Product[]>([])
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const statusFilter = ref<boolean | null>(null)

// Modal states
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const selectedProduct = ref<Product | null>(null)

// Snackbar states
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

// Table configuration
const tableHeaders = [
  { title: 'Producto', key: 'name', sortable: true, width: '35%' },
  { title: 'Precio', key: 'price', sortable: true, width: '15%' },
  { title: 'Categoría', key: 'category', sortable: true, width: '15%' },
  { title: 'Estado', key: 'is_active', sortable: true, width: '10%' },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'center' as const, width: '25%' }
]

const statusOptions = [
  { title: 'Activos', value: true },
  { title: 'Inactivos', value: false }
]

// Computed
const filteredProducts = computed(() => {
  let filtered = [...products.value]

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product =>
      product.name.toLowerCase().includes(query) ||
      (product.description && product.description.toLowerCase().includes(query))
    )
  }

  // Apply status filter
  if (statusFilter.value !== null) {
    filtered = filtered.filter(product => product.is_active === statusFilter.value)
  }

  return filtered
})

const noDataText = computed(() => {
  if (isLoading.value) return 'Cargando productos...'
  if (error.value) return 'Error al cargar los productos'
  if (searchQuery.value || statusFilter.value !== null) return 'No se encontraron productos con los filtros aplicados'
  return 'No hay productos configurados. ¡Agrega el primero!'
})

// Methods
const loadProducts = async () => {
  isLoading.value = true
  error.value = ''

  try {
    const response = await productsService.getProducts()
    products.value = response.products
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los productos'
    console.error('Error loading products:', err)
    showNotification('Error al cargar los productos', 'error')
  } finally {
    isLoading.value = false
  }
}

const showNotification = (message: string, color: 'success' | 'error' = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Modal handlers
const openCreateModal = () => {
  showCreateModal.value = true
}

const openEditModal = (product: Product) => {
  selectedProduct.value = product
  showEditModal.value = true
}

const openDeleteDialog = (product: Product) => {
  selectedProduct.value = product
  showDeleteDialog.value = true
}

const toggleProductStatus = async (product: Product) => {
  try {
    const updatedProduct = await productsService.updateProduct(product.id, {
      is_active: !product.is_active
    })

    // Update local state
    const index = products.value.findIndex(p => p.id === product.id)
    if (index !== -1) {
      products.value[index] = updatedProduct
    }

    const status = updatedProduct.is_active ? 'activado' : 'desactivado'
    showNotification(`Producto "${updatedProduct.name}" ${status} exitosamente`)
  } catch (err: unknown) {
    console.error('Error toggling product status:', err)
    showNotification('Error al cambiar el estado del producto', 'error')
  }
}

// Event handlers
const handleProductCreated = (product: Product) => {
  products.value.unshift(product)
  showNotification(`Producto "${product.name}" creado exitosamente`)
}

const handleProductUpdated = (updatedProduct: Product) => {
  const index = products.value.findIndex(p => p.id === updatedProduct.id)
  if (index !== -1) {
    products.value[index] = updatedProduct
  }
  showNotification(`Producto "${updatedProduct.name}" actualizado exitosamente`)
}

const handleProductDeleted = (productId: string) => {
  const deletedProduct = products.value.find(p => p.id === productId)
  products.value = products.value.filter(p => p.id !== productId)
  showNotification(`Producto "${deletedProduct?.name}" eliminado exitosamente`)
}

// Lifecycle
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
.admin-view {
  height: 100vh;
  background: rgb(var(--v-theme-surface));
}

.admin-header {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
}

.admin-content {
  background: rgb(var(--v-theme-surface));
}

.products-table {
  background: transparent;
}

.products-table :deep(.v-data-table__wrapper) {
  height: 100%;
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

/* Remove default padding from v-row in compact mode */
.admin-view :deep(.v-row) {
  margin: 0;
}

.admin-view :deep(.v-col) {
  padding: 0;
}

.admin-view :deep(.v-col.pr-md-3) {
  padding-right: 12px;
}

.admin-view :deep(.v-col.px-md-3) {
  padding-left: 12px;
  padding-right: 12px;
}

.admin-view :deep(.v-col.pl-md-3) {
  padding-left: 12px;
}

/* Custom gap for action buttons */
.d-flex.gap-1 {
  gap: 4px;
}

/* Text truncate utility */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 959px) {
  .admin-view :deep(.v-col) {
    padding: 4px 0;
  }
}
</style>