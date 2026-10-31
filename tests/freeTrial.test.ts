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
    freeChecklistPath: './assets/free-checklist.pdf',
    lessonSendHour: 10, lessonSendMinute: 0, courseTimezone: 'Europe/Moscow',
  },
}));
vi.mock('../src/utils/logger.js', () => ({
  logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
}));

const { upsertUser } = await import('../src/db/repositories/users.js');
const { createCourseAccess, setCourseDay } = await import('../src/db/repositories/courseAccess.js');
const { saveSubmission, getLessonDelivery } = await import('../src/db/repositories/lessons.js');
const { completeAllSteps } = await import('../src/db/repositories/lessonSteps.js');
const {
  getAvailableDays,
  getLessonForUser,
  scheduleAllLessons,
  checkLessonWarning,
} = await import('../src/services/lessonService.js');
const { up: migration010 } = await import('../src/db/migrations/010_fix_course_schedule.js');
const {
  handleLesson,
  handleLessonDone,
} = await import('../src/bot/handlers/lessonHandler.js');
const { sendFreeChecklist } = await import('../src/bot/handlers/startHandler.js');
const { mainMenuKeyboard, checklistKeyboard } = await import('../src/bot/keyboards/mainMenu.js');
const { formatMenuText } = await import('../src/bot/handlers/menuHandler.js');

function createMockCtx(telegramId: number) {
  let lastText = '';
  let lastMarkup: any = null;
  return {
    from: { id: telegramId, first_name: 'Иван' },
    chat: { id: telegramId },
    session: {} as any,
    answerCallbackQuery: vi.fn(),
    replyWithDocument: vi.fn(async (_doc: any, opts?: any) => {
      lastText = opts?.caption ?? '';
      return { message_id: 100 };
    }),
    reply: vi.fn(async (text: string, opts?: any) => {
      lastText = text;
      lastMarkup = opts?.reply_markup;
      return { message_id: 101 };
    }),
    api: {
      deleteMessage: vi.fn(),
      editMessageText: vi.fn(async (_chatId: number, _msgId: number, text: string, opts?: any) => {
        lastText = text;
        lastMarkup = opts?.reply_markup;
      }),
    },
    getLastText: () => lastText,
    getLastMarkup: () => lastMarkup,
  };
}

