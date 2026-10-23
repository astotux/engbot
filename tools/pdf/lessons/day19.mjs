import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 19 · Модальные глаголы', 'Can, must, should <em>и would like</em>', 'Самые удобные глаголы английского языка — без окончаний и без помощников!')}
<h2>Три суперправила модальных глаголов (can, could, must, should, may, might)</h2>
${grid(3, [
  card('1. БЕЗ окончания -S', 'Даже с he / she / it:<br><b>He can swim. She must go.</b><br>(Никаких «He cans»!)', 'indigo'),
  card('2. БЕЗ частицы TO', 'Сразу начальная форма глагола:<br><b>I can speak. You should sleep.</b><br>(Никаких «can to speak»!)', 'sky'),
  card('3. БЕЗ помощников do/does', 'Вопросы и отрицания напрямую:<br><b>Can you help me? I can’t swim.</b><br>(Никаких «Do you can»!)', 'mint'),
])}
<p class="small">⚡ <b>Исключение-полумодальный: HAVE TO / HAS TO</b> (вынужден по обстоятельствам) — меняется как обычный глагол (<i>don’t have to / doesn’t have to / Do you have to...?</i>) и уже содержит частицу <b>to</b>!</p>
<h2>Главная таблица модальных глаголов</h2>
${table(['Глагол', 'Значение', 'Пример с переводом'], [
  ['can /kæn/ (can’t /kɑːnt/)', 'умею, могу (физически/сейчас)', '<b>I can drive. Can you help me?</b> — Я умею водить. Поможешь?'],
  ['could /kʊd/ (couldn’t)', 'умел в прошлом; вежливое «не могли бы вы»', '<b>Could you open the window, please?</b> — Не могли бы вы открыть окно?'],
  ['must /mʌst/ (mustn’t /ˈmʌsnt/)', 'обязан (строгий долг, закон, моё решение)', '<b>You must stop here.</b> — Вы обязаны остановиться здесь.'],
  ['have to / has to', 'приходится, нужно (обстоятельства, график)', '<b>I have to get up at 6.</b> — Мне приходится вставать в 6.'],
  ['should /ʃʊd/ (shouldn’t)', 'следует, стоит (добрый совет)', '<b>You should see a doctor.</b> — Тебе стоит сходить к врачу.'],
  ['may /meɪ/, might /maɪt/', 'возможно; May I...? (разрешите?)', '<b>It may rain. May I come in?</b> — Может пойти дождь. Можно войти?'],
  ['would like (I’d like)', 'хотел(а) бы (вежливая замена want)', '<b>I would like a cup of coffee.</b> — Я бы хотел чашку кофе.'],
])}
`;

const page2 = `
<h2>Ловушка №1: MUSTN’T ≠ DON’T HAVE TO (Огромная разница!)</h2>
${grid(2, [
  card('🔴 MUSTN’T = СТРОГО ЗАПРЕЩЕНО!', 'Нельзя ни в коем случае:<br><b>You mustn’t smoke here.</b> — Здесь курить запрещено!<br><b>You mustn’t tell anyone.</b> — Никому не рассказывай!', 'rose'),
  card('🟢 DON’T / DOESN’T HAVE TO = НЕ ОБЯЗАТЕЛЬНО', 'Нет необходимости (по желанию):<br><b>It’s Sunday. I don’t have to work.</b> — Работать не нужно.<br><b>She doesn’t have to pay.</b> — Ей не нужно платить.', 'mint'),
])}
<h2>Шкала вежливых просьб и заказов</h2>
${table(['Фраза', 'Нюанс и перевод'], [
  ['Can I have water?', 'Можно мне воды? (нейтрально, с друзьями)'],
  ['Could I have water, please? / Could you help me?', 'Не могли бы вы...? (вежливо, в кафе, с незнакомцами)'],
  ['May I ask a question?', 'Разрешите задать вопрос? (официально, очень вежливо)'],
  ['Would you mind opening the door?', 'Вы не против открыть дверь? (супервежливо, после <b>mind</b> глагол с <b>-ing</b>)'],
  ['I would like (I’d like) a coffee / to order.', 'Я бы хотел кофе (с сущ. без to) / сделать заказ (с глаголом через <b>TO</b>!)'],
])}
${tip('⚠️', '4 грубые ошибки новичков', '❌ <i>He cans swim.</i> → ✅ <b>He can swim.</b> · ❌ <i>I can to swim.</i> → ✅ <b>I can swim.</b><br>❌ <i>Do you can swim?</i> → ✅ <b>Can you swim?</b> · ❌ <i>I would like go home.</i> → ✅ <b>I would like to go home.</b> (нужна <b>to</b>!)', 'warn')}
${practice(
  [
    'She <b>(can / cans)</b> speak English.',
    'You look tired. You <b>(should / mustn’t)</b> sleep.',
    'I would like <b>(buy / to buy)</b> this book.',
    'It’s Saturday, so I <b>(mustn’t / don’t have to)</b> get up early.',
    '<b>(Could / Do can)</b> you help me, please?',
    'He <b>(has to / have to)</b> work today.',
  ],
  '<b>1</b> can · <b>2</b> should · <b>3</b> to buy · <b>4</b> don’t have to · <b>5</b> Could · <b>6</b> has to'
)}
${checklist(
  [
    'Не ставлю -s и to после can/must/should',
    'Различаю mustn’t и don’t have to',
    'Умею вежливо просить с Could you / I’d like',
    'Помню про to после would like перед глаголом',
  ],
  'День 20 — большое повторение и закрепление дней 15–19!'
)}
`;

export default {
  day: 19,
  title: 'Модальные глаголы: can, must, should, would like',
  pages: [page1, page2],
};
