<!--
WebhooksAdminView - Gestión de Webhooks

Vista de administración de webhooks para notificaciones de ventas.
Permite crear, editar, eliminar y probar webhooks.
-->

<template>
  <div class="webhooks-admin">
    <v-card elevation="2">
      <v-card-title class="d-flex align-center justify-space-between pa-4 bg-primary">
        <div class="d-flex align-center">
          <v-icon class="me-2 text-white">mdi-webhook</v-icon>
          <span class="text-white font-weight-bold">Webhooks de Notificación</span>
        </div>
        <v-btn
          color="white"
          variant="flat"
          prepend-icon="mdi-plus"
          @click="openCreateModal"
        >
          Nuevo Webhook
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <!-- Empty State -->
        <div v-else-if="webhooks.length === 0" class="text-center py-8">
          <v-icon size="64" color="grey-lighten-1">mdi-webhook</v-icon>
          <p class="text-h6 mt-4 text-grey">No hay webhooks configurados</p>
          <p class="text-body-2 text-grey-darken-1">
            Crea un webhook para recibir notificaciones cuando se registre una venta
          </p>
        </div>

        <!-- Webhooks Table -->
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
            <tr v-for="webhook in webhooks" :key="webhook.id">
              <td class="font-weight-medium">{{ webhook.name }}</td>
              <td class="text-truncate" style="max-width: 300px;">
                <span class="text-caption font-family-monospace">{{ webhook.url }}</span>
              </td>
              <td>
                <v-chip
                  :color="webhook.is_active ? 'success' : 'grey'"
                  size="small"
                  variant="flat"
                >
                  {{ webhook.is_active ? 'Activo' : 'Inactivo' }}
                </v-chip>
              </td>
              <td>
                <v-icon
                  :color="hasAuth(webhook) ? 'success' : 'grey-lighten-1'"
                  size="small"
                >
                  {{ hasAuth(webhook) ? 'mdi-lock' : 'mdi-lock-open-variant-outline' }}
                </v-icon>
              </td>
              <td class="text-caption text-grey-darken-1">
                {{ formatDate(webhook.created_at) }}
              </td>
              <td class="text-right">
                <v-btn
                  icon="mdi-test-tube"
                  size="small"
                  variant="text"
                  color="info"
                  @click="testWebhook(webhook)"
                  :loading="testingWebhookId === webhook.id"
                >
                  <v-icon>mdi-test-tube</v-icon>
                  <v-tooltip activator="parent">Probar Webhook</v-tooltip>
                </v-btn>
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openEditModal(webhook)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent">Editar</v-tooltip>
                </v-btn>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="openDeleteDialog(webhook)"
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
    <CreateWebhookModal
      v-model="showCreateModal"
      @webhook-created="handleWebhookCreated"
    />

    <EditWebhookModal
      v-model="showEditModal"
      :webhook="selectedWebhook"
      @webhook-updated="handleWebhookUpdated"
    />

    <DeleteWebhookDialog
      v-model="showDeleteDialog"
      :webhook="selectedWebhook"
      @webhook-deleted="handleWebhookDeleted"
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
          {{ testResult?.success ? '✓ Webhook Test Exitoso' : '✗ Webhook Test Falló' }}
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
import { webhooksService } from '@/services/pos'
import type { Webhook, WebhookTestResponse } from '@/types/pos'
import CreateWebhookModal from '@/components/admin/CreateWebhookModal.vue'
import EditWebhookModal from '@/components/admin/EditWebhookModal.vue'
import DeleteWebhookDialog from '@/components/admin/DeleteWebhookDialog.vue'

// State
const webhooks = ref<Webhook[]>([])
const loading = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteDialog = ref(false)
const selectedWebhook = ref<Webhook | null>(null)
const testingWebhookId = ref<string | null>(null)
const showTestResult = ref(false)
const testResult = ref<WebhookTestResponse | null>(null)

// Methods
const loadWebhooks = async () => {
  loading.value = true
  try {
    const response = await webhooksService.getWebhooks()
    webhooks.value = response.webhooks
  } catch (error) {
    console.error('Error loading webhooks:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const openEditModal = (webhook: Webhook) => {
  selectedWebhook.value = webhook
  showEditModal.value = true
}

const openDeleteDialog = (webhook: Webhook) => {
  selectedWebhook.value = webhook
  showDeleteDialog.value = true
}

const testWebhook = async (webhook: Webhook) => {
  testingWebhookId.value = webhook.id
  try {
    const result = await webhooksService.testWebhook(webhook.id)
    testResult.value = result
    showTestResult.value = true
  } catch (error) {
    console.error('Error testing webhook:', error)
    testResult.value = {
      success: false,
      error: 'Error al ejecutar test del webhook'
    }
    showTestResult.value = true
  } finally {
    testingWebhookId.value = null
  }
}

const handleWebhookCreated = () => {
  loadWebhooks()
}

const handleWebhookUpdated = () => {
  loadWebhooks()
}

const handleWebhookDeleted = () => {
  loadWebhooks()
}

const hasAuth = (webhook: Webhook): boolean => {
  try {
    const authConfig = JSON.parse(webhook.auth_config || '{}')
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
  loadWebhooks()
})
</script>

<style scoped>
.webhooks-admin {
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
