import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 14 · Итоги недели 2', 'Повторение <em>дней 8–13</em>', 'Время и даты, 80+ существительных, 40 глаголов и прилагательные — вся неделя в одной шпаргалке.')}
<h2>1. Дни недели, месяцы и время (День 8)</h2>
${grid(2, [
  card('Дни недели и месяцы (с заглавной!)', '<b>Дни:</b> Monday, Tuesday, Wednesday <span class="ipa">/ˈwenzdeɪ/</span>, Thursday, Friday, Saturday, Sunday.<br><b>Месяцы:</b> January, February, March, April, May, June, July, August, September, October, November, December.', 'indigo'),
  card('Который час? — What time is it?', '<b>7:00</b> — It is seven o’clock · <b>7:15</b> — quarter past seven<br><b>7:30</b> — half past seven · <b>7:45</b> — quarter to eight<br><b>Части дня:</b> in the morning / afternoon / evening, <b>at</b> night.', 'sky'),
])}
<p class="small"><b>Маркеры:</b> today (сегодня), tomorrow (завтра), yesterday (вчера), now (сейчас), always (всегда), usually (обычно), often (часто), sometimes (иногда), never (никогда).</p>
<h2>2. Существительные: семья, дом, тело, еда, город, работа (Дни 9–10)</h2>
${table(['Тема', 'Ключевые слова недели'], [
  ['Семья и люди', 'man, woman, child, friend, family, mother, father, brother, sister, son, daughter, husband, wife, teacher, doctor, student'],
  ['Дом и тело', 'house, room, kitchen, bedroom, bathroom, door, window, table, chair, bed, key, phone · head, eye, ear, nose, mouth, hand, arm, leg, foot, heart'],
  ['Еда и напитки', 'bread, water, milk, coffee, tea, juice, meat, fish, egg, cheese, apple, rice, soup, salad, sugar, breakfast'],
  ['Город и дорога', 'street, shop, bank, hospital, school, park, station, airport, hotel, restaurant, bridge, market · car, bus, train, plane, taxi, bike, ticket, road'],
  ['Работа и деньги', '<b>job</b> (должность, a job), <b>work</b> (труд, без a), office, money, price, meeting, company, boss · <i>This is my mother. These are my friends.</i>'],
], false)}
${tip('⚠️', 'Неисчисляемые: a/an vs some', '<b>water, milk, coffee, tea, juice, soup, bread, cheese, meat, fish, rice, sugar, money</b> — неисчисляемые! Нельзя ставить <b>a/an</b> и <b>-s</b>: говорим <b>some water, some bread, some money</b>. С to be — <b>is</b> (<i>My money is here</i>).', 'warn')}
`;

const page2 = `
<h2>3. 40 главных глаголов (Дни 11–12)</h2>
${grid(2, [
  card('Глаголы 1–20', '<b>be, have, do, go, come, get, make, take, see, look, watch, hear, listen, say, tell, speak, know, think, want, need</b>', 'w'),
  card('Глаголы 21–40', '<b>like, love, eat, drink, live, work, study, read, write, buy, give, find, help, try, call, ask, wait, open, play, sleep</b>', 'w'),
])}
<p class="small"><b>Различия:</b> see (видеть) / look at (смотреть на) / watch (смотреть ТВ) · say hello / tell me / speak English.<br><b>Связки:</b> get up (вставать), wake up (просыпаться), sit down (садиться), stand up (вставать), look for (искать), wait for (ждать), listen to (слушать), ask for (просить).</p>
<h2>4. Прилагательные, цвета и чувства (День 13)</h2>
${grid(3, [
  card('Антонимы', 'big — small, long — short, hot — cold, new — old, good — bad, easy — difficult, fast — slow, happy — sad, cheap — expensive, rich — poor, clean — dirty, near — far, early — late, strong — weak', 'amber'),
  card('Цвета', 'red, blue, green, yellow, purple, orange, pink, black, white, grey, brown', 'sky'),
  card('Чувства', 'tired (уставший), hungry (голодный), angry (злой), busy (занятый), afraid (испуганный), bored (скучающий), excited (взволнованный), worried (обеспокоенный)', 'rose'),
])}
${tip('💡', 'Два золотых правила прилагательных', '1) Прилагательное стоит <b>ПЕРЕД</b> существительным: <b>a big house, hot tea, a new car</b>. 2) НЕ меняется по родам и числам: <b>a good friend — good friends</b>.', 'good')}
${practice(
  [
    'Как сказать «7:30» по-английски?',
    'День недели между Tuesday и Thursday?',
    'Выбери: <b>a bread</b> или <b>some bread</b>?',
    'Выбери: We <b>(see / look / watch)</b> TV.',
    'Предлоги: listen ___ music; wait ___ a bus.',
    'Антоним к слову <b>cheap</b> (дешёвый)?',
    'Переведи: «большой новый дом» (с артиклем).',
    'Переведи: «Я голодный и уставший».',
  ],
  '<b>1</b> half past seven · <b>2</b> Wednesday · <b>3</b> some bread · <b>4</b> watch · <b>5</b> to; for · <b>6</b> expensive · <b>7</b> a big new house · <b>8</b> I am hungry and tired.'
)}
${checklist(
  [
    'Называю дни, месяцы и время',
    'Знаю слова: семья, дом, еда, город, работа',
    'Не говорю a water / a money',
    'Знаю 40 глаголов и ставлю прил. перед сущ.',
  ],
  'День 15 — Present Simple: настоящее время во всех лицах и окончание -s!'
)}
`;

export default {
  day: 14,
  title: 'Повторение дней 8–13: итоги второй недели',
  pages: [page1, page2],
};
