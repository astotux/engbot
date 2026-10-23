import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 23 · Будущее время', 'Два способа сказать «я буду»: <em>will и be going to</em>', 'Спонтанные решения, обещания и прогнозы против готовых планов и очевидных признаков.')}
<h2>1. Future Simple — конструкция will</h2>
${formula('Подлежащее + <span>will</span> + глагол (V1, без to) &nbsp;|&nbsp; Отрицание: <span>won’t</span> (will not) &nbsp;|&nbsp; Вопрос: <span>Will</span> + подлежащее + V1?')}
<p class="small"><b>will</b> одинаков для всех лиц (никаких -s!). Сокращения: <b>I’ll, you’ll, he’ll, she’ll, we’ll, they’ll</b>. Отрицание: <b>won’t</b> <span class="ipa">/wəʊnt/</span>.</p>
${table(['Ситуация для will', 'Примеры'], [
  ['Решение «на ходу», в момент речи', '<b>The phone is ringing. I’ll take it.</b> — Звонит телефон. Я возьму.'],
  ['Обещание, предложение помощи', '<b>I will help you.</b> — Я помогу тебе. · <b>I won’t tell anyone.</b> — Я никому не скажу.'],
  ['Предсказание, мнение (I think…)', '<b>I think it will be a good day.</b> — Думаю, день будет хорошим.'],
  ['Вежливая просьба и вопрос', '<b>Will you open the door?</b> — Yes, I will. / No, I won’t.'],
], false)}
${tip('⚠️', 'Частая ошибка с will', 'Не говори <i>I will to go</i> и <i>He wills go</i>. После <b>will</b> — только чистый глагол V1: <b>I will go. He will come.</b>', 'warn')}
<h2>2. Конструкция be going to — планы и намерения</h2>
${formula('<span>am / is / are</span> + <i>going to</i> + глагол (V1)')}
${table(['Ситуация для be going to', 'Примеры'], [
  ['План или намерение, решённое заранее', '<b>I’m going to visit</b> my grandmother tomorrow. — Я собираюсь навестить бабушку завтра.'],
  ['Очевидные признаки (уже видно, что будет)', '<b>Look at the sky! It is going to rain.</b> — Смотри на небо! Сейчас пойдёт дождь.'],
  ['Отрицание (–) и вопрос (?)', '<b>She isn’t going to come.</b> · <b>Are you going to study?</b> — Yes, I am. / No, I’m not.'],
], false)}
`;

const page2 = `
<h2>3. Will или be going to? — быстрое сравнение и маркеры</h2>
${grid(2, [
  card('Как выбрать за секунду', '• <b>Решение сейчас / обещание / I think…</b> → <b>will</b><br><i>«Кто-то стучит» → I will open it.</i><br>• <b>План заранее / очевидные признаки</b> → <b>be going to</b><br><i>«Купила билеты на субботу» → I am going to fly on Saturday.</i><br><span class="small">💡 В речи going to часто звучит как «gonna» (I’m gonna go).</span>', 'indigo'),
  card('Слова-маркеры будущего', '• <b>tomorrow</b> — завтра · <b>tonight</b> — сегодня вечером<br>• <b>next week / month / year</b> — на след. неделе / в след. месяце / году<br>• <b>soon</b> — скоро · <b>in two days</b> — через два дня<br>• <b>in the future</b> — в будущем', 'sky'),
])}
<h2>4. Важное правило: никаких will после IF и WHEN!</h2>
${tip('🚫', 'После if (если) и when (когда) о будущем используем Present Simple, а не will', '❌ <i>If I will have time, I will call you.</i> → ✅ <b>If I have time, I will call you.</b> (Если у меня будет время, я позвоню тебе.)<br>❌ <i>When she will come, we will eat.</i> → ✅ <b>When she comes, we will eat.</b> (Когда она придёт, мы поедим.)', 'warn')}
${practice(
  [
    'Поставь will и сделай «–»: <b>He ___ go → He ___ go.</b>',
    'Вставь am/is/are: <b>They ___ going to travel.</b>',
    'Собери вопрос: <b>you / will / help / me?</b>',
    'Исправь ошибку: <b>I will to go tomorrow.</b>',
    'Исправь: <b>If it will be cold, I will stay home.</b>',
    'Выбери (билет уже куплен): <b>will</b> или <b>be going to</b>?',
  ],
  '<b>1</b> will, will not (won’t) · <b>2</b> are · <b>3</b> Will you help me? · <b>4</b> I will go tomorrow. · <b>5</b> If it is cold, I will stay home. · <b>6</b> be going to (I am going to travel)'
)}
${checklist(
  [
    'Строю предложения с will и won’t',
    'Строю предложения с am/is/are going to',
    'Отличаю спонтанное решение от плана',
    'Помню: после if и when ставим Present Simple',
  ],
  'День 24 — живые диалоги: знакомство и заказ в кафе.'
)}
`;

export default {
  day: 23,
  title: 'Будущее время: will и be going to',
  pages: [page1, page2],
};
