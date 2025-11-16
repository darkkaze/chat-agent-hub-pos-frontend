<!--
EditProductModal Component

Modal para editar un producto existente en el sistema POS.
Incluye validación de campos y manejo de estados.

Props:
- modelValue: boolean - Estado del modal
- product: Product - Producto a editar

Emits:
- update:modelValue: boolean - Actualizar estado del modal
- updated: Product - Producto actualizado exitosamente
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
        <v-icon class="me-3 text-white">mdi-pencil</v-icon>
        <span class="text-white font-weight-bold">Editar Producto</span>
      </v-card-title>

      <v-form ref="form" @submit.prevent="handleSubmit">
        <v-card-text class="pa-6">
          <!-- Product ID Display -->
          <v-text-field
            :model-value="product?.id"
            label="ID del producto"
            variant="outlined"
            density="compact"
            readonly
            class="mb-4 font-family-monospace"
            prepend-inner-icon="mdi-identifier"
          />

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

          <!-- Product Details -->
          <v-textarea
            v-model="formData.details"
            label="Detalles (opcional)"
            placeholder="Ej: + gel GRATIS, SIN DISEÑOS"
            prepend-inner-icon="mdi-note-text"
            variant="outlined"
            density="compact"
            class="mb-4"
            rows="2"
            counter="200"
            maxlength="200"
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

          <!-- Variable Price -->
          <v-switch
            v-model="formData.variable_price"
            color="warning"
            label="Precio variable"
            messages="Si está activo, el precio podrá editarse en el carrito"
            persistent-hint
            class="mb-4"
          />

          <!-- Category -->
          <v-text-field
            v-model="formData.category"
            label="Categoría (opcional)"
            placeholder="Ej: Servicios de Uñas, Depilaciones"
            prepend-inner-icon="mdi-tag"
            variant="outlined"
            density="compact"
            class="mb-4"
            counter="50"
            maxlength="50"
          />

          <!-- Duration -->
          <v-text-field
            v-model="formData.duration_minutes"
            label="Duración en minutos (opcional)"
            placeholder="Ej: 30, 60, 120"
            prepend-inner-icon="mdi-clock-outline"
            variant="outlined"
            density="compact"
            type="number"
            min="0"
            class="mb-4"
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

          <!-- Update Info -->
          <v-alert
            type="info"
            variant="tonal"
            density="compact"
            class="mb-0"
          >
            <div class="text-body-2">
              <strong>Nota:</strong> Los cambios se aplicarán inmediatamente.
              Si el producto está en uso en ventas activas, considera el impacto
              de los cambios de precio.
            </div>
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />

          <v-btn
            variant="text"
            color="on-surface"
            @click="handleCancel"
            :disabled="isUpdating"
          >
            Cancelar
          </v-btn>

          <v-btn
            type="submit"
            color="primary"
            variant="flat"
            :loading="isUpdating"
            :disabled="!isFormValid || !hasChanges"
          >
            <v-icon start>mdi-content-save</v-icon>
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Product, UpdateProductRequest } from '@/types/pos'
import { productsService } from '@/services/pos'

interface Props {
  modelValue: boolean
  product: Product | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'updated', product: Product): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const form = ref<any>(null)
const isUpdating = ref(false)

// Form data
const formData = ref<UpdateProductRequest & { is_active: boolean; duration_minutes?: number }>({
  name: '',
  description: '',
  details: '',
  price: '0.00',
  variable_price: false,
  category: '',
  duration_minutes: undefined,
  is_active: true
})

