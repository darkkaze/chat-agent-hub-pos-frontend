/**
 * Authentication Types - POS System
 *
 * Types para autenticación reusados del sistema principal
 * El POS no implementa auth APIs, solo valida tokens existentes
 */

import type { BaseEntity } from './api'

// User types reusados del sistema principal
export interface UserResponse extends BaseEntity {
  username: string
  email: string
  role: string
  is_active: boolean
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  AGENT = 'agent'
}

// Auth State
export interface AuthState {
  user: UserResponse | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}