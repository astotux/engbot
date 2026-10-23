import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 17 · Грамматика', 'Present Simple: <em>вопросы Do / Does</em>', 'Один маленький помощник — и любое утверждение превращается в вопрос.')}
<h2>Формула вопроса в Present Simple</h2>
${formula('Do / Does + подлежащее + глагол (БЕЗ -s) + остальное ?')}
${table(['Местоимения / подлежащее', 'Помощник', 'Примеры вопросов'], [
  ['<b>I, you, we, they</b> (и все «они»: my parents, the children)', '<b>Do</b>', '<b>Do</b> you like tea? — Ты любишь чай?'],
  ['<b>he, she, it</b> (и все «он/она/оно»: my mother, the cat)', '<b>Does</b>', '<b>Does</b> she like tea? — Она любит чай?'],
], false)}
${tip('💡', 'Правило одного -s и порядок слов', 'В вопросе <b>-s «переезжает» на Does</b>, а сам глагол остаётся простым: <i>She works → <b>Does she work?</b></i>, <i>He watches → <b>Does he watch?</b></i>, <i>My brother studies → <b>Does my brother study?</b></i><br>Порядок слов строгий: <b>Do (1) you (2) like (3) coffee (4)?</b> Нельзя: <i>You do like coffee? / Like you coffee?</i>', 'good')}
<h2>Из утверждения — вопрос</h2>
${table(['Утверждение', 'Вопрос'], [
  ['You speak English.', '<b>Do</b> you speak English?'],
  ['They live in London.', '<b>Do</b> they live in London?'],
  ['He works in a bank.', '<b>Does</b> he <b>work</b> in a bank?'],
  ['She likes music.', '<b>Does</b> she <b>like</b> music?'],
  ['The cat sleeps a lot.', '<b>Does</b> the cat <b>sleep</b> a lot?'],
])}
${tip('⚠️', 'Частые ошибки в вопросах', '❌ <i>Does he works?</i> → ✅ <b>Does he work?</b> &nbsp;|&nbsp; ❌ <i>Do she like?</i> → ✅ <b>Does she like?</b>', 'warn')}
`;

const page2 = `
<h2>Краткие ответы (Short answers)</h2>
${table(['Вопрос', 'Да (Yes)', 'Нет (No)'], [
  ['Do you / we / they work?', '<b>Yes, I / we / they do.</b>', '<b>No, I / we / they don’t.</b>'],
  ['Does he / she / it work?', '<b>Yes, he / she / it does.</b>', '<b>No, he / she / it doesn’t.</b>'],
])}
<p class="small">В кратком ответе смысловой глагол <b>НЕ повторяем</b>: говорим <b>Yes, I do</b> (а не <i>Yes, I like</i>). ❌ <i>Yes, he is</i> (это для to be) → ✅ <b>Yes, he does</b>. ❌ <i>No, I not</i> → ✅ <b>No, I don’t</b>.</p>
<h2>Слова-маркеры и примеры для запоминания</h2>
${grid(2, [
  card('Маркеры в вопросах (перед глаголом!)', '<b>Do you always drink</b> tea?<br><b>Does he often watch</b> TV?<br><b>Do they usually eat</b> at home?<br><b>Does she ever work</b> on Sunday? (<i>ever</i> = когда-либо)', 'sky'),
  card('Примеры диалогов', '<b>Do you speak English?</b> — Yes, I do.<br><b>Does your sister live in Moscow?</b> — No, she doesn’t.<br><b>Does your dad work on Saturday?</b> — No, he doesn’t.<br><b>Do you like pizza?</b> — Yes, I do. I love it!', 'w'),
])}
${practice(
  [
    '___ you like music? (Do / Does)',
    '___ she work here? (Do / Does)',
    '___ they live in Kazan? (Do / Does)',
    '___ your brother play tennis? (Do / Does)',
    '___ we need a pen? / ___ the cat sleep a lot?',
    '___ I speak fast? / ___ your parents work?',
    'Краткий ответ: Does he read books? (да)',
    'Краткий ответ: Do you drink tea? (нет)',
  ],
  '<b>1</b> Do · <b>2</b> Does · <b>3</b> Do · <b>4</b> Does · <b>5</b> Do / Does · <b>6</b> Do / Do · <b>7</b> Yes, he does. · <b>8</b> No, I don’t.'
)}
${checklist(
  [
    'Знаю формулу Do/Does + подлежащее + глагол',
    'Не ставлю -s у глагола после does',
    'Отвечаю кратко: Yes, I do / No, he doesn’t',
    'Могу задать 5 вопросов о привычках другу',
  ],
  'День 18 — вопросительные слова: what, where, when, who, why, how.'
)}
`;

export default {
  day: 17,
  title: 'Present Simple: вопросы Do / Does',
  pages: [page1, page2],
};
