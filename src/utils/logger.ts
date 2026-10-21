import pino from 'pino';
import { config } from '../config/index.js';

export const logger = pino({
  level: config.logLevel,
  transport: config.isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },
  redact: {
    paths: ['BOT_TOKEN', 'YOOKASSA_SECRET_KEY', 'secretKey', 'token', '*.secretKey', '*.token'],
    censor: '[REDACTED]',
  },
});
