/**
 * Auth Store - POS System
 *
 * Store simple de Pinia para manejo del estado de autenticación en el POS
 * - Verifica presencia de token en localStorage
 * - Lee el rol del usuario desde localStorage (guardado por el sistema principal)
 * - No hace validaciones contra el servidor (confía en backend)
 *
 * Nota: El rol viene del sistema principal cuando el usuario hace login
 */

import { defineStore } from 'pinia'
import { computed } from 'vue'
import { authService } from '@/services/auth/authService'

export const useAuthStore = defineStore('auth', () => {
  // Getters - todo basado en localStorage
  const isAuthenticated = computed(() => authService.isAuthenticated())
  const token = computed(() => authService.getToken())

  // Get user role from localStorage (set by main system on login)
  const userRole = computed(() => {
    try {
      const userData = localStorage.getItem('user_data')
      if (userData) {
        const parsed = JSON.parse(userData)
        return parsed.role || null
      }
    } catch {
      // Ignore parse errors
    }
    return null
  })

  // Check if user is admin
  const isAdmin = computed(() => userRole.value === 'ADMIN')

  // Check if user is member (regular user)
  const isMember = computed(() => userRole.value === 'MEMBER')

  return {
    // Getters
    isAuthenticated,
    token,
    userRole,
    isAdmin,
    isMember
  }
})