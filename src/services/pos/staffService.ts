/**
 * Staff Service - Gestión de personal del POS
 *
 * Available methods:
 * - getStaff(): Obtener todo el personal activo
 * - createStaff(data): Crear nuevo miembro del personal
 * - updateStaff(id, data): Actualizar miembro del personal existente
 * - deleteStaff(id): Desactivar miembro del personal (soft delete)
 *
 * Note: Todas las operaciones requieren autenticación válida.
 *
 * @author Agent Hub POS System
 */

import { apiClient } from '../api'
import type {
  Staff,
  StaffListResponse,
  CreateStaffRequest,
  UpdateStaffRequest
} from '@/types/pos'
import type { ApiResponse } from '@/types/api'

export const staffService = {
  /**
   * Obtener todo el personal activo
   */
  async getStaff(): Promise<StaffListResponse> {
    const response = await apiClient.get<StaffListResponse>('/staff')
    return response.data
  },

  /**
   * Crear un nuevo miembro del personal
   */
  async createStaff(staffData: CreateStaffRequest): Promise<Staff> {
    const response = await apiClient.post<Staff>('/staff', staffData)
    return response.data
  },

  /**
   * Obtener información de un miembro del personal específico
   */
  async getStaffById(staffId: string): Promise<Staff> {
    const response = await apiClient.get<Staff>(`/staff/${staffId}`)
    return response.data
  },

  /**
   * Actualizar un miembro del personal existente
   */
  async updateStaff(staffId: string, staffData: UpdateStaffRequest): Promise<Staff> {
    const response = await apiClient.put<Staff>(`/staff/${staffId}`, staffData)
    return response.data
  },

  /**
   * Desactivar miembro del personal (soft delete)
   */
  async deleteStaff(staffId: string): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/staff/${staffId}`)
    return response.data
  }
}