// Original data for change detection
const originalData = ref<UpdateProductRequest & { is_active: boolean; duration_minutes?: number }>({
  name: '',
  description: '',
  details: '',
  price: '0.00',
  variable_price: false,
  category: '',
  duration_minutes: undefined,
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
  (v: string | number) => !!v || 'El precio es requerido',
  (v: string | number) => !isNaN(parseFloat(String(v))) || 'Ingresa un precio válido',
  (v: string | number) => parseFloat(String(v)) >= 0 || 'El precio debe ser mayor o igual a 0',
  (v: string | number) => parseFloat(String(v)) <= 999999.99 || 'El precio es demasiado alto'
]

// Error messages
const nameErrors = ref<string[]>([])
const priceErrors = ref<string[]>([])

// Computed
const isFormValid = computed(() => {
  const name = formData.value.name?.trim()
  const price = formData.value.price
  const description = formData.value.description

  const nameValid = name && name.length >= 2 && name.length <= 100
  const priceValid = !isNaN(parseFloat(String(price) || '0')) && parseFloat(String(price) || '0') >= 0 && parseFloat(String(price) || '0') <= 999999.99
  const descriptionValid = !description || description.length <= 500

  return nameValid && priceValid && descriptionValid
})

const hasChanges = computed(() => {
  return formData.value.name !== originalData.value.name ||
         formData.value.description !== originalData.value.description ||
         formData.value.details !== originalData.value.details ||
         formData.value.price !== originalData.value.price ||
         formData.value.variable_price !== originalData.value.variable_price ||
         formData.value.category !== originalData.value.category ||
         formData.value.duration_minutes !== originalData.value.duration_minutes ||
         formData.value.is_active !== originalData.value.is_active
})

// Methods
const handleSubmit = async () => {
  if (!form.value || !props.product) return

  const { valid } = await form.value.validate()
  if (!valid || !isFormValid.value || !hasChanges.value) return

  isUpdating.value = true
  nameErrors.value = []
  priceErrors.value = []

  try {
    const updateData: UpdateProductRequest = {}

    // Only include changed fields
    if (formData.value.name !== originalData.value.name) {
      updateData.name = formData.value.name?.trim()
    }
    if (formData.value.description !== originalData.value.description) {
      updateData.description = formData.value.description?.trim() || undefined
    }
    if (formData.value.details !== originalData.value.details) {
      updateData.details = formData.value.details?.trim() || undefined
    }
    if (formData.value.price !== originalData.value.price) {
      updateData.price = parseFloat(formData.value.price || '0')
    }
    if (formData.value.variable_price !== originalData.value.variable_price) {
      updateData.variable_price = formData.value.variable_price
    }
    if (formData.value.category !== originalData.value.category) {
      updateData.category = formData.value.category?.trim() || undefined
    }
    if (formData.value.duration_minutes !== originalData.value.duration_minutes) {
      // Build metadata
      const metadata: any = {}
      if (formData.value.duration_minutes) {
        metadata.duration_minutes = formData.value.duration_minutes
      }
      updateData.meta_data = Object.keys(metadata).length > 0 ? JSON.stringify(metadata) : '{}'
    }

    const updatedProduct = await productsService.updateProduct(props.product.id, updateData)

    emit('updated', updatedProduct)
    emit('update:modelValue', false)
  } catch (error: any) {
    console.error('Error updating product:', error)

    // Handle specific validation errors
    if (error.detail?.includes('name')) {
      nameErrors.value = ['Ya existe un producto con este nombre']
    } else if (error.detail?.includes('price')) {
      priceErrors.value = ['Precio inválido']
    }
    // General error handling could be improved with toast notifications
  } finally {
    isUpdating.value = false
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
  loadProductData()
}

const loadProductData = () => {
  if (props.product) {
    // Parse meta_data for duration
    let duration_minutes: number | undefined = undefined
    try {
      const meta_data = JSON.parse(props.product.meta_data || '{}')
      duration_minutes = meta_data.duration_minutes
    } catch (e) {
      // Ignore parse errors
    }

    const productData = {
      name: props.product.name || '',
      description: props.product.description || '',
      details: props.product.details || '',
      price: props.product.price || '0.00',
      variable_price: props.product.variable_price || false,
      category: props.product.category || '',
      duration_minutes,
      is_active: props.product.is_active
    }

    formData.value = { ...productData }
    originalData.value = { ...productData }
  }

  nameErrors.value = []
  priceErrors.value = []

  if (form.value) {
    form.value.resetValidation()
  }
}

// Watch for product changes
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    loadProductData()
  }
}, { immediate: true })

// Watch for modal close
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && props.product) {
    loadProductData()
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

/* Monospace font for product ID */
.font-family-monospace {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
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