import { InlineKeyboard } from 'grammy';

/**
 * Главное меню.
 * @param hasCourse true — у пользователя активный/завершённый доступ к курсу
 */
export function mainMenuKeyboard(hasCourse = false): InlineKeyboard {
  const kb = new InlineKeyboard();

  if (hasCourse) {
    // Пользователь уже обучается на курсе
    kb.text('📖 Мой урок дня', 'my_lesson')
      .text('📊 Мой прогресс', 'my_progress')
      .row();
    kb.text('📂 Мои конспекты', 'my_notes')
      .text('⏰ Выбрать время уроков', 'lesson_time')
      .row();
    kb.text('🎮 Мини-игры', 'games:menu').row();
    kb.text('📚 Программа курса', 'show_program')
      .text('💬 Поддержка', 'support');
  } else {
    // Новый пользователь / гость
    kb.text('✨ Получить курс за 500 ₽', 'buy_course').row();
    kb.text('🎁 Бесплатный чек-лист', 'show_checklist')
      .text('📂 Мои конспекты', 'my_notes')
      .row();
    kb.text('🎮 Мини-игры', 'games:menu')
      .text('⏰ Выбрать время уроков', 'lesson_time')
      .row();
    kb.text('📚 О курсе и программа', 'show_course_info')
      .text('💬 Поддержка', 'support');
  }

  return kb;
}

/** Кнопка «🏠 На главную» */
export function backToMainKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('🏠 В главное меню', 'main_menu');
}

export function courseInfoKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('💳 Купить курс за 500 ₽', 'buy_course')
    .row()
    .text('🎁 Бесплатный чек-лист', 'show_checklist')
    .text('🧠 Словарный тренажёр', 'vocab:menu')
    .row()
    .text('🏠 В главное меню', 'main_menu');
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
  kb.row().text('🏠 В главное меню', 'main_menu');
  return kb;
}

export function cancelKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('❌ Отмена', 'cancel');
}

export function checklistKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('✨ Получить полный курс за 500 ₽', 'buy_course')
    .row()
    .text('🧠 Попробовать словарь', 'vocab:menu')
    .text('📚 О курсе', 'show_course_info')
    .row()
    .text('🏠 В главное меню', 'main_menu');
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
