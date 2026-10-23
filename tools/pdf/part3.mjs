import { head, tip, card, grid, formula, table, words, dialog, steps } from './lib.mjs';

const time = `
${head('Шаг 7 · Основа', 'Дни, месяцы <em>и время</em>', 'Назвать день, дату и сказать, который час — базовые навыки для любой беседы.')}
${grid(2, [
  table(['День', 'Перевод'], [['Monday','понедельник'],['Tuesday','вторник'],['Wednesday','среда'],['Thursday','четверг'],['Friday','пятница'],['Saturday','суббота'],['Sunday','воскресенье']]),
  table(['Месяц', 'Перевод'], [['January','январь'],['February','февраль'],['March','март'],['April','апрель'],['May','май'],['June','июнь'],['July','июль'],['August','август'],['September','сентябрь'],['October','октябрь'],['November','ноябрь'],['December','декабрь']]),
])}
<p class="small">Дни и месяцы всегда пишутся с <b>заглавной</b> буквы.</p>
<h2>Который час?</h2>
${formula('What time <span>is it</span>? — It’s <i>seven o’clock</i>.')}
${table(['Время', 'Как сказать', 'Схема'], [
  ['7:00', 'seven o’clock', 'час + o’clock'],
  ['7:15', 'quarter past seven', 'past — после'],
  ['7:30', 'half past seven', 'половина'],
  ['7:45', 'quarter to eight', 'to — до'],
  ['7:10', 'ten past seven', 'минуты + past'],
  ['7:50', 'ten to eight', 'минуты + to'],
], false)}
<h2>Слова-маркеры времени</h2>
<div class="wordlist" style="margin-top:2mm">
<div class="wl"><b>today</b><span>сегодня</span></div><div class="wl"><b>tomorrow</b><span>завтра</span></div>
<div class="wl"><b>yesterday</b><span>вчера</span></div><div class="wl"><b>now</b><span>сейчас</span></div>
<div class="wl"><b>always</b><span>всегда</span></div><div class="wl"><b>usually</b><span>обычно</span></div>
<div class="wl"><b>often</b><span>часто</span></div><div class="wl"><b>sometimes</b><span>иногда</span></div>
<div class="wl"><b>never</b><span>никогда</span></div><div class="wl"><b>every day</b><span>каждый день</span></div>
</div>
${tip('💡', 'Дата', 'Говорим: <span class="en">October the twenty-third</span> или <span class="en">the twenty-third of October</span>. Пишем: 23 October / October 23.', '')}`;

const nouns1 = `
${head('Шаг 8 · Словарь', 'Топ существительных <em>· часть 1</em>', 'Люди, семья, дом и тело — слова, которые нужны каждый день.')}
<h2>👥 Люди и семья</h2>
${words([['man','мужчина'],['woman','женщина'],['child','ребёнок'],['friend','друг'],['family','семья'],['mother','мама'],['father','папа'],['brother','брат'],['sister','сестра'],['son','сын'],['daughter','дочь'],['husband','муж'],['wife','жена'],['teacher','учитель'],['doctor','врач'],['student','студент']])}
<h2>🏠 Дом</h2>
${words([['house','дом'],['room','комната'],['kitchen','кухня'],['bedroom','спальня'],['bathroom','ванная'],['door','дверь'],['window','окно'],['table','стол'],['chair','стул'],['bed','кровать'],['key','ключ'],['phone','телефон']])}
<h2>🧍 Тело</h2>
${words([['head','голова'],['eye','глаз'],['ear','ухо'],['nose','нос'],['mouth','рот'],['hand','рука (кисть)'],['arm','рука'],['leg','нога'],['foot','стопа'],['heart','сердце']])}
${tip('✅', 'Как учить слова', 'Не заучивай списком. Выбери 5 слов, придумай с каждым предложение про себя: <span class="en">My sister is a doctor.</span> Через день повтори — и слова останутся.', 'good')}`;

const nouns2 = `
${head('Шаг 9 · Словарь', 'Топ существительных <em>· часть 2</em>', 'Еда, город, транспорт и работа — язык повседневных ситуаций.')}
<h2>🍎 Еда и напитки</h2>
${words([['bread','хлеб'],['water','вода'],['milk','молоко'],['coffee','кофе'],['tea','чай'],['juice','сок'],['meat','мясо'],['fish','рыба'],['egg','яйцо'],['cheese','сыр'],['apple','яблоко'],['rice','рис'],['soup','суп'],['salad','салат'],['sugar','сахар'],['breakfast','завтрак']])}
<h2>🏙 Город</h2>
${words([['street','улица'],['shop','магазин'],['bank','банк'],['hospital','больница'],['school','школа'],['park','парк'],['station','станция'],['airport','аэропорт'],['hotel','отель'],['restaurant','ресторан'],['bridge','мост'],['market','рынок']])}
<h2>🚌 Транспорт</h2>
${words([['car','машина'],['bus','автобус'],['train','поезд'],['plane','самолёт'],['taxi','такси'],['bike','велосипед'],['ticket','билет'],['road','дорога']])}
<h2>💼 Работа и деньги</h2>
${words([['job','работа (должность)'],['work','работа (труд)'],['office','офис'],['money','деньги'],['price','цена'],['meeting','встреча'],['company','компания'],['boss','начальник']])}
${tip('⚠️', 'Нельзя во множественном числе', '<span class="en">money, water, bread, advice, information</span> — неисчисляемые. Не <span class="bad-t">a money</span>, а <span class="good-t">some money</span>.', 'bad')}`;

