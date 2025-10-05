<!--
DeleteSignalDialog Component

Dialog de confirmación para eliminar un signal.
Muestra advertencia antes de eliminar permanentemente.
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
    persistent
  >
    <v-card elevation="8">
      <v-card-title class="d-flex align-center pa-4 bg-error">
        <v-icon class="me-3 text-white">mdi-alert-circle</v-icon>
        <span class="text-white font-weight-bold">Eliminar Signal</span>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-alert
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <div class="font-weight-bold mb-2">¿Estás seguro?</div>
          <div class="text-body-2">
            Esta acción no se puede deshacer. El signal será eliminado permanentemente
            y dejará de recibir notificaciones de ventas.
          </div>
        </v-alert>

        <div v-if="signal" class="signal-info">
          <v-card variant="outlined" class="pa-3">
            <div class="d-flex flex-column gap-2">
              <div>
                <span class="text-caption text-grey-darken-1">Nombre:</span>
                <div class="font-weight-medium">{{ signal.name }}</div>
              </div>
              <div>
                <span class="text-caption text-grey-darken-1">URL:</span>
                <div class="text-caption font-family-monospace text-truncate">
                  {{ signal.url }}
                </div>
              </div>
              <div>
                <span class="text-caption text-grey-darken-1">Estado:</span>
                <v-chip
                  :color="signal.is_active ? 'success' : 'grey'"
                  size="x-small"
                  variant="flat"
                  class="ml-2"
                >
                  {{ signal.is_active ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </div>
            </div>
          </v-card>
        </div>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />
        <v-btn
          color="grey"
          variant="text"
          @click="handleCancel"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="error"
          variant="flat"
          @click="handleDelete"
          :loading="loading"
        >
          Eliminar Signal
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { signalsService } from '@/services/pos'
import type { Signal } from '@/types/pos'

// Props & Emits
const props = defineProps<{
  modelValue: boolean
  signal: Signal | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'signal-deleted': []
}>()

// State
const loading = ref(false)

// Methods
const handleDelete = async () => {
  if (!props.signal) return

  loading.value = true
  try {
    await signalsService.deleteSignal(props.signal.id)
    emit('signal-deleted')
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error deleting signal:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.font-family-monospace {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gap-2 {
  gap: 8px;
}
</style>
