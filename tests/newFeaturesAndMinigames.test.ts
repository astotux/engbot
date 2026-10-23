import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import fs from 'fs';
import { createTestDb } from './helpers.js';

let testDb: Database.Database;

vi.mock('../src/db/connection.js', () => ({ getDb: () => testDb, closeDb: () => {} }));
vi.mock('../src/config/index.js', () => ({
  config: {
    logLevel: 'silent',
    nodeEnv: 'test',
    isProduction: false,
    isTest: true,
    databasePath: ':memory:',
    freeChecklistPath: './assets/free-checklist.pdf',
    coursePriceKopecks: 50000,
    coursePriceRub: 500,
    botToken: 'test',
    botUsername: 'testbot',
    adminIds: [],
    yookassa: { enabled: false },
    webhook: { enabled: false },
    lessonSendHour: 10,
    lessonSendMinute: 0,
    courseTimezone: 'Europe/Moscow',
  },
}));
vi.mock('../src/utils/logger.js', () => ({
  logger: { info: () => {}, warn: () => {}, error: () => {}, debug: () => {} },
}));

const { upsertUser, setRemindersEnabled } = await import('../src/db/repositories/users.js');
const { createCourseAccess, startCourse, getCourseAccess } = await import('../src/db/repositories/courseAccess.js');
const { saveSubmission, getLessonDelivery } = await import('../src/db/repositories/lessons.js');
const { createSession, completeSession } = await import('../src/db/repositories/vocabulary.js');
const { getUserAchievements, setUserLessonTime } = await import('../src/services/lessonService.js');
const {
  SERVER_OFFSET_HOURS,
  mskHourToServerHour,
  serverHourToMskHour,
  toZonedScheduledTime,
  getMskDateTimeParts,
} = await import('../src/utils/time.js');
const {
  getUserNotesList,
  handleNotesMenu,
  handleNotesDownload,
  handleLessonTimeMenu,
  handleSetLessonTime,
} = await import('../src/bot/handlers/notesAndTimeHandler.js');
const { handleProgress, formatAchievementsSection } = await import('../src/bot/handlers/lessonHandler.js');
const {
  buildWeeklyReportText,
  runWeeklyReportTick,
  isWeeklyReportSent,
  WEEKLY_REPORT_MSK_HOUR,
} = await import('../src/scheduler/weeklyReportScheduler.js');
const {
  handleMinigamesMenu,
  handlePhraseBuilderStart,
  handlePhraseBuilderPick,
  handlePhraseBuilderUndo,
  handlePhraseBuilderClear,
  handlePhraseBuilderHint,
  handleDialogueMenu,
  handleDialogueStart,
  handleDialogueAnswer,
} = await import('../src/bot/handlers/minigamesHandler.js');
const { PHRASE_BUILDER_ITEMS, DIALOGUE_SCENARIOS } = await import('../src/content/minigames.js');
const { getMinigameProgress } = await import('../src/db/repositories/minigames.js');
const { mainMenuKeyboard } = await import('../src/bot/keyboards/mainMenu.js');

function createMockCtx(telegramId = 1001, messageId = 500) {
  let lastText = '';
  let lastMarkup: any = null;
  const deletedMessageIds: number[] = [];
  const sentDocuments: any[] = [];

  const ctx: any = {
    from: { id: telegramId, first_name: 'Иван' },
    chat: { id: telegramId },
    session: { lastBotMessageId: messageId, cleanupMessageIds: [] },
    callbackQuery: {
      data: 'test',
      message: { message_id: messageId },
    },
    answerCallbackQuery: vi.fn().mockResolvedValue(true),
    editMessageText: vi.fn(async (text: string, opts?: any) => {
      lastText = text;
      lastMarkup = opts?.reply_markup;
      return { message_id: messageId };
    }),
    api: {
      deleteMessage: vi.fn(async (_chatId: number, msgId: number) => {
        deletedMessageIds.push(msgId);
        return true;
      }),
      editMessageText: vi.fn(async (_chatId: number, _msgId: number, text: string, opts?: any) => {
        lastText = text;
        lastMarkup = opts?.reply_markup;
        return { message_id: messageId };
      }),
    },
    reply: vi.fn(async (text: string, opts?: any) => {
      lastText = text;
      lastMarkup = opts?.reply_markup;
      return { message_id: messageId + 1 };
    }),
    replyWithDocument: vi.fn(async (doc: any, opts?: any) => {
      sentDocuments.push({ doc, opts });
      return { message_id: messageId + 10 };
    }),
    getLastText: () => lastText,
    getLastMarkup: () => lastMarkup,
    getDeletedIds: () => deletedMessageIds,
    getSentDocuments: () => sentDocuments,
  };

  return ctx;
}

