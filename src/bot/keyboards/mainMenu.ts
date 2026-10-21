import { Keyboard, InlineKeyboard } from 'grammy';

export function mainMenuKeyboard(): Keyboard {
  return new Keyboard()
    .text('🎁 Бесплатный чек-лист').row()
    .text('📚 Программа курса').text('💳 Купить курс за 500 ₽').row()
    .text('📖 Мой урок').text('📊 Мой прогресс').row()
    .text('🆘 Поддержка')
    .resized()
    .persistent();
}

export function courseInfoKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('💳 Купить за 500 ₽', 'buy_course')
    .row()
    .text('📚 Программа курса', 'show_program');
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
  return kb;
}

export function cancelKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('❌ Отмена', 'cancel');
}

export function checklistKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('📚 Узнать о курсе', 'show_course_info');
}

export function pauseResumeKeyboard(paused: boolean): InlineKeyboard {
  return new InlineKeyboard().text(
    paused ? '▶️ Возобновить обучение' : '⏸ Приостановить обучение',
    paused ? 'resume_course' : 'pause_course',
  );
}

export function disableRemindersKeyboard(): InlineKeyboard {
  return new InlineKeyboard().text('🔕 Отключить напоминания', 'disable_reminders');
}
