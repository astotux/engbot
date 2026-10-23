import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 10 · Существительные · часть 2', 'Еда, город, транспорт <em>и деньги</em>', '44 существительных для повседневных ситуаций и секрет неисчисляемых слов: a/an vs some.')}
<h2>🍎 Еда и напитки (16 слов)</h2>
${table(['Слово', 'Перевод и чтение', 'Как употреблять', 'Слово', 'Перевод и чтение', 'Как употреблять'], [
  ['bread', 'хлеб <span class="ipa">/bred/</span>', 'some bread', 'egg', 'яйцо <span class="ipa">/eɡ/</span>', '<b>an</b> egg, two eggs'],
  ['water', 'вода <span class="ipa">/ˈwɔːtə/</span>', 'some water', 'cheese', 'сыр <span class="ipa">/tʃiːz/</span>', 'some cheese'],
  ['milk', 'молоко <span class="ipa">/mɪlk/</span>', 'some milk', 'apple', 'яблоко <span class="ipa">/ˈæpl/</span>', '<b>an</b> apple, apples'],
  ['coffee', 'кофе <span class="ipa">/ˈkɒfi/</span>', 'some coffee', 'rice', 'рис <span class="ipa">/raɪs/</span>', 'some rice'],
  ['tea', 'чай <span class="ipa">/tiː/</span>', 'some tea', 'soup', 'суп <span class="ipa">/suːp/</span>', 'some soup'],
  ['juice', 'сок <span class="ipa">/dʒuːs/</span>', 'some juice', 'salad', 'салат <span class="ipa">/ˈsæləd/</span>', 'a / some salad'],
  ['meat', 'мясо <span class="ipa">/miːt/</span>', 'some meat', 'sugar', 'сахар <span class="ipa">/ˈʃʊɡə/</span>', 'some sugar'],
  ['fish', 'рыба <span class="ipa">/fɪʃ/</span>', 'some fish', 'breakfast', 'завтрак <span class="ipa">/ˈbrekfəst/</span>', 'без артикля'],
])}
${tip('🔊', 'Произношение', 'В слове <b>sugar</b> первая s читается как «ш»: <span class="ipa">/ˈʃʊɡə/</span>. В <b>bread</b> — короткий «э» <span class="ipa">/bred/</span>, а в <b>tea, meat, cheese</b> — долгий «и» <span class="ipa">/iː/</span>.', '')}
<h2>🏙 Город (12), 🚌 Транспорт (8) и 💼 Работа и деньги (8)</h2>
${grid(3, [
  card('🏙 Город (12 слов)', '<b>street</b> <span class="ipa">/striːt/</span> улица · <b>shop</b> <span class="ipa">/ʃɒp/</span> магазин · <b>bank</b> <span class="ipa">/bæŋk/</span> банк · <b>hospital</b> <span class="ipa">/ˈhɒspɪtl/</span> больница · <b>school</b> <span class="ipa">/skuːl/</span> школа · <b>park</b> <span class="ipa">/pɑːk/</span> парк · <b>station</b> <span class="ipa">/ˈsteɪʃn/</span> вокзал · <b>airport</b> <span class="ipa">/ˈeəpɔːt/</span> аэропорт · <b>hotel</b> <span class="ipa">/həʊˈtel/</span> отель · <b>restaurant</b> <span class="ipa">/ˈrestrɒnt/</span> ресторан · <b>bridge</b> <span class="ipa">/brɪdʒ/</span> мост · <b>market</b> <span class="ipa">/ˈmɑːkɪt/</span> рынок', 'sky'),
  card('🚌 Транспорт (8 слов)', '<b>car</b> <span class="ipa">/kɑː/</span> машина<br><b>bus</b> <span class="ipa">/bʌs/</span> автобус<br><b>train</b> <span class="ipa">/treɪn/</span> поезд<br><b>plane</b> <span class="ipa">/pleɪn/</span> самолёт<br><b>taxi</b> <span class="ipa">/ˈtæksi/</span> такси<br><b>bike</b> <span class="ipa">/baɪk/</span> велосипед<br><b>ticket</b> <span class="ipa">/ˈtɪkɪt/</span> билет<br><b>road</b> <span class="ipa">/rəʊd/</span> дорога', 'amber'),
  card('💼 Работа и деньги (8)', '<b>job</b> <span class="ipa">/dʒɒb/</span> должность (a job)<br><b>work</b> <span class="ipa">/wɜːk/</span> труд (at work)<br><b>office</b> <span class="ipa">/ˈɒfɪs/</span> офис<br><b>money</b> <span class="ipa">/ˈmʌni/</span> деньги<br><b>price</b> <span class="ipa">/praɪs/</span> цена<br><b>meeting</b> <span class="ipa">/ˈmiːtɪŋ/</span> встреча<br><b>company</b> <span class="ipa">/ˈkʌmpəni/</span> компания<br><b>boss</b> <span class="ipa">/bɒs/</span> начальник', 'indigo'),
])}
`;

const page2 = `
<h2>⚖️ Исчисляемые vs Неисчисляемые: a / an или some?</h2>
${formula('an apple · a ticket · a good job <span>vs</span> <i>some</i> water · <i>some</i> bread · <i>some</i> money')}
${grid(2, [
  card('Исчисляемые (штуки: apple, egg, car, job)', '• В единственном числе нужен <b>a / an</b>: <b>an apple, a ticket, a bank, a good job</b>.<br>• Во множественном числе добавляем <b>-s</b>: <b>two apples, three tickets</b>.', 'mint'),
  card('Неисчисляемые (water, bread, money, work…)', '• Нельзя посчитать по штукам и добавить <b>-s</b> (нельзя <i>waters, breads, moneys</i>).<br>• Нельзя ставить <b>a / an</b> → ставим <b>some</b> или ничего: <b>some water, some money</b>.<br>• Всегда <b>is</b> (ед. ч.): <b>The water is cold. My money is here.</b>', 'rose'),
])}
${tip('💡', 'job vs work и ловушка с money', '<b>job</b> — должность (исчисляемое: <i>a good job</i>); <b>work</b> — труд вообще (неисчисляемое: <i>at work, some work</i>). А слово <b>money</b> в английском всегда единственного числа («оно»): <b>Money is important.</b>', 'warn')}
${practice(
  [
    'Переведи: «хлеб, молоко, сахар».',
    'Переведи: «вокзал, мост, рынок».',
    'Выбери: <b>a bread</b> или <b>some bread</b>?',
    'Выбери: <b>an apple</b> или <b>some apple</b>?',
    'Выбери: <b>a job</b> или <b>a work</b>?',
    'Вставь <b>is / are</b>: The money ___ on the table.',
  ],
  '<b>1</b> bread, milk, sugar · <b>2</b> station, bridge, market · <b>3</b> some bread · <b>4</b> an apple · <b>5</b> a job · <b>6</b> is'
)}
${checklist(
  [
    'Знаю 16 слов о еде и напитках',
    'Знаю 12 мест в городе и 8 слов о транспорте',
    'Знаю 8 слов о работе и деньгах (job vs work)',
    'Не говорю a money / a bread / a water, ставлю some',
  ],
  'День 11 — первые 20 главных глаголов английского языка.'
)}
`;

export default {
  day: 10,
  title: 'Существительные: еда, город, работа',
  pages: [page1, page2],
};
