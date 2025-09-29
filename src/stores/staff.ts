/**
 * Staff Store - Estado del personal del POS
 *
 * Maneja el estado del personal disponible y seleccionado
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Staff } from '@/types/pos'
import { staffService } from '@/services/pos'

export const useStaffStore = defineStore('staff', () => {
  // State
  const staffList = ref<Staff[]>([])
  const currentStaff = ref<Staff | null>(null)
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // Getters
  const activeStaff = computed(() =>
    staffList.value.filter(staff => staff.is_active)
  )

  const hasCurrentStaff = computed(() => currentStaff.value !== null)

  const currentStaffName = computed(() =>
    currentStaff.value?.name || 'No seleccionado'
  )

  // Actions
  const loadStaff = async () => {
    isLoading.value = true
    error.value = null

    try {
      const response = await staffService.getStaff()
      staffList.value = response.staff
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al cargar personal'
      console.error('Error loading staff:', err)
    } finally {
      isLoading.value = false
    }
  }

  const setCurrentStaff = (staff: Staff | null) => {
    currentStaff.value = staff
  }

  const clearCurrentStaff = () => {
    currentStaff.value = null
  }

  const createStaff = async (staffData: { name: string; schedule?: string }) => {
    try {
      const newStaff = await staffService.createStaff(staffData)
      staffList.value.push(newStaff)
      return newStaff
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al crear personal'
      throw err
    }
  }

  const updateStaff = async (staffId: string, staffData: { name?: string; schedule?: string; is_active?: boolean }) => {
    try {
      const updatedStaff = await staffService.updateStaff(staffId, staffData)
      const index = staffList.value.findIndex(staff => staff.id === staffId)
      if (index !== -1) {
        staffList.value[index] = updatedStaff
      }

      // Update current staff if it's the one being updated
      if (currentStaff.value?.id === staffId) {
        currentStaff.value = updatedStaff
      }

      return updatedStaff
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al actualizar personal'
      throw err
    }
  }

  const deleteStaff = async (staffId: string) => {
    try {
      await staffService.deleteStaff(staffId)
      const index = staffList.value.findIndex(staff => staff.id === staffId)
      if (index !== -1) {
        staffList.value[index].is_active = false
      }

      // Clear current staff if it's the one being deleted
      if (currentStaff.value?.id === staffId) {
        currentStaff.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al eliminar personal'
      throw err
    }
  }

  return {
    // State
    staffList,
    currentStaff,
    isLoading,
    error,

    // Getters
    activeStaff,
    hasCurrentStaff,
    currentStaffName,

    // Actions
    loadStaff,
    setCurrentStaff,
    clearCurrentStaff,
    createStaff,
    updateStaff,
    deleteStaff
  }
})