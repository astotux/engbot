# Деплой обновления на сервер

## Что изменилось

- `src/content/course.ts` — новая архитектура курса: 30 уроков × 4-6 шагов
- `src/bot/context.ts` — новый тип сессии (awaitingStep вместо awaitingAnswer)
- `src/bot/bot.ts` — обработчики choice/nextstep/hint/lessonDone
- `src/bot/handlers/lessonHandler.ts` — пошаговое прохождение, аудио, PDF
- `src/bot/handlers/menuHandler.ts` — обновлённое меню
- `src/services/lessonService.ts` — логика шагов
- `src/db/migrations/002_lesson_steps.ts` — новая таблица lesson_step_progress
- `src/db/repositories/lessonSteps.ts` — репозиторий прогресса шагов
- `src/db/migrate.ts` — подключена миграция 002

## Команды на сервере

```bash
cd /var/www/engbot

# 1. Копируй файлы (с локального компьютера через scp или git pull)
# Если используешь git:
git pull

# 2. Установи зависимости (если менялся package.json)
npm install --ignore-scripts

# 3. Запусти миграцию (создаст таблицу lesson_step_progress)
npm run migrate

# 4. Собери проект
npm run build

# 5. Перезапусти бота
pm2 restart engbot

# 6. Проверь логи
pm2 logs engbot --lines 20
```

## Структура папок для контента

```
assets/
  free-checklist.pdf          — бесплатный чек-лист (уже должен быть)
  lessons/
    day01.pdf                 — конспект урока 1
    day02.pdf                 — конспект урока 2
    ...
    day30.pdf
  audio/
    day01_greetings.mp4       — кружок для объяснения день 1
    day01_q1.mp4              — кружок для вопроса 1 день 1
    day02_pronouns.mp4
    day02_q1.mp4
    ...
```

## Как добавить аудио-кружки

Записывай видео-заметки (кружки) в формате MP4, разрешение 360x360 или 640x640.
Клади в `assets/audio/` с именами из поля `audioFile` в `src/content/course.ts`.

Если файл отсутствует — бот просто пропустит аудио и отправит только текст.
То же с PDF — если нет файла, урок работает без конспекта.

## Как добавить PDF конспекты

Клади PDF-файлы в `assets/lessons/day01.pdf` ... `assets/lessons/day30.pdf`.
Если файл есть — бот отправит его на первом шаге урока.
