<!--
CreateSignalModal Component

Modal para crear un nuevo signal de notificación de ventas.
Incluye configuración de URL, estado activo, y autenticación opcional.
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="700"
    persistent
  >
    <v-card elevation="8">
      <v-card-title class="d-flex align-center pa-4 bg-primary">
        <v-icon class="me-3 text-white">mdi-signal</v-icon>
        <span class="text-white font-weight-bold">Crear Signal</span>
      </v-card-title>

      <v-form ref="form" @submit.prevent="handleSubmit">
        <v-card-text class="pa-6">
          <!-- Signal Name -->
          <v-text-field
            v-model="formData.name"
            label="Nombre del signal *"
            placeholder="Ej: Sistema de Inventario, CRM Principal"
            prepend-inner-icon="mdi-label"
            variant="outlined"
            density="compact"
            :rules="nameRules"
            class="mb-4"
            counter="100"
            maxlength="100"
            required
          />

          <!-- Signal URL -->
          <v-text-field
            v-model="formData.url"
            label="URL del signal *"
            placeholder="https://example.com/api/signals/sales"
            prepend-inner-icon="mdi-link-variant"
            variant="outlined"
            density="compact"
            :rules="urlRules"
            class="mb-4"
            type="url"
            required
          />

          <!-- Active Status -->
          <v-switch
            v-model="formData.is_active"
            color="success"
            label="Signal activo"
            messages="Si está desactivado, no se enviarán notificaciones"
            persistent-hint
            class="mb-4"
          />

          <v-divider class="my-4" />

          <!-- Auth Configuration -->
          <v-expansion-panels variant="accordion">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <div class="d-flex align-center">
                  <v-icon class="me-2">mdi-lock</v-icon>
                  <span>Configuración de Autenticación (Opcional)</span>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <!-- Auth Type -->
                <v-select
                  v-model="authConfig.type"
                  label="Tipo de autenticación"
                  :items="authTypes"
                  variant="outlined"
                  density="compact"
                  class="mb-4"
                  clearable
                />

                <!-- Bearer Token -->
                <v-text-field
                  v-if="authConfig.type === 'bearer'"
                  v-model="authConfig.token"
                  label="Bearer Token"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  prepend-inner-icon="mdi-key"
                  variant="outlined"
                  density="compact"
                  type="password"
                  class="mb-4"
                />

                <!-- API Key -->
                <template v-if="authConfig.type === 'apikey'">
                  <v-text-field
                    v-model="authConfig.header"
                    label="Nombre del Header"
                    placeholder="X-API-Key"
                    prepend-inner-icon="mdi-tag"
                    variant="outlined"
                    density="compact"
                    class="mb-4"
                  />
                  <v-text-field
                    v-model="authConfig.token"
                    label="API Key"
                    placeholder="sk_live_xxxxxxxxxxxx"
                    prepend-inner-icon="mdi-key"
                    variant="outlined"
                    density="compact"
                    type="password"
                    class="mb-4"
                  />
                </template>

                <!-- Basic Auth -->
                <template v-if="authConfig.type === 'basic'">
                  <v-text-field
                    v-model="authConfig.username"
                    label="Username"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    density="compact"
                    class="mb-4"
                  />
                  <v-text-field
                    v-model="authConfig.password"
                    label="Password"
                    prepend-inner-icon="mdi-lock"
                    variant="outlined"
                    density="compact"
                    type="password"
                    class="mb-4"
                  />
                </template>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
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
            color="primary"
            variant="flat"
            type="submit"
            :loading="loading"
          >
            Crear Signal
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { signalsService } from '@/services/pos'
import type { CreateSignalRequest } from '@/types/pos'

// Props & Emits
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'signal-created': []
}>()

// State
const form = ref()
const loading = ref(false)
const formData = ref<CreateSignalRequest>({
  name: '',
  url: '',
  is_active: true,
  auth_config: '{}'
})

const authConfig = ref<{
  type?: string
  token?: string
  header?: string
  username?: string
  password?: string
}>({})

const authTypes = [
  { title: 'Bearer Token', value: 'bearer' },
  { title: 'API Key', value: 'apikey' },
  { title: 'Basic Auth', value: 'basic' }
]

// Validation Rules
const nameRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length <= 100 || 'Máximo 100 caracteres'
]

const urlRules = [
  (v: string) => !!v || 'La URL es requerida',
  (v: string) => {
    try {
      new URL(v)
      return true
    } catch {
      return 'URL inválida'
    }
  }
]

// Methods
const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  try {
    // Build auth_config JSON
    const auth = authConfig.value.type ? JSON.stringify(authConfig.value) : '{}'

    await signalsService.createSignal({
      ...formData.value,
      auth_config: auth
    })

    emit('signal-created')
    emit('update:modelValue', false)
    resetForm()
  } catch (error) {
    console.error('Error creating signal:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    url: '',
    is_active: true,
    auth_config: '{}'
  }
  authConfig.value = {}
  form.value?.reset()
}

// Watch for modal close to reset
watch(() => props.modelValue, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>
