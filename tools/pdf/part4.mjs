import { head, tip, card, grid, formula, table, words, dialog, steps } from './lib.mjs';

const present = `
${head('Шаг 12 · Грамматика', 'Present Simple <em>— настоящее</em>', 'Время для привычек, фактов и расписаний. Самое используемое время английского.')}
${formula('I / you / we / they <span>+</span> глагол &nbsp;·&nbsp; he / she / it <span>+</span> глагол<i>-s</i>')}
${table(['Тип', 'Формула', 'Пример'], [
  ['✅ Утверждение', 'подлежащее + V(-s)', 'She <b>works</b> in a bank.'],
  ['❌ Отрицание', 'do / does + not + V', 'She <b>doesn’t work</b> on Sunday.'],
  ['❓ Вопрос', 'Do / Does + подлежащее + V?', '<b>Does</b> she <b>work</b> here?'],
], false)}
<h2>Правила окончания -s (he / she / it)</h2>
${table(['Если глагол оканчивается на…', 'Добавляем', 'Пример'], [
  ['обычная буква', '+ s', 'work → works, play → plays'],
  ['s, x, ch, sh, o', '+ es', 'watch → watches, go → goes'],
  ['согласная + y', 'y → ies', 'study → studies, fly → flies'],
  ['особый случай', '—', 'have → <b>has</b>'],
])}
<h2>Когда использовать</h2>
${grid(3, [
  card('🔁 Привычки', '<span class="en">I drink coffee every morning.</span>', 'indigo'),
  card('🌍 Факты', '<span class="en">The sun rises in the east.</span>', 'sky'),
  card('🗓 Расписание', '<span class="en">The train leaves at 8.</span>', 'amber'),
])}
${tip('⚠️', 'Главная ошибка новичков', '<span class="bad-t">She work here.</span> / <span class="bad-t">Does she works?</span><br>После does глагол <b>без -s</b>: <span class="good-t">Does she work here?</span> — буква -s «живёт» только в утверждении.', 'bad')}
${tip('💡', 'Слова-маркеры', 'always, usually, often, sometimes, never, every day, on Mondays — сразу сигналят: нужен Present Simple.', '')}`;

const questions = `
${head('Шаг 13 · Грамматика', 'Вопросительные <em>слова</em>', 'Девять слов — и ты можешь спросить о чём угодно.')}
${table(['Слово', 'Значение', 'Пример'], [
  ['What', 'что / какой', 'What is your name?'],
  ['Where', 'где / куда', 'Where do you live?'],
  ['When', 'когда', 'When does it start?'],
  ['Who', 'кто', 'Who is that man?'],
  ['Why', 'почему', 'Why are you late?'],
  ['How', 'как', 'How are you?'],
  ['Which', 'который из', 'Which one do you like?'],
  ['How much', 'сколько (неисчисл.)', 'How much is it?'],
  ['How many', 'сколько (исчисл.)', 'How many people are there?'],
  ['Whose', 'чей', 'Whose bag is this?'],
])}
${formula('Вопросительное слово <span>+</span> do / does <span>+</span> подлежащее <span>+</span> <i>глагол</i>?')}
${grid(2, [
  card('С глаголом to be', '<span class="en">Where is</span> the station?<br><span class="en">Who are</span> you?<br><span class="en">How old is</span> she?', 'indigo'),
  card('С другими глаголами', '<span class="en">What do</span> you want?<br><span class="en">Where does</span> he work?<br><span class="en">Why do</span> they study?', 'mint'),
])}
<h2>Полезные вопросы на каждый день</h2>
${grid(2, [
  card('', '<span class="en">What’s your name?</span><br><span class="small">Как тебя зовут?</span><br><span class="en">Where are you from?</span><br><span class="small">Откуда ты?</span><br><span class="en">How old are you?</span><br><span class="small">Сколько тебе лет?</span>', ''),
  card('', '<span class="en">What do you do?</span><br><span class="small">Кем ты работаешь?</span><br><span class="en">How do you say … in English?</span><br><span class="small">Как сказать … по-английски?</span><br><span class="en">Can you repeat, please?</span><br><span class="small">Повтори, пожалуйста.</span>', ''),
])}
${tip('✅', 'Лайфхак', 'Не понял собеседника? Три спасительные фразы: <span class="en">Sorry?</span> · <span class="en">Could you say it again?</span> · <span class="en">Slower, please.</span>', 'good')}`;

