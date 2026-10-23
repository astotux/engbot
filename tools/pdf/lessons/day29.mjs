import { head, tip, card, grid, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 29 · Генеральная уборка', 'Повторение слабых мест: <em>шпаргалка-спасатель</em>', '8 самых коварных тем курса на одном развороте — сравнивай и не путай!')}
<h2>⚔️ Блок 1. Битва помощников: TO BE против DO / DOES и WAS / WERE против DID</h2>
<p class="small" style="margin-bottom:1.8mm"><b>Главный вопрос:</b> есть ли в предложении <b>обычный глагол действия</b> (<i>work, live, go, like, see</i>)?</p>
${grid(2, [
  card(
    '🅰 НЕТ глагола действия (кто? какой? где? возраст)',
    'Работает сам глагол <b>TO BE</b>:<br>• <b>Настоящее (am / is / are):</b><br><b>Are you tired? — Yes, I am.</b><br><b>He is not at home. I am 25 years old.</b><br>• <b>Прошедшее (was / were):</b><br><b>Were you at work yesterday? — No, I was not.</b><br><b>She was happy.</b>',
    'indigo'
  ),
  card(
    '🅱 ЕСТЬ глагол действия (работает, живёт, ходил)',
    'Зовём помощников <b>DO / DOES / DID</b>:<br>• <b>Настоящее (do / does):</b><br><b>Do you work here? Does she live in London?</b><br><b>They don’t know.</b><br>• <b>Прошедшее (did):</b><br><b>Did you see him yesterday?</b><br><b>I didn’t go to the shop.</b>',
    'sky'
  ),
])}
${tip('⚠️', 'Главная ошибка', 'Нельзя смешивать <b>am / is / are / was / were</b> с обычным глаголом в начальной форме: ❌ <span class="bad-t">Are you work?</span> → ✅ <span class="good-t">Do you work?</span> · ❌ <span class="bad-t">Was you go?</span> → ✅ <span class="good-t">Did you go?</span>', 'bad')}
<h2>🧲 Блок 2. Закон «Одного показателя» — окончание -S и прошедшее время</h2>
${card(
  'Помощник забирает всю грамматику на себя!',
  '• <b>Утверждение с he / she / it в Present Simple:</b> глагол берёт <b>-s / -es</b> (<b>He works, She watches, It has</b>).<br>• Как только появляется помощник <b>DOES / DOESN’T</b> или <b>DID / DIDN’T</b> — основной глагол возвращается в <b>ЧИСТУЮ первую форму (V1)</b>:<br>✅ <span class="good-t">She doesn’t work. / Does he have a car?</span> (НЕ ❌ <span class="bad-t">doesn’t works</span>, НЕ ❌ <span class="bad-t">Does he has</span>)<br>✅ <span class="good-t">We didn’t go. / Did you buy it?</span> (НЕ ❌ <span class="bad-t">didn’t went</span>, НЕ ❌ <span class="bad-t">Did you bought</span>)',
  'amber'
)}
<h2>🛡 Блок 3. Модальные глаголы (can, could, must, should) — два железных запрета</h2>
${grid(2, [
  card(
    'Запрет 1: никаких окончаний -s',
    'У <b>he / she / it</b> форма не меняется:<br>✅ <span class="good-t">He can swim.</span> (НЕ ❌ <span class="bad-t">He cans</span>)',
    'mint'
  ),
  card(
    'Запрет 2: никакой частицы TO',
    '✅ <span class="good-t">I must go. You should sleep. Can you help me?</span> (НЕ ❌ <span class="bad-t">can to help</span>).<br><span class="small">Исключения по форме: <b>have to / has to</b> и <b>would like to</b> (<i>I have to work, I would like to buy</i>).</span>',
    'mint'
  ),
])}
`;

const page2 = `
<h2>⚡ Блок 4. Топ-30 неправильных глаголов — экспресс-проверка 2-й формы</h2>
${table(
  ['V1 → V2 (Past)', 'V1 → V2 (Past)', 'V1 → V2 (Past)', 'V1 → V2 (Past)', 'V1 → V2 (Past)'],
  [
    ['be → <b>was/were</b>', 'come → <b>came</b>', 'see → <b>saw</b>', 'say → <b>said</b>', 'eat → <b>ate</b>'],
    ['have → <b>had</b>', 'get → <b>got</b>', 'give → <b>gave</b>', 'tell → <b>told</b>', 'drink → <b>drank</b>'],
    ['do → <b>did</b>', 'make → <b>made</b>', 'know → <b>knew</b>', 'find → <b>found</b>', 'write → <b>wrote</b>'],
    ['go → <b>went</b>', 'take → <b>took</b>', 'think → <b>thought</b>', 'buy → <b>bought</b>', 'read → <b>read</b> /red/'],
    ['speak → <b>spoke</b>', 'sit → <b>sat</b>', 'stand → <b>stood</b>', 'run → <b>ran</b>', 'sleep → <b>slept</b>'],
    ['leave → <b>left</b>', 'meet → <b>met</b>', 'pay → <b>paid</b>', 'send → <b>sent</b>', 'lose → <b>lost</b>'],
  ],
  false
)}
<h2>🚀 Блок 5. Будущее: WILL против BE GOING TO · Блок 6. Предлоги и much / many</h2>
${grid(2, [
  card(
    'Будущее: WILL vs BE GOING TO',
    '• <b>WILL + V1</b> — спонтанное решение, обещание, мнение (<i>I think / Maybe</i>): <b>«It is cold — I will close the window.» / «I think it will rain.»</b><br>• <b>AM / IS / ARE GOING TO + V1</b> — готовый план или очевидный факт: <b>«We bought tickets. We are going to fly to Rome.»</b><br>⚠️ После <b>if / when</b> — Present Simple: <b>Call me when you get home!</b> (НЕ ❌ <span class="bad-t">when you will get</span>).',
    'indigo'
  ),
  card(
    'Предлоги и исчисляемые / неисчисляемые',
    '• <b>in May / in the morning</b>, НО <b>at night</b>; <b>on Monday / on 5 May</b>; <b>at 7:00 / at home</b>, НО <b>go home</b> (без <i>to</i>!).<br>• <b>Исчисляемые</b> (1, 2, 3: <i>books, apples, people</i>) → <b>a/an, many, how many</b>.<br>• <b>Неисчисляемые</b> (<i>water, money, bread, time</i>) → НЕЛЬЗЯ <i>a/an</i> и <i>-s</i>! Ставь <b>some, much, how much</b>: <i>some bread, How much money do you have?</i>',
    'sky'
  ),
])}
${practice(
  [
    'Исправь: <span class="bad-t">Are you live here?</span>',
    'Исправь: <span class="bad-t">She doesn’t likes tea.</span>',
    'Исправь: <span class="bad-t">Where was you go?</span>',
    'Исправь: <span class="bad-t">I can to speak English.</span>',
    'Исправь: <span class="bad-t">I need a bread and many money.</span>',
    'Исправь: <span class="bad-t">Let’s go to home!</span>',
  ],
  '<b>1</b> Do you live here? · <b>2</b> She doesn’t like tea. · <b>3</b> Where did you go? · <b>4</b> I can speak English. · <b>5</b> I need some bread and much (a lot of) money. · <b>6</b> Let’s go home!'
)}
${checklist(
  [
    'Не путаю to be и do / does / did',
    'Убираю -s и V2 после doesn’t / didn’t',
    'Помню модальные глаголы без to',
    'Различаю will и going to, much и many',
  ],
  'Завтра — День 30, торжественный финал курса: собираем большой рассказ о себе на 5 минут речи!'
)}
`;

export default {
  day: 29,
  title: 'Повторение слабых мест: генеральная уборка',
  pages: [page1, page2],
};
