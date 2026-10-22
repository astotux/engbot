import type { Context, SessionFlavor } from 'grammy';

export interface SessionData {
  // Ожидание ответа на шаг урока
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

  // ─── Словарный запас ───────────────────────────────────────────────────────
  // ID активной сессии словаря
  vocabSessionId?: number;
  // Ожидание текстового ответа на вопрос словаря
  vocabAwaitingAnswer?: {
    sessionId: number;
    questionId: number;
    questionNumber: number;
    totalQuestions: number;
  };
}

export type BotContext = Context & SessionFlavor<SessionData>;
