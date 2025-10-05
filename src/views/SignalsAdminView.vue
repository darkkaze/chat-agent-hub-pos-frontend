<!--
SignalsAdminView - Gestión de Signals

Vista de administración de signals para notificaciones de ventas.
Permite crear, editar, eliminar y probar signals.
-->

<template>
  <div class="signals-admin">
    <v-card elevation="2">
      <v-card-title class="d-flex align-center justify-space-between pa-4 bg-primary">
        <div class="d-flex align-center">
          <v-icon class="me-2 text-white">mdi-signal</v-icon>
          <span class="text-white font-weight-bold">Signals de Notificación</span>
        </div>
        <v-btn
          color="white"
          variant="flat"
          prepend-icon="mdi-plus"
          @click="openCreateModal"
        >
          Nuevo Signal
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Empty State -->
        <div v-else-if="signals.length === 0" class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1">mdi-signal</v-icon>
          <p class="text-h6 mt-4 text-grey">No hay signals configurados</p>
          <p class="text-body-2 text-grey-darken-1">
            Crea un signal para recibir notificaciones cuando se registre una venta
          </p>
        </div>

        <!-- Signals Table -->
        <v-table v-else>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>URL</th>
              <th>Estado</th>
              <th>Auth</th>
              <th>Creado</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="signal in signals" :key="signal.id">
              <td class="font-weight-medium">{{ signal.name }}</td>
              <td class="text-truncate" style="max-width: 300px;">
                <span class="text-caption font-family-monospace">{{ signal.url }}</span>
              </td>
              <td>
                <v-chip
                  :color="signal.is_active ? 'success' : 'grey'"
                  size="small"
                  variant="flat"
                >
                  {{ signal.is_active ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </td>
              <td>
                <v-icon
                  :color="hasAuth(signal) ? 'success' : 'grey-lighten-1'"
                  size="small"
                >
                  {{ hasAuth(signal) ? 'mdi-lock' : 'mdi-lock-open-variant-outline' }}
                </v-icon>
              </td>
              <td class="text-caption text-grey-darken-1">
                {{ formatDate(signal.created_at) }}
              </td>
              <td class="text-right">
                <v-btn
                  icon="mdi-test-tube"
                  size="small"
                  variant="text"
                  color="info"
                  @click="testSignal(signal)"
                  :loading="testingSignalId === signal.id"
                >
                  <v-icon>mdi-test-tube</v-icon>
                  <v-tooltip activator="parent">Probar Signal</v-tooltip>
                </v-btn>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openEditModal(signal)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent">Editar</v-tooltip>
                </v-btn>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="openDeleteDialog(signal)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent">Eliminar</v-tooltip>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-card>

    <!-- Modals -->
    <CreateSignalModal
      v-model="showCreateModal"
      @signal-created="handleSignalCreated"
    />

    <EditSignalModal
      v-model="showEditModal"
      :signal="selectedSignal"
      @signal-updated="handleSignalUpdated"
    />

    <DeleteSignalDialog
      v-model="showDeleteDialog"
      :signal="selectedSignal"
      @signal-deleted="handleSignalDeleted"
    />

    <!-- Test Result Snackbar -->
    <v-snackbar
      v-model="showTestResult"
      :color="testResult?.success ? 'success' : 'error'"
      :timeout="5000"
      location="top"
    >
      <div class="d-flex flex-column">
        <div class="font-weight-bold mb-1">
          {{ testResult?.success ? '✓ Signal Test Exitoso' : '✗ Signal Test Falló' }}
        </div>
        <div v-if="testResult?.status_code" class="text-caption">
          Status: {{ testResult.status_code }}
        </div>
        <div v-if="testResult?.error" class="text-caption">
          Error: {{ testResult.error }}
        </div>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { signalsService } from '@/services/pos'
import type { Signal, SignalTestResponse } from '@/types/pos'
import CreateSignalModal from '@/components/admin/CreateSignalModal.vue'
import EditSignalModal from '@/components/admin/EditSignalModal.vue'
import DeleteSignalDialog from '@/components/admin/DeleteSignalDialog.vue'

// State
const signals = ref<Signal[]>([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const selectedSignal = ref<Signal | null>(null)
const testingSignalId = ref<string | null>(null)
const showTestResult = ref(false)
const testResult = ref<SignalTestResponse | null>(null)

// Methods
const loadSignals = async () => {
  loading.value = true
  try {
    const response = await signalsService.getSignals()
    signals.value = response.signals
  } catch (error) {
    console.error('Error loading signals:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const openEditModal = (signal: Signal) => {
  selectedSignal.value = signal
  showEditModal.value = true
}

const openDeleteDialog = (signal: Signal) => {
  selectedSignal.value = signal
  showDeleteDialog.value = true
}

const testSignal = async (signal: Signal) => {
  testingSignalId.value = signal.id
  try {
    const result = await signalsService.testSignal(signal.id)
    testResult.value = result
    showTestResult.value = true
  } catch (error) {
    console.error('Error testing signal:', error)
    testResult.value = {
      success: false,
      error: 'Error al ejecutar test del signal'
    }
    showTestResult.value = true
  } finally {
    testingSignalId.value = null
  }
}

const handleSignalCreated = () => {
  loadSignals()
}

const handleSignalUpdated = () => {
  loadSignals()
}

const handleSignalDeleted = () => {
  loadSignals()
}

const hasAuth = (signal: Signal): boolean => {
  try {
    const authConfig = JSON.parse(signal.auth_config || '{}')
    return !!authConfig.type
  } catch {
    return false
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  loadSignals()
})
</script>

<style scoped>
.signals-admin {
  padding: 16px;
}

.font-family-monospace {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
