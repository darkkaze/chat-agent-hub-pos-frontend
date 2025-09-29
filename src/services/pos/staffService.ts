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

import { apiService } from '@/services/api'
import type {
  Staff,
  StaffListResponse,
  CreateStaffRequest,
  UpdateStaffRequest
} from '@/types/pos'
import type { ApiMessageResponse } from '@/types/api'

export const staffService = {
  /**
   * Obtener todo el personal activo
   */
  async getStaff(): Promise<StaffListResponse> {
    return await apiService.get<StaffListResponse>('/staff')
  },

  /**
   * Crear un nuevo miembro del personal
   */
  async createStaff(staffData: CreateStaffRequest): Promise<Staff> {
    return await apiService.post<Staff>('/staff', staffData)
  },

  /**
   * Obtener información de un miembro del personal específico
   */
  async getStaffById(staffId: string): Promise<Staff> {
    return await apiService.get<Staff>(`/staff/${staffId}`)
  },

  /**
   * Actualizar un miembro del personal existente
   */
  async updateStaff(staffId: string, staffData: UpdateStaffRequest): Promise<Staff> {
    return await apiService.put<Staff>(`/staff/${staffId}`, staffData)
  },

  /**
   * Desactivar miembro del personal (soft delete)
   */
  async deleteStaff(staffId: string): Promise<ApiMessageResponse> {
    return await apiService.delete<ApiMessageResponse>(`/staff/${staffId}`)
  }
}