import 'dotenv/config';
import { z } from 'zod';

const configSchema = z.object({
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN обязателен'),
  BOT_USERNAME: z.string().min(1, 'BOT_USERNAME обязателен'),
  ADMIN_TELEGRAM_IDS: z.string().default(''),
  YOOKASSA_SHOP_ID: z.string().optional(),
  YOOKASSA_SECRET_KEY: z.string().optional(),
  YOOKASSA_RETURN_URL: z.string().url().optional(),
  WEBHOOK_BASE_URL: z.string().url().optional(),
  WEBHOOK_PATH_SECRET: z.string().optional(),
  DATABASE_PATH: z.string().default('./data/bot.sqlite'),
  FREE_CHECKLIST_PATH: z.string().default('./assets/free-checklist.pdf'),
  COURSE_PRICE_RUB: z.coerce.number().int().positive().default(500),
  COURSE_TIMEZONE: z.string().default('Europe/Moscow'),
  LESSON_SEND_HOUR: z.coerce.number().int().min(0).max(23).default(10),
  LESSON_SEND_MINUTE: z.coerce.number().int().min(0).max(59).default(0),
  REQUIRED_CHANNEL: z.string().optional(), // username или id канала, например @mychannel или -1001234567890
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = configSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n');
  console.error(`Ошибка конфигурации:\n${errors}`);
  process.exit(1);
}

const raw = parsed.data;

export const config = {
  botToken: raw.BOT_TOKEN,
  botUsername: raw.BOT_USERNAME,
  adminIds: raw.ADMIN_TELEGRAM_IDS
    ? raw.ADMIN_TELEGRAM_IDS.split(',').map((s) => s.trim()).filter(Boolean).map(Number)
    : [],
  yookassa: raw.YOOKASSA_SHOP_ID && raw.YOOKASSA_SECRET_KEY
    ? {
        shopId: raw.YOOKASSA_SHOP_ID,
        secretKey: raw.YOOKASSA_SECRET_KEY,
        returnUrl: raw.YOOKASSA_RETURN_URL ?? `https://t.me/${raw.BOT_USERNAME}`,
        enabled: true,
      }
    : { shopId: '', secretKey: '', returnUrl: '', enabled: false },
  webhook: raw.WEBHOOK_BASE_URL && raw.WEBHOOK_PATH_SECRET
    ? {
        baseUrl: raw.WEBHOOK_BASE_URL,
        pathSecret: raw.WEBHOOK_PATH_SECRET,
        enabled: true,
      }
    : { baseUrl: '', pathSecret: '', enabled: false },
  databasePath: raw.DATABASE_PATH,
  freeChecklistPath: raw.FREE_CHECKLIST_PATH,
  coursePriceRub: raw.COURSE_PRICE_RUB,
  coursePriceKopecks: raw.COURSE_PRICE_RUB * 100,
  courseTimezone: raw.COURSE_TIMEZONE,
  lessonSendHour: raw.LESSON_SEND_HOUR,
  lessonSendMinute: raw.LESSON_SEND_MINUTE,
  requiredChannel: raw.REQUIRED_CHANNEL ?? null, // null = проверка отключена
  logLevel: raw.LOG_LEVEL,
  nodeEnv: raw.NODE_ENV,
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
};

export type Config = typeof config;
