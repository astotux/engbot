/**
 * Скрипт для наполнения таблицы vocabulary_words базовыми словами.
 * Запуск: npx ts-node src/scripts/seedVocabulary.ts
 * или через npm: npm run seed:vocab
 *
 * Скрипт идемпотентен — повторный запуск не создаёт дублей.
 */
import 'dotenv/config';
import { getDb, closeDb } from '../db/connection.js';
import { runMigrations } from '../db/migrate.js';
import { logger } from '../utils/logger.js';

interface WordEntry {
  english_word: string;
  russian_translation: string;
  accepted_translations?: string[];
  example_en?: string;
  example_ru?: string;
}

const WORDS: WordEntry[] = [
  // ─── Базовые слова (A1) ───────────────────────────────────────────────────
  { english_word: 'hello', russian_translation: 'привет', accepted_translations: ['здравствуй', 'здравствуйте'], example_en: 'Hello! How are you?', example_ru: 'Привет! Как дела?' },
  { english_word: 'goodbye', russian_translation: 'пока', accepted_translations: ['до свидания'], example_en: 'Goodbye! See you tomorrow.', example_ru: 'Пока! Увидимся завтра.' },
  { english_word: 'please', russian_translation: 'пожалуйста', example_en: 'Can you help me, please?', example_ru: 'Можете мне помочь, пожалуйста?' },
  { english_word: 'thank you', russian_translation: 'спасибо', accepted_translations: ['благодарю'], example_en: 'Thank you for your help.', example_ru: 'Спасибо за вашу помощь.' },
  { english_word: 'sorry', russian_translation: 'извини', accepted_translations: ['извините', 'прости', 'простите'], example_en: 'Sorry, I was late.', example_ru: 'Извини, я опоздал.' },
  { english_word: 'yes', russian_translation: 'да', example_en: 'Yes, I agree.', example_ru: 'Да, я согласен.' },
  { english_word: 'no', russian_translation: 'нет', example_en: 'No, thank you.', example_ru: 'Нет, спасибо.' },
  { english_word: 'good', russian_translation: 'хорошо', accepted_translations: ['хороший', 'хорошая', 'хорошее'] },
  { english_word: 'bad', russian_translation: 'плохо', accepted_translations: ['плохой', 'плохая', 'плохое'] },
  { english_word: 'water', russian_translation: 'вода', example_en: 'I drink water every day.', example_ru: 'Я пью воду каждый день.' },

  { english_word: 'food', russian_translation: 'еда', accepted_translations: ['пища', 'продукты'], example_en: 'This food is delicious.', example_ru: 'Эта еда вкусная.' },
  { english_word: 'home', russian_translation: 'дом', accepted_translations: ['домой'], example_en: 'I go home after work.', example_ru: 'Я иду домой после работы.' },
  { english_word: 'work', russian_translation: 'работа', accepted_translations: ['работать'], example_en: 'I go to work at 9 a.m.', example_ru: 'Я иду на работу в 9 утра.' },
  { english_word: 'day', russian_translation: 'день', example_en: 'Have a nice day!', example_ru: 'Хорошего дня!' },
  { english_word: 'time', russian_translation: 'время', example_en: 'What time is it?', example_ru: 'Который час?' },
  { english_word: 'friend', russian_translation: 'друг', accepted_translations: ['подруга', 'друзья'], example_en: 'She is my best friend.', example_ru: 'Она моя лучшая подруга.' },
  { english_word: 'family', russian_translation: 'семья', example_en: 'My family is big.', example_ru: 'Моя семья большая.' },
  { english_word: 'house', russian_translation: 'дом', accepted_translations: ['здание'], example_en: 'They live in a big house.', example_ru: 'Они живут в большом доме.' },
  { english_word: 'money', russian_translation: 'деньги', example_en: 'I don\'t have much money.', example_ru: 'У меня немного денег.' },
  { english_word: 'book', russian_translation: 'книга', example_en: 'I read a book every evening.', example_ru: 'Я читаю книгу каждый вечер.' },

  // ─── Глаголы ─────────────────────────────────────────────────────────────
  { english_word: 'eat', russian_translation: 'есть', accepted_translations: ['кушать', 'питаться'], example_en: 'I eat breakfast at 8 a.m.', example_ru: 'Я ем завтрак в 8 утра.' },
  { english_word: 'drink', russian_translation: 'пить', example_en: 'She drinks coffee in the morning.', example_ru: 'Она пьёт кофе утром.' },
  { english_word: 'sleep', russian_translation: 'спать', example_en: 'I sleep 8 hours a day.', example_ru: 'Я сплю 8 часов в день.' },
  { english_word: 'go', russian_translation: 'идти', accepted_translations: ['ехать', 'отправляться'], example_en: 'Let\'s go to the park.', example_ru: 'Пойдём в парк.' },
  { english_word: 'come', russian_translation: 'приходить', accepted_translations: ['прийти'], example_en: 'Please come at 6 p.m.', example_ru: 'Пожалуйста, приходи в 6 вечера.' },
  { english_word: 'see', russian_translation: 'видеть', accepted_translations: ['увидеть'], example_en: 'I can see the mountains.', example_ru: 'Я вижу горы.' },
  { english_word: 'know', russian_translation: 'знать', example_en: 'I know the answer.', example_ru: 'Я знаю ответ.' },
  { english_word: 'like', russian_translation: 'нравиться', accepted_translations: ['любить', 'нравится'], example_en: 'I like music.', example_ru: 'Мне нравится музыка.' },
  { english_word: 'want', russian_translation: 'хотеть', example_en: 'I want to learn English.', example_ru: 'Я хочу выучить английский.' },
  { english_word: 'have', russian_translation: 'иметь', accepted_translations: ['есть', 'обладать'], example_en: 'I have two cats.', example_ru: 'У меня два кота.' },

  // ─── Прилагательные ───────────────────────────────────────────────────────
  { english_word: 'big', russian_translation: 'большой', accepted_translations: ['большая', 'большое', 'крупный'], example_en: 'This is a big city.', example_ru: 'Это большой город.' },
  { english_word: 'small', russian_translation: 'маленький', accepted_translations: ['маленькая', 'маленькое', 'небольшой'], example_en: 'I live in a small flat.', example_ru: 'Я живу в маленькой квартире.' },
  { english_word: 'happy', russian_translation: 'счастливый', accepted_translations: ['счастливая', 'счастлив', 'рад', 'радостный'], example_en: 'I am very happy today.', example_ru: 'Сегодня я очень счастлив.' },
  { english_word: 'tired', russian_translation: 'усталый', accepted_translations: ['устал', 'устала', 'утомлённый'], example_en: 'She is tired after work.', example_ru: 'После работы она устала.' },
  { english_word: 'new', russian_translation: 'новый', accepted_translations: ['новая', 'новое'], example_en: 'I have a new phone.', example_ru: 'У меня новый телефон.' },
  { english_word: 'old', russian_translation: 'старый', accepted_translations: ['старая', 'старое', 'пожилой'], example_en: 'This is an old building.', example_ru: 'Это старое здание.' },
  { english_word: 'beautiful', russian_translation: 'красивый', accepted_translations: ['красивая', 'прекрасный', 'красивое'], example_en: 'What a beautiful day!', example_ru: 'Какой красивый день!' },
  { english_word: 'fast', russian_translation: 'быстрый', accepted_translations: ['быстро', 'скорый'], example_en: 'He is a fast runner.', example_ru: 'Он быстрый бегун.' },
  { english_word: 'slow', russian_translation: 'медленный', accepted_translations: ['медленно', 'медленная'], example_en: 'The train is very slow.', example_ru: 'Поезд очень медленный.' },
  { english_word: 'easy', russian_translation: 'лёгкий', accepted_translations: ['простой', 'несложный', 'легко'], example_en: 'This task is easy.', example_ru: 'Это задание лёгкое.' },

  // ─── Существительные (бытовые) ────────────────────────────────────────────
  { english_word: 'car', russian_translation: 'машина', accepted_translations: ['автомобиль', 'авто'], example_en: 'My car is red.', example_ru: 'Моя машина красная.' },
  { english_word: 'phone', russian_translation: 'телефон', example_en: 'Where is my phone?', example_ru: 'Где мой телефон?' },
  { english_word: 'city', russian_translation: 'город', example_en: 'I live in a big city.', example_ru: 'Я живу в большом городе.' },
  { english_word: 'school', russian_translation: 'школа', example_en: 'She goes to school every day.', example_ru: 'Она ходит в школу каждый день.' },
  { english_word: 'street', russian_translation: 'улица', example_en: 'The shop is on this street.', example_ru: 'Магазин на этой улице.' },
  { english_word: 'coffee', russian_translation: 'кофе', example_en: 'I drink coffee every morning.', example_ru: 'Я пью кофе каждое утро.' },
  { english_word: 'dog', russian_translation: 'собака', accepted_translations: ['пёс'], example_en: 'My dog is very friendly.', example_ru: 'Моя собака очень дружелюбная.' },
  { english_word: 'cat', russian_translation: 'кот', accepted_translations: ['кошка'], example_en: 'The cat is sleeping.', example_ru: 'Кот спит.' },
  { english_word: 'music', russian_translation: 'музыка', example_en: 'I love music.', example_ru: 'Я люблю музыку.' },
  { english_word: 'weather', russian_translation: 'погода', example_en: 'The weather is nice today.', example_ru: 'Сегодня хорошая погода.' },
];

function seedVocabulary(): void {
  runMigrations();
  const db = getDb();

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO vocabulary_words
      (english_word, russian_translation, accepted_translations, example_en, example_ru)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((words: WordEntry[]) => {
    let inserted = 0;
    for (const w of words) {
      const result = insertStmt.run(
        w.english_word,
        w.russian_translation,
        JSON.stringify(w.accepted_translations ?? []),
        w.example_en ?? null,
        w.example_ru ?? null,
      );
      if (result.changes > 0) inserted++;
    }
    return inserted;
  });

  const inserted = insertMany(WORDS);
  logger.info({ total: WORDS.length, inserted, skipped: WORDS.length - inserted }, 'Словарь заполнен');
  console.log(`✅ Добавлено новых слов: ${inserted} (пропущено уже существующих: ${WORDS.length - inserted})`);
}

seedVocabulary();
closeDb();
