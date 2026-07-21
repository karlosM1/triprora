type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

const configuredLevel =
  (process.env.LOG_LEVEL as LogLevel | undefined) ??
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

const threshold = LEVEL_PRIORITY[configuredLevel] ?? LEVEL_PRIORITY.info

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (LEVEL_PRIORITY[level] < threshold) return

  const payload = {
    time: new Date().toISOString(),
    level,
    message,
    ...meta,
  }

  const line = JSON.stringify(payload, (_key, value) =>
    value instanceof Error
      ? { name: value.name, message: value.message, stack: value.stack }
      : value,
  )

  if (level === 'error') {
    process.stderr.write(`${line}\n`)
  } else {
    process.stdout.write(`${line}\n`)
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) =>
    emit('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) =>
    emit('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) =>
    emit('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) =>
    emit('error', message, meta),
}
