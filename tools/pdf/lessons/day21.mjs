import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 21 · Прошедшее время', 'Past Simple: <em>-ed и was / were</em>', 'Как рассказать о том, что было вчера, на прошлой неделе и год назад.')}
<h2>1. Когда используется Past Simple и слова-маркеры</h2>
${card('Действия, которые произошли и завершились в прошлом', '• <b>yesterday</b> — вчера (<b>yesterday morning</b> — вчера утром, <b>the day before yesterday</b> — позавчера)<br>• <b>last night / last week / last month / last year</b> — вчера вечером / на прошлой неделе / в прошлом месяце / в прошлом году<br>• <b>two days ago / a week ago / five years ago</b> — два дня назад / неделю назад / пять лет назад (<b>ago</b> ставится ПОСЛЕ времени!)<br>• <b>in 2020 / in 1999</b> — в 2020 году / в 1999 году', 'indigo')}
<h2>2. Утверждение (+) — правильные глаголы с окончанием -ed</h2>
<p class="small">Отличная новость: в Past Simple форма глагола <b>ОДИНАКОВАЯ</b> для всех лиц (I, you, he, she, it, we, they)!</p>
${table(['Правило', 'Начальная форма', 'Past Simple', 'Примеры'], [
  ['1. Обычный глагол (+ed)', 'work, watch, help, call', '<b>worked, watched, helped, called</b>', 'I worked yesterday.'],
  ['2. На -e (+d)', 'live, like, love, close', '<b>lived, liked, loved, closed</b>', 'She lived in Paris.'],
  ['3. Согласная + y (y → ied)', 'study, try, cry', '<b>studied, tried, cried</b>', 'He studied English. (Но: play → played!)'],
  ['4. Краткая гласная + согл.', 'stop, plan', '<b>stopped, planned</b>', 'The bus stopped here.'],
], false)}
<h2>3. Произношение окончания -ed — 3 звука!</h2>
${tip('🔊', 'Никогда не читай -ed как русское «ед»! Есть всего три варианта:', '<b>1. /t/</b> — после глухих согласных (k, p, s, ch, sh, f): <b>worked</b> <span class="ipa">/wɜːkt/</span>, <b>helped</b> <span class="ipa">/helpt/</span>, <b>watched</b> <span class="ipa">/wɒtʃt/</span>, <b>asked</b> <span class="ipa">/ɑːskt/</span><br><b>2. /d/</b> — после звонких согласных и гласных: <b>lived</b> <span class="ipa">/lɪvd/</span>, <b>played</b> <span class="ipa">/pleɪd/</span>, <b>called</b> <span class="ipa">/kɔːld/</span>, <b>opened</b> <span class="ipa">/ˈəʊpənd/</span><br><b>3. /ɪd/</b> — ТОЛЬКО после звуков /t/ и /d/: <b>wanted</b> <span class="ipa">/ˈwɒntɪd/</span>, <b>needed</b> <span class="ipa">/ˈniːdɪd/</span>, <b>waited</b> <span class="ipa">/ˈweɪtɪd/</span>, <b>started</b> <span class="ipa">/ˈstɑːtɪd/</span>', '')}
`;

const page2 = `
<h2>4. Глагол to be в прошедшем времени — WAS и WERE</h2>
<p class="small">С глаголом <b>to be</b> помощник <b>did</b> НЕ используется! Он меняется сам:</p>
${table(['Подлежащее', 'Утверждение (+)', 'Отрицание (–)', 'Вопрос и краткий ответ'], [
  ['I / he / she / it', '<b>was</b> (был, была, было)', '<b>wasn’t</b> (was not)', '<b>Was</b> he at home? — Yes, he was. / No, he wasn’t.'],
  ['you / we / they', '<b>were</b> (были)', '<b>weren’t</b> (were not)', '<b>Were</b> you tired? — Yes, I was. / No, I wasn’t.'],
])}
<p class="small">Примеры: <b>I was busy yesterday.</b> · <b>They were in London last year.</b> · <b>She wasn’t happy.</b> · <b>Were they at work?</b></p>
<h2>5. Отрицание (–) и вопросы (?) для остальных глаголов — DID / DIDN’T</h2>
${formula('Отрицание: Подлежащее + <span>didn’t</span> + глагол БЕЗ -ed &nbsp;|&nbsp; Вопрос: (Вопр. слово) + <span>Did</span> + подлежащее + <i>глагол БЕЗ -ed</i>?')}
${grid(2, [
  card('Отрицание (–)', '• <b>I didn’t work</b> yesterday. (НЕ <i>didn’t worked</i>!)<br>• <b>She didn’t call</b> me last night.', 'rose'),
  card('Вопрос (?)', '• <b>Did you watch</b> TV yesterday? — Yes, I did. / No, I didn’t.<br>• <b>Where did he live</b> in 2020? — He lived in Berlin.', 'sky'),
])}
${tip('⚠️', 'Две главные ошибки в Past Simple', '<b>1. Не оставляй -ed после did / didn’t:</b> ❌ <i>Did you worked? I didn’t watched.</i> → ✅ <b>Did you work? I didn’t watch.</b><br><b>2. Не смешивай was/were с обычными глаголами:</b> ❌ <i>I was worked. Did you were at home?</i> → ✅ <b>I worked. Were you at home?</b>', 'warn')}
${practice(
  [
    'Напиши в Past Simple: <b>study, stop, play, live</b>.',
    'Как читается -ed в словах <b>watched, played, wanted</b>?',
    'Вставь was или were: <b>We ___ at home last night.</b>',
    'Исправь ошибку: <b>She didn’t called me yesterday.</b>',
    'Переведи: <b>Ты работал вчера?</b>',
    'Переведи: <b>Два дня назад я был в парке.</b>',
  ],
  '<b>1</b> studied, stopped, played, lived · <b>2</b> watched /t/, played /d/, wanted /ɪd/ · <b>3</b> were · <b>4</b> She didn’t call me yesterday. · <b>5</b> Did you work yesterday? · <b>6</b> Two days ago I was in the park.'
)}
${checklist(
  [
    'Знаю 4 правила написания -ed',
    'Произношу -ed как /t/, /d/ или /ɪd/',
    'Различаю was и were',
    'Убираю -ed после did и didn’t',
  ],
  'День 22 — 30 самых нужных неправильных глаголов в Past Simple.'
)}
`;

export default {
  day: 21,
  title: 'Past Simple: правильные глаголы и was/were',
  pages: [page1, page2],
};
