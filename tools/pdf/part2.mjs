import { head, tip, card, grid, formula, table, words, dialog, steps } from './lib.mjs';

const alphabet = `
${head('Шаг 2 · Звуки', 'Алфавит <em>и звуки</em>', '26 букв, но звуков больше — 44. Начнём с букв, а потом разберём, как они читаются.')}
<div class="grid" style="grid-template-columns:repeat(7,1fr);gap:2mm;margin-bottom:3mm">
${[
  ['A','эй'],['B','би'],['C','си'],['D','ди'],['E','и'],['F','эф'],['G','джи'],['H','эйч'],['I','ай'],['J','джей'],['K','кей'],['L','эл'],['M','эм'],['N','эн'],['O','оу'],['P','пи'],['Q','кью'],['R','ар'],['S','эс'],['T','ти'],['U','ю'],['V','ви'],['W','дабл-ю'],['X','экс'],['Y','уай'],['Z','зед']
].map(([l, r], i) => {
  const v = 'AEIOU'.includes(l);
  return `<div style="text-align:center;border-radius:10px;padding:1.5mm 0;background:${v ? 'var(--amber-l)' : 'var(--indigo-l)'};border:1px solid ${v ? '#fde7b0' : '#d9dcff'}"><div style="font-size:15pt;font-weight:800;color:${v ? '#b45309' : 'var(--indigo)'}">${l}${l.toLowerCase()}</div><div class="small" style="font-size:7.5pt">${r}</div></div>`;
}).join('')}
</div>
<p class="small"><span class="pill a">жёлтые</span> — гласные (5 букв, но 20 звуков) · <span class="pill i">синие</span> — согласные (21 буква, 24 звука)</p>
<h2>Гласные: короткие и длинные</h2>
${table(['Звук', 'Как звучит', 'Примеры'], [
  ['/æ/', 'между «а» и «э»', 'cat, bad, hand'],
  ['/ɪ/ — /iː/', 'короткий и — долгий и', 'sit — seat, ship — sheep'],
  ['/ʊ/ — /uː/', 'короткий у — долгий у', 'full — fool, book — moon'],
  ['/ʌ/', 'краткое «а»', 'cup, love, bus'],
  ['/ə/', 'нейтральный «э» (шва)', 'about, teacher, banana'],
  ['/eɪ/ /aɪ/ /ɔɪ/', 'двойные звуки', 'day, my, boy'],
], false)}
${tip('🔊', 'Длина имеет значение', 'Sit /sɪt/ — «сидеть», seat /siːt/ — «место». Тянуть звук /iː/ нужно заметно дольше — иначе собеседник услышит другое слово.', '')}
<h2>Звуки, которых нет в русском</h2>
${grid(2, [
  card('/θ/ — think, three', 'Язык между зубами, дуем без голоса. Похоже на мягкое «с» с кончиком языка.', 'sky'),
  card('/ð/ — this, mother', 'То же положение языка, но с голосом — как «з» через зубы.', 'sky'),
  card('/w/ — water, we', 'Губы трубочкой, как в «у», и быстрый переход. Не «в»!', 'sky'),
  card('/h/ — hello, have', 'Лёгкий выдох из горла. Мягче русской «х».', 'sky'),
])}`;

