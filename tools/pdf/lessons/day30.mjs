import { head, tip, card, grid, table, checklist } from '../lib.mjs';

const page1 = `
${head('День 30 · Торжественный финал', 'Финал: <em>5 минут речи о себе</em>', 'Собираем всё, что ты выучил(а) за 30 дней, в большой красивый монолог из 5 блоков и письмо другу!')}
<h2>🧱 Конструктор «5 минут речи о себе» — 5 готовых блоков</h2>
${table(
  ['Блок и грамматика', 'Готовые шаблоны (подставь свои слова)', 'Пример живых фраз'],
  [
    [
      '1. Кто я: визитка<br><span class="pill i">to be: am / is / are</span>',
      '<b>Hello! My name is [Имя]. I am [число] years old. I am from [страна/город]. I am a/an [профессия]. My family is…</b>',
      'Hello! My name is Alex. I am 28 years old, and I am from Moscow. I am a manager, and my wife is a doctor.',
    ],
    [
      '2. Жизнь и привычки<br><span class="pill s">Present Simple + in/on/at</span>',
      '<b>I live in [город] in a nice flat. On weekdays I usually get up at [время], drink coffee and go to work by [транспорт]. In the evening I come home at…</b>',
      'I live in a big flat with my family. I usually get up at 7:00 in the morning, drink coffee with milk and go to work by metro.',
    ],
    [
      '3. Что умею и люблю<br><span class="pill m">can / like / love</span>',
      '<b>I can [глагол V1] very well, and now I can speak English! I love [сущ.]. In my free time I like to [глагол V1]…</b>',
      'I can cook Italian food, drive a car and speak English! I love warm weather. At the weekend I like to read books and watch films.',
    ],
    [
      '4. Моё прошлое<br><span class="pill a">Past Simple (V2 / -ed)</span>',
      '<b>Last summer / year I went to [место], and it was great! Yesterday I had a busy day: I worked, bought [что] and met…</b>',
      'A month ago I started this course. Yesterday I woke up early, worked hard, and in the evening I met my friend in a cosy cafe.',
    ],
    [
      '5. Планы и мечты<br><span class="pill r">going to / will / would like</span>',
      '<b>Tomorrow I am going to [V1]. Next year I am going to travel to [место]. I would like to see [место]. I will practice English every day!</b>',
      'Tomorrow I am going to relax with my family. Next summer I am going to visit Italy. And I will practice English every day!',
    ],
  ],
  false
)}
<h2>🎤 Пример готового монолога целиком (прочитай вслух с таймером!)</h2>
${card(
  'Мой рассказ о себе на английском (уровень A1–A2)',
  '«<b>Hello! My name is Dmitry. I am 29 years old, and I am from Ekaterinburg. I am an engineer, and my wife Anna is a designer.</b> We live in a comfortable flat near the park. On weekdays I usually wake up at 7 o’clock in the morning, eat breakfast and go to work by car. I come home at 6:30 in the evening. <b>I can swim, cook delicious pasta and drive a car — and now I can speak English!</b> In my free time I love good music and like to play football with my friends. <b>Last summer we went to the mountains, and the weather was wonderful. Yesterday I had a great day:</b> I worked, bought a nice gift for my mother and watched an interesting film at night. <b>What about my future? Tomorrow I am going to rest and walk in the park.</b> Next year we are going to travel to Spain. I would like to see Madrid and the sea. <b>I think everything will be great, and I will practice English every day!</b>»',
  'indigo'
)}
`;

const page2 = `
<h2>✉️ Шаблон письма другу по переписке (Penpal Letter)</h2>
${grid(2, [
  card(
    'Структура дружеского письма',
    '<b>1. Приветствие:</b> <i>Dear [Имя]! Nice to meet you!</i><br><b>2. О себе и буднях (Блоки 1–2):</b> кто ты, откуда, где живёшь и кем работаешь.<br><b>3. Вкусы и таланты (Блок 3):</b> что умеешь (<i>I can…</i>) и любишь (<i>I love / I like to…</i>).<br><b>4. Прошлое и планы (Блоки 4–5):</b> что делал(а) вчера и куда собираешься (<i>I am going to…</i>).<br><b>5. Вопросы другу + подпись:</b> задай 2–3 вопроса и подпиши: <i>Best wishes, [Твоё имя]</i>.',
    'sky'
  ),
  card(
    'Образец письма другу Алексу в Лондон',
    '<i><b>Dear Alex! Nice to meet you!</b><br>My name is Olga, I am 26 years old, and I am from Russia. I live in Kazan and work as a designer. I usually get up at 8:00 and work from home.<br>I can draw and cook well, and I love tea with lemon and good books. Yesterday I walked in the city centre and met my sister. Next summer I am going to visit Italy!<br><b>What about you? Where do you work in London? What do you like to do at the weekend?</b> Write to me soon!<br><b>Best wishes, Olga.</b></i>',
    'w'
  ),
])}
<h2>🏆 Поздравляем с выпускным! Что ты освоил(а) за 30 дней</h2>
${grid(3, [
  card(
    '🔤 Фундамент и словарь',
    'Алфавит, правила чтения, артикли, числа, даты, время на часах, семья, дом, еда, одежда, погода, город, магазин и кафе.',
    'mint'
  ),
  card(
    '⚙️ Вся базовая грамматика',
    'Глагол <b>to be</b>, <b>Present Simple</b>, <b>Past Simple</b> (+ 30 неправ. глаголов), будущее с <b>will</b> и <b>going to</b>, модальные и предлоги.',
    'amber'
  ),
  card(
    '🗣 Живая речь и письмо',
    'Умение задавать вопросы, вести диалоги в поездке, писать сообщения и рассказывать о себе в 3 временах!',
    'indigo'
  ),
])}
${tip('🚀', 'Твой следующий шаг прямо в боте @engbot', 'Курс пройден, но практика продолжается! В главном меню бота тебя ждут:<br>• 📚 <b>Тренажёр словарного запаса по уровням:</b> <b>A1–A2</b> (закрепить базу), <b>B1–B2</b> (средний уровень для бесед и поездок) и <b>C1–C2</b> (продвинутый уровень для фильмов, книг и работы).<br>• 🧠 <b>Интерактивные тесты</b> для проверки уровня и ежедневной тренировки памяти.', 'good')}
${checklist(
  [
    'Собрал(а) свой рассказ по 5 блокам',
    'Прочитал(а) монолог вслух 2–3 раза с выражением',
    'Написал(а) письмо другу с 2–3 вопросами',
    'Прошёл(ла) все 30 дней курса до победного финала!',
  ],
  'Переходи в меню бота к тренировке слов A1–C2 и проверочным тестам. В добрый путь! 🌟'
)}
`;

export default {
  day: 30,
  title: 'Финал: 5 минут речи о себе, прошлом и будущем',
  pages: [page1, page2],
};
