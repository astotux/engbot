import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 13 · Прилагательные', 'Прилагательные: <em>антонимы, цвета, чувства</em>', 'Слова, которые делают речь яркой: 15 пар противоположностей, цвета и состояния.')}
<h2>⚖️ 15 пар главных прилагательных-антонимов</h2>
${table(['Слово (+)', 'Произношение и перевод', 'Антоним (–)', 'Произношение и перевод'], [
  ['big', '<span class="ipa">/bɪɡ/</span> — большой', 'small', '<span class="ipa">/smɔːl/</span> — маленький'],
  ['good', '<span class="ipa">/ɡʊd/</span> — хороший', 'bad', '<span class="ipa">/bæd/</span> — плохой'],
  ['hot', '<span class="ipa">/hɒt/</span> — горячий, жаркий', 'cold', '<span class="ipa">/kəʊld/</span> — холодный'],
  ['new', '<span class="ipa">/njuː/</span> — новый', 'old', '<span class="ipa">/əʊld/</span> — старый (о людях: <b>young</b> <span class="ipa">/jʌŋ/</span>)'],
  ['happy', '<span class="ipa">/ˈhæpi/</span> — счастливый', 'sad', '<span class="ipa">/sæd/</span> — грустный'],
  ['long', '<span class="ipa">/lɒŋ/</span> — длинный (о росте: <b>tall</b> <span class="ipa">/tɔːl/</span>)', 'short', '<span class="ipa">/ʃɔːt/</span> — короткий, невысокий'],
  ['fast', '<span class="ipa">/fɑːst/</span> — быстрый', 'slow', '<span class="ipa">/sləʊ/</span> — медленный'],
  ['easy', '<span class="ipa">/ˈiːzi/</span> — лёгкий, простой (задача)', 'difficult', '<span class="ipa">/ˈdɪfɪkəlt/</span> — трудный, сложный'],
  ['cheap', '<span class="ipa">/tʃiːp/</span> — дешёвый', 'expensive', '<span class="ipa">/ɪkˈspensɪv/</span> — дорогой'],
  ['clean', '<span class="ipa">/kliːn/</span> — чистый', 'dirty', '<span class="ipa">/ˈdɜːti/</span> — грязный'],
  ['strong', '<span class="ipa">/strɒŋ/</span> — сильный', 'weak', '<span class="ipa">/wiːk/</span> — слабый'],
  ['rich', '<span class="ipa">/rɪtʃ/</span> — богатый', 'poor', '<span class="ipa">/pɔː/</span> — бедный'],
  ['full', '<span class="ipa">/fʊl/</span> — полный, сытый', 'empty', '<span class="ipa">/ˈempti/</span> — пустой'],
  ['heavy', '<span class="ipa">/ˈhevi/</span> — тяжёлый', 'light', '<span class="ipa">/laɪt/</span> — лёгкий (по весу!)'],
  ['beautiful', '<span class="ipa">/ˈbjuːtɪfl/</span> — красивый', 'ugly', '<span class="ipa">/ˈʌɡli/</span> — некрасивый'],
])}
${tip('⚠️', 'Не путай easy и light!', '<b>easy</b> — лёгкий, простой по сложности (<i>an easy test</i>); <b>light</b> — лёгкий по весу (<i>a light bag</i>).', 'warn')}
`;

const page2 = `
<h2>🎨 Цвета (11 слов) и 😊 Чувства и состояния (10 слов)</h2>
${grid(2, [
  card('🎨 Цвета (Colors)', '<b>red</b> <span class="ipa">/red/</span> красный · <b>blue</b> <span class="ipa">/bluː/</span> синий · <b>green</b> <span class="ipa">/ɡriːn/</span> зелёный · <b>yellow</b> <span class="ipa">/ˈjeləʊ/</span> жёлтый · <b>black</b> <span class="ipa">/blæk/</span> чёрный · <b>white</b> <span class="ipa">/waɪt/</span> белый · <b>orange</b> <span class="ipa">/ˈɒrɪndʒ/</span> оранжевый · <b>pink</b> <span class="ipa">/pɪŋk/</span> розовый · <b>brown</b> <span class="ipa">/braʊn/</span> коричневый · <b>grey</b> <span class="ipa">/ɡreɪ/</span> серый · <b>purple</b> <span class="ipa">/ˈpɜːpl/</span> фиолетовый', 'sky'),
  card('😊 Чувства с глаголом to be (I am…)', '<b>happy</b> счастливый · <b>sad</b> грустный · <b>angry</b> <span class="ipa">/ˈæŋɡri/</span> сердитый · <b>tired</b> <span class="ipa">/ˈtaɪəd/</span> уставший · <b>hungry</b> <span class="ipa">/ˈhʌŋɡri/</span> голодный · <b>thirsty</b> <span class="ipa">/ˈθɜːsti/</span> хочет пить · <b>scared</b> <span class="ipa">/skeəd/</span> напуганный · <b>bored</b> <span class="ipa">/bɔːd/</span> скучающий · <b>busy</b> <span class="ipa">/ˈbɪzi/</span> занятой · <b>ill</b> <span class="ipa">/ɪl/</span> больной', 'amber'),
])}
<h2>📐 Три главных правила английских прилагательных</h2>
${formula('a <i>big</i> house · <i>an</i> old book · The house is <i>big</i>. · red cars (без -s!)')}
${grid(3, [
  card('1. Порядок слов', 'Прилагательное стоит ПЕРЕД существительным (<b>a red car</b>) или ПОСЛЕ <b>to be</b> (<b>The car is red</b>).', 'indigo'),
  card('2. Никогда не меняются', 'Нет ни рода, ни множественного числа: <b>a red car → red cars</b> (нельзя <i>reds cars</i>!).', 'mint'),
  card('3. Артикль a или an', 'Смотрим на первый ЗВУК прилагательного: <b>a</b> big book, но <b>an</b> old book, <b>an</b> easy test.', 'rose'),
])}
${practice(
  [
    'Назови антонимы к <b>hot, fast, rich</b>.',
    'Как по-английски «жёлтый» и «фиолетовый»?',
    'Расставь слова: <b>house / a / big</b>.',
    'Исправь ошибку: <b>reds cars</b>.',
    'Вставь <b>a / an</b>: ___ old book, ___ easy test.',
    'Дополни: I am ___ (я голоден).',
  ],
  '<b>1</b> cold, slow, poor · <b>2</b> yellow, purple · <b>3</b> a big house · <b>4</b> red cars · <b>5</b> an old book, an easy test · <b>6</b> hungry'
)}
${checklist(
  [
    'Знаю 15 пар антонимов (и разницу easy / light)',
    'Знаю 11 цветов',
    'Умею сказать о состоянии через am / is / are',
    'Ставлю прилагательное перед существительным без -s',
  ],
  'День 14 — повторение дней 8–13: время, семья, еда, глаголы и прилагательные.'
)}
`;

export default {
  day: 13,
  title: 'Прилагательные',
  pages: [page1, page2],
};
