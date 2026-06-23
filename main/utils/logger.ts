type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  timestamp: string
  action: string
  detail?: string
}

function format(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase().padEnd(5)}] ${entry.action}`
  return entry.detail ? `${base} — ${entry.detail}` : base
}

export const logger = {
  info: (action: string, detail?: string): void => {
    console.log(format({ level: 'info', timestamp: new Date().toISOString(), action, detail }))
  },
  warn: (action: string, detail?: string): void => {
    console.warn(format({ level: 'warn', timestamp: new Date().toISOString(), action, detail }))
  },
  error: (action: string, detail?: string): void => {
    console.error(format({ level: 'error', timestamp: new Date().toISOString(), action, detail }))
  },
  debug: (action: string, detail?: string): void => {
    if (process.env['NODE_ENV'] !== 'production') {
      console.debug(format({ level: 'debug', timestamp: new Date().toISOString(), action, detail }))
    }
  }
}