const modals = `
${head('Шаг 14 · Грамматика', 'Модальные глаголы: <em>can, must, should</em>', 'Помогают сказать «могу», «должен», «стоит». Изменяются по одной схеме — без -s и без do.')}
${formula('Подлежащее <span>+</span> can / must / should <span>+</span> <i>глагол без to</i>')}
${table(['Глагол', 'Значение', 'Пример', 'Отрицание'], [
  ['can', 'могу, умею', 'I can swim.', 'can’t / cannot'],
  ['could', 'мог; вежливая просьба', 'Could you help me?', 'couldn’t'],
  ['must', 'должен (сильно)', 'You must stop.', 'mustn’t — нельзя'],
  ['have to', 'вынужден', 'I have to work.', 'don’t have to — не обязан'],
  ['should', 'стоит, следует', 'You should sleep.', 'shouldn’t'],
  ['may / might', 'возможно', 'It may rain.', 'may not'],
  ['would like', 'хотел бы', 'I’d like a tea.', 'wouldn’t like'],
])}
<h2>Вежливые просьбы</h2>
${grid(3, [
  card('Простая', '<span class="en">Can I have water?</span>', 'indigo'),
  card('Вежливая', '<span class="en">Could I have the menu?</span>', 'amber'),
  card('Очень вежливая', '<span class="en">Would you mind helping me?</span>', 'mint'),
])}
<h2>Важные различия</h2>
${grid(2, [
  card('mustn’t ≠ don’t have to', '<span class="en">You mustn’t smoke here.</span><br><span class="small">Тебе запрещено.</span><br><span class="en">You don’t have to come.</span><br><span class="small">Можешь не приходить (не обязан).</span>', 'rose'),
  card('can vs. may', '<span class="en">Can I go?</span> — разговорно.<br><span class="en">May I go?</span> — формально и вежливо.', 'sky'),
])}
${tip('⚠️', 'Три ошибки', '<span class="bad-t">He cans swim.</span> <span class="bad-t">I can to swim.</span> <span class="bad-t">Does she can?</span><br><span class="good-t">He can swim. Can she swim?</span> — без -s, без to, без do.', 'bad')}`;

const past = `
${head('Шаг 15 · Грамматика', 'Past Simple <em>— прошедшее</em>', 'Что случилось и закончилось в прошлом. Одна форма для всех лиц.')}
${formula('Подлежащее <span>+</span> глагол<i>-ed</i> / 2-я форма')}
${table(['Тип', 'Формула', 'Пример'], [
  ['✅ Утверждение', 'V-ed / V2', 'I <b>worked</b> yesterday.'],
  ['❌ Отрицание', 'did not (didn’t) + V', 'I <b>didn’t work</b> yesterday.'],
  ['❓ Вопрос', 'Did + подлежащее + V?', '<b>Did</b> you <b>work</b> yesterday?'],
], false)}
<h2>Окончание -ed (правильные глаголы)</h2>
${table(['Правило', 'Пример', 'Произношение'], [
  ['обычно + ed', 'work → worked, play → played', '/t/ /d/'],
  ['оканчивается на e → + d', 'live → lived, love → loved', '/d/'],
  ['согласная + y → ied', 'study → studied, try → tried', '/d/'],
  ['1 гласная + 1 согласная → удвой', 'stop → stopped, plan → planned', '/t/'],
  ['после t, d', 'want → wanted, need → needed', '/ɪd/'],
])}
<h2>Глагол to be в прошедшем</h2>
${grid(2, [
  card('was', 'I / he / she / it<br><span class="en">She was at home.</span>', 'indigo'),
  card('were', 'you / we / they<br><span class="en">We were tired.</span>', 'mint'),
])}
<h2>Слова-маркеры</h2>
<p><span class="pill a">yesterday</span><span class="pill a">last week</span><span class="pill a">last year</span><span class="pill a">two days ago</span><span class="pill a">in 2020</span><span class="pill a">when I was a child</span></p>
${tip('⚠️', 'Как в Present Simple', 'После did глагол возвращается в начальную форму: <span class="bad-t">Did you went?</span> → <span class="good-t">Did you go?</span>', 'bad')}`;

