import type { Context, SessionFlavor } from 'grammy';

export interface SessionData {
  awaitingAnswer?: number; // day number
  lastOrderId?: string;
  lastPaymentId?: string;
}

export type BotContext = Context & SessionFlavor<SessionData>;
