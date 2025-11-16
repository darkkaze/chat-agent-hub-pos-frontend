/**
 * Globals Store
 *
 * Store for global application configuration loaded from backend.
 * Loads configuration from /pos/api/globals endpoint very early in app lifecycle.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

interface GlobalsConfig {
  frontend_project_name?: string
  loyalty_points_rate?: number
}

export const useGlobalsStore = defineStore('globals', () => {
  // State
  const projectName = ref<string>('Agent Hub')
  const loyaltyPointsRate = ref<number>(0.05) // 5% default rate
  const isLoaded = ref(false)

  // Getters
  const browserTitle = computed(() => `${projectName.value} | POS`)
  const sidebarTitle = computed(() => projectName.value)

  // Actions
  const loadGlobals = async () => {
    console.log('loadGlobals called, isLoaded:', isLoaded.value)
    if (isLoaded.value) return

    console.log('Starting to fetch globals...')
    try {
      // Fetch from POS API globals endpoint
      const globalsUrl = `${location.protocol}//${location.host}/pos/api/globals`
      console.log('Making API call to', globalsUrl)
      const response = await fetch(globalsUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json() as GlobalsConfig
      console.log('API response received:', data)

      // Load loyalty points rate from POS backend
      if (data.loyalty_points_rate !== undefined) {
        loyaltyPointsRate.value = data.loyalty_points_rate
      }

      // Update document title immediately
      document.title = browserTitle.value

      console.log('Globals loaded:', { loyaltyPointsRate: loyaltyPointsRate.value })

      // Save to localStorage for persistence
      localStorage.setItem('posGlobalsLoaded', JSON.stringify({
        loyaltyPointsRate: loyaltyPointsRate.value
      }))

      // Only mark as loaded if the call was successful
      isLoaded.value = true
    } catch (error) {
      console.error('Failed to load globals:', error)
      // Try to restore from localStorage
      try {
        const saved = localStorage.getItem('posGlobalsLoaded')
        if (saved) {
          const data = JSON.parse(saved)
          loyaltyPointsRate.value = data.loyaltyPointsRate || 0.05
        }
      } catch (storageError) {
        console.error('Failed to restore from localStorage:', storageError)
      }
      // isLoaded remains false, so it will retry on next call
    }
    console.log('loadGlobals finished')
  }

  return {
    // State
    projectName: computed(() => projectName.value),
    loyaltyPointsRate: computed(() => loyaltyPointsRate.value),
    isLoaded: computed(() => isLoaded.value),

    // Getters
    browserTitle,
    sidebarTitle,

    // Actions
    loadGlobals
  }
})