const reading = `
${head('Шаг 3 · Чтение', 'Правила <em>чтения</em>', 'Английское чтение подчиняется закономерностям — вот самые частые.')}
<h2>Сочетания букв</h2>
${table(['Буквы', 'Звук', 'Примеры'], [
  ['th', '/θ/ или /ð/', 'think, this, thanks'],
  ['sh', '/ʃ/ — «ш»', 'ship, fish, shop'],
  ['ch', '/tʃ/ — «ч»', 'chair, much, check'],
  ['ph', '/f/ — «ф»', 'phone, photo, phrase'],
  ['ck', '/k/ — «к»', 'black, back, check'],
  ['ng', '/ŋ/ — носовой «нг»', 'sing, long, morning'],
  ['wh', '/w/ — «у»', 'what, when, white'],
  ['tion', '/ʃn/ — «шн»', 'station, action, question'],
  ['igh', '/aɪ/ — «ай»', 'night, light, high'],
  ['oo', '/uː/ или /ʊ/', 'moon, food / book, good'],
  ['ee, ea', '/iː/ — долгий «и»', 'see, meet, eat, tea'],
  ['ow, ou', '/aʊ/ — «ау»', 'now, how, house, out'],
])}
<h2>Магическая e</h2>
<p>Если слово заканчивается на тихую <b>e</b>, предыдущая гласная читается как в алфавите.</p>
${grid(2, [
  card('Без e → короткий звук', '<span class="en">cap</span> /kæp/ · <span class="en">hop</span> · <span class="en">kit</span> · <span class="en">cut</span>', 'indigo'),
  card('С e → долгий звук', '<span class="en">cape</span> /keɪp/ · <span class="en">hope</span> · <span class="en">kite</span> · <span class="en">cute</span>', 'mint'),
])}
<h2>Слова, которые читаются не по правилам</h2>
<p class="small">Их просто нужно запомнить — они очень частотные.</p>
<div class="wordlist">
<div class="wl"><b>one</b><span class="ipa">/wʌn/</span></div><div class="wl"><b>two</b><span class="ipa">/tuː/</span></div>
<div class="wl"><b>people</b><span class="ipa">/ˈpiːpl/</span></div><div class="wl"><b>said</b><span class="ipa">/sed/</span></div>
<div class="wl"><b>friend</b><span class="ipa">/frend/</span></div><div class="wl"><b>want</b><span class="ipa">/wɒnt/</span></div>
<div class="wl"><b>often</b><span class="ipa">/ˈɒfn/</span></div><div class="wl"><b>know</b><span class="ipa">/nəʊ/</span></div>
<div class="wl"><b>you</b><span class="ipa">/juː/</span></div><div class="wl"><b>listen</b><span class="ipa">/ˈlɪsn/</span></div>
</div>
${tip('💡', 'Лайфхак', 'Сомневаешься в произношении? Вводи слово в словарь Cambridge или Google Translate и нажимай 🔊. Повтори 3 раза — запомнится сразу.', '')}`;

const pronouns = `
${head('Шаг 4 · Основа', 'Местоимения <em>и глагол to be</em>', 'Самые важные слова английского. Без них не построить ни одного предложения.')}
${grid(2, [
  table(['Кто', 'Местоимение'], [['я','I'],['ты / вы','you'],['он','he'],['она','she'],['оно','it'],['мы','we'],['они','they']], false),
  table(['Чей', 'Притяжательное'], [['мой','my'],['твой / ваш','your'],['его','his'],['её','her'],['его / её (неодуш.)','its'],['наш','our'],['их','their']], false),
])}
<h2>Глагол to be — «быть»</h2>
<p>В русском «Я студент», в английском обязателен глагол: <b>I am</b> a student.</p>
${table(['Утверждение', 'Отрицание', 'Вопрос'], [
  ['I am (I’m)', 'I am not (I’m not)', 'Am I?'],
  ['he / she / it is (’s)', 'is not (isn’t)', 'Is he / she / it?'],
  ['you / we / they are (’re)', 'are not (aren’t)', 'Are you / we / they?'],
])}
${formula('Подлежащее <span>+</span> am / is / are <span>+</span> <i>остальное</i>')}
${grid(2, [
  card('✅ Примеры', '<span class="en">I am</span> a teacher.<br><span class="en">She is</span> from Spain.<br><span class="en">We are</span> friends.<br><span class="en">It is</span> cold today.', 'mint'),
  card('❓ Вопросы и ответы', '<span class="en">Are you</span> tired? — Yes, I am.<br><span class="en">Is he</span> at home? — No, he isn’t.', 'indigo'),
])}
${tip('⚠️', 'Частая ошибка', '<span class="bad-t">I student.</span> → <span class="good-t">I am a student.</span> В английском без глагола-связки предложение не бывает полным.', 'bad')}
${tip('💡', 'Сокращения в речи', 'Говорящие почти всегда сокращают: I’m, you’re, he’s, we’re, they’re, isn’t. Учись воспринимать их на слух с самого начала.', '')}`;

