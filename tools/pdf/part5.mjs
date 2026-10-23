import { head, tip, card, grid, formula, table, words, dialog, steps } from './lib.mjs';

const dlg1 = `
${head('Шаг 18 · Речь', 'Диалоги: <em>знакомство и кафе</em>', 'Прочитай вслух три раза — и фразы запомнятся целиком.')}
<h2>👋 Знакомство</h2>
${dialog('Anna', 'Tom', [
  ['l', 'Hi! I’m Anna. Nice to meet you.', 'Привет! Я Анна. Приятно познакомиться.'],
  ['r', 'Nice to meet you too. I’m Tom.', 'Мне тоже приятно. Я Том.'],
  ['l', 'Where are you from?', 'Откуда ты?'],
  ['r', 'I’m from Canada. And you?', 'Я из Канады. А ты?'],
  ['l', 'I’m from Ukraine. I’m a teacher.', 'Я из Украины. Я учитель.'],
  ['r', 'Cool! See you later!', 'Здорово! До встречи!'],
])}
<h2>☕ В кафе</h2>
${dialog('Waiter', 'Guest', [
  ['l', 'Hello! What would you like?', 'Здравствуйте! Что желаете?'],
  ['r', 'I’d like a cappuccino and a sandwich, please.', 'Капучино и сэндвич, пожалуйста.'],
  ['l', 'Anything else?', 'Что-нибудь ещё?'],
  ['r', 'No, thank you. How much is it?', 'Нет, спасибо. Сколько с меня?'],
  ['l', 'It’s eight dollars.', 'Восемь долларов.'],
  ['r', 'Here you are. Thank you!', 'Вот, держите. Спасибо!'],
])}
${tip('💡', 'Вежливые фразы', '<span class="en">Please</span> — пожалуйста (просьба) · <span class="en">You’re welcome</span> — пожалуйста (в ответ на thanks) · <span class="en">Excuse me</span> — извините (привлечь внимание) · <span class="en">Sorry</span> — простите.', '')}`;

const dlg2 = `
${head('Шаг 19 · Речь', 'Диалоги: <em>магазин и город</em>', 'Выучи шаблоны — подставляй свои слова.')}
<h2>🛍 В магазине</h2>
${dialog('Seller', 'Buyer', [
  ['l', 'Can I help you?', 'Вам помочь?'],
  ['r', 'Yes, I’m looking for a jacket.', 'Да, я ищу куртку.'],
  ['l', 'What size are you?', 'Какой у вас размер?'],
  ['r', 'Medium. How much is this one?', 'Средний. Сколько стоит эта?'],
  ['l', 'It’s fifty dollars.', 'Пятьдесят долларов.'],
  ['r', 'Can I pay by card?', 'Можно картой?'],
])}
<h2>🗺 Как пройти</h2>
${dialog('Tourist', 'Local', [
  ['l', 'Excuse me, where is the station?', 'Извините, где вокзал?'],
  ['r', 'Go straight, then turn left.', 'Идите прямо, затем налево.'],
  ['l', 'Is it far from here?', 'Это далеко отсюда?'],
  ['r', 'No, it’s five minutes on foot.', 'Нет, пять минут пешком.'],
])}
${table(['Фраза', 'Перевод'], [
  ['Turn left / right', 'Поверните налево / направо'],
  ['Go straight', 'Идите прямо'],
  ['next to / near', 'рядом с / около'],
  ['opposite', 'напротив'],
  ['on the corner', 'на углу'],
  ['at the traffic lights', 'у светофора'],
])}`;

