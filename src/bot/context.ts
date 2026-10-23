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
  // ID главного сообщения бота — для редактирования на месте
  lastBotMessageId?: number;
  // ID вспомогательных сообщений (медиафайлы бота, подсказки, пользовательские ответы) на удаление
  cleanupMessageIds?: number[];

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

  // ─── Мини-игры (Конструктор фраз и Тренажёр диалогов) ──────────────────────
  phraseBuilderState?: {
    phraseIndex: number;
    shuffledWords: string[];
    selectedIndices: number[];
    mistakes: number;
  };
  dialogueState?: {
    scenarioId: string;
    turnIndex: number;
    mistakes: number;
  };
}

export type BotContext = Context & SessionFlavor<SessionData>;
