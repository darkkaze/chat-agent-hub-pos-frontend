/**
 * POS Domain Types
 *
 * Types específicos del sistema POS
 * - Customer, Product, Sale models
 * - Request/Response interfaces
 * - Enums para payment methods
 */

import type { BaseEntity, PaginatedResponse } from './api'

// Enums
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  TRANSFER = 'transfer',
  LOYALTY_POINTS = 'loyalty_points'
}

export enum SaleItemType {
  PRODUCT = 'product',
  SERVICE = 'service'
}

// Customer Types
export interface Customer extends BaseEntity {
  phone: string
  name?: string
  loyalty_points: string // Decimal as string
}

export interface CustomerSearchRequest {
  phone: string
}

export interface CustomerSearchResponse {
  customers: Customer[]
}

export interface CreateCustomerRequest {
  phone: string
  name?: string
}

export interface UpdateCustomerWalletRequest {
  loyalty_points: string // Decimal as string
}

// Product Types
export interface Product extends BaseEntity {
  name: string
  description?: string
  price: string // Decimal as string
  is_active: boolean
}

export interface ProductListResponse {
  products: Product[]
}

export interface CreateProductRequest {
  name: string
  description?: string
  price: string // Decimal as string
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  price?: string
  is_active?: boolean
}

// Sale Item Types
export interface SaleItem {
  type: SaleItemType
  product_id?: string
  name: string
  description?: string
  unit_price: string // Decimal as string
  quantity: number
  total: string // Decimal as string
}

export interface PaymentMethodItem {
  method: PaymentMethod
  amount: string // Decimal as string
  reference?: string
}

// Sale Types
export interface Sale extends BaseEntity {
  customer_id: string
  items: SaleItem[]
  subtotal: string // Decimal as string
  discount_amount?: string // Decimal as string
  total_amount: string // Decimal as string
  loyalty_points_generated?: number
  payment_methods: PaymentMethodItem[]
  customer: Customer
}

export interface CreateSaleRequest {
  customer_id: string
  items: SaleItem[]
  subtotal: string
  discount_amount?: string
  total_amount: string
  loyalty_points_generated?: number
  payment_methods: PaymentMethodItem[]
}

export interface SalesListResponse extends PaginatedResponse<Sale> {
  sales: Sale[]
}

// Search Types
export interface ProductSearchRequest {
  q: string
}

export interface SalesListRequest {
  page?: number
  page_size?: number
  search?: string
  date?: string
}