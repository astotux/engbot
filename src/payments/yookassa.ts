import { z } from 'zod';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

const YOOKASSA_API = 'https://api.yookassa.ru/v3';

const YookassaPaymentSchema = z.object({
  id: z.string(),
  status: z.enum(['pending', 'waiting_for_capture', 'succeeded', 'canceled']),
  amount: z.object({ value: z.string(), currency: z.string() }),
  confirmation: z
    .object({ type: z.string(), confirmation_url: z.string().optional() })
    .optional(),
  metadata: z.record(z.string()).optional(),
  paid: z.boolean().optional(),
});

export type YookassaPayment = z.infer<typeof YookassaPaymentSchema>;

const YookassaWebhookSchema = z.object({
  type: z.literal('notification'),
  event: z.string(),
  object: z.object({
    id: z.string(),
    status: z.string(),
    amount: z.object({ value: z.string(), currency: z.string() }),
    metadata: z.record(z.string()).optional(),
  }),
});

export type YookassaWebhook = z.infer<typeof YookassaWebhookSchema>;

function getAuthHeader(): string {
  const creds = `${config.yookassa.shopId}:${config.yookassa.secretKey}`;
  return `Basic ${Buffer.from(creds).toString('base64')}`;
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  idempotenceKey?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: getAuthHeader(),
    'Content-Type': 'application/json',
  };
  if (idempotenceKey) {
    headers['Idempotence-Key'] = idempotenceKey;
  }

  const res = await fetch(`${YOOKASSA_API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    logger.error({ status: res.status, body: text }, 'YooKassa API error');
    throw new Error(`YooKassa API error ${res.status}: ${text}`);
  }

  return JSON.parse(text) as T;
}

export interface CreatePaymentInput {
  orderId: string;
  telegramId: number;
  amountKopecks: number;
  idempotenceKey: string;
  description: string;
}

export async function createYookassaPayment(input: CreatePaymentInput): Promise<YookassaPayment> {
  if (!config.yookassa.enabled) {
    throw new Error('YooKassa не настроена');
  }

  const amountRub = (input.amountKopecks / 100).toFixed(2);

  const raw = await apiRequest<unknown>(
    'POST',
    '/payments',
    {
      amount: { value: amountRub, currency: 'RUB' },
      confirmation: { type: 'redirect', return_url: config.yookassa.returnUrl },
      description: input.description,
      metadata: {
        order_id: input.orderId,
        telegram_id: String(input.telegramId),
      },
      capture: true,
    },
    input.idempotenceKey,
  );

  return YookassaPaymentSchema.parse(raw);
}

export async function getYookassaPayment(yookassaId: string): Promise<YookassaPayment> {
  if (!config.yookassa.enabled) {
    throw new Error('YooKassa не настроена');
  }
  const raw = await apiRequest<unknown>('GET', `/payments/${yookassaId}`);
  return YookassaPaymentSchema.parse(raw);
}

export function parseWebhookPayload(body: unknown): YookassaWebhook {
  return YookassaWebhookSchema.parse(body);
}
