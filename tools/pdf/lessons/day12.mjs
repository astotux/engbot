import { head, tip, card, grid, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 12 · Глаголы 21–40', 'Глаголы <em>21–40</em>', 'Ещё 20 глаголов и устойчивые связки с предлогами — чтобы рассказать о себе и своём дне.')}
<h2>⚡ Глаголы 21–40: чувства, еда, работа, учёба и повседневные действия</h2>
${table(['#', 'Глагол и чтение', 'Перевод и пример', '#', 'Глагол и чтение', 'Перевод и пример'], [
  ['21', 'like <span class="ipa">/laɪk/</span>', 'нравиться · <i>I like tea.</i>', '31', 'give <span class="ipa">/ɡɪv/</span>', 'давать · <i>We give a gift.</i>'],
  ['22', 'love <span class="ipa">/lʌv/</span>', 'любить · <i>We love music.</i>', '32', 'find <span class="ipa">/faɪnd/</span>', 'находить · <i>I find a key.</i>'],
  ['23', 'eat <span class="ipa">/iːt/</span>', 'есть · <i>I eat bread.</i>', '33', 'help <span class="ipa">/help/</span>', 'помогать · <i>You help Anna.</i>'],
  ['24', 'drink <span class="ipa">/drɪŋk/</span>', 'пить · <i>You drink water.</i>', '34', 'try <span class="ipa">/traɪ/</span>', 'пробовать · <i>I try tea.</i>'],
  ['25', 'live <span class="ipa">/lɪv/</span>', 'жить · <i>I live here.</i>', '35', 'call <span class="ipa">/kɔːl/</span>', 'звонить · <i>I call Tom.</i>'],
  ['26', 'work <span class="ipa">/wɜːk/</span>', 'работать · <i>I work here.</i>', '36', 'ask <span class="ipa">/ɑːsk/</span>', 'спрашивать · <i>You ask Anna.</i>'],
  ['27', 'study <span class="ipa">/ˈstʌdi/</span>', 'учиться · <i>We study English.</i>', '37', 'wait <span class="ipa">/weɪt/</span>', 'ждать · <i>We wait here.</i>'],
  ['28', 'read <span class="ipa">/riːd/</span>', 'читать · <i>I read a book.</i>', '38', 'open <span class="ipa">/ˈəʊpən/</span>', 'открывать · <i>Open the door!</i>'],
  ['29', 'write <span class="ipa">/raɪt/</span>', 'писать (w молчит!) · <i>write a letter</i>', '39', 'play <span class="ipa">/pleɪ/</span>', 'играть · <i>We play football.</i>'],
  ['30', 'buy <span class="ipa">/baɪ/</span>', 'покупать · <i>We buy bread.</i>', '40', 'sleep <span class="ipa">/sliːp/</span>', 'спать · <i>I sleep well.</i>'],
])}
${tip('💡', 'Произношение и оттенки смысла', 'В слове <b>write</b> буква w не читается: <span class="ipa">/raɪt/</span>. В <b>work</b> <span class="ipa">/wɜːk/</span> губы трубочкой. Различай <b>like</b> (нравится: <i>I like tea</i>) и <b>love</b> (сильное чувство: <i>I love my family</i>).', '')}
`;

const page2 = `
<h2>🔗 Связки «глагол + предлог» — учим целиком как пару!</h2>
${table(['Связка', 'Перевод', 'Пример в живой речи'], [
  ['get up', 'вставать (с кровати)', 'I <b>get up</b> at seven. — Я встаю в семь.'],
  ['wake up', 'просыпаться', 'We <b>wake up</b> early. — Мы просыпаемся рано.'],
  ['sit down / stand up', 'садиться / вставать (с места)', '<b>Sit down</b>, please. — Садись, пожалуйста. · <b>Stand up!</b> — Встань!'],
  ['look for', 'искать', 'I <b>look for</b> my phone. — Я ищу свой телефон.'],
  ['wait for', 'ждать кого-то / что-то', 'We <b>wait for</b> a bus. — Мы ждём автобус. (❌ <i>wait a bus</i>)'],
  ['listen to', 'слушать кого-то / что-то', 'We <b>listen to</b> music. — Мы слушаем музыку. (❌ <i>listen music</i>)'],
  ['ask for', 'просить что-то', 'I <b>ask for</b> water. — Я прошу воду.'],
])}
${tip('⚠️', 'Главные ловушки с предлогами', 'По-русски мы говорим «слушать музыку» и «ждать автобус» без предлога, а по-английски предлог обязателен: <b>listen to music</b>, <b>wait for a bus</b>, <b>look for a key</b>.', 'warn')}
${practice(
  [
    'Переведи глаголы: «пить» и «покупать».',
    'Выбери: We ___ football. <b>(play / sleep)</b>',
    'Выбери: I ___ a book. <b>(read / eat)</b>',
    'Как сказать «садись» и «искать» (в два слова)?',
    'Исправь ошибку: <b>We listen music.</b>',
    'Составь фразу: «Я живу здесь».',
  ],
  '<b>1</b> drink; buy · <b>2</b> play · <b>3</b> read · <b>4</b> sit down; look for · <b>5</b> We listen to music. · <b>6</b> I live here.'
)}
${checklist(
  [
    'Знаю глаголы 21–40',
    'Отличаю like от love',
    'Помню пары wait for, listen to, look for, get up',
    'Могу сказать 5 простых фраз о себе и своём дне',
  ],
  'День 13 — прилагательные: big, small, hot, cold, цвета и чувства.'
)}
`;

export default {
  day: 12,
  title: 'Глаголы 21–40',
  pages: [page1, page2],
};
