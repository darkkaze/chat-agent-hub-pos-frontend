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
  frontend_project_name: string
}

export const useGlobalsStore = defineStore('globals', () => {
  // State
  const projectName = ref<string>('Agent Hub')
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
      // Globals endpoint is in the main API (/api), not in /pos/api
      // So we need to call the full URL path
      const globalsUrl = `${location.protocol}//${location.host}/api/globals`
      console.log('Making API call to', globalsUrl)
      const response = await fetch(globalsUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json() as GlobalsConfig
      console.log('API response received:', data)
      projectName.value = data.frontend_project_name || 'Agent Hub'

      // Update document title immediately
      document.title = browserTitle.value

      console.log('Globals loaded:', { projectName: projectName.value })

      // Only mark as loaded if the call was successful
      isLoaded.value = true
    } catch (error) {
      console.error('Failed to load globals:', error)
      // Use default value but DON'T mark as loaded so it retries
      projectName.value = 'Agent Hub'
      // isLoaded remains false, so it will retry on next call
    }
    console.log('loadGlobals finished')
  }

  return {
    // State
    projectName: computed(() => projectName.value),
    isLoaded: computed(() => isLoaded.value),

    // Getters
    browserTitle,
    sidebarTitle,

    // Actions
    loadGlobals
  }
})
