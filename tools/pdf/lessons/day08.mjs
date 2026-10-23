import { head, tip, card, grid, formula, table, words, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 8 · Время и даты', 'Время <em>и даты</em>', 'Дни недели, месяцы, часы — и как сказать, как часто ты что-то делаешь.')}
<h2>📅 Дни недели и 12 месяцев</h2>
${grid(2, [
  `<div>${table(['День', 'Произношение', 'Перевод'], [
    ['Monday', '<span class="ipa">/ˈmʌndeɪ/</span> «мандэй»', 'понедельник'],
    ['Tuesday', '<span class="ipa">/ˈtjuːzdeɪ/</span> «тьюздэй»', 'вторник'],
    ['Wednesday', '<span class="ipa">/ˈwenzdeɪ/</span> (d молчит)', 'среда'],
    ['Thursday', '<span class="ipa">/ˈθɜːzdeɪ/</span> «тёрздэй»', 'четверг'],
    ['Friday', '<span class="ipa">/ˈfraɪdeɪ/</span> «фрайдэй»', 'пятница'],
    ['Saturday', '<span class="ipa">/ˈsætədeɪ/</span> «сэтэдэй»', 'суббота'],
    ['Sunday', '<span class="ipa">/ˈsʌndeɪ/</span> «сандэй»', 'воскресенье'],
  ])}</div>`,
  `<div>${words([
    ['January', 'январь'], ['February', 'февраль'],
    ['March', 'март'], ['April', 'апрель'],
    ['May', 'май'], ['June', 'июнь'],
    ['July', 'июль'], ['August', 'август'],
    ['September', 'сентябрь'], ['October', 'октябрь'],
    ['November', 'ноябрь'], ['December', 'декабрь'],
  ])}
  ${tip('⚠️', 'Всегда с заглавной буквы', 'Дни и месяцы пишутся с большой буквы: <b>Monday, May</b>. Фразы: <b>Today is Monday. Tomorrow is Tuesday.</b>', 'warn')}
  </div>`,
])}
<h2>⏰ Который час? — What time is it?</h2>
${formula("What time is it? <span>→</span> It is five o'clock. / It is half past five.")}
${table(['Время', 'По-английски', 'Правило'], [
  ['5:00', "It is five o'clock.", 'ровно час — добавляем <b>o’clock</b>'],
  ['5:10 / 5:20', 'It is ten / twenty <b>past</b> five.', 'до 30 минут (правая половина) — минуты + <b>past</b> + час'],
  ['5:15 / 5:45', 'It is <b>a quarter past</b> five / <b>to</b> six.', '<b>a quarter</b> = четверть (15 минут)'],
  ['5:30', 'It is <b>half past</b> five.', 'половина ПОСЛЕ пяти (не говори <i>half six</i>!)'],
  ['5:40 / 5:50', 'It is twenty / ten <b>to</b> six.', 'после 30 минут (левая половина) — минуты до + <b>to</b> + след. час'],
])}
`;

const page2 = `
<h2>🌤 Части суток и слова времени</h2>
${grid(2, [
  card('Части суток и приветствия', '<b>in the morning</b> — утром (Good morning!)<br><b>in the afternoon</b> — днём (Good afternoon!)<br><b>in the evening</b> — вечером (Good evening!)<br><b>at night</b> — ночью (Good night — перед сном)', 'sky'),
  card('Сейчас, сегодня, завтра, вчера', '<b>now</b> — сейчас · <b>today</b> — сегодня<br><b>tomorrow</b> — завтра · <b>yesterday</b> — вчера<br><i>I am at home now. Tomorrow is Friday.</i>', 'amber'),
])}
<h2>🔁 Как часто? и 📆 Какое сегодня число?</h2>
${grid(2, [
  card('Шкала частоты (после am / is / are)', '<span class="pill i">always 100%</span> всегда · <span class="pill s">usually 80%</span> обычно · <span class="pill m">often 60%</span> часто · <span class="pill a">sometimes 30%</span> иногда · <span class="pill r">never 0%</span> никогда<br><i>I am <b>always</b> at home. She is <b>usually</b> at work. He is <b>never</b> at school on Sunday.</i>', 'indigo'),
  card('What is the date today?', '<b>Today is the fifth of May.</b> / <b>It is May 5th.</b><br>Порядковые: <b>first</b> (1st), <b>second</b> (2nd), <b>third</b> (3rd), <b>fourth</b> (4th), <b>fifth</b> (5th)… дальше <b>-th</b>.<br><i>My birthday is on the first of June.</i>', 'mint'),
])}
${practice(
  [
    'Какой день идёт после <b>Wednesday</b>?',
    'Как правильно: <b>tuesday</b> или <b>Tuesday</b>?',
    'Какой месяц идёт после <b>March</b>?',
    'Прочитай время: <b>7:00</b> и <b>9:30</b>.',
    'Как сказать <b>3:45</b> по-английски?',
    'Переведи: «иногда» и «5 мая».',
  ],
  "<b>1</b> Thursday · <b>2</b> Tuesday · <b>3</b> April · <b>4</b> It is seven o'clock; It is half past nine · <b>5</b> It is a quarter to four · <b>6</b> sometimes; the fifth of May"
)}
${checklist(
  [
    'Знаю 7 дней недели и 12 месяцев (с заглавной!)',
    "Называю время (o'clock, past, to, half, quarter)",
    'Знаю in the morning / at night и always — never',
    'Могу назвать сегодняшнюю дату',
  ],
  'День 9 — существительные: семья, люди, дом и части тела.'
)}
`;

export default {
  day: 8,
  title: 'Время и даты',
  pages: [page1, page2],
};
