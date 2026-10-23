import { head, tip, card, grid, formula, table, dialog, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 3 · Знакомство', 'Местоимения <em>и приветствия</em>', 'Семь маленьких слов, без которых не обойтись ни в одной фразе, и первые шаблоны знакомства.')}
<h2>Личные и притяжательные местоимения (пары)</h2>
${table(['Личное (кто?)', 'Произношение и пример', 'Притяжательное (чей?)', 'Произношение и пример'], [
  ['I — я', '<span class="ipa">/aɪ/</span> «ай» · <b>I am Anna.</b>', '<b>my</b> — мой, моя, мои', '<span class="ipa">/maɪ/</span> «май» · <b>my name</b>'],
  ['you — ты / вы', '<span class="ipa">/juː/</span> «ю» · <b>You are great.</b>', '<b>your</b> — твой / ваш', '<span class="ipa">/jɔː/</span> «ё» · <b>your book</b>'],
  ['he — он', '<span class="ipa">/hiː/</span> «хи» · <b>He is Tom.</b>', '<b>his</b> — его', '<span class="ipa">/hɪz/</span> «хиз» · <b>his name</b>'],
  ['she — она', '<span class="ipa">/ʃiː/</span> «ши» · <b>She is Kate.</b>', '<b>her</b> — её', '<span class="ipa">/hɜː/</span> «хё» · <b>her name</b>'],
  ['it — оно (предмет)', '<span class="ipa">/ɪt/</span> «ит» · <b>It is a cat.</b>', '<b>its</b> — его / её (предмета)', '<span class="ipa">/ɪts/</span> «итс» · <b>its name</b>'],
  ['we — мы', '<span class="ipa">/wiː/</span> «уи» · <b>We are friends.</b>', '<b>our</b> — наш', '<span class="ipa">/ˈaʊə/</span> «ауэ» · <b>our house</b>'],
  ['they — они', '<span class="ipa">/ðeɪ/</span> «зэй» · <b>They are here.</b>', '<b>their</b> — их', '<span class="ipa">/ðeə/</span> «зэа» · <b>their house</b>'],
])}
${grid(2, [
  card('💡 Важные правила про I, you, it', '• <b>I («я»)</b> всегда с большой буквы: <i>Today I work.</i><br>• <b>you</b> — и «ты», и «вы», и вежливое «Вы».<br>• <b>he / she</b> — только про людей; <b>it</b> — про предметы и животных.', 'indigo'),
  card('⚠️ Не путай his и her!', '• <b>his</b> <span class="ipa">/hɪz/</span> — его (Тома), <b>her</b> <span class="ipa">/hɜː/</span> — её (Кейт).<br>• Притяжательное слово <b>не меняется</b> по родам и числам: <i>my brother, my sister, my friends</i>.', 'amber'),
])}
${formula('I → <i>my</i> · you → <i>your</i> · he → <i>his</i> · she → <i>her</i> · it → <i>its</i> · we → <i>our</i> · they → <i>their</i>')}
`;

const page2 = `
<h2>Приветствия и прощания</h2>
${table(['Фраза', 'Когда говорим', 'Перевод'], [
  ['Hello! / Hi!', 'в любое время / неформально с друзьями', 'Здравствуйте! / Привет!'],
  ['Good morning!', 'утром (до ~12:00)', 'Доброе утро!'],
  ['Good afternoon!', 'днём (с ~12:00 до ~18:00)', 'Добрый день!'],
  ['Good evening!', 'вечером (после ~18:00)', 'Добрый вечер!'],
  ['Good night!', 'перед сном, при прощании на ночь', 'Спокойной ночи!'],
  ['Goodbye! / Bye! / See you!', 'при расставании', 'До свидания! / Пока! / Увидимся!'],
])}
<h2>Шаблоны знакомства и мини-диалог</h2>
${grid(2, [
  card('Как представиться', '<b>My name is Anna.</b> — Меня зовут Анна.<br><b>I am Anna.</b> — Я Анна.<br><b>Her name is Kate. / His name is Mark.</b><br><b>What is your name?</b> — Как тебя зовут?', 'sky'),
  dialog('Anna', 'Tom', [
    ['l', 'Hello! My name is Anna.', 'Здравствуйте! Меня зовут Анна.'],
    ['r', 'Hi, Anna! My name is Tom.', 'Привет, Анна! Меня зовут Том.'],
    ['l', 'Good morning, Tom! See you!', 'Доброе утро, Том! Увидимся!'],
  ]),
])}
${practice(
  [
    'Как по-английски «мы» и «наш дом»?',
    'Какое местоимение подставить вместо имени <b>Kate</b>?',
    'Как правильно написать «я» в середине предложения?',
    'Выбери <b>my / his / her</b>: ___ name is Tom (его).',
    'Чем ответишь на приветствие <b>Good evening!</b>?',
    'Переведи на английский: «Меня зовут Анна».',
  ],
  '<b>1</b> we, our house · <b>2</b> she · <b>3</b> I (с большой буквы) · <b>4</b> his · <b>5</b> Good evening! · <b>6</b> My name is Anna.'
)}
${checklist(
  [
    'Знаю 7 личных местоимений (I, you, he, she, it, we, they)',
    'Знаю 7 притяжательных (my, your, his, her, its, our, their)',
    'Всегда пишу I с большой буквы',
    'Умею здороваться по времени суток и говорить «My name is…»',
  ],
  'День 4 — глагол to be (am, is, are): научимся говорить, кто ты и откуда.'
)}
`;

export default {
  day: 3,
  title: 'Местоимения и знакомство',
  pages: [page1, page2],
};