const verbList = [
  ['be','быть'],['have','иметь'],['do','делать'],['go','идти / ехать'],['come','приходить'],['get','получать'],['make','создавать'],['take','брать'],['see','видеть'],['look','смотреть'],
  ['watch','наблюдать'],['hear','слышать'],['listen','слушать'],['say','сказать'],['tell','рассказать'],['speak','говорить'],['know','знать'],['think','думать'],['want','хотеть'],['need','нуждаться'],
  ['like','нравиться'],['love','любить'],['eat','есть'],['drink','пить'],['live','жить'],['work','работать'],['study','учиться'],['read','читать'],['write','писать'],['buy','покупать'],
  ['give','давать'],['find','находить'],['help','помогать'],['try','пробовать'],['call','звонить'],['ask','спрашивать'],['wait','ждать'],['open','открывать'],['play','играть'],['sleep','спать'],
];
const verbRows = Array.from({ length: 20 }, (_, i) => [verbList[i][0], verbList[i][1], verbList[i + 20][0], verbList[i + 20][1]]);

const verbs = `
${head('Шаг 10 · Словарь', '40 главных <em>глаголов</em>', 'Эти глаголы покрывают около 70% повседневной речи. Выучи по 5 в день — за неделю все.')}
<table><thead><tr><th>Глагол</th><th>Перевод</th><th>Глагол</th><th>Перевод</th></tr></thead><tbody>${verbRows
  .map((r) => `<tr><td class="en">${r[0]}</td><td>${r[1]}</td><td class="en">${r[2]}</td><td>${r[3]}</td></tr>`)
  .join('')}</tbody></table>
<h2>В предложениях</h2>
${grid(2, [
  card('', '<span class="en">I have</span> a brother. · У меня есть брат.<br><span class="en">I go</span> to work by bus. · Я езжу на работу на автобусе.<br><span class="en">She makes</span> good coffee. · Она варит хороший кофе.', 'indigo'),
  card('', '<span class="en">We speak</span> English. · Мы говорим по-английски.<br><span class="en">Can you help</span> me? · Ты можешь мне помочь?<br><span class="en">I need</span> water. · Мне нужна вода.', 'mint'),
])}
${tip('💡', 'Связки с предлогом', 'Один глагол — много значений: <span class="en">get up</span> (вставать), <span class="en">get home</span> (добраться), <span class="en">get tired</span> (устать). Учи глагол вместе с предлогом.', '')}`;

const adjectives = `
${head('Шаг 11 · Словарь', 'Прилагательные <em>и антонимы</em>', 'Учи парами — так запоминается вдвое быстрее.')}
<h2>Противоположности</h2>
${table(['Слово', 'Перевод', 'Антоним', 'Перевод'], [
  ['big', 'большой', 'small', 'маленький'], ['long', 'длинный', 'short', 'короткий'], ['hot', 'горячий', 'cold', 'холодный'], ['new', 'новый', 'old', 'старый'],
  ['good', 'хороший', 'bad', 'плохой'], ['easy', 'лёгкий', 'difficult', 'трудный'], ['fast', 'быстрый', 'slow', 'медленный'], ['happy', 'счастливый', 'sad', 'грустный'],
  ['cheap', 'дешёвый', 'expensive', 'дорогой'], ['rich', 'богатый', 'poor', 'бедный'], ['clean', 'чистый', 'dirty', 'грязный'],
  ['near', 'близкий', 'far', 'далёкий'], ['early', 'ранний', 'late', 'поздний'], ['strong', 'сильный', 'weak', 'слабый'],
], false)}
<h2>🎨 Цвета</h2>
<p>
<span class="pill r">red — красный</span><span class="pill s">blue — синий</span><span class="pill m">green — зелёный</span><span class="pill a">yellow — жёлтый</span>
<span class="pill i">purple — фиолетовый</span><span class="pill a">orange — оранжевый</span><span class="pill r">pink — розовый</span>
<span class="pill i" style="background:#eee;color:#222">black — чёрный</span><span class="pill i" style="background:#fff;border:1px solid #ddd;color:#222">white — белый</span><span class="pill i" style="background:#eee;color:#666">grey — серый</span><span class="pill a" style="background:#f4e6d8;color:#7a4b1e">brown — коричневый</span>
</p>
<h2>😊 Чувства</h2>
${words([['tired','уставший'],['hungry','голодный'],['angry','злой'],['busy','занятый'],['afraid','испуганный'],['bored','скучающий'],['excited','взволнованный'],['worried','обеспокоенный']])}
<h2>Порядок слов</h2>
${formula('Прилагательное <span>+</span> существительное')}
<div class="grid g2"><div class="card mint"><b class="good-t">a big house</b><br><span class="small">большой дом</span></div><div class="card rose"><b class="bad-t">a house big</b><br><span class="small">в английском прилагательное — перед словом</span></div></div>
${tip('⚠️', 'Прилагательные не меняются', 'Нет родов и падежей: <span class="en">a new car, new cars, a new house</span>. Одна форма на все случаи.', 'bad')}`;

export const pages = [
  { section: 'Время и даты', body: time },
  { section: 'Существительные · 1', body: nouns1 },
  { section: 'Существительные · 2', body: nouns2 },
  { section: 'Глаголы', body: verbs },
  { section: 'Прилагательные', body: adjectives },
];
