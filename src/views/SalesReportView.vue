<!--
Sales Report View

Vista de informe de ventas con filtros por rango de fechas y colaborador:
- Filtros: fecha inicio, fecha fin, staff (con opción "Todos")
- Tabla de resultados sin paginación
- Resumen final con totales
- Exportación a CSV con estructura especial

Ruta: /reports
-->

<template>
  <div class="admin-view d-flex flex-column h-100">
    <!-- Header -->
    <div class="admin-header px-4 py-3 border-b d-flex align-center justify-space-between">
      <div>
        <h1 class="text-subtitle-1 font-weight-medium mb-1">
          Informe de Ventas
        </h1>
        <p class="text-caption text-on-surface-variant">
          Genera reportes de ventas por período y colaborador
        </p>
      </div>

      <div class="d-flex align-center gap-2">
        <v-btn
          icon="mdi-download"
          variant="text"
          size="small"
          color="primary"
          :disabled="sales.length === 0 || isLoading"
          @click="downloadCsv"
          title="Descargar como CSV"
        />
      </div>
    </div>

    <!-- Filters -->
    <div class="px-4 py-3 border-b">
      <v-row align="center" no-gutters>
        <v-col cols="12" md="3" class="pr-md-2">
          <v-text-field
            v-model="startDate"
            label="Fecha Inicio"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col cols="12" md="3" class="px-md-2">
          <v-text-field
            v-model="endDate"
            label="Fecha Fin"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col cols="12" md="3" class="px-md-2">
          <v-select
            v-model="selectedStaffId"
            :items="staffOptions"
            label="Colaborador"
            variant="outlined"
            density="compact"
            hide-details
          />
        </v-col>

        <v-col cols="12" md="3" class="pl-md-2">
          <v-btn
            color="primary"
            block
            :loading="isLoading"
            @click="loadReport"
          >
            Consultar
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- Content -->
    <div class="admin-content flex-1-1 overflow-hidden d-flex flex-column">
      <!-- Sales Table -->
      <div class="sales-list flex-grow-1 overflow-auto">
        <v-data-table
          :headers="tableHeaders"
          :items="sales"
          :loading="isLoading"
          :no-data-text="noDataText"
          :items-per-page="-1"
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

          <!-- Items column -->
          <template #[`item.items_display`]="{ item }">
            <div class="text-caption" style="white-space: pre-wrap; word-break: break-word;">
              {{ formatItemsForDisplay(item.items) }}
            </div>
          </template>

          <!-- Staff column -->
          <template #[`item.staff`]="{ item }">
            {{ item.staff?.name || 'Sin asignar' }}
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

          <!-- Tip column -->
          <template #[`item.tip_amount`]="{ item }">
            <div v-if="item.tip_amount && parseFloat(item.tip_amount) > 0" class="font-weight-medium">
              ${{ parseFloat(item.tip_amount).toFixed(2) }}
            </div>
            <span v-else class="text-on-surface-variant">-</span>
          </template>

          <!-- Total amount column -->
          <template #[`item.total_amount`]="{ item }">
            <div class="font-weight-bold text-primary text-h6">
              ${{ parseFloat(item.total_amount).toFixed(2) }}
            </div>
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
        </v-data-table>
      </div>

      <!-- Summary Section -->
      <div v-if="sales.length > 0" class="summary-section border-t pa-4">
        <v-divider class="mb-4" />
        <v-row align="center" no-gutters>
          <v-col cols="12" md="4">
            <div class="text-center">
              <div class="text-caption text-on-surface-variant mb-1">Total de Ventas</div>
              <div class="text-h5 font-weight-bold text-primary">
                {{ sales.length }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="text-center">
              <div class="text-caption text-on-surface-variant mb-1">Suma Total</div>
              <div class="text-h5 font-weight-bold text-primary">
                ${{ totalAmount }}
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="4">
            <div class="text-center">
              <div class="text-caption text-on-surface-variant mb-1">Rango de Fechas</div>
              <div class="text-h6 font-weight-bold">
                {{ formatDate(startDate) }} - {{ formatDate(endDate) }}
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>

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
import { salesService, staffService } from '@/services/pos'
import type { Sale, SalesReportRequest, Staff } from '@/types/pos'
import { Decimal } from 'decimal.js'

// State
const sales = ref<Sale[]>([])
const staffList = ref<Staff[]>([])
const isLoading = ref(false)
const error = ref('')

// Filter states
const startDate = ref('')
const endDate = ref('')
const selectedStaffId = ref('all')

// Snackbar states
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref<'success' | 'error'>('success')

// Table configuration
const tableHeaders = [
  { title: 'ID Venta', key: 'id', sortable: false, width: '12%' },
  { title: 'Cliente', key: 'customer', sortable: false, width: '18%' },
  { title: 'Items', key: 'items_display', sortable: false, width: '20%' },
  { title: 'Staff', key: 'staff', sortable: false, width: '12%' },
  { title: 'Puntos', key: 'loyalty_points_generated', sortable: false, width: '8%' },
  { title: 'Propina', key: 'tip_amount', sortable: false, width: '10%' },
  { title: 'Total', key: 'total_amount', sortable: false, width: '12%' },
  { title: 'Fecha', key: 'created_at', sortable: false, width: '16%' }
]

// Computed
const staffOptions = computed(() => {
  const options = [
    { title: 'Todos', value: 'all' }
  ]
  return options.concat(
    staffList.value.map(staff => ({
      title: staff.name,
      value: staff.id
    }))
  )
})

const totalAmount = computed(() => {
  if (sales.value.length === 0) return '$0.00'
  const total = sales.value.reduce((sum, sale) => {
    return sum.plus(new Decimal(sale.total_amount))
  }, new Decimal('0'))
  return `$${total.toFixed(2)}`
})

const noDataText = computed(() => {
  if (isLoading.value) return 'Cargando reporte...'
  if (error.value) return 'Error al cargar el reporte'
  if (sales.value.length === 0 && startDate.value && endDate.value) return 'No se encontraron ventas en el rango de fechas especificado'
  return 'Selecciona un rango de fechas y haz clic en "Consultar"'
})

// Methods
const loadReport = async () => {
  if (!startDate.value || !endDate.value) {
    showNotification('Por favor selecciona fecha inicio y fin', 'error')
    return
  }

  if (new Date(startDate.value) > new Date(endDate.value)) {
    showNotification('La fecha inicio no puede ser mayor a la fecha fin', 'error')
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const params: SalesReportRequest = {
      start_date: startDate.value,
      end_date: endDate.value,
      staff_id: selectedStaffId.value !== 'all' ? selectedStaffId.value : undefined
    }

    const response = await salesService.getSalesReport(params)
    sales.value = response.sales
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar el reporte'
    console.error('Error loading report:', err)
    showNotification('Error al cargar el reporte', 'error')
  } finally {
    isLoading.value = false
  }
}

const loadStaff = async () => {
  try {
    const response = await staffService.getStaff()
    staffList.value = response.staff
  } catch (err: unknown) {
    console.error('Error loading staff:', err)
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

const formatItemsForDisplay = (itemsData: any): string => {
  try {
    let items = itemsData
    if (typeof itemsData === 'string') {
      items = JSON.parse(itemsData)
    }
    if (!Array.isArray(items)) return ''
    return items.map(item => `${item.name} x ${item.quantity} @ $${parseFloat(item.unit_price).toFixed(2)}`).join('\n')
  } catch {
    return ''
  }
}

const downloadCsv = () => {
  try {
    // 1. Detectar todos los métodos de pago únicos
    const allPaymentMethods = new Set<string>()
    sales.value.forEach(sale => {
      sale.payment_methods?.forEach(pm => {
        allPaymentMethods.add(pm.method)
      })
    })
    const paymentMethodsArray = Array.from(allPaymentMethods).sort()

    // 2. Mapeo de métodos de pago a nombres en español
    const paymentMethodLabels: Record<string, string> = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'transfer': 'Transferencia',
      'loyalty_points': 'Puntos',
      'advance_cash': 'Anticipo Efectivo',
      'advance_transfer': 'Anticipo Transferencia'
    }

    // 3. Headers: Fecha, ID, Cliente, Teléfono, Items, Staff, Puntos, [Métodos dinámicos], Propina, Total
    const headers = [
      'Fecha/Hora',
      'ID Venta',
      'Cliente',
      'Teléfono',
      'Items',
      'Staff',
      'Puntos Lealtad',
      ...paymentMethodsArray.map(m => paymentMethodLabels[m] || m),
      'Propina',
      'Total'
    ]

    // 4. Generar filas
    const rows = sales.value.map(sale => {
      // Items con \n para multilinea
      const itemsText = (sale.items && Array.isArray(sale.items))
        ? sale.items.map(item => `${item.name} x ${item.quantity} @ $${parseFloat(item.unit_price).toFixed(2)}`).join('\n')
        : ''

      // Payment methods por columna
      const paymentsByMethod: Record<string, string> = {}
      sale.payment_methods?.forEach(pm => {
        paymentsByMethod[pm.method] = parseFloat(pm.amount).toFixed(2)
      })

      return [
        `${formatDate(sale.created_at)} ${formatTime(sale.created_at)}`, // Fecha/Hora
        sale.id,                                                            // ID Venta
        sale.customer?.name || '',                                          // Cliente
        sale.customer?.phone || '',                                         // Teléfono
        itemsText,                                                          // Items (con \n)
        sale.staff?.name || '',                                             // Staff
        sale.loyalty_points_generated || 0,                                 // Puntos Lealtad
        ...paymentMethodsArray.map(m => paymentsByMethod[m] || ''),       // Métodos de pago dinámicos
        sale.tip_amount ? parseFloat(sale.tip_amount).toFixed(2) : '0.00', // Propina
        parseFloat(sale.total_amount).toFixed(2)                            // Total
      ]
    })

    // 5. Construir CSV con escape de comillas
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row.map(cell => {
          const cellStr = String(cell)
          // Si contiene \n, coma o comilla, encerrar en comillas y escapar comillas internas
          if (cellStr.includes('\n') || cellStr.includes(',') || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(',')
      )
    ].join('\n')

    // 6. Descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `reporte_ventas_${startDate.value}_${endDate.value}.csv`)
    link.click()
    URL.revokeObjectURL(url)

    showNotification('Reporte descargado exitosamente', 'success')
  } catch (err: unknown) {
    console.error('Error downloading CSV:', err)
    showNotification('Error al descargar el reporte', 'error')
  }
}

const showNotification = (message: string, color: 'success' | 'error' = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}

// Lifecycle
onMounted(() => {
  // Set default dates: today - 7 days to today
  const today = new Date()
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

  endDate.value = today.toISOString().split('T')[0]
  startDate.value = sevenDaysAgo.toISOString().split('T')[0]

  loadStaff()
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

.summary-section {
  flex-shrink: 0;
  background: rgb(var(--v-theme-surface));
}

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

.font-family-monospace {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.d-flex.gap-2 {
  gap: 8px;
}

/* Remove default padding from v-row in compact mode */
.admin-view :deep(.v-row) {
  margin: 0;
}

.admin-view :deep(.v-col) {
  padding: 0;
}

.admin-view :deep(.v-col.pr-md-2) {
  padding-right: 8px;
}

.admin-view :deep(.v-col.px-md-2) {
  padding-left: 8px;
  padding-right: 8px;
}

.admin-view :deep(.v-col.pl-md-2) {
  padding-left: 8px;
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
