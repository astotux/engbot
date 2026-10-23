import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 11 · Глаголы 1–20', 'Глаголы <em>1–20</em>', 'Первая двадцатка глаголов, которые покрывают большую часть живой речи.')}
${formula('I / You / We / They + <i>verb</i> (без окончаний!) <span>→</span> I have a car. We speak English.')}
<h2>🏃 Глаголы 1–13: базовые действия, движение, зрение и слух</h2>
${table(['#', 'Глагол', 'Чтение', 'Перевод', 'Пример'], [
  ['1', 'be (am/is/are)', '<span class="ipa">/biː/</span>', 'быть', 'I <b>am</b> at home. — Я дома.'],
  ['2', 'have', '<span class="ipa">/hæv/</span>', 'иметь («у меня есть»)', 'I <b>have</b> a brother. — У меня есть брат.'],
  ['3', 'do', '<span class="ipa">/duː/</span>', 'делать (выполнять)', 'We <b>do</b> our work. — Мы делаем работу.'],
  ['4', 'go', '<span class="ipa">/ɡəʊ/</span>', 'идти, ехать (туда)', 'I <b>go</b> to work by bus. — Я езжу на автобусе.'],
  ['5', 'come', '<span class="ipa">/kʌm/</span>', 'приходить (сюда)', '<b>Come</b> here! — Иди сюда!'],
  ['6', 'get', '<span class="ipa">/ɡet/</span>', 'получать; добираться', 'I <b>get</b> messages every day.'],
  ['7', 'make', '<span class="ipa">/meɪk/</span>', 'создавать, готовить', 'We <b>make</b> coffee in the morning.'],
  ['8', 'take', '<span class="ipa">/teɪk/</span>', 'брать', 'I <b>take</b> a taxi. — Я беру такси.'],
  ['9', 'see', '<span class="ipa">/siː/</span>', 'видеть (само собой)', 'I <b>see</b> a park. — Я вижу парк.'],
  ['10', 'look (at)', '<span class="ipa">/lʊk/</span>', 'смотреть (направить взгляд)', '<b>Look at</b> this car! — Посмотри на машину!'],
  ['11', 'watch', '<span class="ipa">/wɒtʃ/</span>', 'смотреть (за движением/экраном)', 'We <b>watch</b> TV in the evening.'],
  ['12', 'hear', '<span class="ipa">/hɪə/</span>', 'слышать (ушами, факт)', 'I <b>hear</b> a bus. — Я слышу автобус.'],
  ['13', 'listen (to)', '<span class="ipa">/ˈlɪsn/</span>', 'слушать (внимательно, t молчит!)', 'They <b>listen to</b> the teacher.'],
])}
${tip('💡', 'do vs make и go vs come', '<b>do</b> — выполнять дело (<i>do work</i>); <b>make</b> — создавать или готовить еду/напитки (<i>make coffee, make breakfast</i>). <b>go</b> — двигаться ТУДА (<i>go to work</i>); <b>come</b> — двигаться СЮДА (<i>come here, come home</i>).', '')}
`;

const page2 = `
<h2>💬 Глаголы 14–20: речь, мысли и желания</h2>
${table(['#', 'Глагол', 'Чтение', 'Перевод', 'Пример'], [
  ['14', 'say', '<span class="ipa">/seɪ/</span>', 'сказать (фразу, ЧТО)', 'They <b>say</b> hello. — Они говорят «привет».'],
  ['15', 'tell', '<span class="ipa">/tel/</span>', 'рассказать, сказать (КОМУ)', '<b>Tell</b> me! — Скажи (расскажи) мне!'],
  ['16', 'speak', '<span class="ipa">/spiːk/</span>', 'говорить (общаться, на языке)', 'We <b>speak</b> English. — Мы говорим по-английски.'],
  ['17', 'know', '<span class="ipa">/nəʊ/</span>', 'знать (буква k молчит!)', 'I <b>know</b> this street. — Я знаю эту улицу.'],
  ['18', 'think', '<span class="ipa">/θɪŋk/</span>', 'думать', 'I <b>think</b> so. — Я так думаю.'],
  ['19', 'want', '<span class="ipa">/wɒnt/</span>', 'хотеть', 'I <b>want</b> some coffee. — Я хочу немного кофе.'],
  ['20', 'need', '<span class="ipa">/niːd/</span>', 'нуждаться (мне нужно)', 'We <b>need</b> some water. — Нам нужна вода.'],
])}
${grid(2, [
  card('👀 see / look / watch и 👂 hear / listen', '• <b>see</b> — вижу сам по себе; <b>look at</b> — специально смотрю на; <b>watch</b> — смотрю за движением (<i>watch TV</i>).<br>• <b>hear</b> — слышу звук; <b>listen to</b> — специально слушаю.', 'sky'),
  card('🗣 say / tell / speak и шаблоны', '• <b>say</b> + что (<i>say yes</i>) · <b>tell</b> + кому (<i>tell me</i>) · <b>speak</b> + язык (<i>speak English</i>).<br>• <b>I have…</b> (у меня есть), <b>I want…</b> (я хочу), <b>I need…</b> (мне нужно).', 'amber'),
])}
${practice(
  [
    'Переведи: «У меня есть машина».',
    'Выбери: We <b>(make / do)</b> coffee.',
    'Выбери: We <b>(see / look / watch)</b> TV.',
    'Выбери: We <b>(say / tell / speak)</b> English.',
    'Какие буквы не читаются в <b>know</b> и <b>listen</b>?',
    'Переведи: «Мне нужна вода» и «Иди сюда!».',
  ],
  '<b>1</b> I have a car. · <b>2</b> make · <b>3</b> watch · <b>4</b> speak · <b>5</b> k в know, t в listen · <b>6</b> I need some water; Come here!'
)}
${checklist(
  [
    'Знаю глаголы 1–20 и говорю I have… («у меня есть»)',
    'Различаю see / look at / watch и hear / listen to',
    'Различаю say, tell и speak',
    'Строю предложения с I, you, we, they',
  ],
  'День 12 — глаголы 21–40 (like, love, eat, drink, live, work…) и связки с предлогами.'
)}
`;

export default {
  day: 11,
  title: 'Глаголы 1–20',
  pages: [page1, page2],
};
