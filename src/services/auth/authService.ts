/**
 * Auth Service - POS System
 *
 * Servicio para validación de autenticación en el POS
 * - Valida tokens existentes del sistema principal
 * - Reutiliza token compartido desde localStorage
 * - Verifica autenticación usando endpoint backend
 *
 * Métodos disponibles:
 * - validateToken(): Valida token actual contra backend
 * - isAuthenticated(): Verifica si hay token válido
 * - clearAuth(): Limpia autenticación local
 *
 * Nota: El POS no implementa login propio, solo valida tokens del sistema principal.
 */

import { apiService } from '@/services/api'
import type { UserResponse } from '@/types/auth'

export class AuthService {
  /**
   * Valida el token actual haciendo una petición al backend
   * Usa el endpoint /auth/users que requiere autenticación
   */
  async validateToken(): Promise<{ valid: boolean; user?: UserResponse }> {
    try {
      const token = apiService.getToken()

      if (!token) {
        return { valid: false }
      }

      // Intentar hacer una petición que requiere autenticación
      // Si el token es válido, la petición será exitosa
      const users = await apiService.get<UserResponse[]>('/auth/users')

      // Si llegamos aquí, el token es válido
      // Intentamos obtener información del usuario actual usando el primer usuario activo
      // (en un sistema real, habría un endpoint /auth/me)
      const currentUser = users.length > 0 ? users[0] : undefined

      return {
        valid: true,
        user: currentUser
      }
    } catch (error) {
      // Si hay error 401 o cualquier otro, el token no es válido
      console.log('Token validation failed:', error)
      return { valid: false }
    }
  }

  /**
   * Verifica rápidamente si hay un token en localStorage
   * No valida contra el servidor (para verificación completa usar validateToken)
   */
  isAuthenticated(): boolean {
    const token = apiService.getToken()
    return !!token
  }

  /**
   * Limpia la autenticación local
   * Remueve el token del localStorage
   */
  clearAuth(): void {
    apiService.clearToken()
  }

  /**
   * Obtiene el token actual
   */
  getToken(): string | null {
    return apiService.getToken()
  }
}

export const authService = new AuthService()