import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { BotContext } from '../src/bot/context.js';
import type { ChoiceStep } from '../src/content/course.js';
import {
  nextStepKeyboard,
  doneKeyboard,
  choiceKeyboard,
  inputKeyboard,
  handlePrevStep,
} from '../src/bot/handlers/lessonHandler.js';

describe('Lesson Navigation - Back button and skip prevention', () => {
  describe('nextStepKeyboard', () => {
    it('не показывает кнопку «Назад», если prevStep не передан или отрицательный (первый шаг)', () => {
      const kbNoPrev = nextStepKeyboard(1, 1);
      const jsonNoPrev = kbNoPrev.inline_keyboard;
      expect(jsonNoPrev[0].some((btn) => btn.text.includes('Назад'))).toBe(false);
      expect(jsonNoPrev[0].some((btn) => btn.text.includes('Продолжить'))).toBe(true);

      const kbNegative = nextStepKeyboard(1, 1, -1);
      const jsonNegative = kbNegative.inline_keyboard;
      expect(jsonNegative[0].some((btn) => btn.text.includes('Назад'))).toBe(false);
      expect(jsonNegative[0].some((btn) => btn.text.includes('Продолжить'))).toBe(true);
    });

    it('помещает кнопку «Назад» слева от «Продолжить» в одном ряду, когда prevStep >= 0', () => {
      const kb = nextStepKeyboard(1, 2, 0);
      const rows = kb.inline_keyboard;

      // Первый ряд: [⬅️ Назад, ➡️ Продолжить]
      expect(rows[0]).toHaveLength(2);
      expect(rows[0][0].text).toBe('⬅️ Назад');
      expect(rows[0][0].callback_data).toBe('prevstep:1:0');
      expect(rows[0][1].text).toBe('➡️ Продолжить');
      expect(rows[0][1].callback_data).toBe('nextstep:1:2');

      // Второй ряд: [🏠 На главную]
      expect(rows[1][0].text).toBe('🏠 На главную');
      expect(rows[1][0].callback_data).toBe('main_menu');
    });
  });

  describe('doneKeyboard', () => {
    it('помещает кнопку «Назад» слева от «Завершить урок», когда prevStep >= 0', () => {
      const kb = doneKeyboard(3, 4);
      const rows = kb.inline_keyboard;

      expect(rows[0]).toHaveLength(2);
      expect(rows[0][0].text).toBe('⬅️ Назад');
      expect(rows[0][0].callback_data).toBe('prevstep:3:4');
      expect(rows[0][1].text).toBe('🏆 Завершить урок');
      expect(rows[0][1].callback_data).toBe('lessonDone:3');
    });

    it('не показывает «Назад», если prevStep не передан', () => {
      const kb = doneKeyboard(3);
      const rows = kb.inline_keyboard;

      expect(rows[0]).toHaveLength(1);
      expect(rows[0][0].text).toBe('🏆 Завершить урок');
    });
  });

  describe('choiceKeyboard (тесты с выбором ответа)', () => {
    const mockStep: ChoiceStep = {
      type: 'choice',
      question: 'Choose correct form',
      options: ['Option A', 'Option B', 'Option C'],
      correctIndex: 0,
      hint: 'A hint',
      explanation: 'Explanation',
    };

    it('содержит «Назад», но НЕ содержит «Продолжить», чтобы нельзя было перескочить вопрос', () => {
      const kb = choiceKeyboard(mockStep, 2, 3);
      const rows = kb.inline_keyboard;

      // Проверяем, что ни в одной кнопке нет "Продолжить" или "nextstep"
      const allButtons = rows.flat();
      const hasContinue = allButtons.some(
        (b) => b.text.includes('Продолжить') || (b.callback_data && b.callback_data.startsWith('nextstep')),
      );
      expect(hasContinue).toBe(false);

      // Проверяем наличие кнопки «Назад»
      const backBtn = allButtons.find((b) => b.text.includes('Назад'));
      expect(backBtn).toBeDefined();
      expect(backBtn?.callback_data).toBe('prevstep:2:2');

      // Проверяем кнопку «На главную»
      const homeBtn = allButtons.find((b) => b.callback_data === 'main_menu');
      expect(homeBtn).toBeDefined();
    });

    it('на самом первом шаге (stepIndex = 0) кнопка «Назад» не показывается', () => {
      const kb = choiceKeyboard(mockStep, 1, 0);
      const allButtons = kb.inline_keyboard.flat();

      const backBtn = allButtons.find((b) => b.text.includes('Назад'));
      expect(backBtn).toBeUndefined();

      const continueBtn = allButtons.find((b) => b.text.includes('Продолжить'));
      expect(continueBtn).toBeUndefined();
    });
  });

  describe('inputKeyboard (шаг с написанием слова / текстом)', () => {
    it('содержит «Назад» и «Подсказка», но НЕ содержит «Продолжить», чтобы нельзя было перескочить вопрос', () => {
      const kb = inputKeyboard(5, 4);
      const rows = kb.inline_keyboard;

      const allButtons = rows.flat();
      const hasContinue = allButtons.some(
        (b) => b.text.includes('Продолжить') || (b.callback_data && b.callback_data.startsWith('nextstep')),
      );
      expect(hasContinue).toBe(false);

      // Кнопка «Назад» слева от «Подсказка»
      expect(rows[0][0].text).toBe('⬅️ Назад');
      expect(rows[0][0].callback_data).toBe('prevstep:5:3');
      expect(rows[0][1].text).toBe('💡 Подсказка');
      expect(rows[0][1].callback_data).toBe('hint:5:4');

      // Кнопка «На главную»
      expect(rows[1][0].text).toBe('🏠 На главную');
    });

    it('на первом шаге (stepIndex = 0) только «Подсказка» и «На главную»', () => {
      const kb = inputKeyboard(5, 0);
      const allButtons = kb.inline_keyboard.flat();

      const backBtn = allButtons.find((b) => b.text.includes('Назад'));
      expect(backBtn).toBeUndefined();

      const hintBtn = allButtons.find((b) => b.callback_data === 'hint:5:0');
      expect(hintBtn).toBeDefined();

      const continueBtn = allButtons.find((b) => b.text.includes('Продолжить'));
      expect(continueBtn).toBeUndefined();
    });
  });

  describe('handlePrevStep', () => {
    let mockCtx: Partial<BotContext>;
    let answerCallbackQueryMock: ReturnType<typeof vi.fn>;
    let replyMock: ReturnType<typeof vi.fn>;
    let editMessageTextMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      answerCallbackQueryMock = vi.fn().mockResolvedValue(true);
      replyMock = vi.fn().mockResolvedValue({ message_id: 100 });
      editMessageTextMock = vi.fn().mockResolvedValue(true);
      mockCtx = {
        chat: { id: 12345 } as any,
        from: { id: 12345, is_bot: false, first_name: 'Test' },
        session: {
          awaitingStep: { day: 1, stepIndex: 2, type: 'input' },
          cleanupMessageIds: [],
        } as any,
        answerCallbackQuery: answerCallbackQueryMock,
        reply: replyMock,
        editMessageText: editMessageTextMock,
      } as unknown as BotContext;
    });

    it('отвечает на callback и сбрасывает awaitingStep', async () => {
      await handlePrevStep(mockCtx as BotContext, 1, 0);

      expect(answerCallbackQueryMock).toHaveBeenCalledTimes(1);
      expect(mockCtx.session?.awaitingStep).toBeUndefined();
    });

    it('не выполняет переход при stepIndex < 0', async () => {
      await handlePrevStep(mockCtx as BotContext, 1, -1);
      expect(answerCallbackQueryMock).toHaveBeenCalledTimes(1);
    });
  });
});
