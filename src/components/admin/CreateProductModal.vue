<!--
CreateProductModal Component

Modal para crear un nuevo producto en el sistema POS.
Incluye validación de campos requeridos y formato de precio.

Props:
- modelValue: boolean - Estado del modal

Emits:
- update:modelValue: boolean - Actualizar estado del modal
- created: Product - Producto creado exitosamente
-->

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    max-width="600"
    persistent
  >
    <v-card elevation="8">
      <v-card-title class="d-flex align-center pa-4 bg-primary">
        <v-icon class="me-3 text-white">mdi-package-variant-plus</v-icon>
        <span class="text-white font-weight-bold">Crear Producto</span>
      </v-card-title>

      <v-form ref="form" @submit.prevent="handleSubmit">
        <v-card-text class="pa-6">
          <!-- Product Name -->
          <v-text-field
            v-model="formData.name"
            label="Nombre del producto *"
            placeholder="Ej: Café Americano, Servicio de Reparación"
            prepend-inner-icon="mdi-package-variant"
            variant="outlined"
            density="compact"
            :rules="nameRules"
            :error-messages="nameErrors"
            class="mb-4"
            counter="100"
            maxlength="100"
            required
          />

          <!-- Product Description -->
          <v-textarea
            v-model="formData.description"
            label="Descripción (opcional)"
            placeholder="Describe las características del producto o servicio"
            prepend-inner-icon="mdi-text"
            variant="outlined"
            density="compact"
            :rules="descriptionRules"
            class="mb-4"
            rows="3"
            counter="500"
            maxlength="500"
            no-resize
          />

          <!-- Product Price -->
          <v-text-field
            v-model="formData.price"
            label="Precio *"
            placeholder="0.00"
            prepend-inner-icon="mdi-currency-usd"
            variant="outlined"
            density="compact"
            :rules="priceRules"
            :error-messages="priceErrors"
            type="number"
            step="0.01"
            min="0"
            class="mb-4"
            required
          />

          <!-- Active Status -->
          <v-switch
            v-model="formData.is_active"
            color="primary"
            label="Producto activo"
            :messages="formData.is_active ? 'El producto estará disponible para venta' : 'El producto estará oculto en el POS'"
            persistent-hint
            class="mb-2"
          />

          <!-- Helper Info -->
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mb-0"
          >
            <div class="text-body-2">
              <strong>Nota:</strong> Una vez creado, el producto se podrá buscar
              y agregar desde el punto de venta. Los campos marcados con * son obligatorios.
            </div>
          </v-alert>
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
            type="submit"
            color="primary"
            variant="flat"
            :loading="isCreating"
            :disabled="!isFormValid"
          >
            <v-icon start>mdi-plus</v-icon>
            Crear Producto
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Product, CreateProductRequest } from '@/types/pos'
import { productsService } from '@/services/pos'

interface Props {
  modelValue: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'created', product: Product): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref<any>(null)
const isCreating = ref(false)

// Form data
const formData = ref<CreateProductRequest & { is_active: boolean }>({
  name: '',
  description: '',
  price: '0.00',
  is_active: true
})

// Validation rules
const nameRules = [
  (v: string) => !!v || 'El nombre es requerido',
  (v: string) => v.length >= 2 || 'El nombre debe tener al menos 2 caracteres',
  (v: string) => v.length <= 100 || 'El nombre no debe exceder 100 caracteres'
]

const descriptionRules = [
  (v: string) => !v || v.length <= 500 || 'La descripción no debe exceder 500 caracteres'
]

const priceRules = [
  (v: string) => !!v || 'El precio es requerido',
  (v: string) => !isNaN(parseFloat(v)) || 'Ingresa un precio válido',
  (v: string) => parseFloat(v) >= 0 || 'El precio debe ser mayor o igual a 0',
  (v: string) => parseFloat(v) <= 999999.99 || 'El precio es demasiado alto'
]

// Error messages
const nameErrors = ref<string[]>([])
const priceErrors = ref<string[]>([])

// Form validity
const isFormValid = computed(() => {
  const name = formData.value.name.trim()
  const price = formData.value.price
  const description = formData.value.description

  const nameValid = name.length >= 2 && name.length <= 100
  const priceValid = !isNaN(parseFloat(price)) && parseFloat(price) >= 0 && parseFloat(price) <= 999999.99
  const descriptionValid = !description || description.length <= 500

  return nameValid && priceValid && descriptionValid
})

// Methods
const handleSubmit = async () => {
  if (!form.value) return

  const { valid } = await form.value.validate()
  if (!valid || !isFormValid.value) return

  isCreating.value = true
  nameErrors.value = []
  priceErrors.value = []

  try {
    const productData: CreateProductRequest = {
      name: formData.value.name.trim(),
      description: formData.value.description?.trim() || undefined,
      price: parseFloat(formData.value.price).toFixed(2)
    }

    const product = await productsService.createProduct(productData)

    emit('created', product)
    emit('update:modelValue', false)
    resetForm()
  } catch (error: any) {
    console.error('Error creating product:', error)

    // Handle specific validation errors
    if (error.detail?.includes('name')) {
      nameErrors.value = ['Ya existe un producto con este nombre']
    } else if (error.detail?.includes('price')) {
      priceErrors.value = ['Precio inválido']
    }
    // General error handling could be improved with toast notifications
  } finally {
    isCreating.value = false
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
  resetForm()
}

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    price: '0.00',
    is_active: true
  }
  nameErrors.value = []
  priceErrors.value = []

  if (form.value) {
    form.value.resetValidation()
  }
}

// Format price on blur
const formatPrice = () => {
  const price = parseFloat(formData.value.price)
  if (!isNaN(price)) {
    formData.value.price = price.toFixed(2)
  }
}

// Watch for modal close to reset form
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
.v-text-field,
.v-textarea {
  margin-bottom: 0;
}

/* Custom price field styling */
.v-text-field input[type="number"] {
  -moz-appearance: textfield;
}

.v-text-field input[type="number"]::-webkit-outer-spin-button,
.v-text-field input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>