const preps = `
${head('Шаг 20 · Закрепление', 'Предлоги <em>in, on, at</em>', 'Три главных предлога места и времени. Запомни логику «от большего к меньшему».')}
<h2>Время</h2>
${grid(3, [
  card('IN', 'месяцы, годы, сезоны, части дня<br><span class="en">in May, in 2025, in winter, in the morning</span>', 'indigo'),
  card('ON', 'дни и даты<br><span class="en">on Monday, on 5 May, on my birthday</span>', 'amber'),
  card('AT', 'точное время, ночь<br><span class="en">at 7:00, at noon, at night, at the weekend</span>', 'mint'),
])}
<h2>Место</h2>
${grid(3, [
  card('IN', 'внутри чего-то<br><span class="en">in a room, in London, in a box</span>', 'indigo'),
  card('ON', 'на поверхности<br><span class="en">on the table, on the wall, on the floor</span>', 'amber'),
  card('AT', 'в точке, у места<br><span class="en">at home, at work, at the door</span>', 'mint'),
])}
<h2>Другие важные предлоги</h2>
${table(['Предлог', 'Значение', 'Пример'], [
  ['to', 'куда (направление)', 'I go to school.'],
  ['from', 'откуда', 'I’m from Kyiv.'],
  ['with', 'с кем / чем', 'Coffee with milk.'],
  ['for', 'для; в течение', 'A gift for you. For two hours.'],
  ['by', 'на (транспорте); рядом', 'by bus, by the window'],
  ['about', 'о, про', 'Tell me about it.'],
  ['under / over', 'под / над', 'under the table'],
  ['between', 'между', 'between two houses'],
])}
${tip('⚠️', 'Исключения', '<span class="en">at home</span> (не in home) · <span class="en">go home</span> (без to) · <span class="en">on the bus</span> / <span class="en">by bus</span> · <span class="en">in the morning</span>, но <span class="en">at night</span>.', 'bad')}`;

const mistakes = `
${head('Шаг 21 · Закрепление', '12 ошибок <em>новичков</em>', 'Знаешь — значит, не допустишь. Сверься перед тем, как сказать фразу.')}
${table(['❌ Неправильно', '✅ Правильно', 'Почему'], [
  ['<span class="bad-t">I student</span>', '<span class="good-t">I am a student</span>', 'Нужен глагол to be и артикль'],
  ['<span class="bad-t">She work here</span>', '<span class="good-t">She works here</span>', '-s для he / she / it'],
  ['<span class="bad-t">Does he works?</span>', '<span class="good-t">Does he work?</span>', 'После does — глагол без -s'],
  ['<span class="bad-t">I have 20 years</span>', '<span class="good-t">I am 20 years old</span>', 'Возраст — с глаголом to be'],
  ['<span class="bad-t">I am agree</span>', '<span class="good-t">I agree</span>', 'Agree — уже глагол'],
  ['<span class="bad-t">Me and my friend</span>', '<span class="good-t">My friend and I</span>', 'Себя называем последним'],
  ['<span class="bad-t">I like very much it</span>', '<span class="good-t">I like it very much</span>', 'Very much — в конце'],
  ['<span class="bad-t">He go to school</span>', '<span class="good-t">He goes to school</span>', '-es после o'],
  ['<span class="bad-t">I didn’t went</span>', '<span class="good-t">I didn’t go</span>', 'После didn’t — начальная форма'],
  ['<span class="bad-t">Many money</span>', '<span class="good-t">Much money</span>', 'money неисчисляемое'],
  ['<span class="bad-t">I’m boring</span>', '<span class="good-t">I’m bored</span>', 'boring = скучный, bored = скучающий'],
  ['<span class="bad-t">I look the TV</span>', '<span class="good-t">I watch TV</span>', 'look at — смотреть на, watch — смотреть'],
], false)}
${tip('✅', 'Как избавиться от ошибок', 'Записывай свои типичные ошибки в заметки. Через неделю перечитай — большая часть исчезнет сама.', 'good')}
${tip('💡', 'Не бойся говорить', 'Носители ошибаются в собственном языке постоянно. Главное — донести мысль. Правильность придёт с практикой.', '')}`;

export const pages = [
  { section: 'Диалоги · 1', body: dlg1 },
  { section: 'Диалоги · 2', body: dlg2 },
  { section: 'Предлоги', body: preps },
  { section: 'Типичные ошибки', body: mistakes },
];
