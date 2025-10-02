// Ejemplo de implementación con loglevel
// Para usar: pnpm add loglevel

import log from 'loglevel'

// Configurar nivel según entorno
if (import.meta.env.MODE === 'production') {
  log.setLevel('warn') // Solo warnings y errors en producción
} else {
  log.setLevel('debug') // Todo en desarrollo
}

// Personalizar formato
const originalFactory = log.methodFactory
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName)

  return function (...args) {
    const timestamp = new Date().toLocaleTimeString('es-PY')
    const prefix = `[${timestamp}] ${methodName.toUpperCase()}`
    rawMethod(prefix, ...args)
  }
}

// Aplicar cambios
log.setLevel(log.getLevel())

export const logger = {
  info: log.info,
  warn: log.warn,
  error: log.error,
  debug: log.debug,
  trace: log.trace,
}

/* Uso:
import { logger } from '@/utils/logger-loglevel'

logger.info('Mensaje informativo')
logger.debug('Debug info')
logger.error('Error message')
*/
