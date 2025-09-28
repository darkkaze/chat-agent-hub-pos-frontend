/**
 * Auth Store - POS System
 *
 * Store de Pinia para manejo del estado de autenticación en el POS
 * - Estado de autenticación compartido con sistema principal
 * - Validación de tokens existentes
 * - Estado de loading para UI
 *
 * Nota: Este store no maneja login/logout, solo valida tokens existentes
 * del sistema principal almacenados en localStorage.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth/authService'
import type { UserResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserResponse | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value && authService.isAuthenticated())
  const userName = computed(() => user.value?.username || '')
  const userRole = computed(() => user.value?.role || '')

  // Actions
  const setUser = (userData: UserResponse) => {
    user.value = userData
  }

  const clearUser = () => {
    user.value = null
    authService.clearAuth()
  }

  /**
   * Inicializa la autenticación validando el token existente
   * Se llama al cargar la aplicación para verificar si el usuario está autenticado
   */
  const initializeAuth = async (): Promise<boolean> => {
    if (isInitialized.value) {
      return isAuthenticated.value
    }

    isLoading.value = true

    try {
      const validation = await authService.validateToken()

      if (validation.valid && validation.user) {
        setUser(validation.user)
        isInitialized.value = true
        return true
      } else {
        clearUser()
        isInitialized.value = true
        return false
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      clearUser()
      isInitialized.value = true
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Valida el token actual contra el servidor
   * Útil para verificaciones periódicas o después de acciones importantes
   */
  const validateCurrentToken = async (): Promise<boolean> => {
    isLoading.value = true

    try {
      const validation = await authService.validateToken()

      if (validation.valid && validation.user) {
        setUser(validation.user)
        return true
      } else {
        clearUser()
        return false
      }
    } catch (error) {
      console.error('Error validating token:', error)
      clearUser()
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Limpia completamente la autenticación
   */
  const logout = () => {
    clearUser()
    isInitialized.value = false
  }

  return {
    // State
    user,
    isLoading,
    isInitialized,

    // Getters
    isAuthenticated,
    userName,
    userRole,

    // Actions
    setUser,
    clearUser,
    initializeAuth,
    validateCurrentToken,
    logout
  }
})