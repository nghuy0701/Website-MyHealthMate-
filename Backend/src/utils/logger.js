/**
 * Logger Utility
 * Centralized logging with different log levels
 * Supports console output with colors and timestamps
 */

import { env } from '~/configs/environment'

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
}

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m'   // Reset
}

class Logger {
  constructor(context = 'App') {
    this.context = context
    this.isDevelopment = env.NODE_ENV === 'development'
  }

  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString()
    const color = LOG_COLORS[level] || LOG_COLORS.RESET
    const reset = LOG_COLORS.RESET
    
    let formatted = `${color}[${timestamp}] [${level}] [${this.context}]${reset} ${message}`
    
    if (Object.keys(meta).length > 0) {
      formatted += `\n${JSON.stringify(meta, null, 2)}`
    }
    
    return formatted
  }

  error(message, meta = {}) {
    const formatted = this._formatMessage(LOG_LEVELS.ERROR, message, meta)
    console.error(formatted)
  }

  warn(message, meta = {}) {
    const formatted = this._formatMessage(LOG_LEVELS.WARN, message, meta)
    console.warn(formatted)
  }

  info(message, meta = {}) {
    const formatted = this._formatMessage(LOG_LEVELS.INFO, message, meta)
    console.log(formatted)
  }

  debug(message, meta = {}) {
    // Only show debug logs in development
    if (this.isDevelopment) {
      const formatted = this._formatMessage(LOG_LEVELS.DEBUG, message, meta)
      console.log(formatted)
    }
  }

  // Helper methods for common scenarios
  success(message, meta = {}) {
    this.info(`✅ ${message}`, meta)
  }

  failure(message, meta = {}) {
    this.error(`❌ ${message}`, meta)
  }

  connection(service, status, meta = {}) {
    if (status === 'connected') {
      this.success(`Connected to ${service}`, meta)
    } else if (status === 'connecting') {
      this.info(`🔄 Connecting to ${service}...`, meta)
    } else if (status === 'disconnected') {
      this.warn(`⚠️ Disconnected from ${service}`, meta)
    } else if (status === 'error') {
      this.failure(`Failed to connect to ${service}`, meta)
    }
  }
}

// Export singleton instance
export const createLogger = (context) => new Logger(context)

// Export default logger
export const logger = new Logger('MyHealthMate')

export default logger
