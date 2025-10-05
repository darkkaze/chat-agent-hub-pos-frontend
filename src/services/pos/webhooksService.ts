/**
 * Webhooks Service - POS System
 *
 * Servicio para gestión de webhooks de notificación de ventas
 * - Creación de webhooks con URL y autenticación
 * - Listado de webhooks configurados
 * - Actualización y eliminación
 * - Test de webhooks con datos dummy
 *
 * Available methods:
 * - createWebhook(data): Crear nuevo webhook
 * - getWebhooks(): Obtener lista de webhooks
 * - getWebhook(id): Obtener webhook específico
 * - updateWebhook(id, data): Actualizar webhook
 * - deleteWebhook(id): Eliminar webhook
 * - testWebhook(id): Probar webhook con datos dummy
 *
 * Note: Los webhooks se notifican automáticamente cuando se registra una venta.
 * La configuración de autenticación soporta Bearer, API Key y Basic Auth.
 *
 * Endpoints mapeados:
 * - POST /webhooks/
 * - GET /webhooks/
 * - GET /webhooks/{id}
 * - PUT /webhooks/{id}
 * - DELETE /webhooks/{id}
 * - POST /webhooks/{id}/test
 */

import { apiService } from '@/services/api'
import type {
  Webhook,
  WebhookListResponse,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  WebhookTestResponse
} from '@/types/pos'

export class WebhooksService {
  /**
   * Crear un nuevo webhook
   */
  async createWebhook(webhookData: CreateWebhookRequest): Promise<Webhook> {
    return apiService.post<Webhook>('/webhooks/', webhookData)
  }

  /**
   * Obtener lista de webhooks
   */
  async getWebhooks(): Promise<WebhookListResponse> {
    return apiService.get<WebhookListResponse>('/webhooks/')
  }

  /**
   * Obtener un webhook específico
   */
  async getWebhook(webhookId: string): Promise<Webhook> {
    return apiService.get<Webhook>(`/webhooks/${webhookId}`)
  }

  /**
   * Actualizar un webhook
   */
  async updateWebhook(webhookId: string, webhookData: UpdateWebhookRequest): Promise<Webhook> {
    return apiService.put<Webhook>(`/webhooks/${webhookId}`, webhookData)
  }

  /**
   * Eliminar un webhook
   */
  async deleteWebhook(webhookId: string): Promise<void> {
    return apiService.delete(`/webhooks/${webhookId}`)
  }

  /**
   * Probar webhook con datos dummy de venta
   */
  async testWebhook(webhookId: string): Promise<WebhookTestResponse> {
    return apiService.post<WebhookTestResponse>(`/webhooks/${webhookId}/test`, {})
  }
}

export const webhooksService = new WebhooksService()
