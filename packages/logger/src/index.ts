import pino from 'pino';
import pretty from 'pino-pretty';

const isProduction = process.env.NODE_ENV === 'production';

// Use pino-pretty as a stream in main thread during development to avoid worker thread spawn.
export const logger = isProduction
  ? pino({ level: process.env.LOG_LEVEL || 'info' })
  : pino(
      pretty({
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:standard',
      }),
    );

// Helper for structured error logging
export function logError(err: unknown, message: string) {
  if (err instanceof Error) {
    logger.error({ err, stack: err.stack }, message);
  } else {
    logger.error({ err }, message);
  }
}
