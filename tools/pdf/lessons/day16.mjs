import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 16 · Грамматика', 'Present Simple: <em>отрицание don’t / doesn’t</em>', 'Как сказать «Я не делаю», «Он не любит» и куда пропадает окончание -s.')}
<h2>Главное правило отрицания в Present Simple</h2>
<p>В русском языке мы просто ставим «НЕ» перед глаголом: «Я не работаю». В английском обычный глагол <b>не умеет</b> присоединять частицу <b>not</b> сам по себе — ему нужен глагол-помощник <b>do not (don’t)</b> или <b>does not (doesn’t)</b>.</p>
${grid(2, [
  card('I / You / We / They + don’t + ГЛАГОЛ (V)', '<b>I don’t work</b> on Sunday. — Я не работаю в воскресенье.<br><b>You don’t know</b> him. — Ты его не знаешь.<br><b>We don’t live</b> in London. — Мы не живём в Лондоне.<br><b>They don’t drink</b> coffee. — Они не пьют кофе.', 'indigo'),
  card('He / She / It + doesn’t + ГЛАГОЛ БЕЗ -S (V!)', '<b>He doesn’t work</b> on Sunday. — Он не работает в вс.<br><b>She doesn’t speak</b> French. — Она не говорит по-франц.<br><b>It doesn’t work.</b> — Оно не работает.', 'rose'),
])}
<h2>Произношение полных и кратких форм</h2>
${grid(2, [
  card('do not /duː nɒt/ → don’t /dəʊnt/', 'Используется в 95% разговорной речи для I, you, we, they.', 'sky'),
  card('does not /dʌz nɒt/ → doesn’t /ˈdʌznt/', 'Звук <b>/ʌ/</b> как в слове <i>cup</i>! Для he, she, it.', 'amber'),
])}
${tip('🧲', 'Магнит DOESN’T: почему исчезает -S?', 'Помощник <b>DOES</b> уже забрал себе окончание <b>-es</b>! Второй раз ставить -s у глагола <b>НЕЛЬЗЯ</b>:<br>• She work<b>s</b>. → She <b>doesn’t work</b>. · He <b>has</b> a car. → He <b>doesn’t have</b> a car.<br>• She go<b>es</b> home. → She <b>doesn’t go</b> home. · He studi<b>es</b> a lot. → He <b>doesn’t study</b> a lot.', 'good')}
`;

const page2 = `
<h2>Глагол DO как смысловой («делать»)</h2>
<p>В предложении может быть <b>ДВА do подряд</b> — не пугайся! Первый — помощник, второй — «делать»: <b>I don’t do</b> it every day (Я не делаю это каждый день). <b>He doesn’t do</b> homework in the morning (Он не делает домашку утром).</p>
<h2>Как не перепутать am not / isn’t / aren’t и don’t / doesn’t?</h2>
${table(['Когда НЕТ действия (кто? какой? где? — to be)', 'Когда ЕСТЬ действие (глагол — Present Simple)'], [
  ['I <b>am not</b> a doctor. (Я не врач)', 'I <b>don’t work</b> in a hospital. (Я не работаю в больнице)'],
  ['She <b>isn’t</b> tired. (Она не устала)', 'She <b>doesn’t sleep</b> much. (Она мало спит)'],
  ['They <b>aren’t</b> at home. (Они не дома)', 'They <b>don’t stay</b> at home. (Они не сидят дома)'],
], false)}
${tip('⚠️', '5 типичных ошибок новичков', '1) ❌ <i>I not know.</i> → ✅ <b>I don’t know.</b> · 2) ❌ <i>She doesn’t works.</i> → ✅ <b>She doesn’t work.</b> (без -s!)<br>3) ❌ <i>He doesn’t has a dog.</i> → ✅ <b>He doesn’t have a dog.</b> · 4) ❌ <i>He don’t like tea.</i> → ✅ <b>He doesn’t like tea.</b><br>5) ❌ <i>I am not work here.</i> → ✅ <b>I don’t work here.</b> (не смешивай am/is/are с глаголом действия!)', 'warn')}
${practice(
  [
    'Сделай отрицательным: <b>I drink milk.</b>',
    'Сделай отрицательным: <b>She likes cold weather.</b>',
    'Сделай отрицательным: <b>He has a brother.</b>',
    'Сделай отрицательным: <b>We watch TV in the morning.</b>',
    'Сделай отрицательным: <b>My phone works well.</b>',
    'Сделай отрицательным: <b>Anna goes to bed late.</b>',
  ],
  '<b>1</b> I don’t drink milk. · <b>2</b> She doesn’t like cold weather. · <b>3</b> He doesn’t have a brother. · <b>4</b> We don’t watch TV in the morning. · <b>5</b> My phone doesn’t work well. · <b>6</b> Anna doesn’t go to bed late.'
)}
${checklist(
  [
    'Различаю don’t и doesn’t',
    'Убираю -s у глагола после doesn’t',
    'Говорю doesn’t have (не has!)',
    'Не путаю isn’t и doesn’t',
  ],
  'День 17 — учимся задавать вопросы Do you...? / Does she...? и давать краткие ответы.'
)}
`;

export default {
  day: 16,
  title: "Present Simple: отрицание don't и doesn't",
  pages: [page1, page2],
};
