/**
 * Auth Store - POS System
 *
 * Store simple de Pinia para manejo del estado de autenticación en el POS
 * - Solo verifica presencia de token en localStorage
 * - No hace validaciones contra el servidor
 * - Confía en el backend para manejar la seguridad
 *
 * Nota: Este store no maneja login/logout, solo verifica tokens existentes
 * del sistema principal almacenados en localStorage.
 */

import { defineStore } from 'pinia'
import { computed } from 'vue'
import { authService } from '@/services/auth/authService'

export const useAuthStore = defineStore('auth', () => {
  // Getters - todo basado en localStorage
  const isAuthenticated = computed(() => authService.isAuthenticated())
  const token = computed(() => authService.getToken())

  return {
    // Getters
    isAuthenticated,
    token
  }
})