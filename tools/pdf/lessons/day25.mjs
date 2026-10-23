import { head, tip, card, grid, table, dialog, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 25 · Разговорная практика', 'Диалоги: <em>в магазине и в городе</em>', 'Готовые фразы для шопинга, оплаты и ориентирования на улицах любого города.')}
<h2>1. В магазине (At the Shop) — ключевые фразы</h2>
${table(['Кто говорит', 'English', 'Перевод и подсказка'], [
  ['Продавец', '<b>Can I help you?</b>', 'Могу я вам помочь?'],
  ['Покупатель', '<b>I’m just looking, thank you.</b>', 'Я просто смотрю, спасибо.'],
  ['Покупатель', '<b>I’m looking for a T-shirt / a jacket.</b>', 'Я ищу футболку / куртку. (<b>look for</b> = искать)'],
  ['Продавец', '<b>What size are you?</b>', 'Какой у вас размер?'],
  ['Покупатель', '<b>I’m a Small / Medium / Large (S / M / L).</b>', 'У меня маленький / средний / большой размер.'],
  ['Покупатель', '<b>Can I try it on? / Where is the fitting room?</b>', 'Можно примерить? / Где примерочная?'],
  ['Покупатель', '<b>How much is this one? / How much are these?</b>', 'Сколько стоит вот это? / Сколько стоят эти?'],
  ['Покупатель', '<b>I’ll take it! · Can I pay by card / in cash?</b>', 'Я беру это! · Можно оплатить картой / наличными?'],
], false)}
${tip('💡', 'Важные предлоги в магазине', '• <b>look FOR</b> — искать (<i>I’m looking for shoes</i>) &nbsp;·&nbsp; <b>try ON</b> — примерить (<i>Can I try it on?</i>)<br>• <b>pay BY card</b> — платить картой, но <b>pay IN cash</b> — платить наличными!', 'good')}
<h2>2. Готовый диалог 1: Покупка в магазине одежды</h2>
${dialog('SELLER', 'CUSTOMER', [
  ['l', 'Hello! Can I help you?', 'Здравствуйте! Могу я вам помочь?'],
  ['r', 'Hi! Yes, I’m looking for a white shirt. Medium, please. Can I try it on?', 'Привет! Да, я ищу белую рубашку. Средний размер. Можно примерить?'],
  ['l', 'Sure, the fitting room is over there. … It’s thirty dollars.', 'Конечно, примерочная вон там. … Она стоит тридцать долларов.'],
  ['r', 'It fits well! Great, I’ll take it. Can I pay by card? — Yes, of course!', 'Сидит отлично! Я беру её. Можно оплатить картой? — Да, конечно!'],
])}
`;

const page2 = `
<h2>3. Как спросить дорогу в городе (Asking for Directions)</h2>
${table(['Ситуация', 'English', 'Перевод'], [
  ['Вежливое начало', '<b>Excuse me, where is the station / bank?</b>', 'Извините, где находится вокзал / банк?'],
  ['Как добраться', '<b>Excuse me, how can I get to the hotel?</b>', 'Извините, как мне добраться до отеля?'],
  ['Направление и поворот', '<b>Go straight (on / ahead). · Turn left / right.</b>', 'Идите прямо. · Поверните налево / направо.'],
  ['Ориентир и расстояние', '<b>At the traffic lights. · Is it far from here?</b>', 'На светофоре. · Это далеко отсюда?'],
  ['Время в пути', '<b>No, it’s five minutes on foot.</b>', 'Нет, пять минут пешком. (<b>on foot</b> = пешком!)'],
], false)}
${card('Предлоги места в городе', '• <b>next to</b> — рядом, вплотную (<i>next to the cafe</i>) &nbsp;·&nbsp; <b>near</b> — недалеко от, поблизости (<i>near the park</i>)<br>• <b>opposite</b> — напротив, через дорогу (<i>opposite the supermarket</i>) &nbsp;·&nbsp; <b>on the corner</b> — на углу (<i>on the corner of Main Street</i>)', 'indigo')}
<h2>4. Готовый диалог 2: На улице</h2>
${dialog('TOURIST', 'LOCAL', [
  ['l', 'Excuse me, where is the metro station?', 'Извините, где станция метро?'],
  ['r', 'Go straight and turn left at the traffic lights. The station is on the corner, opposite the bank.', 'Идите прямо и поверните налево на светофоре. Станция на углу, напротив банка.'],
  ['l', 'Is it far from here? — No, it’s about five minutes on foot. — Thank you!', 'Это далеко отсюда? — Нет, около пяти минут пешком. — Спасибо!'],
])}
${practice(
  [
    'Переведи: <b>Какой у вас размер?</b>',
    'Вставь предлог: <b>Can I pay ___ card?</b>',
    'Переведи: <b>Сколько стоит вот это?</b>',
    'Переведи: <b>Идите прямо и поверните направо на светофоре.</b>',
    'Как сказать «<b>пять минут пешком</b>»?',
    'Переведи: <b>Аптека находится напротив парка.</b>',
  ],
  '<b>1</b> What size are you? · <b>2</b> by (by card) · <b>3</b> How much is this one? · <b>4</b> Go straight and turn right at the traffic lights. · <b>5</b> five minutes on foot · <b>6</b> The pharmacy is opposite the park.'
)}
${checklist(
  [
    'Могу назвать свой размер и спросить цену',
    'Знаю разницу by card и in cash',
    'Понимаю команды go straight, turn left/right',
    'Могу спросить дорогу и расстояние',
  ],
  'День 26 — продолжаем практиковать английский в реальных ситуациях!'
)}
`;

export default {
  day: 25,
  title: 'Диалоги: магазин и город',
  pages: [page1, page2],
};
