/**
 * Раздел «🎮 Мини-игры и тренажёры»
 * Объединяет:
 *  1) 🧠 Словарный тренажёр (A1–C2)
 *  2) 🧩 Конструктор фраз (Собери предложение из слов)
 *  3) 💬 Тренажёр диалогов (Симулятор реальной жизни 💬)
 *
 * Все экраны работают в едином сообщении через editScreen / sendScreen.
 */
import { InlineKeyboard } from 'grammy';
import type { BotContext } from '../context.js';
import {
  PHRASE_BUILDER_ITEMS,
  DIALOGUE_SCENARIOS,
  type PhraseBuilderItem,
  type DialogueScenario,
} from '../../content/minigames.js';
import {
  getMinigameProgress,
  incrementPhrasesCompleted,
  markDialogueCompleted,
} from '../../db/repositories/minigames.js';
import { hasUserCourseAccess } from '../../db/repositories/courseAccess.js';
import { config } from '../../config/index.js';
import { editScreen } from '../sendHelper.js';

function buyCourseForGamesKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text(`💳 Купить курс за ${config.coursePriceRub} ₽`, 'buy_course')
    .row()
    .text('◀️ К мини-играм', 'games:menu')
    .text('🏠 В главное меню', 'main_menu');
}

async function showMinigameLockedScreen(ctx: BotContext, gameName: string): Promise<void> {
  await editScreen(
    ctx,
    `🔒 <b>${gameName} — в подарок к курсу!</b>\n\n` +
      `Эта игра открывается после оплаты уроков курса <b>«Английский за 30 дней»</b>.\n\n` +
      `🎁 <b>При покупке курса ты получаешь все мини-игры в подарок:</b>\n` +
      `• 🧠 <b>Тренажёр слов</b> — 500+ слов, безлимитные тесты и повторение ошибок\n` +
      `• 🧩 <b>Конструктор фраз</b> — ${PHRASE_BUILDER_ITEMS.length} предложений для тренировки порядка слов\n` +
      `• 💬 <b>Тренажёр диалогов</b> — ${DIALOGUE_SCENARIOS.length} реальных жизненных сценариев\n\n` +
      `💳 <b>Стоимость курса со всеми играми: всего ${config.coursePriceRub} ₽</b>\n\n`,
    {
      parse_mode: 'HTML',
      reply_markup: buyCourseForGamesKeyboard(),
    },
  );
}

// ─── Главное подменю «🎮 Мини-игры» ──────────────────────────────────────────

export function minigamesMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🧠 Тренажёр слов', 'vocab:menu')
    .row()
    .text('🧩 Конструктор фраз', 'games:builder')
    .row()
    .text('💬 Тренажёр диалогов', 'games:dialogue')
    .row()
    .text('🏠 В главное меню', 'main_menu');
}

export function formatMinigamesMenuText(telegramId: number): string {
  const progress = getMinigameProgress(telegramId);
  const completedDialogues = progress.dialoguesCompleted.length;
  const totalDialogues = DIALOGUE_SCENARIOS.length;
  const totalPhrases = PHRASE_BUILDER_ITEMS.length;

  return (
    `🎮 <b>Мини-игры и тренажёры</b>\n\n` +
    `Тренируй словарный запас, порядок слов и живую разговорную речь в игровом формате:\n\n` +
    `🧠 <b>Тренажёр слов</b> — 500+ слов по уровням, тесты и работа над ошибками\n` +
    `🧩 <b>Конструктор фраз</b> — ${totalPhrases} предложений: собирай фразы из перемешанных слов <i>(собрано: ${progress.phrasesCompleted})</i>\n` +
    `💬 <b>Тренажёр диалогов</b> — ${totalDialogues} жизненных сценариев: кофейня, ресторан, отель, аэропорт, шопинг, врач, собеседование <i>(пройдено: ${completedDialogues}/${totalDialogues})</i>\n\n` +
    `<i>Выбери мини-игру:</i>`
  );
}

