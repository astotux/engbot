import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 4 · Глагол to be', 'Глагол <em>to be</em>: am, is, are', 'Самый главный глагол английского: без него нельзя сказать ни «Я студент», ни «Она дома».')}
${tip('⚠️', 'Зачем нужен глагол to be?', 'В русском мы говорим «Я студент» без глагола. В английском глагол-связка <b>обязателен</b>: дословно «Я ЕСТЬ студент». Ошибка: <s>I student</s> → Правильно: <b>I am a student.</b>', 'warn')}
<h2>Три формы to be и сокращения</h2>
${table(['Местоимение', 'Форма', 'Сокращение и звук', 'Пример и перевод'], [
  ['I', '<b>am</b>', '<b>I’m</b> <span class="ipa">/aɪm/</span>', '<b>I am Anna. / I’m Anna.</b> — Я Анна.'],
  ['he / she / it', '<b>is</b>', '<b>he’s</b> <span class="ipa">/hiːz/</span> · <b>she’s</b> <span class="ipa">/ʃiːz/</span> · <b>it’s</b> <span class="ipa">/ɪts/</span>', '<b>She is from Spain.</b> — Она из Испании.'],
  ['we / you / they', '<b>are</b>', '<b>we’re</b> <span class="ipa">/wɪə/</span> · <b>you’re</b> <span class="ipa">/jɔː/</span> · <b>they’re</b> <span class="ipa">/ðeə/</span>', '<b>They are friends.</b> — Они друзья.'],
])}
${tip('💡', 'Три группы и апостроф', 'Запомни: <b>I → am</b>; единственное число (he/she/it) → <b>is</b>; множественное число и <b>you → are</b> (даже для одного человека!). В сокращениях не забывай апостроф: <b>I’m, he’s, they’re</b>.', 'good')}
<h2>Отрицание: добавляем not после to be</h2>
${formula('I <b>am not</b> (I’m not) · he/she/it <b>is not</b> (isn’t) · we/you/they <b>are not</b> (aren’t)')}
${grid(3, [
  card('I’m not', '<b>I am not from England.</b><br>Я не из Англии.<br><span class="small">⚠️ Формы «amn’t» не существует!</span>', 'rose'),
  card('isn’t = is not', '<b>He isn’t a teacher.</b><br>Он не учитель.<br><b>She isn’t tired.</b>', 'amber'),
  card('aren’t = are not', '<b>We aren’t late.</b><br>Мы не опоздали.<br><b>They aren’t at home.</b>', 'sky'),
])}
`;

const page2 = `
<h2>Вопрос и краткие ответы</h2>
${formula('Утверждение: <b>You are</b> Russian. <span>→</span> Вопрос: <b>Are you</b> Russian? (to be на 1-е место)')}
${table(['Вопрос', 'Краткий ответ «Да» (без сокращения!)', 'Краткий ответ «Нет»'], [
  ['Am I late?', '<b>Yes, you are.</b>', '<b>No, you aren’t.</b> (No, you’re not.)'],
  ['Are you Anna?', '<b>Yes, I am.</b> (❌ не <s>Yes, I’m</s>)', '<b>No, I’m not.</b>'],
  ['Is he Tom?', '<b>Yes, he is.</b>', '<b>No, he isn’t.</b>'],
  ['Is she from Spain?', '<b>Yes, she is.</b>', '<b>No, she isn’t.</b>'],
  ['Are they friends?', '<b>Yes, they are.</b>', '<b>No, they aren’t.</b>'],
])}
<h2>Шаблоны: расскажи о себе</h2>
${grid(2, [
  card('О себе (имя, страна, возраст)', '• <b>My name is Anna. / I’m Anna.</b> — Меня зовут Анна.<br>• <b>I am from Russia.</b> — Я из России.<br>• <b>I am Russian.</b> — Я русская / русский.<br>• <b>I am 25.</b> — Мне 25 лет (слово years не обязательно).', 'indigo'),
  card('Полезные вопросы собеседнику', '• <b>Where are you from?</b> — Откуда ты?<br>• <b>How old are you?</b> — Сколько тебе лет?<br>• <b>How are you?</b> — Как дела?<br>• <b>I’m fine, thanks!</b> — Хорошо, спасибо!', 'mint'),
])}
${practice(
  [
    'Вставь am / is / are: <b>She ___ from Spain. We ___ friends.</b>',
    'Раскрой сокращение: <b>they’re</b>.',
    'Сделай отрицание: <b>He is a doctor.</b>',
    'Сделай вопрос: <b>You are Russian.</b>',
    'Дай краткий ответ «да»: <b>Is she Anna?</b>',
    'Переведи на английский: «Мне 20 лет».',
  ],
  '<b>1</b> is, are · <b>2</b> they are · <b>3</b> He isn’t a doctor. · <b>4</b> Are you Russian? · <b>5</b> Yes, she is. · <b>6</b> I am 20.'
)}
${checklist(
  [
    'Знаю формы am, is, are и не пропускаю их в фразе',
    'Использую сокращения I’m, he’s, isn’t, aren’t',
    'Строю вопрос (to be на 1-е место) и краткий ответ',
    'Могу назвать своё имя, страну и возраст',
  ],
  'День 5 — артикли a, an, the и множественное число существительных.'
)}
`;

export default {
  day: 4,
  title: 'Глагол to be: am, is, are',
  pages: [page1, page2],
};
