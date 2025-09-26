/**
 * POS Application Configuration
 *
 * Configuración para el sistema POS que extiende al CRM principal
 * - APIs en /pos/api
 * - Autenticación compartida con sistema principal
 */

const MODE = import.meta.env.MODE || 'localhost'

const configs = {
  localhost: {
    apiBaseUrl: 'http://localhost:8001/pos/api',
    debug: true,
    environment: 'local',
    locale: 'es-MX',
    timezone: 'America/Mexico_City', // GMT-6
  },
  development: {
    get apiBaseUrl() {
      return `${location.protocol}//${location.host}/pos/api`
    },
    debug: true,
    environment: 'development',
    locale: 'es-MX',
    timezone: 'America/Mexico_City', // GMT-6
  },
  production: {
    get apiBaseUrl() {
      return `${location.protocol}//${location.host}/pos/api`
    },
    debug: false,
    environment: 'production',
    locale: 'es-MX',
    timezone: 'America/Mexico_City', // GMT-6
  },
}

export const config = configs[MODE as keyof typeof configs] || configs.localhost

/**
 * Convierte un timestamp UTC a la timezone configurada
 */
export const toLocalTimezone = (utcTimestamp: string): Date => {
  const utcDate = new Date(utcTimestamp)
  return utcDate
}

/**
 * Formatea una fecha para mostrar en la timezone configurada
 */
export const formatDateWithTimezone = (utcTimestamp: string, options?: Intl.DateTimeFormatOptions): string => {
  if (!utcTimestamp) {
    throw new Error('Invalid timestamp: timestamp is required')
  }

  const normalizedTimestamp = utcTimestamp.endsWith('Z') ? utcTimestamp : `${utcTimestamp}Z`
  const date = new Date(normalizedTimestamp)

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${utcTimestamp}`)
  }

  return date.toLocaleString(config.locale, {
    timeZone: config.timezone,
    ...options
  })
}

/**
 * Obtiene la diferencia en milisegundos entre un timestamp UTC y ahora
 */
export const getTimeDifferenceMs = (utcTimestamp: string): number => {
  if (!utcTimestamp) {
    throw new Error('Invalid timestamp: timestamp is required')
  }

  const normalizedTimestamp = utcTimestamp.endsWith('Z') ? utcTimestamp : `${utcTimestamp}Z`
  const messageDate = new Date(normalizedTimestamp)
  const now = new Date()

  if (isNaN(messageDate.getTime())) {
    throw new Error(`Invalid timestamp: ${utcTimestamp}`)
  }

  return now.getTime() - messageDate.getTime()
}