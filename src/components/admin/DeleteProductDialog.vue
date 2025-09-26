<!--
DeleteProductDialog Component

Dialog de confirmación para eliminar un producto del sistema POS.
Incluye información del producto y advertencias sobre el impacto.

Props:
- modelValue: boolean - Estado del dialog
- product: Product - Producto a eliminar

Emits:
- update:modelValue: boolean - Actualizar estado del dialog
- deleted: string - ID del producto eliminado exitosamente
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
        <v-icon class="me-3 text-white">mdi-delete-alert</v-icon>
        <span class="text-white font-weight-bold">Eliminar Producto</span>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Product Info -->
        <div v-if="product" class="product-info mb-4">
          <v-card variant="outlined" class="pa-3">
            <div class="d-flex align-center mb-2">
              <v-avatar color="secondary" size="small" class="me-3">
                <v-icon color="white" size="small">mdi-package-variant</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-bold">{{ product.name }}</div>
                <div v-if="product.description" class="text-body-2 text-on-surface-variant">
                  {{ product.description }}
                </div>
              </div>
            </div>

            <div class="d-flex justify-space-between align-center">
              <div class="d-flex align-center">
                <v-icon class="me-1" size="small">mdi-currency-usd</v-icon>
                <span class="font-weight-bold text-primary">
                  ${{ parseFloat(product.price).toFixed(2) }}
                </span>
              </div>

              <v-chip
                :color="product.is_active ? 'success' : 'warning'"
                size="small"
                variant="tonal"
              >
                {{ product.is_active ? 'Activo' : 'Inactivo' }}
              </v-chip>
            </div>
          </v-card>
        </div>

        <!-- Warning Message -->
        <v-alert
          type="warning"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          <div class="text-body-2">
            <strong>¿Estás seguro de eliminar este producto?</strong>
          </div>
          <div class="text-body-2 mt-2">
            Esta acción no se puede deshacer. El producto será eliminado
            permanentemente del sistema.
          </div>
        </v-alert>

        <!-- Impact Information -->
        <v-alert
          type="info"
          variant="tonal"
          density="compact"
          class="mb-4"
        >
          <div class="text-body-2">
            <strong>Impacto de la eliminación:</strong>
          </div>
          <ul class="text-body-2 mt-2 ml-4">
            <li>El producto desaparecerá del catálogo del POS</li>
            <li>No se podrá agregar a nuevas ventas</li>
            <li>Las ventas existentes mantendrán el registro histórico</li>
            <li>Los reportes históricos no se verán afectados</li>
          </ul>
        </v-alert>

        <!-- Alternative Suggestion -->
        <v-alert
          type="success"
          variant="tonal"
          density="compact"
          class="mb-0"
        >
          <div class="text-body-2">
            <strong>Alternativa recomendada:</strong>
            En lugar de eliminar, considera <em>desactivar</em> el producto.
            Esto lo ocultará del POS pero mantendrá la información para
            futuras referencias.
          </div>
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-4 pt-0">
        <v-btn
          variant="text"
          color="success"
          @click="handleDeactivate"
          :disabled="isDeleting || !product?.is_active"
        >
          <v-icon start>mdi-archive</v-icon>
          {{ product?.is_active ? 'Solo Desactivar' : 'Ya está inactivo' }}
        </v-btn>

        <v-spacer />

        <v-btn
          variant="text"
          color="on-surface"
          @click="handleCancel"
          :disabled="isDeleting"
        >
          Cancelar
        </v-btn>

        <v-btn
          color="error"
          variant="flat"
          :loading="isDeleting"
          @click="handleDelete"
        >
          <v-icon start>mdi-delete</v-icon>
          Eliminar Definitivamente
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Product } from '@/types/pos'
import { productsService } from '@/services/pos'

interface Props {
  modelValue: boolean
  product: Product | null
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'deleted', productId: string): void
  (e: 'deactivated', product: Product): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isDeleting = ref(false)

// Methods
const handleDelete = async () => {
  if (!props.product) return

  isDeleting.value = true

  try {
    await productsService.deleteProduct(props.product.id)

    emit('deleted', props.product.id)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error deleting product:', error)
    // Error handling could be improved with toast notifications
  } finally {
    isDeleting.value = false
  }
}

const handleDeactivate = async () => {
  if (!props.product || !props.product.is_active) return

  try {
    const updatedProduct = await productsService.updateProduct(props.product.id, {
      is_active: false
    })

    emit('deactivated', updatedProduct)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error deactivating product:', error)
    // Error handling could be improved with toast notifications
  }
}

const handleCancel = () => {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.v-card-title {
  background: rgb(var(--v-theme-error)) !important;
}

.product-info {
  border: 1px solid rgba(var(--v-theme-error), 0.2);
  border-radius: 8px;
  overflow: hidden;
}

/* Custom list styling */
ul {
  padding-left: 0;
  list-style-type: none;
}

ul li {
  position: relative;
  padding-left: 16px;
  margin-bottom: 4px;
}

ul li:before {
  content: "•";
  color: rgb(var(--v-theme-primary));
  position: absolute;
  left: 0;
}

/* Ensure proper button spacing */
.v-card-actions .v-btn {
  margin: 0 4px;
}

.v-card-actions .v-btn:first-child {
  margin-left: 0;
}

.v-card-actions .v-btn:last-child {
  margin-right: 0;
}
</style>