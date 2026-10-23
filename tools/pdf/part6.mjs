import { head, tip, card, grid, formula, table, words, dialog, steps } from './lib.mjs';

const quizItems = [
  'She ___ (be) a doctor. &nbsp; <span class="small">am / is / are</span>',
  'I have ___ apple. &nbsp; <span class="small">a / an / the</span>',
  'They ___ (live) in Paris. &nbsp; <span class="small">live / lives</span>',
  'He ___ (not like) coffee. &nbsp; <span class="small">don’t like / doesn’t like</span>',
  '___ you speak English? &nbsp; <span class="small">Do / Does</span>',
  'Plural of <i>child</i>: &nbsp; <span class="small">childs / children</span>',
  'Yesterday I ___ (go) to the park. &nbsp; <span class="small">go / went</span>',
  '___ she work here? &nbsp; <span class="small">Do / Does</span>',
  'I can ___ (swim). &nbsp; <span class="small">swim / to swim / swims</span>',
  'My birthday is ___ May. &nbsp; <span class="small">in / on / at</span>',
  'The film starts ___ 7:30. &nbsp; <span class="small">in / on / at</span>',
  'Tomorrow I ___ (visit) my aunt. &nbsp; <span class="small">am going to visit / visited</span>',
  '“Where ___ you from?” &nbsp; <span class="small">is / are / do</span>',
  '“How ___ is it?” (цена) &nbsp; <span class="small">many / much</span>',
  'He ___ (study) every day. &nbsp; <span class="small">studys / studies</span>',
];

const quiz = `
${head('Шаг 22 · Проверка', 'Мини-тест <em>на 15 вопросов</em>', 'Ответь письменно, затем проверь себя внизу страницы. 13+ правильных — отлично!')}
<div class="grid g2" style="margin-top:2mm">
${quizItems.map((q, i) => `<div class="card w" style="display:flex;gap:2.5mm;align-items:flex-start;padding:2.2mm 3mm"><span class="num" style="flex:none">${i + 1}</span><div style="flex:1">${q}<div style="border-bottom:1.5px dotted #b9bddf;height:5mm;margin-top:1mm"></div></div></div>`).join('')}
</div>
<h2>✅ Ответы</h2>
<div class="card mint" style="font-size:9.3pt">
<b>1</b> is · <b>2</b> an · <b>3</b> live · <b>4</b> doesn’t like · <b>5</b> Do · <b>6</b> children · <b>7</b> went · <b>8</b> Does<br>
<b>9</b> swim · <b>10</b> in · <b>11</b> at · <b>12</b> am going to visit · <b>13</b> are · <b>14</b> much · <b>15</b> studies
</div>
<table style="margin-top:3mm"><thead><tr><th>Результат</th><th>Что делать</th></tr></thead><tbody>
<tr><td class="en">13–15</td><td>Отлично! Переходи к следующему уровню — A2.</td></tr>
<tr><td class="en">9–12</td><td>Хорошо. Перечитай страницы с ошибками и повтори тест через 3 дня.</td></tr>
<tr><td class="en">0–8</td><td>Вернись к страницам 6, 14 и 17 и повтори 15 минут в день.</td></tr>
</tbody></table>`;

const days = [
  'Алфавит', 'Правила чтения', 'Местоимения', 'Глагол to be', 'Артикли', 'Числа', 'Повтор 1–6',
  'Время и даты', 'Семья, дом', 'Еда и город', 'Глаголы 1–20', 'Глаголы 21–40', 'Прилагательные', 'Повтор 8–14',
  'Present Simple', 'Отрицание', 'Вопросы', 'Question words', 'can / must', 'Повтор 15–19',
  'Past Simple', 'Неправильные', 'Will / going to', 'Диалог: кафе', 'Диалог: город', 'Предлоги', 'Ошибки',
  'Мини-тест', 'Повтор слабых мест', 'Финал: 5 минут речи',
];

const plan = `
${head('Шаг 23 · План', 'Твои <em>30 дней</em>', 'Отмечай выполненные дни. 15 минут в день — и результат придёт.')}
<div class="grid" style="grid-template-columns:repeat(5,1fr);gap:2mm">
${days.map((d, i) => {
  const rev = /Повтор|тест|Финал/.test(d);
  return `<div class="card ${rev ? 'amber' : 'w'}" style="padding:1.6mm 2.2mm;min-height:15mm"><div style="display:flex;justify-content:space-between;align-items:center"><b style="color:var(--indigo)">День ${i + 1}</b><span class="cb"></span></div><div class="small" style="line-height:1.2;margin-top:.8mm;color:var(--ink)">${d}</div></div>`;
}).join('')}
</div>
<p class="small" style="margin-top:2mm"><span class="pill a">жёлтые</span> — дни повторения и проверки. Пропустил день? Просто продолжай со следующего — серия не обнуляется.</p>
<div style="margin-top:4mm;border-radius:16px;background:linear-gradient(135deg,#312e81,#4f46e5);color:#fff;padding:6mm 7mm;position:relative;overflow:hidden">
  <div style="position:absolute;right:-12mm;top:-14mm;width:50mm;height:50mm;border-radius:50%;background:rgba(255,255,255,.09)"></div>
  <div style="font-size:8.5pt;letter-spacing:.14em;text-transform:uppercase;opacity:.8;font-weight:700">Что дальше?</div>
  <div style="font-size:17pt;font-weight:800;margin:1.5mm 0 2mm;letter-spacing:-.01em">Продолжай в боте <span style="color:#fbbf24">каждый день</span></div>
  <div style="font-size:10pt;opacity:.92;max-width:130mm;line-height:1.4">Короткие уроки, словарь A1–C2 с интервальными повторениями, тесты по уровню и аудио от носителей. Гид — это старт, бот — твой ежедневный тренер.</div>
  <div style="display:flex;gap:3mm;margin-top:4mm;flex-wrap:wrap">
    <span style="background:rgba(255,255,255,.16);padding:1.5mm 4mm;border-radius:14px;font-size:9pt;font-weight:700">📖 Уроки с видео и аудио</span>
    <span style="background:rgba(255,255,255,.16);padding:1.5mm 4mm;border-radius:14px;font-size:9pt;font-weight:700">🧠 Словарь по уровням</span>
    <span style="background:rgba(255,255,255,.16);padding:1.5mm 4mm;border-radius:14px;font-size:9pt;font-weight:700">✅ Тесты</span>
  </div>
  <div style="margin-top:4mm;display:inline-block;background:#fbbf24;color:#1e1b4b;font-weight:800;padding:2mm 6mm;border-radius:20px;font-size:10.5pt">Открой бота и нажми «Старт» →</div>
</div>`;

export const pages = [
  { section: 'Мини-тест', body: quiz },
  { section: 'План на 30 дней', body: plan },
];
