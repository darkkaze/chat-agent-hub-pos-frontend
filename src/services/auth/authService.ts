/**
 * Auth Service - POS System
 *
 * Servicio simple para verificación de autenticación en el POS
 * - Verifica presencia de token del sistema principal en localStorage
 * - Confía en el backend para validar tokens en cada request
 * - No hace peticiones adicionales de validación
 *
 * Métodos disponibles:
 * - isAuthenticated(): Verifica si hay token en localStorage
 * - getToken(): Obtiene token actual
 *
 * Nota: La seguridad real está en el backend - si el token es inválido,
 * el backend retornará 401 en las peticiones normales.
 */

export class AuthService {
  /**
   * Verifica si hay un token de autenticación en localStorage
   * No valida contra el servidor - confía en que el backend validará en cada request
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    return !!token
  }

  /**
   * Obtiene el token actual del localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }
}

export const authService = new AuthService()