const irregular = `
${head('Шаг 16 · Грамматика', '30 неправильных <em>глаголов</em>', 'У них нет окончания -ed — выучи вторую форму наизусть. Это самые частые.')}
${(() => {
  const L = [
    ['be','was / were','быть'],['have','had','иметь'],['do','did','делать'],['go','went','идти'],['come','came','приходить'],['get','got','получать'],['make','made','делать'],['take','took','брать'],['see','saw','видеть'],['give','gave','давать'],
    ['know','knew','знать'],['think','thought','думать'],['say','said','сказать'],['tell','told','рассказать'],['find','found','находить'],['buy','bought','покупать'],['eat','ate','есть'],['drink','drank','пить'],['write','wrote','писать'],['read','read /red/','читать'],
    ['speak','spoke','говорить'],['sit','sat','сидеть'],['stand','stood','стоять'],['run','ran','бежать'],['sleep','slept','спать'],['leave','left','уходить'],['meet','met','встречать'],['pay','paid','платить'],['send','sent','отправлять'],['lose','lost','терять'],
  ];
  const col = (a, b) => `<table><thead><tr><th>V1</th><th>V2</th><th>Перевод</th></tr></thead><tbody>${L.slice(a, b).map((r) => `<tr><td class="en">${r[0]}</td><td><b>${r[1]}</b></td><td>${r[2]}</td></tr>`).join('')}</tbody></table>`;
  return `<div class="grid g2">${col(0, 15)}${col(15, 30)}</div>`;
})()}
${tip('💡', 'Как выучить 30 глаголов', 'Учи по 3 в день — за 10 дней все в кармане. Придумай по короткой фразе: <span class="en">I went to the park. I saw a dog. I bought a coffee.</span>', '')}
${tip('✅', 'Группы по звучанию', '<span class="en">buy–bought, think–thought</span> · <span class="en">sleep–slept, leave–left</span> · <span class="en">write–wrote, speak–spoke</span>. Похожие глаголы меняются похоже.', 'good')}`;

const future = `
${head('Шаг 17 · Грамматика', 'Будущее: <em>will и going to</em>', 'Две формы будущего — разные ситуации. Запомни простую разницу.')}
${grid(2, [
  card('will', 'Решение «здесь и сейчас», обещание, прогноз.<br><span class="en">I’ll help you!</span><br><span class="en">It will rain tomorrow.</span>', 'indigo'),
  card('be going to', 'План, намерение, очевидный признак.<br><span class="en">I’m going to study English.</span><br><span class="en">Look at the clouds! It’s going to rain.</span>', 'mint'),
])}
${formula('will <span>+</span> глагол &nbsp;·&nbsp; am / is / are <span>+</span> going to <span>+</span> <i>глагол</i>')}
${table(['Тип', 'will', 'going to'], [
  ['✅', 'I will call you.', 'I’m going to call you.'],
  ['❌', 'I won’t (will not) call.', 'I’m not going to call.'],
  ['❓', 'Will you call me?', 'Are you going to call me?'],
], false)}
<h2>Слова-маркеры будущего</h2>
<p><span class="pill s">tomorrow</span><span class="pill s">next week</span><span class="pill s">next year</span><span class="pill s">soon</span><span class="pill s">in two days</span><span class="pill s">tonight</span><span class="pill s">in the future</span></p>
<h2>Примеры из жизни</h2>
${dialog('Anna', 'Tom', [
  ['l', 'What are you going to do this weekend?', 'Что ты собираешься делать на выходных?'],
  ['r', 'I’m going to visit my parents.', 'Навещу родителей.'],
  ['l', 'Oh, I forgot my wallet!', 'Ой, я забыл кошелёк!'],
  ['r', 'Don’t worry, I’ll pay.', 'Не волнуйся, я заплачу.'],
])}
${tip('⚠️', 'Нельзя will после if и when', '<span class="bad-t">If it will rain, I’ll stay.</span> → <span class="good-t">If it rains, I’ll stay.</span> После if и when используем настоящее время.', 'bad')}`;

export const pages = [
  { section: 'Present Simple', body: present },
  { section: 'Вопросы', body: questions },
  { section: 'Модальные глаголы', body: modals },
  { section: 'Past Simple', body: past },
  { section: 'Неправильные глаголы', body: irregular },
  { section: 'Будущее время', body: future },
];
