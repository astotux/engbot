import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 9 · Топ существительных: часть 1', 'Люди, семья, <em>дом и тело</em>', '38 базовых существительных, которые нужны каждый день, и конструкция This is my…')}
<h2>👥 Люди, семья и профессии (16 слов)</h2>
${table(['Слово', 'Транскрипция и перевод', 'Слово', 'Транскрипция и перевод'], [
  ['man', '<span class="ipa">/mæn/</span> — мужчина (мн. <b>men</b>)', 'sister', '<span class="ipa">/ˈsɪstə/</span> — сестра'],
  ['woman', '<span class="ipa">/ˈwʊmən/</span> — женщина (мн. <b>women</b>)', 'son', '<span class="ipa">/sʌn/</span> — сын'],
  ['child', '<span class="ipa">/tʃaɪld/</span> — ребёнок (мн. <b>children</b>)', 'daughter', '<span class="ipa">/ˈdɔːtə/</span> — дочь (gh молчат!)'],
  ['friend', '<span class="ipa">/frend/</span> — друг, подруга', 'husband', '<span class="ipa">/ˈhʌzbənd/</span> — муж'],
  ['family', '<span class="ipa">/ˈfæməli/</span> — семья', 'wife', '<span class="ipa">/waɪf/</span> — жена (мн. <b>wives</b>)'],
  ['mother', '<span class="ipa">/ˈmʌðə/</span> — мама', 'teacher', '<span class="ipa">/ˈtiːtʃə/</span> — учитель'],
  ['father', '<span class="ipa">/ˈfɑːðə/</span> — папа', 'doctor', '<span class="ipa">/ˈdɒktə/</span> — врач'],
  ['brother', '<span class="ipa">/ˈbrʌðə/</span> — брат', 'student', '<span class="ipa">/ˈstjuːdnt/</span> — студент, ученик'],
])}
<h2>📌 Грамматика дня: my / your и This is my…</h2>
${formula('This is <i>my</i> mother. · My sister is <i>a</i> doctor. · Is this <i>your</i> key?')}
${grid(2, [
  card('my и your', '<b>my</b> — мой, моя, моё, мои<br><b>your</b> — твой, твоя, твоё, твои (ваш, ваши)<br><b>This is my…</b> — Это мой / моя / моё…', 'indigo'),
  card('⚠️ Без артикля перед my / your!', 'Перед <b>my, your, his, her</b> артикль <b>a / an / the</b> НИКОГДА не ставится!<br>❌ <i>a my friend, the my house</i> → ✅ <b>my friend, my house</b>', 'rose'),
])}
`;

const page2 = `
<h2>🏠 Дом (12 слов) и 🧍 Тело человека (10 слов)</h2>
${grid(2, [
  `<div>${table(['Дом', 'Произношение и перевод'], [
    ['house / room', '<span class="ipa">/haʊs/</span> дом · <span class="ipa">/ruːm/</span> комната'],
    ['kitchen', '<span class="ipa">/ˈkɪtʃɪn/</span> — кухня'],
    ['bedroom', '<span class="ipa">/ˈbedruːm/</span> — спальня'],
    ['bathroom', '<span class="ipa">/ˈbɑːθruːm/</span> — ванная'],
    ['door / window', '<span class="ipa">/dɔː/</span> дверь · <span class="ipa">/ˈwɪndəʊ/</span> окно'],
    ['table / chair', '<span class="ipa">/ˈteɪbl/</span> стол · <span class="ipa">/tʃeə/</span> стул'],
    ['bed', '<span class="ipa">/bed/</span> — кровать'],
    ['key / phone', '<span class="ipa">/kiː/</span> ключ · <span class="ipa">/fəʊn/</span> телефон'],
  ])}</div>`,
  `<div>${table(['Тело', 'Произношение и перевод'], [
    ['head', '<span class="ipa">/hed/</span> — голова'],
    ['eye / ear', '<span class="ipa">/aɪ/</span> глаз · <span class="ipa">/ɪə/</span> ухо'],
    ['nose / mouth', '<span class="ipa">/nəʊz/</span> нос · <span class="ipa">/maʊθ/</span> рот'],
    ['hand', '<span class="ipa">/hænd/</span> — кисть руки (ладонь)'],
    ['arm', '<span class="ipa">/ɑːm/</span> — вся рука (от плеча)'],
    ['leg', '<span class="ipa">/leɡ/</span> — вся нога'],
    ['foot', '<span class="ipa">/fʊt/</span> — стопа (мн. <b>feet</b>)'],
    ['heart', '<span class="ipa">/hɑːt/</span> — сердце'],
  ])}</div>`,
])}
${tip('💡', 'Не путай части тела и учи слова в контексте', '<b>hand</b> — кисть, <b>arm</b> — вся рука от плеча; <b>foot</b> — стопа (отсюда football), <b>leg</b> — вся нога. Не заучивай списком: придумай 5 фраз про себя (<i>My sister is a doctor</i>).', 'good')}
${practice(
  [
    'Переведи: «Это мой брат».',
    'Как сказать по-английски «муж и жена»?',
    'Где мы спим (комната и предмет мебели)?',
    'В чём разница между <b>hand</b> и <b>arm</b>?',
    'Исправь ошибку: <b>This is a my phone.</b>',
    'Переведи: «Моя мама — учитель».',
  ],
  '<b>1</b> This is my brother. · <b>2</b> husband and wife · <b>3</b> bedroom, bed · <b>4</b> hand — кисть, arm — вся рука · <b>5</b> This is my phone. · <b>6</b> My mother is a teacher.'
)}
${checklist(
  [
    'Знаю 16 слов про людей и семью',
    'Знаю 12 слов про дом и мебель',
    'Знаю 10 частей тела (hand/arm, foot/leg)',
    'Строю фразы This is my… без лишнего артикля',
  ],
  'День 10 — Существительные · часть 2: еда, город, транспорт, работа и неисчисляемые слова.'
)}
`;

export default {
  day: 9,
  title: 'Существительные: семья, дом, тело',
  pages: [page1, page2],
};
