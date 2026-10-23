import { head, tip, card, grid, table, checklist } from '../lib.mjs';

const page1 = `
${head('День 28 · Проверка знаний', 'Мини-тест <em>по всему курсу</em>', 'Спокойная проверка за 27 дней: повтори главные формулы по экспресс-шпаргалке и реши 15 заданий.')}
<h2>🧭 Экспресс-шпаргалка перед стартом</h2>
${grid(2, [
  card(
    '1. Глагол to be и артикли a / an',
    '• <b>I am</b> · <b>he / she / it is</b> · <b>you / we / they are</b><br>• Профессия, происхождение, возраст:<br><b>She is from Spain. I am 30 years old.</b><br>• <b>a</b> + согласный звук (<i>a book</i>), <b>an</b> + гласный (<i>an apple</i>).',
    'indigo'
  ),
  card(
    '2. Present Simple (обычное действие)',
    '• Утверждение: <b>I work</b>, но <b>he / she / it works</b>.<br>• После <b>-ch, -sh, -s, -x, -o</b> пишем <b>-es</b>: <b>He watches TV.</b><br>• Отрицание: <b>don’t / doesn’t + V1</b> (<i>My brother doesn’t like fish</i>).<br>• Вопрос: <b>Does she like coffee? — Yes, she does.</b>',
    'sky'
  ),
  card(
    '3. Past Simple (вчера и в прошлом)',
    '• Маркеры: <b>yesterday, last week, two days ago</b>.<br>• Правильные: <b>-ed</b> (<i>worked</i>). Неправильные: 2-я форма (<b>go → went, buy → bought, see → saw</b>).<br>• В вопросе и с <b>didn’t</b> — чистый глагол V1!',
    'amber'
  ),
  card(
    '4. Будущее, модальные и вежливость',
    '• <b>will + V1</b> (без <i>to</i>!): <b>I will call you tomorrow.</b><br>• План: <b>am / is / are going to + V1</b>.<br>• Модальные: <b>can / must / should + V1</b> (<i>I can swim</i>).<br>• Вежливое «я бы хотел»: <b>I would like a coffee.</b>',
    'mint'
  ),
  card(
    '5. Числа, время и мн. число',
    '• <b>13 thirteen</b> (удар. на конец) ≠ <b>30 thirty</b> (на 1-й слог).<br>• <b>3:30 = half past three</b> · <b>3:15 = quarter past three</b>.<br>• Особое мн. ч.: <b>child → children, man → men, woman → women, person → people</b>.',
    'w'
  ),
  card(
    '6. Предлоги и вопросительные слова',
    '• Время: <b>in May</b> (месяц), <b>on Monday</b> (день), <b>at 7:00 / at night</b>.<br>• Движение: <b>go to work</b>, но <b>go home</b> (без <i>to</i>!).<br>• Вопросы: <b>Where</b> (где?), <b>When</b> (когда?), <b>What</b> (что?), <b>Who</b> (кто?), <b>How much</b> (сколько?).',
    'w'
  ),
])}
<h2>📋 Правила мини-теста</h2>
${table(
  ['Часть теста', 'Вопросы', 'Что проверяем', 'Как выполнять'],
  [
    ['Часть 1 · База', '№ 1–5', 'Буквы (spelling), to be, артикли a/an, числа 13/30, особое мн. число', 'Читай внимательно и не торопись'],
    ['Часть 2 · Настоящее', '№ 6–10', 'Время на часах, предлоги in/on/at, Present Simple (-es, doesn’t, краткий ответ)', 'Следи за подлежащим he / she / it'],
    ['Часть 3 · 3 времени', '№ 11–15', 'Вопросительные слова, Past Simple (went, bought), будущее с will, would like', 'Ищи слова-маркеры: yesterday, tomorrow'],
  ],
  false
)}
${tip('💪', 'Главный совет перед началом', 'Это не строгий экзамен, а дружеская диагностика. Сначала отметь ответы на странице 2 самостоятельно, а затем сверься с ключом и посчитай свои баллы!', 'good')}
`;

