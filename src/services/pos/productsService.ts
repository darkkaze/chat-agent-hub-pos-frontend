/**
 * Products Service - POS System
 *
 * Servicio para gestión del catálogo de productos del POS
 * - Listado de productos activos
 * - Búsqueda inteligente por nombre/descripción
 * - CRUD de productos
 *
 * Available methods:
 * - getProducts(): Obtener todos los productos activos
 * - searchProducts(query): Búsqueda por nombre/descripción
 * - createProduct(data): Crear nuevo producto
 * - updateProduct(id, data): Actualizar producto existente
 * - deleteProduct(id): Desactivar producto (soft delete)
 *
 * Endpoints mapeados:
 * - GET /products/
 * - GET /products/search?q={query}
 * - POST /products/
 * - PUT /products/{id}
 * - DELETE /products/{id}
 */

import { apiService, buildQueryParams } from '@/services/api'
import type {
  ProductListResponse,
  ProductSearchRequest,
  CreateProductRequest,
  UpdateProductRequest,
  Product
} from '@/types/pos'
import type { ApiMessageResponse } from '@/types/api'

export class ProductsService {
  /**
   * Obtener todos los productos activos
   */
  async getProducts(): Promise<ProductListResponse> {
    return apiService.get<ProductListResponse>('/products/')
  }

  /**
   * Buscar productos por nombre o descripción
   */
  async searchProducts(query: string): Promise<ProductListResponse> {
    const queryParams = buildQueryParams({ q: query })
    return apiService.get<ProductListResponse>(`/products/search${queryParams}`)
  }

  /**
   * Crear un nuevo producto
   */
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    return apiService.post<Product>('/products/', productData)
  }

  /**
   * Obtener información de un producto específico
   */
  async getProduct(productId: string): Promise<Product> {
    return apiService.get<Product>(`/products/${productId}`)
  }

  /**
   * Actualizar un producto existente
   */
  async updateProduct(productId: string, productData: UpdateProductRequest): Promise<Product> {
    return apiService.put<Product>(`/products/${productId}`, productData)
  }

  /**
   * Desactivar producto (soft delete)
   */
  async deleteProduct(productId: string): Promise<ApiMessageResponse> {
    return apiService.delete<ApiMessageResponse>(`/products/${productId}`)
  }
}

export const productsService = new ProductsService()