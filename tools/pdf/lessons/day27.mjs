import { head, tip, card, grid, checklist, practice } from '../lib.mjs';

const errCard = (num, title, pairs, rule) =>
  card(
    `${num}. ${title}`,
    `${pairs
      .map(
        ([bad, good, ru]) =>
          `<div style="font-size:8.8pt;margin-bottom:.6mm">❌ <span class="bad-t">${bad}</span> → ✅ <span class="good-t">${good}</span> <span class="small">(${ru})</span></div>`
      )
      .join('')}<div class="small" style="margin-top:1mm;color:var(--ink)"><b>Правило:</b> ${rule}</div>`,
    'w'
  );

const page1 = `
${head('День 27 · Работа над ошибками', '12 ошибок <em>новичков</em>', 'Ошибаются все — большинство ловушек возникает из-за дословного перевода с русского. Уберём их за один вечер!')}
${grid(2, [
  errCard(
    1,
    'Пропуск глагола to be',
    [
      ['I student.', 'I am a student.', 'Я студент'],
      ['She very nice.', 'She is very nice.', 'Она очень милая'],
      ['We at home.', 'We are at home.', 'Мы дома'],
    ],
    'В английском предложении всегда нужен глагол. Нет действия — ставим <b>am / is / are</b>.'
  ),
  errCard(
    2,
    'Возраст через have',
    [
      ['I have 20 years.', 'I am 20 years old.', 'Мне 20 лет'],
      ['He has 30 years.', 'He is 30 years old.', 'Ему 30 лет'],
    ],
    'Возраст = <b>to be + число + years old</b>. Глагол <i>have</i> для возраста не используется.'
  ),
  errCard(
    3,
    'Потеряли -s в Present Simple',
    [
      ['He work in a bank.', 'He works in a bank.', 'Он работает'],
      ['My mother like tea.', 'My mother likes tea.', 'Мама любит чай'],
    ],
    'С <b>he / she / it</b> в утверждении добавляй <b>-s</b> (<i>watches, goes, studies, has</i>).'
  ),
  errCard(
    4,
    'Лишнее -s после do / does / doesn’t',
    [
      ['Does she works?', 'Does she work?', 'Она работает?'],
      ['He doesn’t works.', 'He doesn’t work.', 'Он не работает'],
    ],
    'Окончание <b>-s</b> «забирает» помощник <b>does / doesn’t</b>. Глагол остаётся в начальной форме.'
  ),
  errCard(
    5,
    'Забыли артикль a / an',
    [
      ['She is teacher.', 'She is a teacher.', 'Она учитель'],
      ['I have dog.', 'I have a dog.', 'У меня есть собака'],
      ['He is engineer.', 'He is an engineer.', 'Он инженер'],
    ],
    'Перед профессией и одним исчисляемым предметом ставим <b>a / an</b> (<b>an</b> — перед гласным звуком).'
  ),
  errCard(
    6,
    'Частица to после can / must / will',
    [
      ['I can to swim.', 'I can swim.', 'Я умею плавать'],
      ['She must to go.', 'She must go.', 'Ей нужно идти'],
      ['I will to call you.', 'I will call you.', 'Я позвоню тебе'],
    ],
    'После модальных глаголов (<b>can, must, should</b>) и <b>will</b> идёт чистый глагол без <b>to</b> и без <b>-s</b>.'
  ),
  errCard(
    7,
    'Настоящее время вместо прошедшего',
    [
      ['Yesterday I go to the cinema.', 'Yesterday I went to the cinema.', 'Вчера ходил'],
      ['Did you went there?', 'Did you go there?', 'Ты ходил туда?'],
    ],
    '<b>Yesterday, last week, ago</b> — сигнал Past Simple (V2). Но с <b>did / didn’t</b> возвращаем V1 (<b>go</b>)!'
  ),
  errCard(
    8,
    'Двойное отрицание',
    [
      ['I don’t know nothing.', 'I don’t know anything.', 'Я ничего не знаю'],
      ['She doesn’t have no money.', 'She doesn’t have any money.', 'У неё нет денег'],
    ],
    'В английском предложении только <b>ОДНО</b> отрицание. После <b>not</b> используем <b>any / anything / anybody</b>.'
  ),
])}
${tip('💡', 'Подсказка: одно предложение — одно -s', 'Либо окончание <b>-s</b> стоит на самом глаголе (<b>He works</b>), либо на помощнике <b>does</b> (<b>Does he work? He doesn’t work</b>).', 'info')}
`;