const page2 = `
<h2>✍️ Бланк мини-теста: 15 вопросов по курсу</h2>
<div class="grid g2" style="gap:1.8mm">
${[
  '<b>[Буквы]</b> Собери слово по буквам <b>C – A – T</b>: ________',
  '<b>[to be]</b> She ___ from Spain. <i>(am / are / is / be)</i>',
  '<b>[Артикль]</b> I have ___ apple. <i>(a / an / the / two)</i>',
  '<b>[Числа]</b> «Мне 30 лет» — I am ___: <i>(thirteen / thirty)</i>',
  '<b>[Мн. число]</b> Напиши мн. число слова <b>child</b>: ________',
  '<b>[Время]</b> Как сказать «<b>3:30</b>»? <i>(quarter past three / half past three)</i>',
  '<b>[Предлоги]</b> My birthday is ___ May. <i>(on / at / in / by)</i>',
  '<b>[Вопрос]</b> Does she like coffee? — <i>(Yes, she is / Yes, she does)</i>',
  '<b>[Окончание]</b> He ___ <i>(watch)</i> TV every evening.',
  '<b>[Отрицание]</b> My brother ___ like fish. <i>(doesn’t / don’t / isn’t)</i>',
  '<b>[Вопрос. слово]</b> «Где ты живёшь?»: ___ do you live?',
  '<b>[Маркер]</b> I went to the cinema yesterday. Когда? <i>(завтра / вчера)</i>',
  '<b>[Past Simple]</b> Yesterday I ___ a book. <i>(buyed / buy / bought)</i>',
  '<b>[Будущее]</b> I ___ you tomorrow. <i>(will call / will to call / am will call)</i>',
  '<b>[Вежливость]</b> «Я бы хотел кофе»: I ___ like a coffee.',
  '<b>[Бонус-письмо]</b> Напиши 3 фразы: 1) <i>I am…</i> 2) <i>Every day I…</i> 3) <i>Yesterday I…</i>',
]
  .map(
    (q, i) =>
      `<div class="card w" style="display:flex;gap:2mm;align-items:flex-start;padding:1.5mm 2.5mm"><span class="num" style="width:5mm;height:5mm;font-size:7.8pt">${i < 15 ? i + 1 : '★'}</span><div style="flex:1;font-size:8.8pt">${q}</div></div>`
  )
  .join('')}
</div>
<div class="card mint" style="margin-top:2mm;padding:2mm 3.2mm;font-size:8.7pt">
  <b>🔑 Ключи к тесту:</b> <b>1</b> cat · <b>2</b> is · <b>3</b> an · <b>4</b> thirty (30) · <b>5</b> children · <b>6</b> half past three · <b>7</b> in · <b>8</b> Yes, she does. · <b>9</b> watches · <b>10</b> doesn’t · <b>11</b> Where · <b>12</b> вчера · <b>13</b> bought · <b>14</b> will call · <b>15</b> would · <b>★ Пример:</b> <i>I am Anna. Every day I drink coffee. Yesterday I watched a film.</i>
</div>
<h2>📊 Оцени свой результат</h2>
${table(
  ['Твой балл', 'Уровень освоения', 'Что делать дальше'],
  [
    ['🥇 12–15 баллов', 'Отличная база!', 'Ты уверенно ориентируешься в грамматике курса. Готов(а) к финальному рывку!'],
    ['🥈 8–11 баллов', 'Хороший результат!', 'Основа уже крепкая. Выпиши вопросы, где были сомнения — завтра мы их разберём.'],
    ['🥉 0–7 баллов', 'Точка роста!', 'Не расстраивайся: перечитай шпаргалку на стр. 1 и пройди День 29 особенно внимательно.'],
  ],
  false
)}
${checklist(
  [
    'Ответил(а) на все 15 вопросов теста',
    'Проверил(а) себя по ключам',
    'Написал(а) 3 предложения о себе (настоящее и прошлое)',
    'Отметил(а) темы, которые стоит освежить завтра',
  ],
  'День 29 — повторение слабых мест: генеральная уборка по самым коварным темам курса.'
)}
`;

export default {
  day: 28,
  title: 'Мини-тест по всему курсу',
  pages: [page1, page2],
};
