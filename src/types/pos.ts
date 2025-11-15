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

// Staff Types
export interface Staff extends BaseEntity {
  name: string
  schedule: string // JSON string for schedule/shifts
  is_active: boolean
}

export interface StaffListResponse {
  staff: Staff[]
}

export interface CreateStaffRequest {
  name: string
  schedule?: string
}

export interface UpdateStaffRequest {
  name?: string
  schedule?: string
  is_active?: boolean
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
  details?: string // Additional notes
  price: string // Decimal as string
  variable_price: boolean // If price is editable in cart
  category?: string // Product category
  meta_data: string // JSON metadata
  is_active: boolean
}

export interface ProductListResponse {
  products: Product[]
}

export interface CreateProductRequest {
  name: string
  description?: string
  details?: string
  price: string // Decimal as string
  variable_price?: boolean
  category?: string
  meta_data?: string
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  details?: string
  price?: string
  variable_price?: boolean
  category?: string
  meta_data?: string
  is_active?: boolean
}

// Sale Item Types
export interface SaleItem {
  type: SaleItemType
  product_id?: string
  name: string
  description?: string
  details?: string // Additional notes from product
  unit_price: string // Decimal as string
  quantity: number
  total: string // Decimal as string
  variable_price?: boolean // If price was editable
}

export interface PaymentMethodItem {
  method: PaymentMethod
  amount: string // Decimal as string
  reference?: string
}

// Sale Types
export interface Sale extends BaseEntity {
  customer_id: string
  staff_id: string
  items: SaleItem[]
  subtotal: string // Decimal as string
  discount_amount?: string // Decimal as string
  total_amount: string // Decimal as string
  loyalty_points_generated?: number
  payment_methods: PaymentMethodItem[]
  delivered_at?: string | null // Delivery timestamp (ISO 8601) or null if not delivered
  customer: Customer
  staff: Staff
}

export interface CreateSaleRequest {
  customer_id: string
  staff_id: string
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

// Signal Types
export interface Signal extends BaseEntity {
  name: string
  url: string
  is_active: boolean
  auth_config: string // JSON string for auth configuration
}

export interface SignalListResponse {
  signals: Signal[]
}

export interface CreateSignalRequest {
  name: string
  url: string
  is_active?: boolean
  auth_config?: string
}

export interface UpdateSignalRequest {
  name?: string
  url?: string
  is_active?: boolean
  auth_config?: string
}

export interface SignalTestResponse {
  success: boolean
  status_code?: number
  response_body?: string
  error?: string
}