describe('Первые 3 бесплатных дня курса и упоминание в чек-листе', () => {
  const USER_ID = 777;

  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: USER_ID, username: 'free_tester' });
  });

  describe('1. Доступность уроков для бесплатного пользователя', () => {
    it('для пользователя без покупки изначально доступен только День 1', () => {
      const days = getAvailableDays(USER_ID);
      expect(days).toEqual([1]);

      const l1 = getLessonForUser(USER_ID, 1);
      expect(l1).toBeDefined();
      expect(l1?.day).toBe(1);

      // Урок 4 недоступен
      const l4 = getLessonForUser(USER_ID, 4);
      expect(l4).toBeUndefined();
    });

    it('после завершения Дня 1 открывается День 2', () => {
      saveSubmission(USER_ID, 1, 'completed', true, 100);
      completeAllSteps(USER_ID, 1);

      const days = getAvailableDays(USER_ID);
      expect(days).toEqual([1, 2]);

      const l2 = getLessonForUser(USER_ID, 2);
      expect(l2).toBeDefined();
      expect(l2?.day).toBe(2);
    });

    it('после завершения Дня 2 открывается День 3', () => {
      saveSubmission(USER_ID, 1, 'completed', true, 100);
      completeAllSteps(USER_ID, 1);
      saveSubmission(USER_ID, 2, 'completed', true, 100);
      completeAllSteps(USER_ID, 2);

      const days = getAvailableDays(USER_ID);
      expect(days).toEqual([1, 2, 3]);

      const l3 = getLessonForUser(USER_ID, 3);
      expect(l3).toBeDefined();
      expect(l3?.day).toBe(3);
    });

    it('после завершения Дня 3 День 4 НЕ открывается бесплатно', () => {
      saveSubmission(USER_ID, 1, 'completed', true, 100);
      completeAllSteps(USER_ID, 1);
      saveSubmission(USER_ID, 2, 'completed', true, 100);
      completeAllSteps(USER_ID, 2);
      saveSubmission(USER_ID, 3, 'completed', true, 100);
      completeAllSteps(USER_ID, 3);

      const days = getAvailableDays(USER_ID);
      expect(days).toEqual([1, 2, 3]);

      const l4 = getLessonForUser(USER_ID, 4);
      expect(l4).toBeUndefined();
    });

    it('при покупке курса после 3 бесплатных уроков current_day становится 4, Урок 4 открывается сразу, а Урок 5 — на следующий день', () => {
      saveSubmission(USER_ID, 1, 'completed', true, 100);
      completeAllSteps(USER_ID, 1);
      saveSubmission(USER_ID, 2, 'completed', true, 100);
      completeAllSteps(USER_ID, 2);
      saveSubmission(USER_ID, 3, 'completed', true, 100);
      completeAllSteps(USER_ID, 3);

      const access = createCourseAccess(USER_ID, null, 'active');
      expect(access?.current_day).toBe(4);

      scheduleAllLessons(USER_ID);

      const d4 = getLessonDelivery(USER_ID, 4);
      expect(d4).toBeTruthy();
      // Урок 4 доступен сразу в день покупки
      const l4 = getLessonForUser(USER_ID, 4);
      expect(l4).toBeDefined();
      expect(l4?.day).toBe(4);

      // Урок 5 запланирован на следующий день в 00:01 МСК
      const d5 = getLessonDelivery(USER_ID, 5);
      expect(d5).toBeTruthy();
      expect(new Date(d5!.scheduled_at).getTime()).toBeGreaterThan(Date.now() + 3600_000);
    });
  });

  describe('2. Завершение уроков и пейволл после 3-го дня', () => {
    it('завершение Урока 1 предлагает перейти к Уроку 2', async () => {
      const ctx = createMockCtx(USER_ID);
      await handleLessonDone(ctx as any, 1);

      expect(ctx.getLastText()).toContain('Урок 1 завершён!');
      expect(ctx.getLastText()).toContain('Урок 2');
      const buttons = ctx.getLastMarkup()?.inline_keyboard?.flat() ?? [];
      expect(buttons.some((b: any) => b.callback_data === 'start_required_lesson:2')).toBe(true);
    });

    it('завершение Урока 2 предлагает перейти к Уроку 3', async () => {
      saveSubmission(USER_ID, 1, 'completed', true, 100);
      completeAllSteps(USER_ID, 1);

      const ctx = createMockCtx(USER_ID);
      await handleLessonDone(ctx as any, 2);

      expect(ctx.getLastText()).toContain('Урок 2 завершён!');
      expect(ctx.getLastText()).toContain('Урок 3');
      const buttons = ctx.getLastMarkup()?.inline_keyboard?.flat() ?? [];
      expect(buttons.some((b: any) => b.callback_data === 'start_required_lesson:3')).toBe(true);
    });

    it('завершение Урока 3 поздравляет с 3 бесплатными днями и предлагает купить полный курс', async () => {
      saveSubmission(USER_ID, 1, 'completed', true, 100);
      completeAllSteps(USER_ID, 1);
      saveSubmission(USER_ID, 2, 'completed', true, 100);
      completeAllSteps(USER_ID, 2);

      const ctx = createMockCtx(USER_ID);
      await handleLessonDone(ctx as any, 3);

      expect(ctx.getLastText()).toContain('Урок 3 завершён!');
      expect(ctx.getLastText()).toContain('3 бесплатных');
      expect(ctx.getLastText()).toContain('В полной версии курса');
      const buttons = ctx.getLastMarkup()?.inline_keyboard?.flat() ?? [];
      expect(buttons.some((b: any) => b.callback_data === 'buy_course')).toBe(true);
      expect(buttons.some((b: any) => b.callback_data?.includes('start_required_lesson:4'))).toBe(false);
    });

    it('попытка открыть Урок 4 без оплаты показывает пейволл', async () => {
      saveSubmission(USER_ID, 1, 'completed', true, 100);
      completeAllSteps(USER_ID, 1);
      saveSubmission(USER_ID, 2, 'completed', true, 100);
      completeAllSteps(USER_ID, 2);
      saveSubmission(USER_ID, 3, 'completed', true, 100);
      completeAllSteps(USER_ID, 3);

      const ctx = createMockCtx(USER_ID);
      await handleLesson(ctx as any, 4);

      expect(ctx.getLastText()).toContain('Первые 3 бесплатных дня курса завершены!');
      const buttons = ctx.getLastMarkup()?.inline_keyboard?.flat() ?? [];
      expect(buttons.some((b: any) => b.callback_data === 'buy_course')).toBe(true);
    });
  });

  describe('3. Упоминание 3 бесплатных дней при получении чек-листа и в меню', () => {
    it('при получении чек-листа упоминается, что первые 3 дня курса бесплатны', async () => {
      const ctx = createMockCtx(USER_ID);
      await sendFreeChecklist(ctx as any);

      expect(ctx.getLastText()).toContain('чек-лист');
      expect(ctx.getLastText()).toContain('Первые 3 дня курса — совершенно бесплатно!');

      // Кнопка начать 1-й урок бесплатно присутствует
      const buttons = ctx.getLastMarkup()?.inline_keyboard?.flat() ?? [];
      expect(buttons.some((b: any) => b.callback_data === 'my_lesson' && b.text.includes('1-й урок'))).toBe(true);
    });

    it('клавиатура чек-листа checklistKeyboard содержит кнопку бесплатного 1-го урока', () => {
      const kb = checklistKeyboard();
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some((b: any) => b.callback_data === 'my_lesson' && b.text.includes('1-й урок'))).toBe(true);
      expect(buttons.some((b: any) => b.callback_data === 'buy_course')).toBe(true);
    });

    it('главное меню для гостя mainMenuKeyboard(false) содержит кнопку «Урок дня (1–3 дни бесплатно)»', () => {
      const kb = mainMenuKeyboard(false);
      const buttons = kb.inline_keyboard.flat();
      expect(buttons.some((b: any) => b.callback_data === 'my_lesson' && b.text.includes('1–3 дни'))).toBe(true);
      expect(buttons.some((b: any) => b.callback_data === 'buy_course')).toBe(true);
    });

    it('текст меню formatMenuText(false) упоминает 3 бесплатных дня', () => {
      const text = formatMenuText(false, 'Иван');
      expect(text).toContain('Первые 3 дня курса — совершенно бесплатно!');
    });
  });

  describe('4. Защита от преждевременного открытия уроков наперёд и миграция 010', () => {
    it('существующий платный пользователь: уроки не открываются наперёд при scheduleAllLessons', () => {
      const PAID_USER = 888;
      upsertUser({ telegram_id: PAID_USER, username: 'paid_user' });
      // Создаём доступ 2 дня назад (сегодня должен быть открыт только День 3)
      const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString();
      testDb.prepare(`
        INSERT INTO course_access (telegram_id, product_id, status, started_at, current_day, start_day, send_hour, send_minute)
        VALUES (?, 'english_30_days', 'active', ?, 3, 1, 0, 1)
      `).run(PAID_USER, twoDaysAgo);

      // Пользователь сдал Урок 1 и Урок 2
      saveSubmission(PAID_USER, 1, 'completed', true, 100);
      saveSubmission(PAID_USER, 2, 'completed', true, 100);

      // Запускаем планирование (как при старте бота)
      scheduleAllLessons(PAID_USER, true);

      // Доступны должны быть только Дни 1, 2, 3
      const available = getAvailableDays(PAID_USER);
      expect(available).toEqual([1, 2, 3]);

      // Будущий урок 4 запланирован на будущее (не доступен)
      const d4 = getLessonDelivery(PAID_USER, 4);
      expect(d4).toBeTruthy();
      expect(d4?.status).toBe('pending');
      expect(new Date(d4!.scheduled_at).getTime()).toBeGreaterThan(Date.now());

      // Урок 5 также строго в будущем
      const d5 = getLessonDelivery(PAID_USER, 5);
      expect(d5).toBeTruthy();
      expect(d5?.status).toBe('pending');
      expect(new Date(d5!.scheduled_at).getTime()).toBeGreaterThan(Date.now() + 86_400_000);

      // Предупреждение о забегании вперёд НЕ возникает
      const warning = checkLessonWarning(PAID_USER);
      expect(warning.upcomingDays).toEqual([]);
    });

    it('миграция 010 восстанавливает корректное расписание и сбрасывает ошибочно открытые наперёд уроки', () => {
      const CORRUPTED_USER = 999;
      upsertUser({ telegram_id: CORRUPTED_USER, username: 'corrupted_user' });
      const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString();

      // Симулируем испорченное состояние БД: current_day=8, уроки 4..8 ошибочно помечены 'sent'
      testDb.prepare(`
        INSERT INTO course_access (telegram_id, product_id, status, started_at, current_day, send_hour, send_minute)
        VALUES (?, 'english_30_days', 'active', ?, 8, 0, 1)
      `).run(CORRUPTED_USER, twoDaysAgo);

      saveSubmission(CORRUPTED_USER, 1, 'completed', true, 100);
      saveSubmission(CORRUPTED_USER, 2, 'completed', true, 100);

      // Добавляем ошибочные 'sent' записи для будущих дней 4, 5, 6, 7, 8
      for (let day = 1; day <= 8; day++) {
        testDb.prepare(`
          INSERT INTO lesson_deliveries (telegram_id, day_number, scheduled_at, status, sent_at)
          VALUES (?, ?, datetime('now'), 'sent', datetime('now'))
        `).run(CORRUPTED_USER, day);
      }

      // До миграции пользователю ошибочно открыты уроки 1..8
      expect(getAvailableDays(CORRUPTED_USER).length).toBe(8);

      // Применяем восстанавливающую миграцию 010
      migration010(testDb);

      // После миграции:
      // current_day должен стать 3 (так как прошло 2 дня со started_at)
      const access = testDb.prepare('SELECT * FROM course_access WHERE telegram_id = ?').get(CORRUPTED_USER) as any;
      expect(access.current_day).toBe(3);
      expect(access.start_day).toBe(1);

      // Дни 4..8 должны стать 'pending' с будущим временем scheduled_at и sent_at = NULL
      for (let day = 4; day <= 8; day++) {
        const d = getLessonDelivery(CORRUPTED_USER, day);
        expect(d?.status).toBe('pending');
        expect(d?.sent_at).toBeNull();
        expect(new Date(d!.scheduled_at).getTime()).toBeGreaterThan(Date.now());
      }

      // Доступны только реально наступившие уроки: 1, 2, 3
      const correctedAvailable = getAvailableDays(CORRUPTED_USER);
      expect(correctedAvailable).toEqual([1, 2, 3]);

      // Уроки наперёд не открыты
      const warning = checkLessonWarning(CORRUPTED_USER);
      expect(warning.upcomingDays).toEqual([]);
    });
  });
});