export async function handleMinigamesMenu(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  if (ctx.session) {
    ctx.session.phraseBuilderState = undefined;
    ctx.session.dialogueState = undefined;
  }

  await editScreen(ctx, formatMinigamesMenuText(telegramId), {
    parse_mode: 'HTML',
    reply_markup: minigamesMenuKeyboard(),
  });
}

// ─── 🧩 Конструктор фраз (Собери предложение из слов) ─────────────────────────

/**
 * Детерминированное или случайное перемешивание слов (гарантирует, что порядок отличается от исходного).
 */
export function shuffleWords(words: string[]): string[] {
  if (words.length <= 1) return [...words];
  const arr = [...words];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Если случайно совпало с оригиналом — меняем первые два местами
  if (arr.every((w, i) => w === words[i])) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

function initBuilderState(phraseIndex: number) {
  const total = PHRASE_BUILDER_ITEMS.length;
  const idx = ((phraseIndex % total) + total) % total;
  const item = PHRASE_BUILDER_ITEMS[idx];
  return {
    phraseIndex: idx,
    shuffledWords: shuffleWords(item.words),
    selectedIndices: [] as number[],
    mistakes: 0,
  };
}

function formatBuilderScreenText(
  item: PhraseBuilderItem,
  state: NonNullable<BotContext['session']['phraseBuilderState']>,
  extraNotice?: string,
): string {
  const total = PHRASE_BUILDER_ITEMS.length;
  const builtWords = state.selectedIndices.map((idx) => state.shuffledWords[idx]);
  const currentLine =
    builtWords.length > 0
      ? `<b>${builtWords.join(' ')}</b>`
      : `<i>(нажимай на слова ниже по порядку)</i>`;

  let text =
    `🧩 <b>Конструктор фраз</b>  <i>(${state.phraseIndex + 1} из ${total} • ${item.level})</i>\n\n` +
    `Собери предложение из слов:\n` +
    `🇷🇺 <b>«${item.russianPrompt}»</b>\n\n` +
    `📝 Твоя фраза:\n` +
    `${currentLine}`;

  if (extraNotice) {
    text += `\n\n${extraNotice}`;
  }

  return text;
}

function builderKeyboard(
  state: NonNullable<BotContext['session']['phraseBuilderState']>,
): InlineKeyboard {
  const kb = new InlineKeyboard();
  const remaining: Array<{ word: string; idx: number }> = [];

  state.shuffledWords.forEach((word, idx) => {
    if (!state.selectedIndices.includes(idx)) {
      remaining.push({ word, idx });
    }
  });

  // Раскладываем доступные слова по 3 кнопки в ряд
  remaining.forEach((entry, i) => {
    kb.text(entry.word, `games:b_pick:${entry.idx}`);
    if ((i + 1) % 3 === 0 || i === remaining.length - 1) {
      kb.row();
    }
  });

  if (state.selectedIndices.length > 0) {
    kb.text('⬅️ Убрать слово', 'games:b_undo').text('🔄 Сбросить', 'games:b_clear').row();
  }

  kb.text('💡 Подсказка', 'games:b_hint')
    .text('⏭ Другая фраза', `games:builder:${state.phraseIndex + 1}`)
    .row()
    .text('◀️ К мини-играм', 'games:menu')
    .text('🏠 В меню', 'main_menu');

  return kb;
}

export async function handlePhraseBuilderStart(
  ctx: BotContext,
  explicitIndex?: number,
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  if (!hasUserCourseAccess(telegramId)) {
    await showMinigameLockedScreen(ctx, '🧩 Конструктор фраз');
    return;
  }

  const progress = getMinigameProgress(telegramId);
  const startIdx = explicitIndex ?? (progress.phrasesCompleted % PHRASE_BUILDER_ITEMS.length);

  const state = initBuilderState(startIdx);
  ctx.session.phraseBuilderState = state;

  const item = PHRASE_BUILDER_ITEMS[state.phraseIndex];
  await editScreen(ctx, formatBuilderScreenText(item, state), {
    parse_mode: 'HTML',
    reply_markup: builderKeyboard(state),
  });
}

export async function handlePhraseBuilderPick(
  ctx: BotContext,
  wordIdx: number,
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  let state = ctx.session.phraseBuilderState;
  if (!state) {
    await handlePhraseBuilderStart(ctx);
    return;
  }

  if (
    wordIdx < 0 ||
    wordIdx >= state.shuffledWords.length ||
    state.selectedIndices.includes(wordIdx)
  ) {
    if (ctx.callbackQuery) await ctx.answerCallbackQuery();
    return;
  }

  const item = PHRASE_BUILDER_ITEMS[state.phraseIndex];
  const nextPos = state.selectedIndices.length;
  const chosenWord = state.shuffledWords[wordIdx];
  const expectedWord = item.words[nextPos];

  // Проверяем, подходит ли слово на текущую позицию (сравнение без учёта регистра на случай дублей)
  if (chosenWord.toLowerCase() !== expectedWord.toLowerCase()) {
    state.mistakes += 1;
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({
        text: `❌ Слово «${chosenWord}» стоит не на этом месте. Попробуй другое!`,
        show_alert: false,
      });
    }
    const notice = `⚠️ <i>Слово «<b>${chosenWord}</b>» здесь не подходит. Попробуй выбрать другое слово!</i>`;
    await editScreen(ctx, formatBuilderScreenText(item, state, notice), {
      parse_mode: 'HTML',
      reply_markup: builderKeyboard(state),
    });
    return;
  }

  if (ctx.callbackQuery) await ctx.answerCallbackQuery('✅ Верно!');
  state.selectedIndices.push(wordIdx);

  // Если собрали все слова предложения
  if (state.selectedIndices.length === item.words.length) {
    const totalCompleted = incrementPhrasesCompleted(telegramId);
    const fullSentence = item.words.join(' ');
    const nextIdx = (state.phraseIndex + 1) % PHRASE_BUILDER_ITEMS.length;

    const winText =
      `🎉 <b>Отлично! Фраза собрана верно!</b>\n\n` +
      `🇬🇧 <b>${fullSentence}.</b>\n` +
      `🇷🇺 <i>${item.russianPrompt}</i>\n\n` +
      `🎯 Ошибок при сборке: <b>${state.mistakes}</b>\n` +
      `🏆 Всего собрано фраз: <b>${totalCompleted}</b>`;

    const winKb = new InlineKeyboard()
      .text('➡️ Следующая фраза', `games:builder:${nextIdx}`)
      .row()
      .text('◀️ К мини-играм', 'games:menu')
      .text('🏠 В главное меню', 'main_menu');

    await editScreen(ctx, winText, {
      parse_mode: 'HTML',
      reply_markup: winKb,
    });
    return;
  }

  await editScreen(ctx, formatBuilderScreenText(item, state), {
    parse_mode: 'HTML',
    reply_markup: builderKeyboard(state),
  });
}

