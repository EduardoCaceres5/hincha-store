type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success'

const isDevelopment = import.meta.env.MODE === 'development'

const colors = {
  info: '#3b82f6',
  warn: '#f59e0b',
  error: '#ef4444',
  debug: '#8b5cf6',
  success: '#10b981',
}

const icons = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  debug: '🔍',
  success: '✅',
}

class Logger {
  private log(level: LogLevel, message: string, ...args: any[]) {
    if (!isDevelopment && level === 'debug') return

    const timestamp = new Date().toLocaleTimeString('es-PY')
    const icon = icons[level]
    const color = colors[level]

    console.log(
      `%c${icon} [${timestamp}] ${message}`,
      `color: ${color}; font-weight: bold;`,
      ...args
    )
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args)
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args)
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args)
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args)
  }

  success(message: string, ...args: any[]) {
    this.log('success', message, ...args)
  }
}

export const logger = new Logger()
