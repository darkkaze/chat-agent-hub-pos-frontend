<!--
Sales History View

Vista de historial de ventas (tickets) con listado paginado:
- Lista de ventas con información básica
- Paginación para navegación
- Búsqueda por cliente o ID de venta
- Modal de detalles al hacer click en una venta

Ruta: /tickets
-->

<template>
  <div class="admin-view d-flex flex-column h-100">
    <!-- Header -->
    <div class="admin-header px-4 py-3 border-b d-flex align-center justify-space-between">
      <div>
        <h1 class="text-subtitle-1 font-weight-medium mb-1">
          Historial de Ventas
        </h1>
        <p class="text-caption text-on-surface-variant">
          Consulta el histórico de todas las ventas realizadas en el POS
        </p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-chip
          v-if="totalSales > 0"
          color="primary"
          variant="outlined"
          size="small"
        >
          {{ totalSales }} venta{{ totalSales === 1 ? '' : 's' }}
        </v-chip>

        <v-btn
          icon="mdi-refresh"
          variant="text"
          size="small"
          color="primary"
          @click="refreshSales"
          :loading="isLoading"
        />
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="px-4 py-3 border-b">
      <v-row align="center" no-gutters>
        <v-col cols="12" md="6" class="pr-md-3">
          <v-text-field
            v-model="searchQuery"
            placeholder="Buscar por ID de venta, cliente o teléfono"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            clearable
            hide-details
            @update:model-value="debouncedSearch"
          />
        </v-col>
        <v-col cols="12" md="3" class="px-md-3">
          <v-select
            v-model="selectedPageSize"
            :items="pageSizeOptions"
            label="Elementos por página"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="changePageSize"
          />
        </v-col>
        <v-col cols="12" md="3" class="pl-md-3">
          <v-text-field
            v-model="dateFilter"
            label="Filtrar por fecha"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            clearable
            @update:model-value="() => loadSales()"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Content -->
    <div class="admin-content flex-1-1 overflow-hidden d-flex flex-column">
      <!-- Sales List -->
      <div class="sales-list flex-grow-1 overflow-auto">
        <v-data-table
          :headers="tableHeaders"
          :items="sales"
          :loading="isLoading"
          :no-data-text="noDataText"
          :items-per-page="selectedPageSize"
          :page="currentPage"
          item-key="id"
          class="sales-table h-100"
          density="compact"
          hide-default-footer
        >
          <!-- Sale ID column -->
          <template #[`item.id`]="{ item }">
            <div class="font-family-monospace text-primary font-weight-medium">
              {{ item.id }}
            </div>
          </template>

          <!-- Customer column -->
          <template #[`item.customer`]="{ item }">
            <div class="d-flex align-center">
              <v-avatar color="success" size="small" class="me-2">
                <v-icon color="white" size="small">mdi-account</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-medium">
                  {{ item.customer?.name || 'Sin nombre' }}
                </div>
                <div class="text-caption text-on-surface-variant">
                  {{ item.customer?.phone || 'Sin teléfono' }}
                </div>
              </div>
            </div>
          </template>

          <!-- Items count column -->
          <template #[`item.items_count`]="{ item }">
            <v-chip
              size="small"
              color="secondary"
              variant="tonal"
            >
              {{ getItemsCount(item.items) }} item{{ getItemsCount(item.items) === 1 ? '' : 's' }}
            </v-chip>
          </template>

          <!-- Total amount column -->
          <template #[`item.total_amount`]="{ item }">
            <div class="font-weight-bold text-primary text-h6">
              ${{ parseFloat(item.total_amount).toFixed(2) }}
            </div>
          </template>

          <!-- Loyalty points column -->
          <template #[`item.loyalty_points_generated`]="{ item }">
            <div v-if="item.loyalty_points_generated" class="d-flex align-center">
              <v-icon color="warning" size="small" class="me-1">mdi-star</v-icon>
              <span class="font-weight-medium text-warning">
                {{ item.loyalty_points_generated }}
              </span>
            </div>
            <span v-else class="text-on-surface-variant">-</span>
          </template>

          <!-- Date column -->
          <template #[`item.created_at`]="{ item }">
            <div>
              <div class="font-weight-medium">
                {{ formatDate(item.created_at) }}
              </div>
              <div class="text-caption text-on-surface-variant">
                {{ formatTime(item.created_at) }}
              </div>
            </div>
          </template>

          <!-- Actions column -->
          <template #[`item.actions`]="{ item }">
            <v-btn
              icon="mdi-eye"
              variant="text"
              size="small"
              color="primary"
              @click.stop="openSaleDetails(item)"
            />
          </template>
        </v-data-table>
      </div>

      <!-- Pagination -->
      <div class="pagination-section border-t pa-3">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          density="compact"
          @update:model-value="changePage"
        />

        <div class="text-center text-caption text-on-surface-variant mt-2">
          Mostrando {{ startItem }} - {{ endItem }} de {{ totalSales }} ventas
        </div>
      </div>
    </div>

    <!-- Sale Details Modal -->
    <SaleDetailsModal
      v-model="showDetailsModal"
      :sale="selectedSale"
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
import { ref, computed, onMounted, watch } from 'vue'
import { salesService } from '@/services/pos'
import type { Sale, SalesListRequest } from '@/types/pos'
import SaleDetailsModal from '@/components/pos/SaleDetailsModal.vue'