describe('Новые фичи и мини-игры', () => {
  beforeEach(() => {
    testDb = createTestDb();
    upsertUser({ telegram_id: 1001, username: 'ivan', first_name: 'Иван' });
  });

  // ─── 1. 📂 Мои конспекты (слайдер + бесплатный чек-лист) ────────────────────
  describe('1. 📂 Мои конспекты со слайдером', () => {
    it('даже если пользователь не прошёл ни одного урока, в списке всегда есть бесплатный чек-лист', () => {
      const notes = getUserNotesList(1001);
      expect(notes.length).toBe(1);
      expect(notes[0].isChecklist).toBe(true);
      expect(notes[0].title).toContain('Бесплатный чек-лист');
    });

    it('при прохождении уроков они добавляются в слайдер конспектов по порядку', () => {
      saveSubmission(1001, 3, 'done', true, 100);
      saveSubmission(1001, 1, 'done', true, 100);

      const notes = getUserNotesList(1001);
      expect(notes.length).toBe(3);
      expect(notes[0].isChecklist).toBe(true);
      expect(notes[1].day).toBe(1);
      expect(notes[2].day).toBe(3);
    });

    it('слайдер редактирует одно и то же сообщение при переключении стрелками ⬅️ ➡️', async () => {
      saveSubmission(1001, 1, 'done', true, 100);
      saveSubmission(1001, 2, 'done', true, 100);

      const ctx = createMockCtx(1001);

      // Открываем слайд 0 (чек-лист)
      await handleNotesMenu(ctx, 0);
      expect(ctx.getLastText()).toContain('Мои конспекты');
      expect(ctx.getLastText()).toContain('(1 из 3)');
      expect(ctx.getLastText()).toContain('Бесплатный чек-лист');

      // Переключаем на слайд 1 (День 1)
      await handleNotesMenu(ctx, 1);
      expect(ctx.getLastText()).toContain('(2 из 3)');
      expect(ctx.getLastText()).toContain('День 1:');

      // Переключаем на слайд -1 (кольцевой переход на последний слайд — День 2)
      await handleNotesMenu(ctx, -1);
      expect(ctx.getLastText()).toContain('(3 из 3)');
      expect(ctx.getLastText()).toContain('День 2:');
      expect(ctx.editMessageText).toHaveBeenCalledTimes(3);
    });

    it('при скачивании PDF удаляет старый экран, отправляет документ и создаёт новый экран ниже', async () => {
      const existsSpy = vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      const ctx = createMockCtx(1001, 500);

      await handleNotesDownload(ctx, 0);

      expect(ctx.getDeletedIds()).toContain(500);
      expect(ctx.getSentDocuments().length).toBe(1);
      expect(ctx.reply).toHaveBeenCalledTimes(1);
      expect(ctx.getLastText()).toContain('Мои конспекты');

      existsSpy.mockRestore();
    });
  });

  // ─── 2. ⏰ Выбрать время уроков (с учётом 3-часовой разницы с сервером) ────
  describe('2. ⏰ Выбор времени уроков (разница с сервером 3 часа)', () => {
    it('корректно переводит время МСК в серверное время (-3 часа) и обратно', () => {
      expect(SERVER_OFFSET_HOURS).toBe(3);
      expect(mskHourToServerHour(10)).toBe(7); // 10:00 МСК = 07:00 на сервере (UTC)
      expect(mskHourToServerHour(2)).toBe(23); // 02:00 МСК = 23:00 предыдущего дня на сервере
      expect(mskHourToServerHour(0)).toBe(21); // 00:00 МСК = 21:00 на сервере
      expect(serverHourToMskHour(7)).toBe(10);
      expect(serverHourToMskHour(21)).toBe(0);
    });

    it('toZonedScheduledTime учитывает 3-часовую разницу с сервером', () => {
      const baseDate = new Date(Date.UTC(2026, 9, 20, 12, 0, 0));
      const scheduled = toZonedScheduledTime(baseDate, 15, 0, 'Europe/Moscow');
      // 15:00 МСК должно запланироваться на 12:00 UTC на сервере
      expect(scheduled.getUTCHours()).toBe(12);
      expect(scheduled.getUTCMinutes()).toBe(0);
    });

    it('сохраняет выбранный час в course_access и пересчитывает pending-уроки', async () => {
      createCourseAccess(1001, null, 'active');
      startCourse(1001);

      const ctx = createMockCtx(1001);
      await handleLessonTimeMenu(ctx);
      expect(ctx.getLastText()).toContain('Выбрать время уроков');
      expect(ctx.getLastText()).toContain('10:00 (МСК)');
      expect(ctx.getLastText()).toContain('07:00');

      // Меняем время на 18:00 МСК (15:00 серверное)
      await handleSetLessonTime(ctx, 18);
      expect(ctx.getLastText()).toContain('18:00 (МСК)');
      expect(ctx.getLastText()).toContain('15:00');

      const access = getCourseAccess(1001);
      expect(access?.send_hour).toBe(18);

      const d1 = getLessonDelivery(1001, 1);
      expect(d1).toBeTruthy();
      expect(new Date(d1!.scheduled_at).getUTCHours()).toBe(15);
    });
  });

  // ─── 3. 🏅 Витрина значков в «Мой прогресс» ────────────────────────────────
  describe('3. 🏅 Витрина значков в «Мой прогресс»', () => {
    it('изначально все 4 значка закрыты', () => {
      const badges = getUserAchievements(1001);
      expect(badges.length).toBe(4);
      expect(badges.every((b) => !b.unlocked)).toBe(true);
    });

    it('открывает значок «Первый шаг» после прохождения 1-го урока', () => {
      saveSubmission(1001, 1, 'completed', true, 100);
      const badges = getUserAchievements(1001);
      const firstStep = badges.find((b) => b.id === 'first_step');
      expect(firstStep?.unlocked).toBe(true);
      expect(firstStep?.title).toBe('Первый шаг');
    });

    it('открывает значок «Без единой ошибки» при тесте словаря на 10/10', () => {
      const session = createSession(1001, 'quiz', '{}');
      completeSession(session.id, 10, 10, 0, 0);

      const badges = getUserAchievements(1001);
      const flawless = badges.find((b) => b.id === 'flawless_quiz');
      expect(flawless?.unlocked).toBe(true);
      expect(flawless?.title).toBe('Без единой ошибки');
    });

    it('открывает значок «Экватор» после прохождения 15 дней курса', () => {
      for (let day = 1; day <= 15; day++) {
        saveSubmission(1001, day, 'completed', true, 100);
      }
      const badges = getUserAchievements(1001);
      const equator = badges.find((b) => b.id === 'equator');
      expect(equator?.unlocked).toBe(true);
      expect(equator?.title).toBe('Экватор');
    });

    it('открывает значок «Полиглот-снайпер» при 100 усвоенных словах в тренажёре', () => {
      for (let i = 1; i <= 100; i++) {
        testDb.prepare(`
          INSERT INTO vocabulary_words (id, english_word, russian_translation, difficulty)
          VALUES (?, ?, ?, 'A1-A2')
        `).run(i, `word_${i}`, `слово_${i}`);
        testDb.prepare(`
          INSERT INTO user_vocabulary (telegram_id, word_id, mastered)
          VALUES (1001, ?, 1)
        `).run(i);
      }

      const badges = getUserAchievements(1001);
      const polyglot = badges.find((b) => b.id === 'polyglot_sniper');
      expect(polyglot?.unlocked).toBe(true);
      expect(polyglot?.title).toBe('Полиглот-снайпер');
    });

    it('отображает витрину значков в разделе «Мой прогресс»', async () => {
      createCourseAccess(1001, null, 'active');
      startCourse(1001);
      saveSubmission(1001, 1, 'completed', true, 100);

      const ctx = createMockCtx(1001);
      await handleProgress(ctx);

      const text = ctx.getLastText();
      expect(text).toContain('Витрина значков (1 из 4)');
      expect(text).toContain('«Первый шаг»');
      expect(text).toContain('«Без единой ошибки»');
      expect(text).toContain('«Экватор»');
      expect(text).toContain('«Полиглот-снайпер»');
    });
  });

  // ─── 4. 📊 Еженедельный мини-отчёт по воскресеньям ─────────────────────────
  describe('4. 📊 Еженедельный мини-отчёт по воскресеньям', () => {
    beforeEach(() => {
      createCourseAccess(1001, null, 'active');
      startCourse(1001);
      saveSubmission(1001, 1, 'completed', true, 100);
    });

    it('формирует информативный текст еженедельного отчёта', () => {
      const text = buildWeeklyReportText(1001);
      expect(text).toContain('Твой воскресный мини-отчёт, Иван!');
      expect(text).toContain('Уроки за неделю:');
      expect(text).toContain('Словарный запас:');
      expect(text).toContain('Открыто значков:');
      expect(text).toContain('Первый шаг');
    });

    it('отправляет отчёт только в воскресенье в назначенный час МСК (с учётом 3ч разницы сервера) и ровно 1 раз за неделю', async () => {
      const sentMessages: Array<{ chatId: number; text: string }> = [];
      const mockBot = {
        api: {
          sendMessage: vi.fn(async (chatId: number, text: string) => {
            sentMessages.push({ chatId, text });
            return { message_id: 777 };
          }),
        },
      };

      // Суббота 19:00 МСК (16:00 UTC) -> 2026-10-24 (суббота)
      const saturday = new Date(Date.UTC(2026, 9, 24, WEEKLY_REPORT_MSK_HOUR - 3, 0, 0));
      expect(getMskDateTimeParts(saturday).dayOfWeek).toBe(6);
      const countSat = await runWeeklyReportTick(mockBot as any, saturday);
      expect(countSat).toBe(0);

      // Воскресенье 19:00 МСК (16:00 UTC на сервере) -> 2026-10-25 (воскресенье)
      const sunday = new Date(Date.UTC(2026, 9, 25, WEEKLY_REPORT_MSK_HOUR - 3, 15, 0));
      expect(getMskDateTimeParts(sunday).dayOfWeek).toBe(0);
      expect(getMskDateTimeParts(sunday).hour).toBe(WEEKLY_REPORT_MSK_HOUR);

      const countSun1 = await runWeeklyReportTick(mockBot as any, sunday);
      expect(countSun1).toBe(1);
      expect(sentMessages.length).toBe(1);
      expect(isWeeklyReportSent(1001, '2026-10-25')).toBe(true);

      // Повторный тик в то же воскресенье не должен отправлять дубликат
      const countSun2 = await runWeeklyReportTick(mockBot as any, sunday);
      expect(countSun2).toBe(0);
      expect(sentMessages.length).toBe(1);
    });

    it('не отправляет отчёт пользователям с отключёнными напоминаниями', async () => {
      setRemindersEnabled(1001, false);
      const mockBot = { api: { sendMessage: vi.fn() } };
      const sunday = new Date(Date.UTC(2026, 9, 25, WEEKLY_REPORT_MSK_HOUR - 3, 0, 0));
      const count = await runWeeklyReportTick(mockBot as any, sunday);
      expect(count).toBe(0);
    });
  });

  // ─── 5. 🎮 Мини-игры: объединённая кнопка, Конструктор фраз и Диалоги ───────
  describe('5. 🎮 Подменю «Мини-игры», Конструктор фраз и Тренажёр диалогов', () => {
    it('на главной странице объединяет тренажёр слов, конструктор фраз и диалоги в подкнопку «🎮 Мини-игры»', async () => {
      const kbGuest = mainMenuKeyboard(false);
      const guestButtons = kbGuest.inline_keyboard.flat();
      expect(guestButtons.some((b: any) => b.callback_data === 'games:menu' && b.text.includes('Мини-игры'))).toBe(true);
      expect(guestButtons.some((b: any) => b.callback_data === 'my_notes')).toBe(true);
      expect(guestButtons.some((b: any) => b.callback_data === 'lesson_time')).toBe(true);

      const kbStudent = mainMenuKeyboard(true);
      const studentButtons = kbStudent.inline_keyboard.flat();
      expect(studentButtons.some((b: any) => b.callback_data === 'games:menu' && b.text.includes('Мини-игры'))).toBe(true);
      expect(studentButtons.some((b: any) => b.callback_data === 'my_notes')).toBe(true);
      expect(studentButtons.some((b: any) => b.callback_data === 'lesson_time')).toBe(true);

      const ctx = createMockCtx(1001);
      await handleMinigamesMenu(ctx);
      const subButtons = ctx.getLastMarkup().inline_keyboard.flat();
      expect(subButtons.some((b: any) => b.callback_data === 'vocab:menu')).toBe(true);
      expect(subButtons.some((b: any) => b.callback_data === 'games:builder')).toBe(true);
      expect(subButtons.some((b: any) => b.callback_data === 'games:dialogue')).toBe(true);
    });

    it('Конструктор фраз: позволяет собрать предложение по словам, проверяет ошибки, подсказки и сохраняет прогресс в одном сообщении', async () => {
      const ctx = createMockCtx(1001);
      await handlePhraseBuilderStart(ctx, 0);

      const item = PHRASE_BUILDER_ITEMS[0];
      expect(ctx.getLastText()).toContain('Конструктор фраз');
      expect(ctx.getLastText()).toContain(item.russianPrompt);

      const state = ctx.session.phraseBuilderState!;
      expect(state).toBeTruthy();

      // Пробуем выбрать заведомо неправильное слово для первой позиции
      const wrongWordIdx = state.shuffledWords.findIndex(
        (w: string) => w.toLowerCase() !== item.words[0].toLowerCase(),
      );
      await handlePhraseBuilderPick(ctx, wrongWordIdx);
      expect(ctx.session.phraseBuilderState.mistakes).toBe(1);
      expect(ctx.session.phraseBuilderState.selectedIndices.length).toBe(0);
      expect(ctx.getLastText()).toContain('здесь не подходит');

      // Проверяем подсказку
      await handlePhraseBuilderHint(ctx);
      expect(ctx.getLastText()).toContain(item.words[0]);

      // Выбираем первое правильное слово, затем отменяем (undo) и сбрасываем (clear)
      const firstCorrectIdx = state.shuffledWords.findIndex(
        (w: string) => w.toLowerCase() === item.words[0].toLowerCase(),
      );
      await handlePhraseBuilderPick(ctx, firstCorrectIdx);
      expect(ctx.session.phraseBuilderState.selectedIndices.length).toBe(1);

      await handlePhraseBuilderUndo(ctx);
      expect(ctx.session.phraseBuilderState.selectedIndices.length).toBe(0);

      await handlePhraseBuilderPick(ctx, firstCorrectIdx);
      await handlePhraseBuilderClear(ctx);
      expect(ctx.session.phraseBuilderState.selectedIndices.length).toBe(0);

      // Теперь собираем всю фразу до конца
      for (const expectedWord of item.words) {
        const idx = state.shuffledWords.findIndex(
          (w: string, i: number) =>
            !ctx.session.phraseBuilderState.selectedIndices.includes(i) &&
            w.toLowerCase() === expectedWord.toLowerCase(),
        );
        await handlePhraseBuilderPick(ctx, idx);
      }

      expect(ctx.getLastText()).toContain('Фраза собрана верно!');
      expect(getMinigameProgress(1001).phrasesCompleted).toBe(1);
    });

    it('содержит расширенную базу Конструктора фраз (35 фраз A1–B1) и 8 сценариев Тренажёра диалогов', () => {
      expect(PHRASE_BUILDER_ITEMS.length).toBeGreaterThanOrEqual(35);
      for (const item of PHRASE_BUILDER_ITEMS) {
        expect(item.words.length).toBeGreaterThanOrEqual(5);
        expect(item.russianPrompt.length).toBeGreaterThan(5);
        expect(item.hint.length).toBeGreaterThan(5);
      }

      expect(DIALOGUE_SCENARIOS.length).toBeGreaterThanOrEqual(8);
      for (const scenario of DIALOGUE_SCENARIOS) {
        expect(scenario.turns.length).toBeGreaterThanOrEqual(3);
        for (const turn of scenario.turns) {
          expect(turn.options.filter((o) => o.isCorrect).length).toBe(1);
        }
      }
    });

    it('Тренажёр диалогов: проходит сценарий по шагам, обрабатывает неверные реплики и сохраняет завершённый диалог', async () => {
      const ctx = createMockCtx(1001);
      await handleDialogueMenu(ctx);
      expect(ctx.getLastText()).toContain('Тренажёр диалогов');

      const scenario = DIALOGUE_SCENARIOS[0];
      await handleDialogueStart(ctx, scenario.id);
      expect(ctx.getLastText()).toContain(scenario.title);
      expect(ctx.getLastText()).toContain(scenario.turns[0].speakerLineEn);

      // Выбираем неверную реплику на шаге 0
      const wrongOptIdx = scenario.turns[0].options.findIndex((o) => !o.isCorrect);
      await handleDialogueAnswer(ctx, scenario.id, 0, wrongOptIdx);
      expect(ctx.session.dialogueState.mistakes).toBe(1);
      expect(ctx.getLastText()).toContain('Не совсем:');

      // Проходим все реплики правильными ответами
      for (let t = 0; t < scenario.turns.length; t++) {
        const correctOptIdx = scenario.turns[t].options.findIndex((o) => o.isCorrect);
        await handleDialogueAnswer(ctx, scenario.id, t, correctOptIdx);
      }

      expect(ctx.getLastText()).toContain(`Диалог «${scenario.title}» успешно пройден!`);
      const progress = getMinigameProgress(1001);
      expect(progress.dialoguesCompleted).toContain(scenario.id);
    });
  });
});
