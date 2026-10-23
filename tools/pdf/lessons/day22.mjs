import { head, tip, card, grid, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 22 · Past Simple', '30 неправильных <em>глаголов</em>', 'Эти 30 слов нужно просто запомнить — зато они есть в каждом разговоре.')}
<p class="small">Правильный глагол: <b>work → worked</b> (+ed). Неправильный глагол: <b>go → went</b> (своя форма V2). Для Past Simple в «+» нужна именно <b>V2</b>.</p>
<div class="grid g2" style="gap:2.5mm">
<div>
<h3 style="margin-top:0">Первая десятка (1–10)</h3>
${table(['V1', 'V2 (Past)', 'Произношение', 'Перевод'], [
  ['be', '<b>was / were</b>', '/wɒz/, /wɜː/', 'быть'],
  ['have', '<b>had</b>', '/hæd/', 'иметь'],
  ['do', '<b>did</b>', '/dɪd/', 'делать'],
  ['go', '<b>went</b>', '/went/', 'идти, ехать'],
  ['come', '<b>came</b>', '/keɪm/', 'приходить'],
  ['get', '<b>got</b>', '/gɒt/', 'получать'],
  ['make', '<b>made</b>', '/meɪd/', 'делать, создавать'],
  ['take', '<b>took</b>', '/tʊk/', 'брать'],
  ['see', '<b>saw</b>', '/sɔː/', 'видеть'],
  ['give', '<b>gave</b>', '/geɪv/', 'давать'],
])}
</div>
<div>
<h3 style="margin-top:0">Вторая десятка (11–20)</h3>
${table(['V1', 'V2 (Past)', 'Произношение', 'Перевод'], [
  ['know', '<b>knew</b>', '/njuː/', 'знать'],
  ['think', '<b>thought</b>', '/θɔːt/', 'думать'],
  ['say', '<b>said</b>', '/sed/', 'сказать'],
  ['tell', '<b>told</b>', '/təʊld/', 'рассказать'],
  ['find', '<b>found</b>', '/faʊnd/', 'находить'],
  ['buy', '<b>bought</b>', '/bɔːt/', 'покупать'],
  ['eat', '<b>ate</b>', '/eɪt/', 'есть, кушать'],
  ['drink', '<b>drank</b>', '/dræŋk/', 'пить'],
  ['write', '<b>wrote</b>', '/rəʊt/', 'писать'],
  ['read', '<b>read</b>', '/red/', 'читать'],
])}
</div>
</div>
${grid(2, [
  tip('💡', 'was / were и примеры', '<b>was</b> — I, he, she, it; <b>were</b> — we, you, they.<br><i>I went home. · She had a cat. · We saw a film. · He took my pen. · They came late.</i>', 'good'),
  tip('⚠️', 'Частая ошибка и глагол read', 'Не говори <i>goed, taked, seed, maked</i> → <b>went, took, saw, made</b>!<br><b>read</b> (V1) = <span class="ipa">/riːd/</span>, а <b>read</b> (V2) = <span class="ipa">/red/</span>: <i>I read it yesterday.</i>', 'warn'),
])}
`;

const page2 = `
<div class="grid g2" style="gap:2.5mm">
<div>
<h3 style="margin-top:0">Третья десятка (21–30)</h3>
${table(['V1', 'V2 (Past)', 'Произношение', 'Перевод'], [
  ['speak', '<b>spoke</b>', '/spəʊk/', 'говорить'],
  ['sit', '<b>sat</b>', '/sæt/', 'сидеть'],
  ['stand', '<b>stood</b>', '/stʊd/', 'стоять'],
  ['run', '<b>ran</b>', '/ræn/', 'бегать'],
  ['sleep', '<b>slept</b>', '/slept/', 'спать'],
  ['leave', '<b>left</b>', '/left/', 'уходить, оставлять'],
  ['meet', '<b>met</b>', '/met/', 'встречать'],
  ['pay', '<b>paid</b>', '/peɪd/', 'платить'],
  ['send', '<b>sent</b>', '/sent/', 'отправлять'],
  ['lose', '<b>lost</b>', '/lɒst/', 'терять'],
])}
</div>
<div>
<h3 style="margin-top:0">Группы по звучанию и правила «– / ?»</h3>
${card('Рифмы для лёгкого запоминания', '• <b>-ought:</b> think — thought, buy — bought<br>• <b>-ept/-ent/-eft/-et/-ost:</b> sleep — slept, send — sent, leave — left, meet — met, lose — lost<br>• <b>-old/-ound/-ood:</b> tell — told, find — found, stand — stood<br>• <b>гласная «a»:</b> sit — sat, run — ran, drink — drank, come — came, give — gave, eat — ate, see — saw<br>• <b>«o / oo»:</b> speak — spoke, write — wrote, take — took', 'indigo')}
${card('Отрицание и вопрос: возвращаем V1!', 'После <b>did</b> и <b>didn’t</b> глагол стоит в первой форме (<b>V1</b>):<br><b>I went</b> home → <b>I didn’t go</b> home → <b>Did you go</b> home?<br>❌ <i>I didn’t went / Did you went?</i> (Исключение: <b>wasn’t / were</b>).<br><span class="small">Маркеры: yesterday, last week, two days ago, in 2020.</span>', 'amber')}
</div>
</div>
${practice(
  [
    'Past Simple (V2) от <b>buy</b> и <b>eat</b>.',
    'Past Simple (V2) от <b>meet</b> и <b>write</b>.',
    'Исправь: <b>I didn’t went to school.</b>',
    'Переведи: <b>Вчера я видел собаку.</b>',
    'Как читается read в «<b>I read a book yesterday</b>»?',
    'Вопрос к «She ate an apple»: <b>___ she ___ an apple?</b>',
  ],
  '<b>1</b> bought, ate · <b>2</b> met, wrote · <b>3</b> I didn’t go to school. · <b>4</b> Yesterday I saw a dog. · <b>5</b> /red/ · <b>6</b> Did she eat an apple?'
)}
${checklist(
  [
    'Знаю 30 глаголов и их форму V2',
    'Не говорю goed и taked',
    'После didn’t ставлю глагол в V1',
    'Знаю, как читается read в прошлом (/red/)',
  ],
  'День 23 — будущее время: конструкции will и be going to.'
)}
`;

export default {
  day: 22,
  title: '30 неправильных глаголов',
  pages: [page1, page2],
};
