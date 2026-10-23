import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 2 · Чтение', 'Правила <em>чтения</em>', 'Буквы работают командой: сочетания согласных и гласных, которые нужно знать наизусть.')}
<h2>Согласные и особые сочетания</h2>
${table(['Сочетание', 'Звук и правило', 'Примеры с переводом'], [
  ['sh', '<span class="ipa">/ʃ/</span> — русское «ш»', '<b>ship</b> (корабль), <b>shop</b> (магазин), <b>fish</b> (рыба)'],
  ['ch', '<span class="ipa">/tʃ/</span> — русское «ч»', '<b>chair</b> (стул), <b>cheese</b> (сыр), <b>lunch</b> (обед)'],
  ['th', '<span class="ipa">/θ/</span> или <span class="ipa">/ð/</span> — язык между зубами', '<b>think</b> (думать), <b>this</b> (это), <b>three</b> (три)'],
  ['ph', '<span class="ipa">/f/</span> — русское «ф»', '<b>phone</b> (телефон), <b>photo</b> (фото), <b>elephant</b> (слон)'],
  ['ck', '<span class="ipa">/k/</span> — «к» в конце после краткой гласной', '<b>back</b> (спина), <b>black</b> (чёрный), <b>clock</b> (часы)'],
  ['ng', '<span class="ipa">/ŋ/</span> — носовой звук, «г» почти не слышно', '<b>sing</b> (петь), <b>long</b> (длинный), <b>morning</b> (утро)'],
  ['wh', '<span class="ipa">/w/</span> — губы трубочкой, <b>h</b> молчит', '<b>what</b> (что), <b>white</b> (белый), <b>when</b> (когда), <b>why</b>'],
  ['tion', '<span class="ipa">/ʃn/</span> — читается «шн»', '<b>station</b> (станция), <b>information</b>, <b>nation</b> (нация)'],
  ['igh', '<span class="ipa">/aɪ/</span> — «ай», буквы <b>g</b> и <b>h</b> молчат', '<b>night</b> (ночь), <b>light</b> (свет), <b>high</b>, <b>right</b>'],
])}
${tip('💡', 'Подсказка про букву H', 'Буква <b>h</b> после согласной почти никогда не читается отдельно — она меняет звук первой буквы: <b>s+h = ш</b>, <b>c+h = ч</b>, <b>p+h = ф</b>.', 'good')}
<h2>Гласные сочетания</h2>
${table(['Сочетание', 'Звук', 'Примеры'], [
  ['ee', '<span class="ipa">/iː/</span> долгий «и»', '<b>see</b> (видеть), <b>green</b> (зелёный), <b>meet</b> (встречать)'],
  ['ea', '<span class="ipa">/iː/</span> долгий «и» (искл. <span class="ipa">/e/</span>)', '<b>eat</b> (есть), <b>tea</b> (чай), <b>sea</b> · но: <b>bread</b> <span class="ipa">/bred/</span>, <b>head</b> <span class="ipa">/hed/</span>'],
  ['oo', '<span class="ipa">/uː/</span> долгий «у» / <span class="ipa">/ʊ/</span> краткий «у»', '<b>moon</b>, <b>food</b>, <b>school</b> · краткий: <b>book</b> <span class="ipa">/bʊk/</span>, <b>look</b>, <b>good</b>'],
  ['ow', '<span class="ipa">/aʊ/</span> «ау» или <span class="ipa">/əʊ/</span> «оу»', '<b>cow</b> (корова), <b>now</b>, <b>down</b> · «оу»: <b>snow</b>, <b>show</b>, <b>yellow</b>'],
  ['ou', '<span class="ipa">/aʊ/</span> «ау»', '<b>house</b> (дом), <b>out</b> (наружу), <b>mouth</b> (рот)'],
])}
`;

const page2 = `
<h2>Магическая «e» на конце слова</h2>
${formula('гласная + согласная + <b>e</b> (молчит) <span>→</span> гласная читается как <i>в алфавите</i>')}
${table(['Гласная', 'Закрытый слог (кратко)', 'С магической e (долго)', 'Ещё примеры'], [
  ['a → /eɪ/', '<b>cap</b> <span class="ipa">/kæp/</span> — шапка', '<b>cape</b> <span class="ipa">/keɪp/</span> — плащ', 'mad → made, plan → plane'],
  ['i → /aɪ/', '<b>kit</b> <span class="ipa">/kɪt/</span> — набор', '<b>kite</b> <span class="ipa">/kaɪt/</span> — возд. змей', 'bit → bite, win → wine'],
  ['o → /əʊ/', '<b>hop</b> <span class="ipa">/hɒp/</span> — прыгать', '<b>hope</b> <span class="ipa">/həʊp/</span> — надеяться', 'not → note, rob → robe'],
  ['u → /juː/', '<b>cub</b> <span class="ipa">/kʌb/</span> — детёныш', '<b>cube</b> <span class="ipa">/kjuːb/</span> — куб', 'tub → tube, cut → cute'],
])}
${tip('⚠️', 'Исключения магической e и слова-хулиганы', 'Короткий звук несмотря на <b>e</b>: <b>have</b> <span class="ipa">/hæv/</span>, <b>give</b> <span class="ipa">/gɪv/</span>, <b>live</b> <span class="ipa">/lɪv/</span>, <b>come</b> <span class="ipa">/kʌm/</span>, <b>love</b> <span class="ipa">/lʌv/</span>, <b>some</b> <span class="ipa">/sʌm/</span>. Немые буквы: <b>k</b> в <i>know</i>, <b>w</b> в <i>two</i>, <b>t</b> в <i>listen/often</i>.', 'warn')}
<h2>10 слов-исключений (запомни целиком) и чтение вслух</h2>
${grid(2, [
  card('Слова-исключения (часть 1)', '<b>one</b> <span class="ipa">/wʌn/</span> «уан» — один · <b>two</b> <span class="ipa">/tuː/</span> «ту» — два<br><b>people</b> <span class="ipa">/ˈpiːpl/</span> — люди · <b>said</b> <span class="ipa">/sed/</span> — сказал<br><b>friend</b> <span class="ipa">/frend/</span> — друг · <b>want</b> <span class="ipa">/wɒnt/</span> — хотеть', 'amber'),
  card('Слова-исключения (часть 2) + фразы', '<b>often</b> <span class="ipa">/ˈɒfn/</span> — часто · <b>know</b> <span class="ipa">/nəʊ/</span> — знать<br><b>you</b> <span class="ipa">/juː/</span> — ты/вы · <b>listen</b> <span class="ipa">/ˈlɪsn/</span> — слушать<br><i>The moon is high tonight. Listen to the music.</i>', 'sky'),
])}
${practice(
  [
    'Как читается <b>ph</b> в слове <b>phone</b>?',
    'Допиши слово «ночь»: <b>n___t</b>.',
    'Как читается <b>ou</b> в слове <b>house</b>?',
    'Добавь магическую <b>e</b> к слову <b>kit</b>.',
    'Как читается слово <b>two</b> и какая буква молчит?',
    'Какое сочетание даёт «шн»: <b>tion</b> или <b>igh</b>?',
  ],
  '<b>1</b> «ф» (/f/) · <b>2</b> night · <b>3</b> «ау» (/aʊ/) · <b>4</b> kite · <b>5</b> «ту» (/tuː/, w молчит) · <b>6</b> tion'
)}
${checklist(
  [
    'Читаю sh, ch, th, ph, ck, ng, wh',
    'Узнаю tion (/ʃn/) и igh (/aɪ/)',
    'Различаю ee, ea, oo, ow, ou',
    'Применяю правило магической e и помню 10 исключений',
  ],
  'День 3 — местоимения (I, you, he, she…) и твоё первое знакомство по-английски.'
)}
`;

export default {
  day: 2,
  title: 'Правила чтения',
  pages: [page1, page2],
};
