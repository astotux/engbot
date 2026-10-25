import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { createTestDb } from './helpers.js';

let testDb: Database.Database;

vi.mock('../src/db/connection.js', () => ({ getDb: () => testDb, closeDb: () => {} }));
vi.mock('../src/config/index.js', () => ({
  config: {
    logLevel: 'silent', nodeEnv: 'test', isProduction: false, isTest: true,
    databasePath: ':memory:', coursePriceKopecks: 50000, coursePriceRub: 500,
    botToken: 'test', botUsername: 'testbot', adminIds: [],
    yookassa: { enabled: false }, webhook: { enabled: false },
    lessonSendHour: 10, lessonSendMinute: 0, courseTimezone: 'Europe/Moscow',
  },
}));
vi.mock('../src/utils/logger.js', () => ({ logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} } }));

const { upsertUser } = await import('../src/db/repositories/users.js');
const {
  saveLessonNotification,
  getLessonNotification,
  clearLessonNotification,
} = await import('../src/db/repositories/lessons.js');
const { cleanupLessonNotification, handleLesson } = await import('../src/bot/handlers/lessonHandler.js');
const { createCourseAccess } = await import('../src/db/repositories/courseAccess.js');
const {
  isVocabOnboarded,
  markVocabOnboarded,
  getUserSettings,
} = await import('../src/db/repositories/vocabulary.js');
const {
  handleVocabMenu,
  handleVocabOnboardingDone,
  handleFinishTest,
  handleResumeTest,
  handleFinishConfirm,
} = await import('../src/bot/handlers/vocabularyHandler.js');
const { startQuizSession } = await import('../src/services/vocabularyService.js');
const { getDb } = await import('../src/db/connection.js');

