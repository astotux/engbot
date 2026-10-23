import { head, tip, card, grid, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 5 · Артикли и мн. число', 'Артикли <em>a / an / the</em> и множественное число', 'Маленькие слова перед существительными и правила, как из одного предмета сделать много.')}
${grid(3, [
  card('a — один из многих', 'Перед <b>согласным ЗВУКОМ</b> (только ед. число):<br><b>a book, a car, a dog, a university</b> <span class="ipa">/ˌjuːnɪˈvɜːsəti/</span>', 'indigo'),
  card('an — один из многих', 'Перед <b>гласным ЗВУКОМ</b> (только ед. число):<br><b>an apple, an egg, an hour</b> <span class="ipa">/ˈaʊə/</span> (h молчит!)', 'amber'),
  card('the — тот самый', 'Конкретный, уже знакомый или единственный в мире:<br><b>the sun, the moon, the book</b>', 'mint'),
])}
${tip('💡', 'Золотое правило: выбираем a / an по ЗВУКУ, а не по букве!', '• <b>an hour</b> <span class="ipa">/ˈaʊə/</span> — буква <b>h</b> не читается, слово начинается с гласного звука → ставим <b>an</b>.<br>• <b>a university</b> <span class="ipa">/ˌjuːnɪˈvɜːsəti/</span> — буква <b>u</b> даёт согласный звук <span class="ipa">/j/</span> («ю») → ставим <b>a</b>.', 'good')}
<h2>Когда какой артикль ставить</h2>
${table(['Ситуация', 'Артикль', 'Пример', 'Перевод'], [
  ['Первое упоминание (один предмет)', '<b>a / an</b>', 'It is <b>a</b> dog.', 'Это собака (какая-то одна).'],
  ['Второе упоминание (тот самый)', '<b>the</b>', '<b>The</b> dog is big.', 'Эта (та самая) собака — большая.'],
  ['Единственный в мире', '<b>the</b>', '<b>the</b> sun, <b>the</b> moon, <b>the</b> internet', 'солнце, луна, интернет'],
  ['Профессия в единственном числе', '<b>a / an</b>', 'She is <b>a</b> doctor.', 'Она врач (нельзя <s>She is doctor</s>!).'],
  ['Мн. число (вообще) и неисчисляемые', '<b>— (нет)</b>', 'Dogs are cute. Tea is hot.', 'Собаки милые. Чай горячий.'],
  ['Имена, страны, города, языки', '<b>— (нет)</b>', 'Anna, Russia, Italy, English', 'Анна, Россия, Италия, английский'],
])}
${tip('⚠️', 'Две частые ошибки новичков', '<b>1.</b> Перед профессией в ед. ч. обязателен артикль: <b>He is a teacher</b> (не <s>He is teacher</s>). <b>2.</b> Артикли <b>a / an</b> никогда не ставятся со множественным числом: только <b>books</b> или <b>the books</b> (не <s>a books</s>).', 'warn')}
`;

const page2 = `
<h2>Множественное число: 4 правила окончаний</h2>
${table(['Правило', 'Окончание', 'Примеры'], [
  ['Большинство слов', '<b>+ s</b>', 'book → <b>books</b>, cat → <b>cats</b>, car → <b>cars</b>, dog → <b>dogs</b>'],
  ['После свистящих -s, -x, -ch, -sh, -o', '<b>+ es</b>', 'bus → <b>buses</b>, box → <b>boxes</b>, watch → <b>watches</b>, dish → <b>dishes</b>'],
  ['Согласная + y (но гласная + y → +s)', '<b>y → ies</b>', 'city → <b>cities</b>, baby → <b>babies</b> · но: boy → <b>boys</b>, day → <b>days</b>'],
  ['Слова на -f / -fe', '<b>f/fe → ves</b>', 'knife → <b>knives</b>, wife → <b>wives</b>, leaf → <b>leaves</b>'],
])}
<h2>8 главных слов-исключений (выучи наизусть!)</h2>
${table(['Единственное → Множественное', 'Произношение', 'Перевод'], [
  ['man → <b>men</b> · woman → <b>women</b>', '<span class="ipa">/mæn/ → /men/</span> · <span class="ipa">/ˈwʊmən/ → /ˈwɪmɪn/</span>', 'мужчина → мужчины · женщина → женщины'],
  ['child → <b>children</b> · person → <b>people</b>', '<span class="ipa">/tʃaɪld/ → /ˈtʃɪldrən/</span> · <span class="ipa">/ˈpɜːsn/ → /ˈpiːpl/</span>', 'ребёнок → дети · человек → люди'],
  ['foot → <b>feet</b> · tooth → <b>teeth</b>', '<span class="ipa">/fʊt/ → /fiːt/</span> · <span class="ipa">/tuːθ/ → /tiːθ/</span>', 'стопа → стопы · зуб → зубы'],
  ['mouse → <b>mice</b> · sheep → <b>sheep</b>', '<span class="ipa">/maʊs/ → /maɪs/</span> · <span class="ipa">/ʃiːp/ → /ʃiːp/</span>', 'мышь → мыши · овца → овцы (не меняется!)'],
])}
${practice(
  [
    'Поставь <b>a</b> или <b>an</b>: ___ apple, ___ book, ___ hour, ___ university.',
    'Вставь артикль: It is ___ cat. ___ cat is black.',
    'Образуй мн. число: <b>bus → ___, city → ___, knife → ___</b>.',
    'Мн. число исключений: <b>child → ___, woman → ___, person → ___</b>.',
    'Исправь ошибку: <b>He is teacher.</b>',
    'Переведи на английский: «Они врачи».',
  ],
  '<b>1</b> an, a, an, a · <b>2</b> a, The · <b>3</b> buses, cities, knives · <b>4</b> children, women, people · <b>5</b> He is a teacher. · <b>6</b> They are doctors.'
)}
${checklist(
  [
    'Различаю a и an по первому звуку (an hour, a university)',
    'Понимаю разницу между a/an (любой) и the (конкретный)',
    'Образую множественное число на -s, -es, -ies, -ves',
    'Знаю наизусть 8 исключений (men, women, children, people…)',
  ],
  'День 6 — числа от 0 до миллиона, цены, телефон и возраст.'
)}
`;

export default {
  day: 5,
  title: 'Артикли a/an/the и множественное число',
  pages: [page1, page2],
};
