# Englishbot — Telegram-бот «Английский за 30 дней»

Telegram-бот для автоматической продажи и доставки 30-дневного курса английского языка.

---

## Требования

- **Node.js** v18+ (рекомендуется v20 LTS или v22 LTS; v24 тоже поддерживается)
- **npm** v9+
- Интернет для Telegram Bot API и YooKassa

---

## Установка зависимостей

```bash
npm install --ignore-scripts
```

> `--ignore-scripts` нужен, если нет Visual Studio Build Tools (Windows). better-sqlite3 использует prebuilt-бинарник.

---

## 1. Создание бота через BotFather

1. Напиши `/newbot` боту [@BotFather](https://t.me/BotFather)
2. Укажи имя и username бота
3. Скопируй токен — это `BOT_TOKEN`
4. Узнай username бота — это `BOT_USERNAME` (без @)

---

## 2. Настройка .env

```bash
cp .env.example .env
```

Заполни все поля в `.env`:

```env
BOT_TOKEN=123456789:AAF...
BOT_USERNAME=my_english_bot
ADMIN_TELEGRAM_IDS=123456789

# YooKassa (оставь пустым для тестирования без оплаты)
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
YOOKASSA_RETURN_URL=https://t.me/my_english_bot

# Webhook (оставь пустым для long polling)
WEBHOOK_BASE_URL=
WEBHOOK_PATH_SECRET=

DATABASE_PATH=./data/bot.sqlite
FREE_CHECKLIST_PATH=./assets/free-checklist.pdf
COURSE_PRICE_RUB=500
COURSE_TIMEZONE=Europe/Moscow
LESSON_SEND_HOUR=10
LESSON_SEND_MINUTE=0
LOG_LEVEL=info
NODE_ENV=development
```

---

## 3. Настройка YooKassa

### Тестовый режим

1. Зарегистрируйся на [yookassa.ru](https://yookassa.ru/)
2. Перейди в **Настройки → Ключи API**
3. Создай секретный ключ (начинается с `test_secret_...` для тестового режима)
4. Скопируй **shopId** и **secretKey** в `.env`
5. В тестовом режиме используй [тестовые карты](https://yookassa.ru/developers/payment-acceptance/testing-and-going-live/testing) из документации YooKassa

### Настройка webhook в кабинете YooKassa

1. Укажи URL webhook: `https://your-domain.com/webhook/yookassa/<WEBHOOK_PATH_SECRET>`
2. Выбери события: `payment.succeeded`, `payment.canceled`

---

## 4. Публичный HTTPS-адрес для webhook (локальная разработка)

Для тестирования webhook локально используй [ngrok](https://ngrok.com/):

```bash
ngrok http 3000
```

Полученный URL (например `https://abc123.ngrok.io`) вставь в `WEBHOOK_BASE_URL`.

---

## 5. Запуск миграций

```bash
npm run migrate
```

Создаёт все таблицы БД в файле, указанном в `DATABASE_PATH`.

---

## 6. Запуск локально (long polling)

```bash
npm run dev
```

Бот запускается в режиме long polling — webhook не нужен.

---

## 7. Запуск тестов

```bash
npm test
```

Тесты используют in-memory SQLite — реальные данные не затрагиваются, реальных платежей нет.

---

## 8. Сборка и запуск в production

```bash
npm run build
npm start
```

В production укажи в `.env`:
```env
NODE_ENV=production
WEBHOOK_BASE_URL=https://your-domain.com
WEBHOOK_PATH_SECRET=random-secret-string
```

Бот переключится на webhook-режим.

---

## 9. Развёртывание на сервере

Пример для Ubuntu/Debian с PM2:

```bash
npm install -g pm2
npm run build
pm2 start dist/index.js --name engbot
pm2 save
pm2 startup
```

---

## 10. Резервное копирование базы данных

SQLite поддерживает горячее резервное копирование через `backup()` API (используется в коде).

Пример cron-задачи (каждый день в 3:00):
```bash
0 3 * * * node -e "import('./dist/db/connection.js').then(m => m.backupDb('./data/bot-backup-$(date +\%Y\%m\%d).sqlite'))"
```

Никогда не копируй `.sqlite` файл напрямую во время работы приложения — используй только `backup()`.

---

## 11. Добавление PDF чек-листа

Положи PDF-файл по пути, указанному в `FREE_CHECKLIST_PATH` (по умолчанию `./assets/free-checklist.pdf`).

Если файл отсутствует, бот отправит текстовую версию чек-листа и уведомит об отсутствии PDF.

---

## 12. Редактирование учебных материалов

Все 30 уроков находятся в файле `src/content/course.ts`.

Каждый урок содержит:
- `title` — название
- `explanation` — объяснение на русском
- `examples` — примеры с переводом
- `exercise` — задание
- `answerKey` — массив правильных ответов (пустой = свободный ответ)
- `hint` — подсказка

После редактирования пересобери проект: `npm run build`

---

## 13. Добавление администраторов

В `.env` укажи Telegram ID через запятую:
```env
ADMIN_TELEGRAM_IDS=123456789,987654321
```

### Команды администратора

| Команда | Описание |
|---------|----------|
| `/admin_stats` | Статистика: пользователи, заказы, выручка |
| `/admin_user <id>` | Информация о пользователе |
| `/admin_grant <id>` | Выдать доступ к курсу |
| `/admin_revoke <id>` | Отозвать доступ |
| `/admin_lesson <id> <день>` | Повторно отправить урок |
| `/admin_msg <id> <текст>` | Отправить сообщение пользователю |
| `/admin_audit` | Последние действия администраторов |
| `/admin_help` | Список команд |

---

## 14. Устранение типичных ошибок

**`BOT_TOKEN` обязателен** — убедись, что `.env` заполнен и находится в корне проекта.

**`better-sqlite3` не устанавливается** — запусти `npm install --ignore-scripts`. Prebuilt бинарники поддерживают Node 18, 20, 22, 24 на Windows x64.

**YooKassa не отвечает** — убедись, что `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY` заполнены. Без них бот работает, но кнопка оплаты недоступна.

**Webhook не приходит** — проверь, что URL доступен публично по HTTPS и совпадает с настройкой в кабинете YooKassa.

**Уроки не отправляются** — проверь, что пользователь нажал «Начать обучение» и курс в статусе `active`. Планировщик проверяет расписание каждую минуту.

---

## Структура проекта

```
src/
  config/         — конфигурация и валидация env
  bot/
    commands/     — команды бота
    handlers/     — обработчики событий
    keyboards/    — клавиатуры
  db/
    migrations/   — SQL-миграции
    repositories/ — работа с БД
  payments/       — интеграция YooKassa
  courses/        — управление доступом
  content/        — учебные материалы (course.ts)
  scheduler/      — планировщик уроков и напоминаний
  admin/          — административные функции
  http/           — Express-сервер и webhook
  services/       — бизнес-логика
  utils/          — логгер, утилиты времени
tests/            — автоматические тесты (Vitest)
assets/           — PDF чек-лист
data/             — SQLite база (исключена из Git)
```

---

## Что требует ручной настройки перед запуском

1. ✅ Создать бота через BotFather и получить `BOT_TOKEN`
2. ✅ Заполнить `.env` на основе `.env.example`
3. ✅ Добавить PDF чек-лист в `./assets/free-checklist.pdf`
4. ⚠️ Настроить YooKassa (shopId + secretKey) для приёма платежей
5. ⚠️ Настроить публичный HTTPS-адрес и webhook для production

Без пунктов 4–5 бот полностью работает, но кнопка оплаты будет недоступна.
