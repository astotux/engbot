import { head, tip, card, grid, formula, table, words, dialog, steps } from './lib.mjs';

const cover = `
<div class="blob" style="width:170mm;height:170mm;right:-60mm;top:-50mm;background:rgba(255,255,255,.07)"></div>
<div class="blob" style="width:110mm;height:110mm;left:-40mm;bottom:20mm;background:rgba(251,191,36,.14)"></div>
<div class="blob" style="width:60mm;height:60mm;right:20mm;bottom:40mm;background:rgba(16,185,129,.2)"></div>
<div style="position:absolute;left:20mm;top:22mm;font-weight:800;letter-spacing:.18em;font-size:11pt">ENGBOT</div>
<div style="position:absolute;left:20mm;top:98mm;right:20mm">
  <span class="chip" style="background:rgba(255,255,255,.16);color:#fff">Бесплатный гид · A0 → A2</span>
  <div style="font-size:46pt;font-weight:800;line-height:1.02;letter-spacing:-.03em;margin:8mm 0 6mm">Английский<br>с нуля<br><span style="color:#fbbf24">за 30 дней</span></div>
  <div style="font-size:14pt;opacity:.85;max-width:140mm;line-height:1.4">Правила, слова, диалоги и план занятий — всё, что нужно новичку, на 25 страницах.</div>
</div>
<div style="position:absolute;left:20mm;right:20mm;bottom:22mm;display:flex;gap:6mm">
  <div style="flex:1;background:rgba(255,255,255,.12);border-radius:14px;padding:4mm 5mm"><div style="font-size:20pt;font-weight:800">300+</div><div style="font-size:9pt;opacity:.8">слов и фраз с переводом</div></div>
  <div style="flex:1;background:rgba(255,255,255,.12);border-radius:14px;padding:4mm 5mm"><div style="font-size:20pt;font-weight:800">8</div><div style="font-size:9pt;opacity:.8">готовых диалогов</div></div>
  <div style="flex:1;background:rgba(255,255,255,.12);border-radius:14px;padding:4mm 5mm"><div style="font-size:20pt;font-weight:800">15 мин</div><div style="font-size:9pt;opacity:.8">в день — этого хватит</div></div>
</div>`;

const contents = `
${head('Навигация', 'Что внутри <em>гида</em>', 'Двигайся по порядку — каждая тема опирается на предыдущую.')}
${table(['Блок', 'Темы', 'Стр.'], [
  ['1 · Старт', 'Как учить, алфавит, правила чтения', '3–5'],
  ['2 · Основа', 'Местоимения, to be, артикли, числа и время', '6–9'],
  ['3 · Словарь', 'Существительные, глаголы, прилагательные', '10–13'],
  ['4 · Грамматика', 'Present Simple, вопросы, can/must, Past, Future', '14–19'],
  ['5 · Речь', 'Диалоги: знакомство, кафе, магазин, город', '20–21'],
  ['6 · Закрепление', 'Предлоги, ошибки, мини-тест, план на 30 дней', '22–24'],
], true)}
${tip('🎯', 'Как пользоваться', 'Читай вслух, повторяй примеры и отмечай прогресс в трекере на последних страницах. Лучше 15 минут каждый день, чем 3 часа раз в неделю.', 'info')}
<h2>Условные обозначения</h2>
${grid(2, [
  card('💡 Подсказка', '<span class="small">Лайфхаки, которые экономят время.</span>', 'amber'),
  card('✅ Правильно', '<span class="small">Образцы, которые стоит запомнить.</span>', 'mint'),
  card('⚠️ Ошибка', '<span class="small">Типичные промахи новичков.</span>', 'rose'),
  card('🔊 Произношение', '<span class="small">Транскрипция <span class="ipa">/ˈhɛləʊ/</span> и ударения.</span>', 'sky'),
])}`;

const how = `
${head('Шаг 1 · Метод', 'Как учить <em>быстро</em>', 'Пять принципов, на которых строится вся система.')}
${steps([
  '<b>Каждый день, но коротко.</b> 15 минут ежедневно дают больше, чем марафон по выходным: мозг закрепляет через повторение.',
  '<b>Слова — в контексте.</b> Учи не «apple — яблоко», а «I eat an apple» — так слово запоминается вместе с грамматикой.',
  '<b>Интервальные повторения.</b> Повторяй новое через 1 день, 3 дня, 7 дней, 21 день. Именно так работает словарь в боте.',
  '<b>Говори вслух.</b> Даже одному. Произношение — это мышечная память, её не выучить глазами.',
  '<b>Не бойся ошибок.</b> Тебя поймут, даже если артикль перепутан. Практика важнее идеала.',
])}
<h2>Ежедневный ритуал на 15 минут</h2>
${grid(3, [
  card('⏱ 5 мин', '<b>Повторение</b><br><span class="small">Вчерашние слова и фразы</span>', 'indigo'),
  card('⏱ 5 мин', '<b>Новое</b><br><span class="small">Одна тема из гида</span>', 'amber'),
  card('⏱ 5 мин', '<b>Речь</b><br><span class="small">3–5 предложений вслух</span>', 'mint'),
])}
${tip('💡', 'Правило трёх', 'Каждый день: 5 новых слов + 1 правило + 3 своих предложения. За 30 дней это 150 слов и 30 правил.')}
<h2>Твои уровни</h2>
${table(['Уровень', 'Что умеешь', 'Слов'], [
  ['A1', 'Представиться, заказать еду, спросить дорогу', '≈ 500'],
  ['A2', 'Рассказать о себе, планах, прошлом', '≈ 1000'],
  ['B1', 'Поддержать беседу, понимать фильмы с субтитрами', '≈ 2000'],
])}`;

export const pages = [
  { cls: 'cover', body: cover },
  { section: 'Содержание', body: contents },
  { section: 'Старт', body: how },
];
