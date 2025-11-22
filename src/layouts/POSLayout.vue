<!--
POSLayout Component

Layout principal para el sistema POS que incluye:
- Navegación superior con tabs (Productos, Tickets, Venta)
- Área principal para el contenido
- Responsive design para diferentes tamaños de pantalla

Props: ninguno
Emits: ninguno
-->

<template>
  <v-app>
    <!-- App Bar con navegación -->
    <v-app-bar
      color="surface"
      elevation="2"
      height="64"
      density="default"
    >
      <v-app-bar-title class="text-h6 font-weight-bold text-primary">
        <v-icon size="28" class="me-2">mdi-cash-register</v-icon>
        POS - {{ globalsStore.sidebarTitle }}
      </v-app-bar-title>

      <v-spacer />

      <!-- Navigation Tabs -->
      <v-tabs
        v-model="currentTab"
        color="primary"
        align-tabs="end"
        density="compact"
      >
        <!-- Admin-only tabs -->
        <v-tab
          v-if="isAdmin"
          value="products"
          prepend-icon="mdi-package-variant"
        >
          Productos
        </v-tab>
        <v-tab
          v-if="isAdmin"
          value="tickets"
          prepend-icon="mdi-receipt"
        >
          Tickets
        </v-tab>
        <v-tab
          v-if="isAdmin"
          value="reports"
          prepend-icon="mdi-file-chart"
        >
          Informe
        </v-tab>
        <v-tab
          v-if="isAdmin"
          value="signals"
          prepend-icon="mdi-signal"
        >
          Signals
        </v-tab>
        <!-- Available for all users -->
        <v-tab
          value="sale"
          prepend-icon="mdi-home"
        >
          Venta
        </v-tab>
      </v-tabs>
    </v-app-bar>

    <!-- Main Content Area -->
    <v-main class="main-content">
      <v-container fluid class="pa-0 h-100">
        <!-- Router View - displays component based on current route -->
        <router-view />
      </v-container>
    </v-main>

    <!-- Global Loading Overlay -->
    <v-overlay
      v-if="showGlobalLoading"
      :model-value="showGlobalLoading"
      class="d-flex align-center justify-center"
      scrim="rgba(0,0,0,0.6)"
      persistent
    >
      <v-card
        elevation="8"
        class="pa-6 text-center"
        min-width="200"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          size="48"
          class="mb-4"
        />
        <div class="text-subtitle-1 text-on-surface">
          Procesando venta...
        </div>
      </v-card>
    </v-overlay>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePOSStore } from '@/stores/pos'
import { useAuthStore } from '@/stores/auth'
import { useGlobalsStore } from '@/stores/globals'

const route = useRoute()
const router = useRouter()
const posStore = usePOSStore()
const authStore = useAuthStore()
const globalsStore = useGlobalsStore()

// Reactive state
const currentTab = ref<string>('sale')

// Show global loading when processing sale
const showGlobalLoading = computed(() => posStore.isProcessingSale)

// Check if user is admin (can access all tabs)
const isAdmin = computed(() => authStore.isAdmin)

// Watch for route changes to update tab
watch(
  () => route.path,
  (newPath) => {
    // Update tab based on route path
    if (newPath === '/sale' || newPath === '/') {
      currentTab.value = 'sale'
    } else if (newPath === '/productos') {
      currentTab.value = 'products'
    } else if (newPath === '/tickets') {
      currentTab.value = 'tickets'
    } else if (newPath === '/reports') {
      currentTab.value = 'reports'
    } else if (newPath === '/signals') {
      currentTab.value = 'signals'
    }
  },
  { immediate: true }
)

// Watch for tab changes to update route
watch(currentTab, (newTab) => {
  if (newTab === 'sale' && route.path !== '/sale') {
    router.push('/sale')
  } else if (newTab === 'products' && route.path !== '/productos') {
    router.push('/productos')
  } else if (newTab === 'tickets' && route.path !== '/tickets') {
    router.push('/tickets')
  } else if (newTab === 'reports' && route.path !== '/reports') {
    router.push('/reports')
  } else if (newTab === 'signals' && route.path !== '/signals') {
    router.push('/signals')
  }
})
</script>

<style scoped>
/* Main content container - allow natural scroll */
.main-content {
  min-height: 100vh;
}

/* Custom app bar styling */
.v-app-bar {
  background: rgb(var(--v-theme-surface)) !important;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

/* Tab styling */
.v-tabs {
  flex: 0 0 auto;
}

/* Responsive adjustments */
@media (max-width: 959px) {
  .v-app-bar-title {
    font-size: 1.1rem !important;
  }

  .v-tabs {
    font-size: 0.875rem;
  }
}

@media (max-width: 599px) {
  .v-app-bar-title .mdi {
    display: none;
  }

  .v-app-bar-title {
    font-size: 1rem !important;
  }
}
</style>