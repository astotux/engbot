import { InlineKeyboard } from 'grammy';

/**
 * Главное меню.
 * @param hasCourse true — у пользователя активный/завершённый доступ к курсу
 */
export function mainMenuKeyboard(hasCourse = false): InlineKeyboard {
  const kb = new InlineKeyboard();

  if (hasCourse) {
    // Пользователь уже обучается на курсе
    kb.text('📖 Урок дня', 'my_lesson').row();
    kb.text('📂 Мои конспекты', 'my_notes');
    kb.text('📊 Мой прогресс', 'my_progress').row();
    kb.text('🎮 Мини-игры', 'games:menu').row();
    kb.text('📚 Программа курса', 'show_program')
      .text('💬 Поддержка', 'support');
  } else {
    // Новый пользователь / гость
    kb.text('📖 Урок дня (1–3 дни бесплатно)', 'my_lesson').row();
    kb.text('✨ Получить полный курс', 'buy_course').row();
    kb.text('🎁 Бесплатный чек-лист', 'show_checklist')
      .text('📂 Мои конспекты', 'my_notes')
      .row();
    kb.text('🎮 Мини-игры', 'games:menu').row();
    kb.text('📚 О курсе и программа', 'show_course_info')
      .text('💬 Поддержка', 'support');
  }

  return kb;
}

/** Кнопка «🏠 На главную» */
export function backToMainKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('🏠 В главное меню', 'main_menu');
}

/** Клавиатура экрана поддержки с прямой ссылкой на @adm_koval */
export function supportKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .url('💬 Написать', 'https://t.me/adm_koval')
    .row()
    .text('🏠 В главное меню', 'main_menu');
}

export function courseInfoKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('🚀 Начать 3 бесплатных дня', 'my_lesson')
    .row()
    .text('💳 Купить курс', 'buy_course')
    .row()
    .text('🎁 Бесплатный чек-лист', 'show_checklist')
    .row()
    .text('🎮 Мини-игры и тренажёры', 'games:menu')
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
    .text('🚀 Начать 1-й урок (бесплатно)', 'my_lesson')
    .row()
    .text('✨ Получить полный курс', 'buy_course')
    .row()
    .text('🎮 Мини-игры', 'games:menu')
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
