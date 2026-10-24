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
vi.mock('../src/utils/logger.js', () => ({
  logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
}));

const { upsertUser } = await import('../src/db/repositories/users.js');
const { createCourseAccess, startCourse } = await import('../src/db/repositories/courseAccess.js');
const { scheduleLessonDelivery, markLessonSent, saveSubmission } = await import('../src/db/repositories/lessons.js');
const { advanceStep, completeAllSteps } = await import('../src/db/repositories/lessonSteps.js');
const {
  getAvailableDays,
  getEarliestUncompletedDay,
  checkLessonWarning,
} = await import('../src/services/lessonService.js');
const {
  formatLessonWarning,
  lessonWarningKeyboard,
  handleLesson,
  handleStartLessonDirectly,
  handleLessonDone,
} = await import('../src/bot/handlers/lessonHandler.js');

describe('Предупреждение о незавершённых уроках', () => {
  const USER_ID = 555;

  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: USER_ID, username: 'tester' });
    createCourseAccess(USER_ID, null, 'active');
  });

  describe('1. Логика определения доступности и незавершённых уроков', () => {
    it('новый активный курс: доступен только День 1, ранний незавершённый — 1', () => {
      const available = getAvailableDays(USER_ID);
      expect(available).toContain(1);
      expect(getEarliestUncompletedDay(USER_ID)).toBe(1);
    });

    it('после завершения Дня 1 ранний незавершённый становится Днём 2', () => {
      saveSubmission(USER_ID, 1, 'done', true, 100);
      completeAllSteps(USER_ID, 1);

      expect(getEarliestUncompletedDay(USER_ID)).toBe(2);
    });

    it('getAvailableDays включает отправленные планировщиком дни', () => {
      scheduleLessonDelivery(USER_ID, 2, new Date().toISOString());
      markLessonSent(USER_ID, 2);
      scheduleLessonDelivery(USER_ID, 3, new Date().toISOString());
      markLessonSent(USER_ID, 3);

      const available = getAvailableDays(USER_ID);
      expect(available).toContain(1);
      expect(available).toContain(2);
      expect(available).toContain(3);
    });
  });

  describe('2. checkLessonWarning: условия срабатывания предупреждения', () => {
    beforeEach(() => {
      // День 1 завершён
      saveSubmission(USER_ID, 1, 'done', true, 100);
      completeAllSteps(USER_ID, 1);

      // Планировщик отправил уроки 2 и 3
      scheduleLessonDelivery(USER_ID, 2, new Date().toISOString());
      markLessonSent(USER_ID, 2);
      scheduleLessonDelivery(USER_ID, 3, new Date().toISOString());
      markLessonSent(USER_ID, 3);
    });

    it('срабатывает, когда доступен 3 урок, а 2 не сделан, и пользователь нажимает на уведомление 3 урока', () => {
      const warning = checkLessonWarning(USER_ID, 3);
      expect(warning.hasWarning).toBe(true);
      expect(warning.currentRequiredDay).toBe(2);
      expect(warning.targetDay).toBe(3);
      expect(warning.upcomingDays).toContain(3);
    });

    it('срабатывает при переходе по «Мой урок» (без указания targetDay), если открыты следующие уроки', () => {
      const warning = checkLessonWarning(USER_ID);
      expect(warning.hasWarning).toBe(true);
      expect(warning.currentRequiredDay).toBe(2);
      expect(warning.targetDay).toBeUndefined();
      expect(warning.upcomingDays).toEqual([3]);
    });

    it('срабатывает и наглядно перечисляет дни, если открыты уроки за 3, 4 и 5 дни, а пользователь на 2-м', () => {
      scheduleLessonDelivery(USER_ID, 4, new Date().toISOString());
      markLessonSent(USER_ID, 4);
      scheduleLessonDelivery(USER_ID, 5, new Date().toISOString());
      markLessonSent(USER_ID, 5);

      const warning = checkLessonWarning(USER_ID);
      expect(warning.hasWarning).toBe(true);
      expect(warning.currentRequiredDay).toBe(2);
      expect(warning.upcomingDays).toEqual([3, 4, 5]);
    });

    it('НЕ срабатывает, если доступен только 2 урок (следующие ещё не открыты)', () => {
      // Тестируем другого пользователя, у которого открыт только 2 урок
      upsertUser({ telegram_id: 777 });
      createCourseAccess(777, null, 'active');
      saveSubmission(777, 1, 'done', true, 100);
      completeAllSteps(777, 1);
      scheduleLessonDelivery(777, 2, new Date().toISOString());
      markLessonSent(777, 2);

      const warning = checkLessonWarning(777);
      expect(warning.hasWarning).toBe(false);
      expect(warning.currentRequiredDay).toBe(2);
    });

    it('НЕ срабатывает, если пользователь открывает 2 урок (целевой урок совпадает с требуемым)', () => {
      const warning = checkLessonWarning(USER_ID, 2);
      expect(warning.hasWarning).toBe(false);
      expect(warning.currentRequiredDay).toBe(2);
    });
  });

  describe('3. Визуальное оформление предупреждения (текст и кнопки)', () => {
    it('текст содержит информацию о переходе из уведомления, статус уроков со значками', () => {
      const info = {
        hasWarning: true,
        currentRequiredDay: 2,
        targetDay: 3,
        availableDays: [1, 2, 3],
        upcomingDays: [3],
      };
      const text = formatLessonWarning(info);

      expect(text).toContain('⚠️ <b>Сначала нужно пройти предыдущий урок!</b>');
      expect(text).toContain('об <b>Уроке 3</b>');
      expect(text).toContain('<b>День 2</b> ещё не завершён');
      expect(text).toContain('✅ День 1:');
      expect(text).toContain('пройден');
      expect(text).toContain('⏳ <b>День 2:');
      expect(text).toContain('нужно пройти сейчас</b> 👈');
      expect(text).toContain('🔓 День 3:');
      expect(text).toContain('уже доступен');
    });

    it('текст наглядно перечисляет дни, когда открыты 3, 4 и 5 дни', () => {
      const info = {
        hasWarning: true,
        currentRequiredDay: 2,
        availableDays: [1, 2, 3, 4, 5],
        upcomingDays: [3, 4, 5],
      };
      const text = formatLessonWarning(info);

      expect(text).toContain('День 3, День 4, День 5');
      expect(text).toContain('⏳ <b>День 2:');
      expect(text).toContain('🔓 День 3:');
      expect(text).toContain('🔓 День 4:');
      expect(text).toContain('🔓 День 5:');
    });

    it('клавиатура предлагает начать урок с начала, если шаг 0', () => {
      const kb = lessonWarningKeyboard(2, 0, 5);
      const buttons = kb.inline_keyboard.flat();
      const startBtn = buttons.find((b) => b.callback_data === 'start_required_lesson:2');
      expect(startBtn).toBeDefined();
      expect(startBtn?.text).toBe('🚀 Начать День 2');
    });

    it('клавиатура предлагает продолжить урок, если шаг > 0', () => {
      const kb = lessonWarningKeyboard(2, 2, 6);
      const buttons = kb.inline_keyboard.flat();
      const contBtn = buttons.find((b) => b.callback_data === 'start_required_lesson:2');
      expect(contBtn).toBeDefined();
      expect(contBtn?.text).toBe('▶️ Продолжить День 2 (шаг 3/6)');
    });
  });

  describe('4. Интеграция с ботом (handleLesson и handleLessonDone)', () => {
    it('handleLesson показывает предупреждение при переходе на 3 урок, если 2 не сделан', async () => {
      saveSubmission(USER_ID, 1, 'done', true, 100);
      completeAllSteps(USER_ID, 1);
      scheduleLessonDelivery(USER_ID, 2, new Date().toISOString());
      markLessonSent(USER_ID, 2);
      scheduleLessonDelivery(USER_ID, 3, new Date().toISOString());
      markLessonSent(USER_ID, 3);

      let sentScreenText = '';
      let sentKeyboard: any;

      const mockCtx: any = {
        from: { id: USER_ID },
        chat: { id: USER_ID },
        session: {},
        api: {
          deleteMessage: vi.fn(),
          editMessageText: vi.fn(),
        },
        reply: vi.fn(async (text: string, opts?: any) => {
          sentScreenText = text;
          sentKeyboard = opts?.reply_markup;
          return { message_id: 111 };
        }),
      };

      await handleLesson(mockCtx, 3);

      expect(sentScreenText).toContain('⚠️ <b>Сначала нужно пройти предыдущий урок!</b>');
      expect(sentScreenText).toContain('об <b>Уроке 3</b>');
      expect(sentScreenText).toContain('⏳ <b>День 2:');

      const buttons = sentKeyboard?.inline_keyboard?.flat();
      expect(buttons?.some((b: any) => b.callback_data === 'start_required_lesson:2')).toBe(true);
    });

    it('handleStartLessonDirectly сразу запускает требуемый урок без цикла предупреждений', async () => {
      let sentText = '';
      const mockCtx: any = {
        from: { id: USER_ID },
        chat: { id: USER_ID },
        session: {},
        api: {
          deleteMessage: vi.fn(),
          editMessageText: vi.fn(),
        },
        reply: vi.fn(async (text: string) => {
          sentText = text;
          return { message_id: 222 };
        }),
      };

      await handleStartLessonDirectly(mockCtx, 2);

      // Запустился шаг урока 2
      expect(sentText).toContain('1/'); // Шаг 1/N
    });

    it('handleLessonDone при наличии уже доступного следующего урока предлагает перейти к нему', async () => {
      saveSubmission(USER_ID, 1, 'done', true, 100);
      completeAllSteps(USER_ID, 1);
      scheduleLessonDelivery(USER_ID, 2, new Date().toISOString());
      markLessonSent(USER_ID, 2);
      scheduleLessonDelivery(USER_ID, 3, new Date().toISOString());
      markLessonSent(USER_ID, 3);

      let doneText = '';
      let doneKb: any;

      const mockCtx: any = {
        from: { id: USER_ID },
        chat: { id: USER_ID },
        session: {},
        answerCallbackQuery: vi.fn(),
        replyWithDocument: vi.fn(),
        api: {
          deleteMessage: vi.fn(),
          editMessageText: vi.fn(),
        },
        reply: vi.fn(async (text: string, opts?: any) => {
          doneText = text;
          doneKb = opts?.reply_markup;
          return { message_id: 333 };
        }),
      };

      // Завершаем 2 урок
      await handleLessonDone(mockCtx, 2);

      // В сообщении пишется, что 3 урок уже открыт
      expect(doneText).toContain('🎉 <b>Урок 2 завершён!</b>');
      expect(doneText).toContain('⚡ <b>День 3');
      expect(doneText).toContain('уже открыт</b>');

      const buttons = doneKb?.inline_keyboard?.flat();
      const nextBtn = buttons?.find((b: any) => b.callback_data === 'start_required_lesson:3');
      expect(nextBtn).toBeDefined();
      expect(nextBtn?.text).toContain('Перейти к уроку 3');
    });
  });
});
