import { head, tip, card, grid, formula, table, checklist, practice } from '../lib.mjs';

const page1 = `
${head('День 15 · Грамматика', 'Present Simple: <em>утверждение и -s</em>', 'Как рассказывать о привычках, постоянных фактах и своём расписании по-английски.')}
<h2>Когда мы используем Present Simple?</h2>
${grid(3, [
  card('☕ 1. Привычки (Habits)', '<b>I drink coffee every morning.</b><br>Я пью кофе каждое утро.', 'amber'),
  card('🌍 2. Факты (Facts)', '<b>I live in Moscow. Water boils at 100°C.</b><br>Я живу в Москве.', 'sky'),
  card('🚌 3. Расписания (Schedules)', '<b>The bus leaves at 8 o’clock.</b><br>Автобус уходит в 8:00.', 'mint'),
])}
<h2>Главная формула утверждения</h2>
${grid(2, [
  card('I / You / We / They + ГЛАГОЛ (V)', '<b>I work</b> every day. — Я работаю каждый день.<br><b>You speak</b> English well. — Ты хорошо говоришь.<br><b>We live</b> in a big city. — Мы живём в большом городе.<br><b>They play</b> football on Sunday. — Они играют в футбол.', 'indigo'),
  card('He / She / It + ГЛАГОЛ + -S / -ES (V-s)', '<b>He works</b> every day. — Он работает каждый день.<br><b>She speaks</b> English well. — Она хорошо говорит.<br><b>It works</b> fast. — Оно работает быстро.', 'rose'),
])}
${tip('💡', 'Золотое правило Present Simple', 'Видишь <b>HE, SHE, IT</b> (или одного человека/предмет: <b>my brother, Anna, the cat</b>) — приклей к глаголу хвостик <b>-S</b>!', 'good')}
<h2>Правила окончания -s / -es / -ies и глагол HAVE → HAS</h2>
${table(['Правило', 'Как меняется', 'Примеры с переводом'], [
  ['Обычные глаголы', '<b>+ -s</b>', 'work → <b>works</b> (работает), read → <b>reads</b> (читает), live → <b>lives</b> (живёт)'],
  ['На -s, -ss, -sh, -ch, -x, -o', '<b>+ -es</b>', 'watch → <b>watches</b> (смотрит), wash → <b>washes</b> (моет), go → <b>goes</b>, do → <b>does</b>'],
  ['Согласная + -y', '<b>-y → -ies</b>', 'study → <b>studies</b> (учится), try → <b>tries</b> (пытается), fly → <b>flies</b> (летает)'],
  ['Гласная + -y', 'просто <b>+ -s</b>', 'play → <b>plays</b> (играет), buy → <b>buys</b> (покупает), say → <b>says</b> (говорит)'],
  ['ОСОБЫЙ СЛУЧАЙ', '<b>have → has</b>', 'I have a cat → <b>She has a cat</b> (У неё есть кошка). Формы «haves» НЕ существует!'],
], false)}
`;

const page2 = `
<h2>Слова-маркеры регулярности (Adverbs of frequency)</h2>
${table(['Частота', 'Слово и транскрипция', 'Перевод и пример'], [
  ['100%', '<b>always</b> <span class="ipa">/ˈɔːlweɪz/</span>', 'всегда — <i>I <b>always</b> get up at 7 o’clock.</i>'],
  ['80%', '<b>usually</b> <span class="ipa">/ˈjuːʒuəli/</span>', 'обычно — <i>She <b>usually</b> drinks tea.</i>'],
  ['60%', '<b>often</b> <span class="ipa">/ˈɒfn/</span>', 'часто — <i>We <b>often</b> watch TV in the evening.</i>'],
  ['40%', '<b>sometimes</b> <span class="ipa">/ˈsʌmtaɪmz/</span>', 'иногда — <i>He <b>sometimes</b> eats pizza.</i>'],
  ['0%', '<b>never</b> <span class="ipa">/ˈnevə/</span>', 'никогда — <i>They <b>never</b> drink milk.</i>'],
  ['В конце', '<b>every day / morning / week</b>', 'каждый день / утро / неделю — <i>I work <b>every day</b>.</i>'],
], false)}
${tip('📍', 'Куда ставить слово-маркер?', 'Слова <b>always / usually / often / sometimes / never</b> стоят <b>ПЕРЕД</b> обычным глаголом (<i>I always work</i>), но <b>ПОСЛЕ</b> глагола to be (<i>I am always happy</i>).', '')}
${tip('⚠️', '4 частые ошибки новичков', '❌ <i>He work in a bank.</i> → ✅ <b>He works in a bank.</b> (Забыли -s после he!) · ❌ <i>She haves a car.</i> → ✅ <b>She has a car.</b><br>❌ <i>He studys English.</i> → ✅ <b>He studies English.</b> (согл. + y → -ies) · ❌ <i>I am work every day.</i> → ✅ <b>I work every day.</b>', 'warn')}
${practice(
  [
    'She <b>(work)</b> in an office.',
    'We <b>(live)</b> in London.',
    'He <b>(watch)</b> TV every evening.',
    'My brother <b>(study)</b> English.',
    'Anna <b>(have)</b> a big dog.',
    'I <b>(always / drink)</b> coffee in the morning.',
  ],
  '<b>1</b> works · <b>2</b> live · <b>3</b> watches · <b>4</b> studies · <b>5</b> has · <b>6</b> always drink'
)}
${checklist(
  [
    'Знаю формулу I/you/we/they + V и he/she/it + V-s',
    'Пишу goes, watches, studies, has без ошибок',
    'Ставлю always/usually/often перед глаголом',
    'Могу рассказать о своём обычном дне',
  ],
  'День 16 — как сказать «Я НЕ делаю» и «Он НЕ делает» (don’t / doesn’t).'
)}
`;

export default {
  day: 15,
  title: 'Present Simple: утверждение и окончание -s',
  pages: [page1, page2],
};