export async function handlePhraseBuilderUndo(ctx: BotContext): Promise<void> {
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();
  const state = ctx.session.phraseBuilderState;
  if (!state || state.selectedIndices.length === 0) return;

  state.selectedIndices.pop();
  const item = PHRASE_BUILDER_ITEMS[state.phraseIndex];
  await editScreen(ctx, formatBuilderScreenText(item, state), {
    parse_mode: 'HTML',
    reply_markup: builderKeyboard(state),
  });
}

export async function handlePhraseBuilderClear(ctx: BotContext): Promise<void> {
  if (ctx.callbackQuery) await ctx.answerCallbackQuery('Сброшено');
  const state = ctx.session.phraseBuilderState;
  if (!state) return;

  state.selectedIndices = [];
  const item = PHRASE_BUILDER_ITEMS[state.phraseIndex];
  await editScreen(ctx, formatBuilderScreenText(item, state), {
    parse_mode: 'HTML',
    reply_markup: builderKeyboard(state),
  });
}

export async function handlePhraseBuilderHint(ctx: BotContext): Promise<void> {
  const state = ctx.session.phraseBuilderState;
  if (!state) {
    if (ctx.callbackQuery) await ctx.answerCallbackQuery();
    return;
  }

  const item = PHRASE_BUILDER_ITEMS[state.phraseIndex];
  const nextWord = item.words[state.selectedIndices.length];
  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery({
      text: `💡 Следующее слово: «${nextWord}»`,
      show_alert: false,
    });
  }

  const hintNotice = `💡 <b>Подсказка:</b> ${item.hint}\n👉 Следующее слово: <b>${nextWord}</b>`;
  await editScreen(ctx, formatBuilderScreenText(item, state, hintNotice), {
    parse_mode: 'HTML',
    reply_markup: builderKeyboard(state),
  });
}