const page2 = `
${grid(2, [
  errCard(
    9,
    'Неверный порядок слов',
    [
      ['I very like music.', 'I like music very much.', 'Очень люблю музыку'],
      ['I have a car red.', 'I have a red car.', 'Красная машина'],
    ],
    'Прилагательное стоит <b>перед</b> существительным. <b>Very much</b> ставим в конце фразы, а не перед глаголом.'
  ),
  errCard(
    10,
    'Лишние предлоги с home и транспортом',
    [
      ['I go to home.', 'I go home.', 'Я иду домой'],
      ['I am at the home.', 'I am at home.', 'Я дома'],
      ['I go by the bus.', 'I go by bus.', 'Езжу на автобусе'],
    ],
    'С <b>home</b> предлог <i>to</i> не нужен. <b>At home, by bus, at night</b> — устойчивые связки без артикля.'
  ),
  errCard(
    11,
    'People, children и особые слова',
    [
      ['People is friendly.', 'People are friendly.', 'Люди дружелюбны'],
      ['two childs, three mans', 'two children, three men', '2 детей, 3 мужчин'],
    ],
    '<b>People</b> — всегда мн. число (<b>are</b>). Особые формы: <b>man → men, woman → women, child → children, foot → feet</b>.'
  ),
  errCard(
    12,
    'Глагол to be перед обычным глаголом',
    [
      ['I am agree with you.', 'I agree with you.', 'Я согласен с тобой'],
      ['I am like cats.', 'I like cats.', 'Я люблю кошек'],
    ],
    '<b>To be</b> нужен там, где нет глагола действия. Если есть <b>agree, like, know, live, work</b> — <i>am/is/are</i> не ставим!'
  ),
])}
${tip('⚠️', 'Главное: 3 вопроса перед отправкой сообщения', '<b>1)</b> Есть ли в предложении глагол? <b>2)</b> Не потерялось ли окончание <b>-s</b> или артикль <b>a/an</b>? <b>3)</b> Не добавил(а) ли я лишнее <b>to</b>, <b>be</b> или второе отрицание?', '')}
${practice(
  [
    'Исправь: <span class="bad-t">I student.</span>',
    'Исправь: <span class="bad-t">I have 25 years.</span>',
    'Исправь: <span class="bad-t">She work in a shop.</span>',
    'Исправь: <span class="bad-t">Does he likes tea?</span>',
    'Исправь: <span class="bad-t">He is doctor.</span>',
    'Исправь: <span class="bad-t">I can to cook.</span>',
    'Исправь: <span class="bad-t">Yesterday I see my friend.</span>',
    'Исправь: <span class="bad-t">I don’t have nothing.</span>',
  ],
  '<b>1</b> I am a student. · <b>2</b> I am 25 years old. · <b>3</b> She works in a shop. · <b>4</b> Does he like tea? · <b>5</b> He is a doctor. · <b>6</b> I can cook. · <b>7</b> Yesterday I saw my friend. · <b>8</b> I don’t have anything.'
)}
${checklist(
  [
    'Не пропускаю am / is / are',
    'Возраст говорю с am ... years old',
    'Помню -s у he / she / it',
    'Не ставлю -s после does / doesn’t',
    'Ставлю a / an перед профессией',
    'Не добавляю to после can / will',
    'Использую 2-ю форму после yesterday',
    'Говорю anything / any после don’t',
  ],
  'Завтра — мини-тест: проверим всё, что ты узнал за курс.'
)}
`;

export default {
  day: 27,
  title: '12 ошибок новичков',
  pages: [page1, page2],
};
