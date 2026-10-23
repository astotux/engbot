import { head, tip, card, grid, table, dialog, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 24 · Разговорная практика', 'Диалоги: <em>знакомство и кафе</em>', 'Готовые фразы для первой встречи и для заказа в кафе. Учим целыми репликами!')}
<h2>1. Знакомство — ключевые фразы и вежливость</h2>
<div class="grid g2" style="gap:2.5mm">
<div>
${table(['Английский', 'Русский'], [
  ['Hello! / Hi! · My name is Anna.', 'Привет! Меня зовут Анна.'],
  ['What is your name?', 'Как тебя зовут?'],
  ['Nice to meet you. — Nice to meet you too.', 'Приятно познакомиться. — Мне тоже.'],
  ['Where are you from? — I’m from Russia.', 'Откуда ты? — Я из России.'],
  ['How are you? — I’m fine, thanks. And you?', 'Как дела? — Хорошо, спасибо. А у тебя?'],
  ['How old are you? — I’m twenty-five.', 'Сколько тебе лет? — Мне 25.'],
  ['What do you do? — I’m a teacher.', 'Кем работаешь? — Я учитель.'],
  ['Goodbye! / See you! / Bye!', 'До свидания! / Увидимся! / Пока!'],
])}
</div>
<div>
${table(['Слово вежливости', 'Пример и ситуация'], [
  ['<b>please</b> (пожалуйста — просьба)', 'Can I have a tea, please?'],
  ['<b>thank you / thanks</b> (спасибо)', 'Thank you very much!'],
  ['<b>You’re welcome</b> (не за что)', '— Thanks! — You’re welcome.'],
  ['<b>Excuse me</b> (извините — позвать)', 'Excuse me, where is the menu?'],
  ['<b>Sorry</b> (простите — виноват)', 'Sorry, I’m late.'],
  ['<b>Pardon? / Sorry?</b> (не расслышал)', 'Pardon? Could you say it again?'],
], false)}
${tip('💡', 'Этикет: How are you?', 'На вопрос «How are you?» не принято долго жаловаться. Достаточно: <b>«I’m fine, thanks. And you?»</b>', 'good')}
</div>
</div>
<h2>2. Диалог 1 — Первая встреча</h2>
${dialog('ANNA', 'TOM', [
  ['l', 'Hello! My name is Anna. What is your name?', 'Привет! Меня зовут Анна. Как тебя зовут?'],
  ['r', 'Hi, Anna! I am Tom. Nice to meet you.', 'Привет, Анна! Я Том. Приятно познакомиться.'],
  ['l', 'Nice to meet you too. Where are you from?', 'Мне тоже приятно. Откуда ты?'],
  ['r', 'I am from Canada. And you? — I am from Russia.', 'Я из Канады. А ты? — Я из России.'],
])}
`;

const page2 = `
<h2>3. В кафе — меню, заказ и цена</h2>
<div class="grid g2" style="gap:2.5mm">
<div>
${table(['Фраза в кафе', 'Перевод'], [
  ['What would you like?', 'Что вы будете?'],
  ['I would like (I’d like) a coffee, please.', 'Я бы хотел(а) кофе, пожалуйста.'],
  ['Can I have a tea, please?', 'Можно мне чай, пожалуйста?'],
  ['Anything else? — No, thank you.', 'Что-нибудь ещё? — Нет, спасибо.'],
  ['For here or to take away?', 'Здесь или с собой?'],
  ['Here you are. · Enjoy your meal!', 'Вот, пожалуйста. · Приятного аппетита!'],
  ['How much is it? · The bill, please.', 'Сколько стоит? · Счёт, пожалуйста.'],
])}
</div>
<div>
${card('Меню и как спросить цену', '<b>Меню:</b> coffee (кофе), tea (чай), juice (сок), water (вода), sandwich (сэндвич), cake (торт), soup (суп), salad (салат).<br><b>Цена:</b> <b>How much is</b> the cake? — It is $3 (1 предмет).<br><b>How much are</b> the sandwiches? — They are $4 <b>each</b> (за штуку).', 'indigo')}
${tip('⚠️', 'Не говори так!', '❌ <i>I want a coffee</i> (резко) → ✅ <b>I would like a coffee, please.</b><br>❌ <i>I am 25 years / I am agree</i> → ✅ <b>I am 25 / I agree.</b>', 'warn')}
</div>
</div>
<h2>4. Диалог 2 — Заказ в кафе и покупка</h2>
${dialog('WAITER', 'CUSTOMER', [
  ['l', 'Good morning! What would you like?', 'Доброе утро! Что вы будете?'],
  ['r', 'Good morning. I would like a coffee and a sandwich, please.', 'Доброе утро. Я бы хотел(а) кофе и сэндвич, пожалуйста.'],
  ['l', 'Anything else? — No, thank you. How much is it?', 'Что-нибудь ещё? — Нет, спасибо. Сколько это стоит?'],
  ['r', 'It is eight dollars. — Here you are. — Thank you. Enjoy your meal!', 'Восемь долларов. — Вот, пожалуйста. — Спасибо. Приятного аппетита!'],
])}
${practice(
  [
    'Ответь на фразу: <b>Nice to meet you.</b>',
    'Ответь на: <b>Thank you very much!</b>',
    'Вежливо попроси чай (с <b>would like</b>).',
    'Вставь слово: <b>How ___ is the cake?</b>',
    'Выбери <b>is</b> или <b>are</b>: How much ___ the sandwiches?',
    'Как сказать «Привлечь внимание» и «Счёт, пожалуйста»?',
  ],
  '<b>1</b> Nice to meet you too. · <b>2</b> You’re welcome. · <b>3</b> I would like a tea, please. · <b>4</b> much · <b>5</b> are · <b>6</b> Excuse me. / The bill, please.'
)}
${checklist(
  [
    'Могу познакомиться и назвать свою страну',
    'Знаю слова вежливости (please, excuse me, you’re welcome)',
    'Умею вежливо сделать заказ в кафе',
    'Умею спросить цену (How much is/are…)',
  ],
  'День 25 — диалоги в магазине одежды и как спросить дорогу в городе.'
)}
`;

export default {
  day: 24,
  title: 'Диалоги: знакомство и кафе',
  pages: [page1, page2],
};
