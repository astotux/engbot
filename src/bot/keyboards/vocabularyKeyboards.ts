import { InlineKeyboard } from 'grammy';

/**
 * UI-принцип эмодзи:
 * 🟢/✅/▶️/🚀 — позитивные / основные действия (зелёный)
 * 🔴/❌/⏹     — деструктивные / стоп (красный)
 * 🔵/📚/📊    — информационные / нейтральные
 * ◀️/🏠        — навигация назад
 */

/** Главное меню раздела */
export function vocabMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('📚 Учить слова', 'vocab:study').row()
    .text('🧠 Проверить знания', 'vocab:quiz').row()
    .text('🔁 Повторить ошибки', 'vocab:review_errors').row()
    .text('📊 Мой прогресс', 'vocab:stats').row()
    .text('⚙️ Настройки', 'vocab:settings').row()
    .text('🏠 На главную', 'main_menu');
}

/** После показа слов (режим изучения) */
export function afterStudyKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🧠 Проверить себя', 'vocab:quiz_after_study').row()
    .text('⚙️ Настройки', 'vocab:settings').row()
    .text('🏠 На главную', 'main_menu');
}

/** Кнопки теста: варианты ответа */
export function testQuestionKeyboard(
  options: string[],
  sessionId: number,
  questionId: number,
): InlineKeyboard {
  const kb = new InlineKeyboard();
  options.forEach((opt, i) => {
    kb.text(opt, `vocab:answer:${sessionId}:${questionId}:${i}`).row();
  });
  kb.text('⏹ Завершить', `vocab:finish:${sessionId}`);
  return kb;
}

/** Кнопки письменного вопроса */
export function writtenQuestionKeyboard(sessionId: number): InlineKeyboard {
  return new InlineKeyboard()
    .text('⏹ Завершить', `vocab:finish:${sessionId}`);
}

/** После ответа — кнопка «Следующий» */
export function nextQuestionKeyboard(sessionId: number, questionId: number): InlineKeyboard {
  return new InlineKeyboard()
    .text('➡️ Следующий вопрос', `vocab:next:${sessionId}:${questionId}`);
}

/** Итоги занятия */
export function summaryKeyboard(sessionId: number, hasErrors: boolean): InlineKeyboard {
  const kb = new InlineKeyboard()
    .text('🔄 Пройти заново', `vocab:restart:${sessionId}`).row();
  if (hasErrors) {
    kb.text('🔁 Повторить ошибки', 'vocab:review_errors').row();
  }
  kb.text('📚 Учить новые слова', 'vocab:study').row()
    .text('🏠 На главную', 'main_menu');
  return kb;
}

/** Настройки */
export function settingsKeyboard(
  direction: 'en_to_ru' | 'ru_to_en',
  mode: 'test' | 'written' | 'alternating',
): InlineKeyboard {
  // Направление — взаимоисключающие, активное отмечено ✅
  const d1 = `${direction === 'en_to_ru' ? '✅ ' : ''}🇬🇧→🇷🇺 Англ → Рус`;
  const d2 = `${direction === 'ru_to_en' ? '✅ ' : ''}🇷🇺→🇬🇧 Рус → Англ`;
  // Способ ответа — три варианта, активное отмечено ✅
  const m1 = `${mode === 'test' ? '✅ ' : ''}Тест`;
  const m2 = `${mode === 'written' ? '✅ ' : ''}Письменно`;
  const m3 = `${mode === 'alternating' ? '✅ ' : ''}Чередование`;

  return new InlineKeyboard()
    .text(d1, 'vocab:set:dir:en_to_ru')
    .text(d2, 'vocab:set:dir:ru_to_en').row()
    .text(m1, 'vocab:set:mode:test')
    .text(m2, 'vocab:set:mode:written')
    .text(m3, 'vocab:set:mode:alternating').row()
    .text('◀️ Назад', 'vocab:menu');
}

/** Кнопка «назад в меню словаря» */
export function backToVocabMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('◀️ Словарный запас', 'vocab:menu').row()
    .text('🏠 На главную', 'main_menu');
}
