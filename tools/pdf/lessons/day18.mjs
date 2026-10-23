import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 18 · Вопросы', 'Вопросительные <em>слова</em>', 'Десять слов, с которыми можно спросить почти обо всём, и фразы, чтобы попросить повторить.')}
<h2>Таблица вопросительных слов (Wh-questions)</h2>
${table(['Слово', 'Перевод', 'Пример с переводом'], [
  ['what /wɒt/', 'что, какой', '<b>What</b> is your name? — Как тебя зовут?'],
  ['where /weə/', 'где, куда, откуда', '<b>Where</b> are you from? — Откуда ты?'],
  ['when /wen/', 'когда', '<b>When</b> is your birthday? — Когда твой день рождения?'],
  ['who /huː/', 'кто, кого', '<b>Who</b> is he? — Кто он?'],
  ['why /waɪ/', 'почему, зачем', '<b>Why</b> are you sad? — Почему ты грустный?'],
  ['how /haʊ/', 'как', '<b>How</b> are you? — Как дела?'],
  ['which /wɪtʃ/', 'какой (из нескольких)', '<b>Which</b> book do you want? — Какую книгу ты хочешь?'],
  ['how much', 'сколько (неисчисл., цена)', '<b>How much</b> is it? — Сколько это стоит?'],
  ['how many', 'сколько (исчисляемое)', '<b>How many</b> brothers do you have? — Сколько у тебя братьев?'],
  ['whose /huːz/', 'чей', '<b>Whose</b> bag is this? — Чья это сумка?'],
])}
<h2>Две главные формулы вопросов</h2>
${grid(2, [
  card('1. С глаголом to be (am / is / are)', '<b>Вопр. слово + am / is / are + подлежащее?</b><br>What is your name? · Where are you from? · How old are you? · Who is she? · When is the lesson?', 'indigo'),
  card('2. С глаголом действия (do / does)', '<b>Вопр. слово + do / does + подлежащее + глагол?</b><br>Where do you live? · What does she do? · When do they work? · Why does he study? · What time does she get up?', 'sky'),
])}
`;

const page2 = `
${tip('⚠️', 'Частые ошибки и особый случай с Who', '❌ <i>Where you live?</i> → ✅ <b>Where do you live?</b> &nbsp;|&nbsp; ❌ <i>Where does he lives?</i> → ✅ <b>Where does he live?</b><br><b>Who без помощника:</b> когда <b>who</b> — подлежащее («кто делает?»), do/does не нужен, глагол с <b>-s</b>: <b>Who lives here? Who works in a bank?</b> А к дополнению («кого?»): <b>Who do you like?</b>', 'warn')}
<h2>How much vs How many и полезные вопросы</h2>
${grid(2, [
  card('How many vs How much', '<b>how many</b> + исчисл. мн.ч.: <i>How many apples / friends?</i><br><b>how much</b> + неисчисл.: <i>How much water / money?</i><br>Цена: <i>How much is this bag? / are these shoes?</i>', 'amber'),
  card('Вопросы на каждый день', '<b>What do you do?</b> — Кем ты работаешь?<br><b>Where do you live?</b> — Где ты живёшь?<br><b>What time is it?</b> — Который час?', 'mint'),
])}
<h2>Спасательные фразы, когда не понял собеседника</h2>
${table(['Фраза по-английски', 'Перевод'], [
  ['Sorry? / Pardon? / I don’t understand.', 'Простите? / Что-что? / Я не понимаю.'],
  ['Could you say it again, please?', 'Повторите, пожалуйста.'],
  ['Could you speak more slowly, please?', 'Говорите помедленнее, пожалуйста.'],
  ['What does «...» mean? / How do you say «...» in English?', 'Что значит «...»? / Как сказать «...» по-английски?'],
])}
${practice(
  [
    '___ is your name? (Как зовут?)',
    '___ are you from? (Откуда ты?)',
    '___ old are you? (Сколько лет?)',
    '___ do you live? (Где живёшь?)',
    '___ does she work? (Где/когда работает?)',
    '___ is it? (Сколько стоит — цена)',
    '___ brothers do you have? (Сколько братьев)',
    '___ bag is this? (Чья сумка)',
  ],
  '<b>1</b> What · <b>2</b> Where · <b>3</b> How · <b>4</b> Where · <b>5</b> Where / When · <b>6</b> How much · <b>7</b> How many · <b>8</b> Whose'
)}
${checklist(
  [
    'Знаю 10 вопросительных слов',
    'Строю вопросы с is/are и с do/does',
    'Отличаю how much и how many',
    'Могу попросить собеседника повторить',
  ],
  'День 19 — модальные глаголы: can, must, should и вежливые просьбы.'
)}
`;

export default {
  day: 18,
  title: 'Вопросительные слова',
  pages: [page1, page2],
};
