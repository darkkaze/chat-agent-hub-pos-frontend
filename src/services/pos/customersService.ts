/**
 * Customers Service - POS System
 *
 * Servicio para gestión de clientes del POS
 * - Búsqueda de clientes por teléfono
 * - Creación de nuevos clientes
 * - Gestión de loyalty points (wallet)
 *
 * Available methods:
 * - searchCustomers(phone): Buscar clientes por teléfono
 * - createCustomer(data): Crear nuevo cliente
 * - updateCustomerWallet(id, points): Actualizar loyalty points
 *
 * Endpoints mapeados:
 * - GET /customers/search?phone={number}
 * - POST /customers/
 * - PUT /customers/{id}/wallet
 */

import { apiService, buildQueryParams } from '@/services/api'
import type {
  CustomerSearchRequest,
  CustomerSearchResponse,
  CreateCustomerRequest,
  Customer,
  UpdateCustomerWalletRequest
} from '@/types/pos'
import type { ApiMessageResponse } from '@/types/api'

export class CustomersService {
  /**
   * Buscar clientes por número de teléfono
   */
  async searchCustomers(phone: string): Promise<CustomerSearchResponse> {
    const queryParams = buildQueryParams({ phone })
    return apiService.get<CustomerSearchResponse>(`/customers/search${queryParams}`)
  }

  /**
   * Crear un nuevo cliente
   */
  async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
    return apiService.post<Customer>('/customers/', customerData)
  }

  /**
   * Actualizar loyalty points del cliente (wallet)
   */
  async updateCustomerWallet(customerId: string, walletData: UpdateCustomerWalletRequest): Promise<ApiMessageResponse> {
    return apiService.put<ApiMessageResponse>(`/customers/${customerId}/wallet`, walletData)
  }

  /**
   * Obtener información completa de un cliente
   * (incluye historial de ventas si está disponible en la API)
   */
  async getCustomer(customerId: string): Promise<Customer> {
    return apiService.get<Customer>(`/customers/${customerId}`)
  }
}

export const customersService = new CustomersService()