/**
 * Sales Service - POS System
 *
 * Servicio para gestión de ventas del POS
 * - Creación de ventas con items y métodos de pago
 * - Listado paginado de ventas
 * - Consulta de detalles de venta específica
 *
 * Available methods:
 * - createSale(data): Crear nueva venta con validación automática
 * - getSales(params): Obtener ventas con paginación
 * - getSale(id): Obtener detalles de venta específica
 *
 * Note: El sistema valida automáticamente que la suma de payment_methods
 * coincida con total_amount, y actualiza los loyalty_points del cliente.
 *
 * Endpoints mapeados:
 * - POST /sales/
 * - GET /sales/?page={page}&page_size={size}
 * - GET /sales/{id}
 */

import { apiService, buildQueryParams } from '@/services/api'
import type {
  CreateSaleRequest,
  Sale,
  SalesListRequest,
  SalesListResponse
} from '@/types/pos'

export class SalesService {
  /**
   * Crear una nueva venta
   *
   * El sistema automáticamente:
   * - Valida que payment_methods sum = total_amount
   * - Actualiza loyalty_points del cliente
   * - Genera embedding para búsqueda inteligente
   */
  async createSale(saleData: CreateSaleRequest): Promise<Sale> {
    return apiService.post<Sale>('/sales/', saleData)
  }

  /**
   * Obtener lista de ventas con paginación
   */
  async getSales(params: SalesListRequest = {}): Promise<SalesListResponse> {
    const { page = 1, page_size = 20, ...otherParams } = params
    const queryParams = buildQueryParams({ page, page_size, ...otherParams })
    return apiService.get<SalesListResponse>(`/sales/${queryParams}`)
  }

  /**
   * Obtener detalles de una venta específica
   */
  async getSale(saleId: string): Promise<Sale> {
    return apiService.get<Sale>(`/sales/${saleId}`)
  }
}

export const salesService = new SalesService()