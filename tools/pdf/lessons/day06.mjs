import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 6 · Числа и счёт', 'Числа <em>от 0 до миллиона</em>', 'Выучи числа до 20 — все остальные собираются по простой и логичной схеме.')}
<h2>Таблица чисел: 0–10, 11–19 (-teen) и десятки (-ty)</h2>
${table(['0–10 (база)', '11–19 (ударение на -teen!)', '20–90 (ударение на 1-й слог)'], [
  ['0 <b>zero</b> <span class="ipa">/ˈzɪərəʊ/</span> (oh <span class="ipa">/əʊ/</span>)', '11 <b>eleven</b> <span class="ipa">/ɪˈlevn/</span>', '20 <b>twenty</b> <span class="ipa">/ˈtwenti/</span>'],
  ['1 <b>one</b> <span class="ipa">/wʌn/</span>', '12 <b>twelve</b> <span class="ipa">/twelv/</span>', '30 <b>thirty</b> <span class="ipa">/ˈθɜːti/</span>'],
  ['2 <b>two</b> <span class="ipa">/tuː/</span>', '13 <b>thirteen</b> <span class="ipa">/ˌθɜːˈtiːn/</span>', '40 <b>forty</b> <span class="ipa">/ˈfɔːti/</span> (без буквы u!)'],
  ['3 <b>three</b> <span class="ipa">/θriː/</span>', '14 <b>fourteen</b> <span class="ipa">/ˌfɔːˈtiːn/</span>', '50 <b>fifty</b> <span class="ipa">/ˈfɪfti/</span>'],
  ['4 <b>four</b> <span class="ipa">/fɔː/</span>', '15 <b>fifteen</b> <span class="ipa">/ˌfɪfˈtiːn/</span>', '60 <b>sixty</b> <span class="ipa">/ˈsɪksti/</span>'],
  ['5 <b>five</b> <span class="ipa">/faɪv/</span>', '16 <b>sixteen</b> <span class="ipa">/ˌsɪksˈtiːn/</span>', '70 <b>seventy</b> <span class="ipa">/ˈsevnti/</span>'],
  ['6 <b>six</b> <span class="ipa">/sɪks/</span>', '17 <b>seventeen</b> <span class="ipa">/ˌsevnˈtiːn/</span>', '80 <b>eighty</b> <span class="ipa">/ˈeɪti/</span>'],
  ['7 <b>seven</b> <span class="ipa">/ˈsevn/</span>', '18 <b>eighteen</b> <span class="ipa">/ˌeɪˈtiːn/</span>', '90 <b>ninety</b> <span class="ipa">/ˈnaɪnti/</span>'],
  ['8 <b>eight</b> <span class="ipa">/eɪt/</span> · 9 <b>nine</b> <span class="ipa">/naɪn/</span>', '19 <b>nineteen</b> <span class="ipa">/ˌnaɪnˈtiːn/</span>', '10 <b>ten</b> <span class="ipa">/ten/</span> · 100 <b>one hundred</b>'],
], false)}
${formula('Составные числа 21–99 (через дефис): 21 = <i>twenty-one</i> · 35 = <i>thirty-five</i> · 99 = <i>ninety-nine</i>')}
${tip('⚠️', 'Ловушка на слух: как не перепутать 13 (thirteen) и 30 (thirty)', '• <b>13 — thirteen</b> <span class="ipa">/ˌθɜːˈtiːn/</span>: долгий звук и главное ударение <b>НА КОНЦЕ</b> («фё-ТИИИН»).<br>• <b>30 — thirty</b> <span class="ipa">/ˈθɜːti/</span>: ударение <b>НА ПЕРВОМ слоге</b>, конец короткий («ФЁ-ти»).', 'warn')}
`;

const page2 = `
<h2>Большие и порядковые числительные (какой по счёту?)</h2>
${table(['Число / порядок', 'По-английски', 'Важное правило'], [
  ['100 / 250', '<b>one hundred</b> · <b>two hundred and fifty</b>', 'Без <b>-s</b> в точных числах: <i>two hundred</i> (не <s>hundreds</s>!)'],
  ['1 000 / 1 000 000', '<b>one thousand</b> · <b>one million</b>', '<i>three thousand</i> (3 000), <i>five million</i> (5 000 000)'],
  ['1st · 2nd · 3rd', '<b>first</b> (1-й) · <b>second</b> (2-й) · <b>third</b> (3-й)', 'Особые формы — используются в датах и этажах (the first floor)'],
  ['4th · 5th · 12th · 20th · 21st', '<b>fourth · fifth · twelfth · twentieth · twenty-first</b>', 'К обычным числам добавляем <b>-th</b> <span class="ipa">/θ/</span>'],
], false)}
<h2>Где пригодятся числа в реальной жизни</h2>
${grid(3, [
  card('📞 Телефон', 'Читаем <b>по одной цифре</b>! 0 = <b>oh</b> <span class="ipa">/əʊ/</span> или zero. Две подряд = <b>double</b>.<br><i>0-7-9 → oh seven nine<br>5-5-2 → double five two</i>', 'indigo'),
  card('💷 Цена', '<b>$20</b> = twenty dollars.<br><b>$5.50</b> = five fifty (разговорно) или five dollars fifty.', 'amber'),
  card('🎂 Возраст', 'Используем глагол <b>to be</b>:<br><b>I am twenty-five.</b><br><i>(или I am twenty-five years old.)</i>', 'mint'),
])}
${practice(
  [
    'Напиши словами числа: <b>12, 15, 40</b>.',
    'Переведи на английский: <b>35</b> и <b>250</b>.',
    'Как сказать «первый, второй, третий»?',
    'Прочитай номер телефона: <b>0 – 7 – 7 – 3</b>.',
    'Скажи по-английски: «Мне 25 лет».',
    'Где ударение в слове <b>thirteen (13)</b>?',
  ],
  '<b>1</b> twelve, fifteen, forty · <b>2</b> thirty-five, two hundred and fifty · <b>3</b> first, second, third · <b>4</b> oh double seven three · <b>5</b> I am twenty-five. · <b>6</b> На конце (-teen)'
)}
${checklist(
  [
    'Считаю от 0 до 100 и знаю hundred, thousand, million',
    'Чётко различаю на слух -teen (13–19) и -ty (20–90)',
    'Знаю порядковые: first, second, third, fourth, fifth',
    'Могу назвать цену, возраст и продиктовать телефон',
  ],
  'День 7 — большое повторение и закрепление всей первой недели курса!'
)}
`;

export default {
  day: 6,
  title: 'Числа и счёт: от 0 до миллиона',
  pages: [page1, page2],
};