// State
const sales = ref<Sale[]>([])
const totalSales = ref(0)
const currentPage = ref(1)
const selectedPageSize = ref(20)
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const dateFilter = ref('')

// Modal states
const showDetailsModal = ref(false)
const selectedSale = ref<Sale | null>(null)

// Snackbar states
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

// Search debounce
const searchTimeout = ref<number | null>(null)

// Table configuration
const tableHeaders = [
  { title: 'ID Venta', key: 'id', sortable: false, width: '15%' },
  { title: 'Cliente', key: 'customer', sortable: false, width: '25%' },
  { title: 'Items', key: 'items_count', sortable: false, width: '10%' },
  { title: 'Total', key: 'total_amount', sortable: false, width: '15%' },
  { title: 'Puntos', key: 'loyalty_points_generated', sortable: false, width: '10%' },
  { title: 'Fecha', key: 'created_at', sortable: false, width: '20%' },
  { title: '', key: 'actions', sortable: false, width: '5%', align: 'center' as const }
]

const pageSizeOptions = [
  { title: '10', value: 10 },
  { title: '20', value: 20 },
  { title: '50', value: 50 },
  { title: '100', value: 100 }
]

// Computed
const totalPages = computed(() => {
  return Math.ceil(totalSales.value / selectedPageSize.value)
})

const startItem = computed(() => {
  return (currentPage.value - 1) * selectedPageSize.value + 1
})

const endItem = computed(() => {
  return Math.min(currentPage.value * selectedPageSize.value, totalSales.value)
})

const noDataText = computed(() => {
  if (isLoading.value) return 'Cargando ventas...'
  if (error.value) return 'Error al cargar las ventas'
  if (searchQuery.value || dateFilter.value) return 'No se encontraron ventas con los filtros aplicados'
  return 'No hay ventas registradas aún'
})

// Methods
const loadSales = async (resetPage = false) => {
  if (resetPage) {
    currentPage.value = 1
  }

  isLoading.value = true
  error.value = ''

  try {
    const params: SalesListRequest = {
      page: currentPage.value,
      page_size: selectedPageSize.value
    }

    // Add search filter if present
    if (searchQuery.value.trim()) {
      // For now, we'll rely on backend search implementation
      // This could be enhanced to search by customer name, phone, or sale ID
      params.search = searchQuery.value.trim()
    }

    // Add date filter if present
    if (dateFilter.value) {
      params.date = dateFilter.value
    }

    const response = await salesService.getSales(params)

    sales.value = response.sales
    totalSales.value = response.total

  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar las ventas'
    console.error('Error loading sales:', err)
    showNotification('Error al cargar las ventas', 'error')
  } finally {
    isLoading.value = false
  }
}

const refreshSales = () => {
  loadSales()
}

const changePage = (page: number) => {
  currentPage.value = page
  loadSales()
}

const changePageSize = (newSize: number) => {
  selectedPageSize.value = newSize
  loadSales(true) // Reset to page 1
}

const debouncedSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = setTimeout(() => {
    loadSales(true) // Reset to page 1 when searching
  }, 500)
}

const openSaleDetails = async (sale: Sale) => {
  // Fetch complete sale details from API
  try {
    isLoading.value = true
    const fullSale = await salesService.getSale(sale.id)
    selectedSale.value = fullSale
    showDetailsModal.value = true
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar detalles de la venta'
    console.error('Error loading sale details:', err)
    showNotification('Error al cargar detalles de la venta', 'error')
  } finally {
    isLoading.value = false
  }
}

const getItemsCount = (itemsJson: any): number => {
  try {
    if (typeof itemsJson === 'string') {
      const items = JSON.parse(itemsJson)
      return Array.isArray(items) ? items.length : 0
    }
    return Array.isArray(itemsJson) ? itemsJson.length : 0
  } catch {
    return 0
  }
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Fecha inválida'
  }
}

const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Hora inválida'
  }
}

const showNotification = (message: string, color: 'success' | 'error' = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Watch for search query changes
watch(searchQuery, () => {
  if (!searchQuery.value.trim()) {
    loadSales(true)
  }
})

// Cleanup timeout on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
})

// Lifecycle
onMounted(() => {
  loadSales()
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

.sales-table {
  background: transparent;
}

.sales-table :deep(.v-data-table__wrapper) {
  height: 100%;
}

.sales-table :deep(.v-data-table__wrapper tbody tr) {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.sales-table :deep(.v-data-table__wrapper tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

.border-b {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.border-t {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.pagination-section {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
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

/* Custom gap for header buttons */
.d-flex.gap-2 {
  gap: 8px;
}

/* Monospace font for sale IDs */
.font-family-monospace {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* Custom scrollbar for sales list */
.sales-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) transparent;
}

.sales-list::-webkit-scrollbar {
  width: 6px;
}

.sales-list::-webkit-scrollbar-track {
  background: transparent;
}

.sales-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 3px;
}

.sales-list::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.5);
}

@media (max-width: 959px) {
  .admin-view :deep(.v-col) {
    padding: 4px 0;
  }

  .d-flex.gap-2 {
    flex-direction: column;
    gap: 8px;
  }
}
</style>