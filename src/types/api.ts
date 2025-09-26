/**
 * Base API Types - POS System
 *
 * Types generales para la comunicación con la API del POS
 * - Response wrappers para paginación
 * - Error handling
 * - Base interfaces
 */

// Response wrappers
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}

export interface ApiError {
  detail: string
  type?: string
}

export interface ApiMessageResponse {
  message: string
}

// Base request/response types
export interface BaseEntity {
  id: string
  created_at: string
  updated_at: string
}

export interface PaginationParams {
  page?: number
  page_size?: number
  [key: string]: unknown
}