// ─── 💬 Тренажёр диалогов (Симулятор реальной жизни 💬) ──────────────────────

export function dialogueMenuKeyboard(completedIds: string[]): InlineKeyboard {
  const kb = new InlineKeyboard();
  DIALOGUE_SCENARIOS.forEach((sc, idx) => {
    const doneMark = completedIds.includes(sc.id) ? ' ✅' : '';
    kb.text(`${sc.emoji} ${sc.title}${doneMark}`, `games:d_start:${sc.id}`);
    if ((idx + 1) % 2 === 0 || idx === DIALOGUE_SCENARIOS.length - 1) {
      kb.row();
    }
  });
  kb.text('◀️ К мини-играм', 'games:menu').text('🏠 В главное меню', 'main_menu');
  return kb;
}

export async function handleDialogueMenu(ctx: BotContext): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  if (!hasUserCourseAccess(telegramId)) {
    await showMinigameLockedScreen(ctx, '💬 Тренажёр диалогов');
    return;
  }

  const progress = getMinigameProgress(telegramId);
  let text =
    `💬 <b>Тренажёр диалогов</b>\n\n` +
    `Погрузись в реальные жизненные ситуации и выбирай правильные реплики на английском:\n\n`;

  for (const sc of DIALOGUE_SCENARIOS) {
    const status = progress.dialoguesCompleted.includes(sc.id) ? '✅ <i>Пройдено</i>' : '🆕 <i>Доступно</i>';
    text += `${sc.emoji} <b>${sc.title}</b> — ${sc.description} (${status})\n\n`;
  }

  text += `<i>Выбери ситуацию для тренировки:</i>`;

  await editScreen(ctx, text, {
    parse_mode: 'HTML',
    reply_markup: dialogueMenuKeyboard(progress.dialoguesCompleted),
  });
}

function formatDialogueTurnText(
  scenario: DialogueScenario,
  turnIndex: number,
  feedbackNotice?: string,
): string {
  const turn = scenario.turns[turnIndex];
  let text =
    `${scenario.emoji} <b>Диалог: ${scenario.title}</b>  <i>(Шаг ${turnIndex + 1} из ${scenario.turns.length})</i>\n\n` +
    `🗣 <b>${turn.speakerName}:</b>\n` +
    `«<b>${turn.speakerLineEn}</b>»\n` +
    `<i>(${turn.speakerLineRu})</i>\n\n` +
    `💬 <b>Как ты ответишь? Выбери подходящую реплику:</b>\n\n`;

  turn.options.forEach((opt, idx) => {
    text += `<b>${idx + 1}.</b> ${opt.textEn}\n`;
  });

  if (feedbackNotice) {
    text += `\n${feedbackNotice}`;
  }

  return text;
}

function dialogueTurnKeyboard(scenario: DialogueScenario, turnIndex: number): InlineKeyboard {
  const turn = scenario.turns[turnIndex];
  const kb = new InlineKeyboard();
  turn.options.forEach((opt, idx) => {
    const label = `${idx + 1}. ${opt.textEn}`;
    const shortLabel = label.length > 48 ? label.slice(0, 45) + '...' : label;
    kb.text(shortLabel, `games:d_ans:${scenario.id}:${turnIndex}:${idx}`).row();
  });
  kb.text('◀️ К выбору диалога', 'games:dialogue').text('🏠 В меню', 'main_menu');
  return kb;
}