describe('Мини-фиксы: уведомление об уроке и словарный тренажер', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 700, username: 'testuser' });
  });

  describe('1. Уведомление об уроке', () => {
    it('сохраняет, получает и очищает ID сообщения-уведомления', () => {
      saveLessonNotification(700, 12345, 1);
      const notif = getLessonNotification(700);
      expect(notif).toBeTruthy();
      expect(notif?.message_id).toBe(12345);
      expect(notif?.day_number).toBe(1);

      clearLessonNotification(700);
      expect(getLessonNotification(700)).toBeUndefined();
    });

    it('cleanupLessonNotification удаляет уведомление через Telegram API', async () => {
      saveLessonNotification(700, 555, 2);

      const deletedIds: number[] = [];
      const mockApi = {
        deleteMessage: vi.fn(async (_chatId: number, msgId: number) => {
          deletedIds.push(msgId);
        }),
      };

      await cleanupLessonNotification(mockApi, 700);
      expect(deletedIds).toContain(555);
      expect(getLessonNotification(700)).toBeUndefined();
    });

    it('handleLesson удаляет уведомление при старте урока с главной страницы', async () => {
      saveLessonNotification(700, 777, 1);
      createCourseAccess(700, null, 'active');

      const deletedIds: number[] = [];
      const mockCtx: any = {
        from: { id: 700 },
        chat: { id: 700 },
        session: {},
        api: {
          deleteMessage: vi.fn(async (_chatId: number, msgId: number) => {
            deletedIds.push(msgId);
          }),
          editMessageText: vi.fn(),
        },
        reply: vi.fn().mockResolvedValue({ message_id: 888 }),
      };

      await handleLesson(mockCtx);
      expect(deletedIds).toContain(777);
      expect(getLessonNotification(700)).toBeUndefined();
    });

    it('при нажатии на инлайн-кнопку уведомления удаляет предыдущее основное сообщение и открывает урок в уведомлении', async () => {
      saveLessonNotification(700, 777, 1);
      createCourseAccess(700, null, 'active');

      const deletedIds: number[] = [];
      const mockCtx: any = {
        from: { id: 700 },
        chat: { id: 700 },
        session: { lastBotMessageId: 500 },
        callbackQuery: {
          data: 'start_scheduled_lesson:1',
          message: { message_id: 777 },
        },
        answerCallbackQuery: vi.fn(),
        api: {
          deleteMessage: vi.fn(async (_chatId: number, msgId: number) => {
            deletedIds.push(msgId);
          }),
          editMessageText: vi.fn(),
        },
        replyWithVideoNote: vi.fn().mockResolvedValue({ message_id: 778 }),
        replyWithVoice: vi.fn().mockResolvedValue({ message_id: 779 }),
        reply: vi.fn().mockResolvedValue({ message_id: 780 }),
      };

      await handleLesson(mockCtx, 1);
      // Предыдущее основное сообщение (500) удалено
      expect(deletedIds).toContain(500);
      expect(getLessonNotification(700)).toBeUndefined();
    });
  });

  describe('2. Словарный тренажер: первый заход и настройки', () => {
    it('для нового пользователя isVocabOnboarded возвращает false', () => {
      expect(isVocabOnboarded(700)).toBe(false);
    });

    it('при первом заходе открывается онбординг с кнопкой "Продолжить"', async () => {
      let sentText = '';
      let replyMarkup: any = null;

      const mockCtx: any = {
        from: { id: 700 },
        chat: { id: 700 },
        session: {},
        api: {
          deleteMessage: vi.fn(),
          editMessageText: vi.fn(async (_c, _m, text, opts) => {
            sentText = text;
            replyMarkup = opts?.reply_markup;
          }),
        },
        reply: vi.fn(async (text, opts) => {
          sentText = text;
          replyMarkup = opts?.reply_markup;
          return { message_id: 999 };
        }),
      };

      await handleVocabMenu(mockCtx);

      expect(sentText).toContain('Добро пожаловать в Словарный тренажёр');
      expect(sentText).toContain('Давай настроим тренажёр под твой уровень');

      // Проверяем наличие кнопки "Продолжить"
      const buttons = replyMarkup?.inline_keyboard?.flat() ?? [];
      const continueBtn = buttons.find((b: any) => b.callback_data === 'vocab:onboarding_done');
      expect(continueBtn).toBeTruthy();
      expect(continueBtn.text).toContain('Продолжить');
    });

    it('после нажатия "Продолжить" статус становится onboarded и открывается меню', async () => {
      let sentText = '';
      const mockCtx: any = {
        from: { id: 700 },
        chat: { id: 700 },
        session: {},
        api: {
          deleteMessage: vi.fn(),
          editMessageText: vi.fn(async (_c, _m, text) => {
            sentText = text;
          }),
        },
        reply: vi.fn(async (text) => {
          sentText = text;
          return { message_id: 999 };
        }),
      };

      await handleVocabOnboardingDone(mockCtx);
      expect(isVocabOnboarded(700)).toBe(true);
      expect(sentText).toContain('Словарный запас');
      expect(sentText).toContain('Выбери действие:');
    });
  });

  describe('3. Кнопка "Завершить" в тренажере', () => {
    beforeEach(() => {
      // Добавляем минимум 4 изученных слова для генерации квиза
      for (let i = 1; i <= 4; i++) {
        testDb.prepare(`
          INSERT INTO vocabulary_words (id, english_word, russian_translation, difficulty)
          VALUES (?, ?, ?, 'A1-A2')
        `).run(i, `word_${i}`, `перевод_${i}`);
        testDb.prepare(`
          INSERT INTO user_vocabulary (telegram_id, word_id)
          VALUES (700, ?)
        `).run(i);
      }
    });

    it('при нажатии на "Завершить" спрашивает подтверждение и даёт 2 кнопки (завершить и вернуться)', async () => {
      const quizRes = startQuizSession(700, 2);
      expect('session' in quizRes).toBe(true);
      if (!('session' in quizRes)) return;
      const session = quizRes.session;

      let sentText = '';
      let replyMarkup: any = null;

      const mockCtx: any = {
        from: { id: 700 },
        chat: { id: 700 },
        session: {},
        callbackQuery: { message: { message_id: 111 } },
        answerCallbackQuery: vi.fn(),
        editMessageText: vi.fn(async (text, opts) => {
          sentText = text;
          replyMarkup = opts?.reply_markup;
        }),
        api: {
          deleteMessage: vi.fn(),
        },
        reply: vi.fn(async (text, opts) => {
          sentText = text;
          replyMarkup = opts?.reply_markup;
          return { message_id: 111 };
        }),
      };

      await handleFinishTest(mockCtx, session.id);

      expect(sentText).toContain('Завершить тренировку?');
      expect(sentText).toContain('Ты точно хочешь закончить тест досрочно?');

      const buttons = replyMarkup?.inline_keyboard?.flat() ?? [];
      const finishBtn = buttons.find((b: any) => b.callback_data === `vocab:finish_confirm:${session.id}`);
      const resumeBtn = buttons.find((b: any) => b.callback_data === `vocab:resume:${session.id}`);

      expect(finishBtn).toBeTruthy();
      expect(finishBtn.text).toContain('Завершить');
      expect(resumeBtn).toBeTruthy();
      expect(resumeBtn.text).toContain('Вернуться');
    });

    it('кнопка "Вернуться" возвращает пользователя к вопросу теста', async () => {
      const quizRes = startQuizSession(700, 1);
      expect('session' in quizRes).toBe(true);
      if (!('session' in quizRes)) return;
      const session = quizRes.session;

      let sentText = '';
      const mockCtx: any = {
        from: { id: 700 },
        chat: { id: 700 },
        session: {},
        callbackQuery: { message: { message_id: 222 } },
        answerCallbackQuery: vi.fn(),
        editMessageText: vi.fn(async (text) => {
          sentText = text;
        }),
        api: {
          deleteMessage: vi.fn(),
          editMessageText: vi.fn(async (_c, _m, text) => {
            sentText = text;
          }),
        },
        reply: vi.fn(async (text) => {
          sentText = text;
          return { message_id: 222 };
        }),
      };

      await handleResumeTest(mockCtx, session.id);
      expect(sentText).toContain('Вопрос 1 из');
    });

    it('подтверждение завершения досрочно финализирует тест и показывает результаты', async () => {
      const quizRes = startQuizSession(700, 1);
      expect('session' in quizRes).toBe(true);
      if (!('session' in quizRes)) return;
      const session = quizRes.session;

      let sentText = '';
      const mockCtx: any = {
        from: { id: 700 },
        chat: { id: 700 },
        session: {},
        callbackQuery: { message: { message_id: 333 } },
        answerCallbackQuery: vi.fn(),
        editMessageText: vi.fn(async (text) => {
          sentText = text;
        }),
        api: {
          deleteMessage: vi.fn(),
          editMessageText: vi.fn(async (_c, _m, text) => {
            sentText = text;
          }),
        },
        reply: vi.fn(async (text) => {
          sentText = text;
          return { message_id: 333 };
        }),
      };

      await handleFinishConfirm(mockCtx, session.id);
      expect(sentText).toContain('Результаты');
      expect(sentText).toContain('Вопросов:');
    });
  });
});
