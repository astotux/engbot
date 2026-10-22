import { InlineKeyboard } from 'grammy';

/** Главное меню раздела «Словарный запас» */
export function vocabMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('📚 Учить слова', 'vocab:study').row()
    .text('🧠 Проверить знания', 'vocab:quiz').row()
    .text('🔁 Повторить ошибки', 'vocab:review_errors').row()
    .text('📊 Мой прогресс', 'vocab:stats').row()
    .text('⚙️ Настройки', 'vocab:settings').row()
    .text('🏠 На главную', 'main_menu');
}

/** Клавиатура после показа всех слов (режим изучения) */
export function afterStudyKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('📝 Проверить себя', 'vocab:quiz_after_study').row()
    .text('⚙️ Настройки', 'vocab:settings').row()
    .text('🏠 На главную', 'main_menu');
}

/** Кнопки вопроса теста */
export function testQuestionKeyboard(
  options: string[],
  sessionId: number,
  questionId: number,
): InlineKeyboard {
  const kb = new InlineKeyboard();
  options.forEach((opt, i) => {
    kb.text(opt, `vocab:answer:${sessionId}:${questionId}:${i}`).row();
  });
  kb.text('⏹ Завершить тест', `vocab:finish:${sessionId}`);
  return kb;
}

/** Кнопки при письменном вопросе */
export function writtenQuestionKeyboard(sessionId: number): InlineKeyboard {
  return new InlineKeyboard()
    .text('⏹ Завершить тест', `vocab:finish:${sessionId}`);
}

/** После ответа — переход к следующему вопросу */
export function nextQuestionKeyboard(sessionId: number, questionId: number): InlineKeyboard {
  return new InlineKeyboard()
    .text('➡️ Следующий', `vocab:next:${sessionId}:${questionId}`);
}

/** Итоги занятия */
export function summaryKeyboard(sessionId: number, hasErrors: boolean): InlineKeyboard {
  const kb = new InlineKeyboard()
    .text('🔄 Пройти заново', `vocab:restart:${sessionId}`).row();
  if (hasErrors) {
    kb.text('🔁 Повторить ошибки', `vocab:review_errors`).row();
  }
  kb.text('📚 Учить новые слова', 'vocab:study').row()
    .text('🏠 На главную', 'main_menu');
  return kb;
}

/** Настройки — основная клавиатура */
export function settingsKeyboard(
  direction: 'en_to_ru' | 'ru_to_en',
  mode: 'test' | 'written' | 'alternating',
): InlineKeyboard {
  const dirBtn1 = `${direction === 'en_to_ru' ? '✅ ' : ''}🇬🇧→🇷🇺 Англ → Рус`;
  const dirBtn2 = `${direction === 'ru_to_en' ? '✅ ' : ''}🇷🇺→🇬🇧 Рус → Англ`;
  const mBtn1 = `${mode === 'test' ? '✅ ' : ''}Тест`;
  const mBtn2 = `${mode === 'written' ? '✅ ' : ''}Письменно`;
  const mBtn3 = `${mode === 'alternating' ? '✅ ' : ''}Чередование`;

  return new InlineKeyboard()
    .text(dirBtn1, 'vocab:set:dir:en_to_ru')
    .text(dirBtn2, 'vocab:set:dir:ru_to_en').row()
    .text(mBtn1, 'vocab:set:mode:test')
    .text(mBtn2, 'vocab:set:mode:written')
    .text(mBtn3, 'vocab:set:mode:alternating').row()
    .text('◀️ Назад', 'vocab:menu');
}

/** Кнопка «назад в меню словаря» */
export function backToVocabMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('◀️ Словарный запас', 'vocab:menu')
    .row()
    .text('🏠 На главную', 'main_menu');
}
