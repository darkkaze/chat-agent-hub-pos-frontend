<!--
CustomerModal Component

Modal para crear rapidamente un nuevo cliente cuando no se encuentra
en la búsqueda. Incluye validación básica de teléfono y nombre.

Props:
- modelValue: boolean - Estado del modal
- phone: string - Teléfono pre-llenado desde la búsqueda

Emits:
- update:modelValue: boolean - Actualizar estado del modal
- customerCreated: Customer - Cliente creado exitosamente
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="500"
    persistent
  >
    <v-card elevation="8">
      <v-card-title class="d-flex align-center pa-4 bg-primary">
        <v-icon class="me-3 text-white">mdi-account-plus</v-icon>
        <span class="text-white font-weight-bold">Crear Cliente Rápido</span>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="form" @submit.prevent="handleSubmit">
          <!-- Phone Field -->
          <v-text-field
            v-model="formData.phone"
            label="Número de teléfono"
            placeholder="Ej: 1234567890"
            prepend-inner-icon="mdi-phone"
            variant="outlined"
            density="compact"
            :rules="phoneRules"
            :readonly="true"
            class="mb-4"
            hint="Teléfono detectado de la búsqueda"
            persistent-hint
          />

          <!-- Name Field -->
          <v-text-field
            v-model="formData.name"
            label="Nombre del cliente (opcional)"
            placeholder="Ej: Juan Pérez"
            prepend-inner-icon="mdi-account"
            variant="outlined"
            density="compact"
            :rules="nameRules"
            class="mb-4"
            autofocus
          />

          <!-- Info Card -->
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mb-4"
          >
            <div class="text-body-2">
              <strong>Nota:</strong> El cliente se creará con 0 puntos de lealtad.
              Podrás actualizar sus datos más tarde desde la gestión de clientes.
            </div>
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-spacer />

        <v-btn
          variant="text"
          color="on-surface"
          @click="handleCancel"
          :disabled="isCreating"
        >
          Cancelar
        </v-btn>

        <v-btn
          color="primary"
          variant="flat"
          @click="handleSubmit"
          :loading="isCreating"
          :disabled="!isFormValid"
        >
          <v-icon start>mdi-account-plus</v-icon>
          Crear Cliente
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Customer } from '@/types/pos'
import { useCustomerStore } from '@/stores/customer'

interface Props {
  modelValue: boolean
  phone: string
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'customerCreated', customer: Customer): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const customerStore = useCustomerStore()
const form = ref<any>(null)

// Form data
const formData = ref({
  phone: '',
  name: ''
})

// Loading state
const isCreating = computed(() => customerStore.isCreating)

// Validation rules
const phoneRules = [
  (v: string) => !!v || 'El teléfono es requerido',
  (v: string) => /^\d{10}$/.test(v) || 'Debe tener exactamente 10 dígitos'
]

const nameRules = [
  (v: string) => !v || v.length <= 100 || 'El nombre no debe exceder 100 caracteres'
]

// Form validity
const isFormValid = computed(() => {
  const phone = formData.value.phone
  const name = formData.value.name

  const phoneValid = phone && /^\d{10}$/.test(phone)
  const nameValid = !name || name.length <= 100

  return phoneValid && nameValid
})

// Methods
const handleSubmit = async () => {
  if (!form.value) return

  const { valid } = await form.value.validate()
  if (!valid || !isFormValid.value) return

  try {
    const customerData = {
      phone: `+521${formData.value.phone}`,
      name: formData.value.name || undefined
    }

    const customer = await customerStore.createCustomer(customerData)
    emit('customerCreated', customer)
    emit('update:modelValue', false)
    resetForm()
  } catch (error) {
    console.error('Error creating customer:', error)
    // Error handling could be improved with toast notifications
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  formData.value = {
    phone: '',
    name: ''
  }
  if (form.value) {
    form.value.resetValidation()
  }
}

// Watch for props changes
watch(() => props.phone, (newPhone) => {
  if (newPhone) {
    // Extract last 10 digits
    const cleanPhone = newPhone.replace(/\D/g, '').slice(-10)
    formData.value.phone = cleanPhone
  }
}, { immediate: true })

watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    resetForm()
  }
})
</script>

<style scoped>
.v-card-title {
  background: rgb(var(--v-theme-primary)) !important;
}

.v-form {
  width: 100%;
}

/* Ensure proper spacing */
.v-text-field {
  margin-bottom: 0;
}
</style>