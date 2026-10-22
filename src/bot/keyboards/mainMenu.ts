import { InlineKeyboard } from 'grammy';

/**
 * Главное меню.
 * @param hasCourse true — у пользователя активный/завершённый доступ к курсу
 */
export function mainMenuKeyboard(hasCourse = false): InlineKeyboard {
  const kb = new InlineKeyboard();

  if (!hasCourse) {
    kb.text('🎁 Бесплатный чек-лист', 'show_checklist').row();
    kb.text('💳 Купить курс за 500 ₽', 'buy_course').row();
  }

  kb.text('📚 Программа курса', 'show_program').row();

  if (hasCourse) {
    kb.text('📖 Мой урок', 'my_lesson').text('📊 Мой прогресс', 'my_progress').row();
  }

  kb.text('⬆️ Словарный запас', 'vocab:menu').row();
  kb.text('🆘 Поддержка', 'support');

  return kb;
}

/** Кнопка «🏠 На главную» */
export function backToMainKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('🏠 На главную', 'main_menu');
}

export function courseInfoKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('💳 Купить за 500 ₽', 'buy_course')
    .row()
    .text('🏠 На главную', 'main_menu');
}

export function startCourseKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('🚀 Начать обучение', 'start_course');
}

export function lessonKeyboard(dayNumber: number, hasAnswer: boolean): InlineKeyboard {
  const kb = new InlineKeyboard();
  if (!hasAnswer) {
    kb.text('✅ Отправить ответ', `answer_day_${dayNumber}`);
  } else {
    kb.text('🔄 Попробовать ещё раз', `answer_day_${dayNumber}`);
  }
  if (dayNumber > 1) {
    kb.row().text('⬅️ Предыдущий урок', `lesson_day_${dayNumber - 1}`);
  }
  kb.row().text('🏠 На главную', 'main_menu');
  return kb;
}

export function cancelKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('❌ Отмена', 'cancel');
}

export function checklistKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('📚 Узнать о курсе', 'show_course_info')
    .row()
    .text('🏠 На главную', 'main_menu');
}

export function pauseResumeKeyboard(paused: boolean): InlineKeyboard {
  return new InlineKeyboard()
    .text(
      paused ? '▶️ Возобновить обучение' : '⏸ Приостановить обучение',
      paused ? 'resume_course' : 'pause_course',
    )
    .row()
    .text('🏠 На главную', 'main_menu');
}

export function disableRemindersKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🔕 Отключить напоминания', 'disable_reminders')
    .row()
    .text('🏠 На главную', 'main_menu');
}