const articles = `
${head('Шаг 5 · Основа', 'Артикли <em>и множественное число</em>', 'Маленькие слова a, an, the — самая большая головная боль новичков. Вот простая схема.')}
${grid(3, [
  card('a', 'Один из многих. Перед согласным звуком.<br><span class="en">a book, a car, a dog</span>', 'indigo'),
  card('an', 'Один из многих. Перед гласным звуком.<br><span class="en">an apple, an hour, an egg</span>', 'amber'),
  card('the', 'Конкретный, уже известный предмет.<br><span class="en">the sun, the book on the table</span>', 'mint'),
])}
<h2>Когда ставить артикль</h2>
${table(['Ситуация', 'Артикль', 'Пример'], [
  ['Первое упоминание', 'a / an', 'I have <b>a</b> dog.'],
  ['Второе упоминание', 'the', '<b>The</b> dog is big.'],
  ['Единственный в мире', 'the', '<b>the</b> moon, <b>the</b> internet'],
  ['Профессия', 'a / an', 'She is <b>a</b> doctor.'],
  ['Общее (мн.ч.) / вещество', 'нет артикля', 'I like music. Dogs are loyal.'],
  ['Языки, страны, имена', 'нет артикля', 'I speak English. He is in Italy.'],
], false)}
<h2>Множественное число</h2>
${table(['Правило', 'Пример', 'Окончание'], [
  ['Обычно', 'book → books', '+ s'],
  ['После s, x, ch, sh, o', 'bus → buses, box → boxes', '+ es'],
  ['Согласная + y', 'city → cities', 'y → ies'],
  ['f / fe', 'knife → knives', 'f → ves'],
])}
<h3>Исключения (запомни!)</h3>
<p><span class="pill i">man → men</span><span class="pill i">woman → women</span><span class="pill i">child → children</span><span class="pill i">foot → feet</span><span class="pill i">tooth → teeth</span><span class="pill i">person → people</span><span class="pill i">mouse → mice</span><span class="pill i">sheep → sheep</span></p>
${tip('💡', 'Золотое правило', 'a / an выбирается по <b>звуку</b>, а не по букве: <span class="en">an hour</span> (h не читается), <span class="en">a university</span> (читается «ю»).', '')}`;

const numbers = `
${head('Шаг 6 · Основа', 'Числа <em>и счёт</em>', 'Выучи до 20 — остальное строится по схеме.')}
${table(['0–10', '11–20', 'Десятки'], [
  ['0 zero · 1 one · 2 two', '11 eleven · 12 twelve', '20 twenty · 30 thirty'],
  ['3 three · 4 four · 5 five', '13 thirteen · 14 fourteen', '40 forty · 50 fifty'],
  ['6 six · 7 seven · 8 eight', '15 fifteen · 16 sixteen', '60 sixty · 70 seventy'],
  ['9 nine · 10 ten', '17 seventeen · 18 eighteen · 19 nineteen', '80 eighty · 90 ninety'],
], false)}
${formula('21 = twenty<span>-</span>one · 35 = thirty<span>-</span>five · 99 = ninety<span>-</span>nine')}
<h2>Большие числа</h2>
${table(['Число', 'Английский'], [
  ['100', 'one hundred'], ['250', 'two hundred <b>and</b> fifty'], ['1 000', 'one thousand'], ['1 000 000', 'one million'],
], false)}
${tip('⚠️', 'thirteen и thirty звучат похоже', '<b>thir<u>teen</u></b> /θɜːˈtiːn/ — ударение на конце. <b><u>thir</u>ty</b> /ˈθɜːti/ — ударение в начале. Так их и различают.', 'bad')}
<h2>Порядковые числа</h2>
<div class="wordlist">
<div class="wl"><b>1st first</b><span>первый</span></div><div class="wl"><b>2nd second</b><span>второй</span></div>
<div class="wl"><b>3rd third</b><span>третий</span></div><div class="wl"><b>4th fourth</b><span>четвёртый</span></div>
<div class="wl"><b>5th fifth</b><span>пятый</span></div><div class="wl"><b>12th twelfth</b><span>двенадцатый</span></div>
<div class="wl"><b>20th twentieth</b><span>двадцатый</span></div><div class="wl"><b>21st twenty-first</b><span>двадцать первый</span></div>
</div>
<h2>Где пригодятся числа</h2>
${grid(3, [
  card('📞 Телефон', 'Читают по цифрам:<br><span class="en">0-7-9 → oh seven nine</span>', 'sky'),
  card('💷 Цена', '<span class="en">$5.50</span> = five fifty<br><span class="en">$20</span> = twenty dollars', 'sky'),
  card('🎂 Возраст', '<span class="en">I am twenty-five.</span><br>(без years old тоже ок)', 'sky'),
])}`;

export const pages = [
  { section: 'Алфавит и звуки', body: alphabet },
  { section: 'Правила чтения', body: reading },
  { section: 'Местоимения и to be', body: pronouns },
  { section: 'Артикли и множ. число', body: articles },
  { section: 'Числа', body: numbers },
];
