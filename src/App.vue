<!--
App Component - POS System

Componente raíz de la aplicación POS.
Simplemente renderiza el RouterView para mostrar las vistas correspondientes.
-->

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { apiService } from '@/services/api'

// Initialize API service with token from localStorage on app start
onMounted(() => {
  const token = apiService.getToken()
  if (token) {
    console.log('POS App initialized with existing token')
  } else {
    console.log('POS App initialized - no token found')
  }
})
</script>

<template>
  <RouterView />
</template>

<style>
/* Global styles for the POS application */
body {
  margin: 0;
  padding: 0;
  font-family: 'Roboto', sans-serif;
  background: rgb(var(--v-theme-background));
}

#app {
  min-height: 100vh;
}

/* Ensure consistent box-sizing */
*, *::before, *::after {
  box-sizing: border-box;
}

/* Custom utility classes */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Responsive text sizing */
@media (max-width: 599px) {
  .v-card-title {
    font-size: 1.1rem !important;
  }

  .text-h6 {
    font-size: 1rem !important;
  }
}
</style>