export async function handleDialogueStart(ctx: BotContext, scenarioId: string): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();

  if (!hasUserCourseAccess(telegramId)) {
    await showMinigameLockedScreen(ctx, '💬 Тренажёр диалогов');
    return;
  }

  const scenario = DIALOGUE_SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) {
    await handleDialogueMenu(ctx);
    return;
  }

  ctx.session.dialogueState = {
    scenarioId: scenario.id,
    turnIndex: 0,
    mistakes: 0,
  };

  await editScreen(ctx, formatDialogueTurnText(scenario, 0), {
    parse_mode: 'HTML',
    reply_markup: dialogueTurnKeyboard(scenario, 0),
  });
}

export async function handleDialogueAnswer(
  ctx: BotContext,
  scenarioId: string,
  turnIndex: number,
  optionIndex: number,
): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const scenario = DIALOGUE_SCENARIOS.find((s) => s.id === scenarioId);
  const turn = scenario?.turns[turnIndex];
  const option = turn?.options[optionIndex];

  if (!scenario || !turn || !option) {
    if (ctx.callbackQuery) await ctx.answerCallbackQuery();
    return;
  }

  if (!ctx.session.dialogueState || ctx.session.dialogueState.scenarioId !== scenarioId) {
    ctx.session.dialogueState = { scenarioId, turnIndex, mistakes: 0 };
  }

  if (!option.isCorrect) {
    ctx.session.dialogueState.mistakes += 1;
    if (ctx.callbackQuery) {
      await ctx.answerCallbackQuery({
        text: '🤔 Попробуй другой вариант!',
        show_alert: false,
      });
    }

    const wrongNotice =
      `❌ <b>Не совсем:</b> «<i>${option.textEn}</i>» (${option.textRu})\n` +
      `💡 ${option.feedback}`;

    await editScreen(ctx, formatDialogueTurnText(scenario, turnIndex, wrongNotice), {
      parse_mode: 'HTML',
      reply_markup: dialogueTurnKeyboard(scenario, turnIndex),
    });
    return;
  }

  if (ctx.callbackQuery) await ctx.answerCallbackQuery('✅ Отличный ответ!');

  const isLastTurn = turnIndex + 1 >= scenario.turns.length;

  if (isLastTurn) {
    const completedList = markDialogueCompleted(telegramId, scenario.id);
    const mistakes = ctx.session.dialogueState.mistakes;
    ctx.session.dialogueState = undefined;

    const finishText =
      `🎉 <b>Диалог «${scenario.title}» успешно пройден!</b>\n\n` +
      `✅ Твоя финальная реплика: «<b>${option.textEn}</b>»\n` +
      `💡 <i>${option.feedback}</i>\n\n` +
      `🎯 Неверных попыток в диалоге: <b>${mistakes}</b>\n` +
      `🏅 Пройдено сценариев: <b>${completedList.length} из ${DIALOGUE_SCENARIOS.length}</b>`;

    const finishKb = new InlineKeyboard()
      .text('💬 Другой диалог', 'games:dialogue')
      .text('🔄 Пройти заново', `games:d_start:${scenario.id}`)
      .row()
      .text('◀️ К мини-играм', 'games:menu')
      .text('🏠 В главное меню', 'main_menu');

    await editScreen(ctx, finishText, {
      parse_mode: 'HTML',
      reply_markup: finishKb,
    });
    return;
  }

  // Переход к следующей реплике диалога
  const nextTurnIndex = turnIndex + 1;
  ctx.session.dialogueState.turnIndex = nextTurnIndex;
  const prevFeedback = `✅ <b>Отлично!</b> ${option.feedback}`;

  await editScreen(ctx, formatDialogueTurnText(scenario, nextTurnIndex, prevFeedback), {
    parse_mode: 'HTML',
    reply_markup: dialogueTurnKeyboard(scenario, nextTurnIndex),
  });
}
