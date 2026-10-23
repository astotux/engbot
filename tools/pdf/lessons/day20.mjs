import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 20 · Большое повторение', 'Дни 15–19: <em>Present Simple и модальные</em>', 'Present Simple, вопросительные слова и модальные глаголы на одном листе.')}
<h2>1. Present Simple — полная таблица (Дни 15–17)</h2>
${table(['Тип предложения', 'I / you / we / they', 'he / she / it'], [
  ['Утверждение (+)', '<b>I work</b> every day.', '<b>He works</b> every day. <span class="small">(have → has, go → goes, study → studies)</span>'],
  ['Отрицание (–)', '<b>I don’t work</b> on Sunday.', '<b>He doesn’t work</b> on Sunday. <span class="small">(глагол БЕЗ -s!)</span>'],
  ['Вопрос (?)', '<b>Do you work</b> here?', '<b>Does he work</b> here? <span class="small">(глагол БЕЗ -s!)</span>'],
  ['Краткий ответ', 'Yes, I do. / No, I don’t.', 'Yes, he does. / No, he doesn’t.'],
], false)}
${tip('⚠️', 'Главная ловушка Present Simple', 'Как только в предложении появляется помощник <b>DOES</b> или <b>DOESN’T</b>, он забирает окончание <b>-s</b> себе:<br>❌ <i>He doesn’t works. / Does she likes tea?</i> → ✅ <b>He doesn’t work. / Does she like tea?</b>', 'warn')}
<h2>2. Слова-маркеры регулярности</h2>
${grid(2, [
  card('Наречия частоты', '<span class="pill i">always (100%)</span> всегда · <span class="pill s">usually (80%)</span> обычно · <span class="pill m">often (60%)</span> часто · <span class="pill a">sometimes (30%)</span> иногда · <span class="pill r">never (0%)</span> никогда', 'indigo'),
  card('Выражения времени и порядок слов', '<b>every day / week / morning</b> · <b>on Mondays</b><br>Маркер стоит <b>ПЕРЕД</b> обычным глаголом (<i>I always drink coffee</i>), но <b>ПОСЛЕ</b> am/is/are (<i>He is always late</i>).', 'sky'),
])}
<h2>3. Вопросительные слова и схема вопроса (День 18)</h2>
${formula('Вопросительное слово + <span>do / does</span> + подлежащее + <i>глагол (без -s)</i>?')}
${table(['Слово', 'Значение', 'Пример вопроса', 'Пример ответа'], [
  ['What', 'что / какой', 'What do you like?', 'I like tea and music.'],
  ['Where', 'где / куда', 'Where does she live?', 'She lives in London.'],
  ['When', 'когда', 'When do they get up?', 'They get up at seven o’clock.'],
  ['Who', 'кто / кого', 'Who do you know here?', 'I know Anna and Tom.'],
  ['Why', 'почему', 'Why do you study English?', 'Because I want to travel.'],
  ['How', 'как', 'How do you go to work?', 'I go to work by bus.'],
  ['How much', 'сколько (неисчисл. / цена)', 'How much is this dress?', 'It is thirty dollars.'],
  ['How many', 'сколько (исчисл., мн. ч.)', 'How many brothers do you have?', 'I have two brothers.'],
])}
`;

const page2 = `
<h2>4. Модальные глаголы (День 19)</h2>
${table(['Глагол', 'Значение', 'Пример', 'Важная деталь'], [
  ['can / can’t', 'умею, могу / не могу', 'I can swim. She can’t drive.', 'После can — глагол <b>БЕЗ to</b> и <b>БЕЗ -s</b>'],
  ['must / mustn’t', 'обязан / строго запрещено', 'You must stop. You mustn’t smoke here.', '<b>mustn’t</b> = нельзя (строгий запрет!)'],
  ['have to / don’t have to', 'приходится / нет необходимости', 'I have to work. You don’t have to pay.', 'Меняется: <b>he has to / doesn’t have to</b>'],
  ['should / shouldn’t', 'следует (добрый совет)', 'You should sleep more.', 'Мягкий совет, не приказ'],
  ['would like', 'хотел(а) бы (вежливо)', 'I would like a cup of coffee.', 'С глаголом — через <b>to</b>: <i>I’d like to go</i>'],
])}
${practice(
  [
    'Исправь ошибку: <b>She doesn’t likes milk.</b>',
    'Переведи: <b>Где ты живёшь?</b>',
    'Выбери: <b>How much / How many</b> water do you drink?',
    'Исправь ошибку: <b>He can to speak English.</b>',
    'Переведи: <b>Мне не нужно вставать рано</b> (нет необходимости).',
    'Переведи: <b>Я бы хотел(а) чашку чая.</b>',
  ],
  '<b>1</b> She doesn’t like milk. · <b>2</b> Where do you live? · <b>3</b> How much water do you drink? · <b>4</b> He can speak English. · <b>5</b> I don’t have to get up early. · <b>6</b> I would like a cup of tea.'
)}
${checklist(
  [
    'Не забываю -s у he/she/it в «+»',
    'Убираю -s после doesn’t и does',
    'Строю вопросы с What/Where/Why',
    'Различаю mustn’t и don’t have to',
  ],
  'День 21 — Past Simple: правильные глаголы на -ed и формы was/were.'
)}
`;

export default {
  day: 20,
  title: 'Повторение дней 15–19',
  pages: [page1, page2],
};
