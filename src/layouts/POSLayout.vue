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
        POS - Agent Hub
      </v-app-bar-title>

      <v-spacer />

      <!-- Navigation Tabs -->
      <v-tabs
        v-model="currentTab"
        color="primary"
        align-tabs="end"
        density="compact"
      >
        <v-tab
          value="products"
          prepend-icon="mdi-package-variant"
        >
          Productos
        </v-tab>
        <v-tab
          value="tickets"
          prepend-icon="mdi-receipt"
        >
          Tickets
        </v-tab>
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
        <!-- Tab Content -->
        <v-window v-model="currentTab" class="h-100">
          <!-- Products Tab -->
          <v-window-item value="products" class="h-100">
            <router-view v-if="currentTab === 'products'" name="products" />
            <div v-else class="d-flex align-center justify-center h-100">
              <div class="text-center">
                <v-icon size="120" color="on-surface-variant" class="mb-4">
                  mdi-package-variant
                </v-icon>
                <h2 class="text-h5 text-on-surface-variant mb-2">
                  Gestión de Productos
                </h2>
                <p class="text-body-1 text-on-surface-variant">
                  Cargando...
                </p>
              </div>
            </div>
          </v-window-item>

          <!-- Tickets Tab -->
          <v-window-item value="tickets" class="h-100">
            <router-view />
          </v-window-item>

          <!-- Sale Tab (Main POS) -->
          <v-window-item value="sale" class="h-100">
            <router-view />
          </v-window-item>
        </v-window>
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

const route = useRoute()
const router = useRouter()
const posStore = usePOSStore()

// Reactive state
const currentTab = ref<string>('sale')

// Show global loading when processing sale
const showGlobalLoading = computed(() => posStore.isProcessingSale)

// Watch for route changes to update tab
watch(
  () => route.name,
  (newRouteName) => {
    // Update tab based on route if needed
    if (newRouteName === 'pos-sale') {
      currentTab.value = 'sale'
    } else if (newRouteName === 'products-admin') {
      currentTab.value = 'products'
    } else if (newRouteName === 'sales-history') {
      currentTab.value = 'tickets'
    }
  },
  { immediate: true }
)

// Watch for tab changes to update route
watch(currentTab, (newTab) => {
  if (newTab === 'sale' && route.name !== 'pos-sale') {
    router.push({ name: 'pos-sale' })
  } else if (newTab === 'products' && route.name !== 'products-admin') {
    router.push({ name: 'products-admin' })
  } else if (newTab === 'tickets' && route.name !== 'sales-history') {
    router.push({ name: 'sales-history' })
  }
})
</script>

<style scoped>
/* Main content container - fill viewport height */
.main-content {
  height: 100vh;
  overflow: hidden;
}

/* Ensure full height for tab content */
.v-window {
  height: 100%;
}

.v-window-item {
  height: 100%;
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