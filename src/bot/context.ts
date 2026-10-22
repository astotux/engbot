import type { Context, SessionFlavor } from 'grammy';

export interface SessionData {
  // Ожидание ответа на шаг
  awaitingStep?: {
    day: number;
    stepIndex: number;
    type: 'input' | 'free';
  };
  // Для платёжного флоу
  lastOrderId?: string;
  lastPaymentId?: string;
  // ID последнего сообщения бота — для удаления перед отправкой нового
  lastBotMessageId?: number;
}

export type BotContext = Context & SessionFlavor<SessionData>;
