import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 1 · Старт', 'Алфавит <em>и звуки</em>', '26 букв, но 44 звука. Начинаем с главного: названия букв, гласные и согласные, длина звука.')}
<div class="grid" style="grid-template-columns:repeat(7,1fr);gap:1.8mm;margin-bottom:2.5mm">
${[
  ['A','эй'],['B','би'],['C','си'],['D','ди'],['E','и'],['F','эф'],['G','джи'],
  ['H','эйч'],['I','ай'],['J','джей'],['K','кей'],['L','эл'],['M','эм'],['N','эн'],
  ['O','оу'],['P','пи'],['Q','кью'],['R','ар'],['S','эс'],['T','ти'],['U','ю'],
  ['V','ви'],['W','дабл-ю'],['X','экс'],['Y','уай'],['Z','зед'],
].map(([l, r]) => {
  const v = 'AEIOU'.includes(l);
  return `<div style="text-align:center;border-radius:10px;padding:1.4mm 0;background:${v ? 'var(--amber-l)' : 'var(--indigo-l)'};border:1px solid ${v ? '#fde7b0' : '#d9dcff'}"><div style="font-size:14pt;font-weight:800;color:${v ? '#b45309' : 'var(--indigo)'}">${l}${l.toLowerCase()}</div><div class="small" style="font-size:7.4pt">${r}</div></div>`;
}).join('')}
</div>
<p class="small"><span class="pill a">жёлтые</span> — гласные (5 букв: A, E, I, O, U → около 20 звуков) · <span class="pill i">синие</span> — согласные (21 буква → 24 звука)</p>
<h2>Гласные: короткие и длинные</h2>
${table(['Звук', 'Как звучит', 'Примеры'], [
  ['/æ/', 'широкий звук между «а» и «э»', 'cat, bad, hand, map'],
  ['/ɪ/ — /iː/', 'короткий «и» — долгий «и» (тянем!)', 'sit — seat, ship — sheep'],
  ['/ʊ/ — /uː/', 'короткий «у» — долгий «у»', 'full — fool, book — moon'],
  ['/ʌ/', 'краткое отрывистое «а»', 'cup, love, bus, sun'],
  ['/ə/', 'нейтральный безударный «э» (шва)', 'about, teacher, banana'],
  ['/eɪ/ /aɪ/ /ɔɪ/', 'двойные гласные (дифтонги)', 'day, name · my, time · boy'],
], false)}
${tip('🔊', 'Длина гласного меняет смысл слова', '<b>sit</b> <span class="ipa">/sɪt/</span> — «сидеть», <b>seat</b> <span class="ipa">/siːt/</span> — «место». <b>ship</b> <span class="ipa">/ʃɪp/</span> — «корабль», <b>sheep</b> <span class="ipa">/ʃiːp/</span> — «овца». Двоеточие <span class="ipa">ː</span> в транскрипции значит «тяни звук заметно дольше».', '')}
`;

const page2 = `
<h2>Звуки, которых нет в русском языке</h2>
${grid(2, [
  card('/θ/ — think, three, thanks', 'Кончик языка между зубами, дуем воздух <b>без голоса</b>.', 'sky'),
  card('/ð/ — this, that, mother', 'То же положение языка между зубами, но <b>с голосом</b>.', 'sky'),
  card('/w/ — water, we, what', 'Губы трубочкой как для «у» и быстрый переход. <b>Не русская «в»!</b>', 'sky'),
  card('/h/ — hello, have, home', 'Лёгкий тёплый выдох из горла (как будто греешь ладони).', 'sky'),
])}
<h2>Как называть слова по буквам (Spelling)</h2>
${formula('How do you spell your name? <span>→</span> It’s <i>A – N – N – A</i>.')}
${table(['Слово / имя', 'Как диктуем по буквам', 'На что обратить внимание'], [
  ['Anna', 'A – N – N – A (эй – эн – эн – эй)', 'можно сказать: A – double N – A'],
  ['Emma', 'E – double M – A (и – дабл-эм – эй)', '<b>double</b> = двойная буква подряд'],
  ['Tom', 'T – O – M (ти – оу – эм)', 'коротко и по одной букве'],
])}
<h3>⚠️ Пары букв, которые часто путают на слух</h3>
<p><span class="pill r">B (би) ≠ V (ви)</span> <span class="pill a">G (джи) ≠ J (джей)</span> <span class="pill i">E (и) ≠ I (ай)</span> <span class="pill s">A (эй) ≠ R (ар)</span> <span class="pill m">I (ай) ≠ Y (уай)</span></p>
${tip('💡', 'Лайфхак дня', 'Назови по буквам вслух три предмета вокруг себя: <b>lamp</b> (L-A-M-P), <b>book</b> (B-O-O-K), <b>phone</b> (P-H-O-N-E) — это лучшая минутка для закрепления алфавита.', 'good')}
${practice(
  [
    'Какая буква называется «джи»? — <b>G или J</b>?',
    'Назови первую гласную алфавита.',
    'Собери слово из букв: <b>B – O – O – K</b>.',
    'Какая буква идёт в алфавите сразу после <b>E</b>?',
    'Как сказать по-английски «двойная N»?',
    'В каком слове долгий звук /iː/: <b>sit</b> или <b>seat</b>?',
  ],
  '<b>1</b> G · <b>2</b> A · <b>3</b> book · <b>4</b> F · <b>5</b> double N · <b>6</b> seat'
)}
${checklist(
  [
    'Знаю названия всех 26 букв',
    'Отличаю 5 гласных от 21 согласной',
    'Слышу разницу между sit и seat',
    'Могу продиктовать своё имя по буквам',
  ],
  'День 2 — правила чтения: сочетания sh, ch, th, ph и «магическая e».'
)}
`;

export default {
  day: 1,
  title: 'Алфавит и звуки',
  pages: [page1, page2],
};
