/**
 * Signals Service - POS System
 *
 * Servicio para gestión de signals de notificación de ventas
 * - Creación de signals con URL y autenticación
 * - Listado de signals configurados
 * - Actualización y eliminación
 * - Test de signals con datos dummy
 *
 * Available methods:
 * - createSignal(data): Crear nuevo signal
 * - getSignals(): Obtener lista de signals
 * - getSignal(id): Obtener signal específico
 * - updateSignal(id, data): Actualizar signal
 * - deleteSignal(id): Eliminar signal
 * - testSignal(id): Probar signal con datos dummy
 *
 * Note: Los signals se notifican automáticamente cuando se registra una venta.
 * La configuración de autenticación soporta Bearer, API Key y Basic Auth.
 *
 * Endpoints mapeados:
 * - POST /signals/
 * - GET /signals/
 * - GET /signals/{id}
 * - PUT /signals/{id}
 * - DELETE /signals/{id}
 * - POST /signals/{id}/test
 */

import { apiService } from '@/services/api'
import type {
  Signal,
  SignalListResponse,
  CreateSignalRequest,
  UpdateSignalRequest,
  SignalTestResponse
} from '@/types/pos'

export class SignalsService {
  /**
   * Crear un nuevo signal
   */
  async createSignal(signalData: CreateSignalRequest): Promise<Signal> {
    return apiService.post<Signal>('/signals/', signalData)
  }

  /**
   * Obtener lista de signals
   */
  async getSignals(): Promise<SignalListResponse> {
    return apiService.get<SignalListResponse>('/signals/')
  }

  /**
   * Obtener un signal específico
   */
  async getSignal(signalId: string): Promise<Signal> {
    return apiService.get<Signal>(`/signals/${signalId}`)
  }

  /**
   * Actualizar un signal
   */
  async updateSignal(signalId: string, signalData: UpdateSignalRequest): Promise<Signal> {
    return apiService.put<Signal>(`/signals/${signalId}`, signalData)
  }

  /**
   * Eliminar un signal
   */
  async deleteSignal(signalId: string): Promise<void> {
    return apiService.delete(`/signals/${signalId}`)
  }

  /**
   * Probar signal con datos dummy de venta
   */
  async testSignal(signalId: string): Promise<SignalTestResponse> {
    return apiService.post<SignalTestResponse>(`/signals/${signalId}/test`, {})
  }
}

export const signalsService = new SignalsService()
