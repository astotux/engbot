import { head, tip, card, grid, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 7 · Итоги недели 1', 'Повторение <em>первой недели</em>', 'Алфавит, правила чтения, местоимения, глагол to be, артикли, множественное число и числа — вся база в одном конспекте.')}
<h2>1. Алфавит, звуки и правила чтения (Дни 1–2)</h2>
${grid(2, [
  card('Алфавит (26 букв → 44 звука)', '<b>5 гласных:</b> A, E, I, O, U · <b>21 согласная</b>.<br>Не путай на слух: <b>B–V, G–J, E–I</b>. Двойная буква: <b>double M</b>.<br>Особые звуки: <span class="ipa">/θ/</span> <i>think</i>, <span class="ipa">/ð/</span> <i>this</i>, <span class="ipa">/w/</span> <i>we</i>, <span class="ipa">/h/</span> <i>hello</i>, долгота <span class="ipa">/ɪ/–/iː/</span> (<i>sit–seat</i>).', 'indigo'),
  card('Команды букв и магическая e', '<b>sh</b> «ш» (<i>ship</i>) · <b>ch</b> «ч» (<i>chair</i>) · <b>ph</b> «ф» (<i>phone</i>) · <b>ck</b> «к» · <b>ng</b> <span class="ipa">/ŋ/</span> · <b>tion</b> «шн» · <b>igh</b> «ай» (<i>night</i>) · <b>ee/ea</b> «иː» · <b>oo</b> «у» · <b>ou/ow</b> «ау/оу».<br><b>Магическая e:</b> <i>cap → cape, kit → kite, hop → hope</i>.', 'sky'),
])}
${tip('⚠️', '10 слов-исключений первой недели', '<b>one</b> <span class="ipa">/wʌn/</span> · <b>two</b> <span class="ipa">/tuː/</span> · <b>people</b> <span class="ipa">/ˈpiːpl/</span> · <b>said</b> <span class="ipa">/sed/</span> · <b>friend</b> <span class="ipa">/frend/</span> · <b>want</b> <span class="ipa">/wɒnt/</span> · <b>often</b> <span class="ipa">/ˈɒfn/</span> · <b>know</b> <span class="ipa">/nəʊ/</span> · <b>you</b> <span class="ipa">/juː/</span> · <b>listen</b> <span class="ipa">/ˈlɪsn/</span>.', 'amber')}
<h2>2. Местоимения и глагол to be (Дни 3–4)</h2>
${table(['Личное → Притяж.', 'Форма to be (+ / −)', 'Вопрос и краткий ответ', 'Примеры для рассказа о себе'], [
  ['<b>I → my</b> (я → мой)', '<b>I am (I’m)</b> / I’m not', '<b>Am I…?</b> — Yes, you are.', '<b>My name is Anna. I am 25.</b>'],
  ['<b>he / she / it → his / her / its</b>', '<b>is (’s)</b> / isn’t', '<b>Is she…?</b> — Yes, she is. / No, she isn’t.', '<b>She is a doctor. He is from Spain.</b>'],
  ['<b>we / you / they → our / your / their</b>', '<b>are (’re)</b> / aren’t', '<b>Are you…?</b> — Yes, I am. / No, I’m not.', '<b>We are friends. Are you a teacher?</b>'],
], false)}
${tip('💡', 'Главное правило предложения', 'В английском нельзя пропускать глагол-связку: <s>I student</s> → <b>I am a student.</b> Местоимение <b>I</b> всегда пишется с большой буквы!', 'good')}
`;

const page2 = `
<h2>3. Артикли, множественное число и числа (Дни 5–6)</h2>
${grid(2, [
  card('Артикли a / an / the', '• <b>a</b> + согласный звук: <i>a book, a university</i> <span class="ipa">/j/</span><br>• <b>an</b> + гласный звук: <i>an apple, an hour</i> (h молчит)<br>• <b>the</b> — конкретный / единственный: <i>the sun, the dog</i><br>• <b>Без артикля:</b> имена, страны, мн. ч. вообще (<i>Anna, Russia, dogs</i>).', 'indigo'),
  card('Множественное число', '• Обычно <b>+s</b>: <i>books, dogs</i><br>• После s, x, ch, sh <b>+es</b>: <i>buses, boxes, watches</i><br>• Согл. + y → <b>ies</b>: <i>city → cities</i> · f/fe → <b>ves</b>: <i>knives</i><br>• <b>Исключения:</b> <i>man–men, woman–women, child–children, person–people, foot–feet, tooth–teeth</i>.', 'mint'),
])}
${table(['Числа 0–19', 'Десятки и большие числа', 'Важные детали'], [
  ['0 zero (oh) · 1 one · 2 two · 3 three · 4 four · 5 five · 6 six · 7 seven · 8 eight · 9 nine · 10 ten · 11 eleven · 12 twelve · 13–19 <b>-teen</b> (<i>thirteen, fifteen</i>)', '20 twenty · 30 thirty · 40 <b>forty</b> · 50 fifty · 60 sixty · 70 seventy · 80 eighty · 90 ninety · 100 a hundred · 1000 a thousand · 1 000 000 a million', '• <b>thirTEEN</b> (13) vs <b>THIRty</b> (30)<br>• 21 = <i>twenty-one</i> (через дефис)<br>• Порядковые: <b>first, second, third</b><br>• Телефон — по одной цифре (<i>double</i>)'],
], false)}
${practice(
  [
    'Продиктуй по буквам имя <b>Tom</b> и скажи, как читается <b>ph</b> в <b>phone</b>.',
    'Вставь глагол и исправь ошибку: <b>She ___ a doctor.</b> / <b>I student.</b>',
    'Поставь артикль <b>a</b> или <b>an</b>: ___ apple, ___ university, ___ hour.',
    'Напиши множественное число: <b>one child → two ___, one city → two ___</b>.',
    'Напиши словами числа: <b>15</b> и <b>50</b>.',
    'Сделай вопрос из утверждения: <b>You are a teacher.</b>',
  ],
  '<b>1</b> T–O–M, «ф» · <b>2</b> is / I am a student · <b>3</b> an, a, an · <b>4</b> children, cities · <b>5</b> fifteen, fifty · <b>6</b> Are you a teacher?'
)}
${checklist(
  [
    'Называю буквы алфавита и диктую своё имя по буквам',
    'Читаю sh, ch, th, ph, ck, ng, igh, ee, ea, oo и магическую e',
    'Различаю I/my, he/his, she/her, they/their и не пропускаю am/is/are',
    'Выбираю a/an/the, строю мн. число и отличаю thirteen от thirty',
  ],
  'День 8 — время и даты: дни недели, месяцы и вопрос «Который час?».'
)}
`;

export default {
  day: 7,
  title: 'Повторение дней 1–6',
  pages: [page1, page2],
};
