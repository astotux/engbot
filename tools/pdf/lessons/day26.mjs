import { head, tip, card, grid, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 26 · Грамматика связок', 'Предлоги: <em>in, on, at</em> и другие связки', 'Маленькие слова, которые соединяют время, место и движение в точную фразу.')}
<h2>⏰ Блок 1. Треугольник ВРЕМЕНИ — от большого к точке</h2>
${table(
  ['Предлог', 'Когда используем', 'Примеры с переводом'],
  [
    [
      'IN',
      '<b>Длинные периоды</b>: месяцы, годы, сезоны, века, части дня',
      '<b>in May</b> (в мае) · <b>in 2025</b> (в 2025 году) · <b>in winter</b> (зимой) · <b>in the morning / afternoon / evening</b> (утром / днём / вечером)',
    ],
    [
      'ON',
      '<b>Один конкретный день или дата</b> (всегда есть «день»)',
      '<b>on Monday</b> (в понедельник) · <b>on 5 May</b> (5 мая) · <b>on my birthday</b> (в мой день рождения) · <b>on Sunday morning</b> (в воскресное утро)',
    ],
    [
      'AT',
      '<b>Точное время на часах</b> и короткие моменты',
      '<b>at 7:00</b> (в 7:00) · <b>at night</b> (ночью) · <b>at noon</b> (в полдень) · <b>at midnight</b> (в полночь) · <b>at the weekend</b> (на выходных)',
    ],
  ]
)}
${tip('💡', 'Правило воронки', 'Представь воронку: широкий верх — <b>IN</b> (год, месяц, сезон), середина — <b>ON</b> (конкретный день и дата), узкая точка внизу — <b>AT</b> (час, минута, полночь).', 'info')}
<h2>📍 Блок 2. Треугольник МЕСТА — объём, поверхность, точка</h2>
${grid(3, [
  card(
    '📦 IN — внутри объёма',
    'Закрытое пространство, город, страна, легковая машина:<br>• <b>in a room</b> — в комнате<br>• <b>in London</b> — в Лондоне<br>• <b>in a box</b> — в коробке<br>• <b>in the park</b> — в парке<br>• <b>in a car</b> — в машине',
    'indigo'
  ),
  card(
    '🪪 ON — на поверхности',
    'Поверхность (горизонтальная/вертикальная), этажи, большой транспорт:<br>• <b>on the table</b> — на столе<br>• <b>on the wall / floor</b> — на стене / полу<br>• <b>on the first floor</b> — на 1-м этаже<br>• <b>on the bus / train / plane</b> — в автобусе / поезде / самолёте',
    'sky'
  ),
  card(
    '🎯 AT — в точке / функции',
    'Конкретная точка или функция места (не важно, внутри или снаружи):<br>• <b>at home</b> — дома<br>• <b>at work / school</b> — на работе / в школе<br>• <b>at the door</b> — у двери<br>• <b>at the bus stop / station</b> — на остановке / вокзале',
    'mint'
  ),
])}
`;

const page2 = `
<h2>🧭 Блок 3. 9 других незаменимых предлогов</h2>
${table(
  ['Предлог', 'Значение', 'Примеры с переводом'],
  [
    ['to', 'к, в (направление куда?)', '<b>I go to work.</b> — Я иду на работу. <b>Give it to me.</b> — Дай это мне.'],
    ['from', 'из, от (откуда?)', '<b>I am from Russia.</b> — Я из России. <b>From Monday to Friday.</b> — С пн по пт.'],
    ['with', 'с (кем? чем?)', '<b>Coffee with milk.</b> — Кофе с молоком. <b>Come with me.</b> — Пойдём со мной.'],
    ['for', 'для, ради, за', '<b>This gift is for you.</b> — Подарок для тебя. <b>Thank you for help.</b> — Спасибо за помощь.'],
    ['by', 'на (транспорте), у', '<b>I go by bus / by car / by metro.</b> — Я езжу на автобусе / машине / метро.'],
    ['about', 'о, про, около', '<b>A book about love.</b> — Книга о любви. <b>Tell me about your day.</b> — Расскажи о дне.'],
    ['under', 'под', '<b>The cat is under the table.</b> — Кот под столом.'],
    ['over', 'над, через', '<b>A lamp over the table.</b> — Лампа над столом.'],
    ['between', 'между (двумя)', '<b>The bank is between the cafe and the shop.</b> — Банк между кафе и магазином.'],
  ]
)}
<h2>⚠️ Блок 4. Главные ловушки и исключения</h2>
${grid(3, [
  card(
    '1. Утро vs Ночь',
    'Утро, день и вечер идут с <b>IN</b>: <b>in the morning</b>, <b>in the evening</b>.<br>Но ночь — всегда с <b>AT</b>: <b>at night</b>!',
    'amber'
  ),
  card(
    '2. Домой — без TO!',
    'С <b>home</b> после глаголов движения <b>to</b> НЕ ставится: <b>go home, come home, get home</b>.<br>А «быть дома» — <b>at home</b>.',
    'rose'
  ),
  card(
    '3. BY bus vs ON the bus',
    'Способ езды без артикля — <b>by bus, by train, by car</b> (пешком — <b>on foot</b>!).<br>Внутри с артиклем — <b>on the bus</b>.',
    'sky'
  ),
])}
${practice(
  [
    'I wake up ___ 7 o’clock ___ the morning.',
    'My birthday is ___ May, ___ 10 May.',
    'Your keys are ___ the table, not ___ the box.',
    'Let’s go ___ home now!',
    'She goes to work ___ bus, and now she is ___ the bus.',
    'The dog sleeps ___ night ___ the bed.',
  ],
  '<b>1</b> at, in · <b>2</b> in, on · <b>3</b> on, in · <b>4</b> — (без предлога: go home) · <b>5</b> by, on · <b>6</b> at, under (или on)'
)}
${checklist(
  [
    'Не путаю in, on, at со временем',
    'Различаю in, on, at для места',
    'Знаю 9 предлогов (to, from, with, for, by, about, under, over, between)',
    'Помню go home и at night',
  ],
  'Завтра — разбираем и навсегда исправляем 12 главных ошибок новичков.'
)}
`;

export default {
  day: 26,
  title: 'Предлоги: in, on, at и другие связки',
  pages: [page1, page2],
};
