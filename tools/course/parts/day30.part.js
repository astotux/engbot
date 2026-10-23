  {
    day: 30,
    title: 'Финал: 5 минут речи о себе, прошлом и будущем',
    objective: 'Собрать большой связный рассказ о себе из 5 блоков (to be, Present Simple, can/like, Past Simple, going to/will), написать финальное письмо другу по переписке и подвести итоги 30-дневного курса',
    estimatedMinutes: 40,
    steps: [
      // ── Шаг 1/19: торжественное вступление к 30-му дню ──
      {
        type: 'explain',
        title: '🏆 День 30: Финал! Твои 5 минут живой речи',
        // 🎬 ВСТАВИТЬ КРУЖОК (mp4, до 60 сек, квадрат) — assets/audio/day30_s01_intro.mp4
        // ВИЗУАЛ: преподаватель крупным планом, праздничное настроение, показывает цифру 30 или карточку «DAY 30 — FINAL», широко улыбается
        // ТЕКСТ (дословно, что сказать): «Привет! Ты веришь в это? Сегодня тридцатый, финальный день нашего курса «Английский с нуля за тридцать дней»! Месяц назад мы начинали с алфавита и первой буквы A, а сегодня ты соберёшь полноценный монолог на английском языке — на целых пять минут живой речи! Секрет длинного и красивого рассказа очень прост: мы разделим его на пять понятных кирпичиков. Первый — кто ты, откуда и сколько тебе лет. Второй — твоя жизнь, работа и привычки. Третий — что ты любишь и умеешь делать. Четвёртый — твоё прошлое и вчерашний день. И пятый — твои планы и мечты! В конце ты напишешь настоящее письмо новому другу. Давай сделаем этот финал незабываемым!»
        videoNoteFile: 'assets/audio/day30_s01_intro.mp4',
        text:
          'Поздравляю! Ты дошёл(ла) до <b>30-го, финального дня</b> курса! 🎊\n\n' +
          'Месяц назад мы учили буквы <b>A, B, C</b>, а сегодня ты можешь говорить по-английски целых <b>5 минут подряд</b>!\n\n' +
          'Как легко говорить 5 минут и не сбиваться? Секрет — <b>конструктор из 5 блоков</b>:\n' +
          '1️⃣ <b>Кто я, возраст, откуда</b> (глагол <i>to be</i>)\n' +
          '2️⃣ <b>Моя жизнь, работа, привычки</b> (<i>Present Simple</i>)\n' +
          '3️⃣ <b>Что я умею и люблю</b> (<i>can / like / love</i>)\n' +
          '4️⃣ <b>Моё прошлое и вчерашний день</b> (<i>Past Simple</i>)\n' +
          '5️⃣ <b>Мои планы и мечты</b> (<i>be going to / will</i>)\n\n' +
          'Мы пройдём все 5 блоков шаг за шагом, а в конце соберём твоё <b>большое финальное письмо другу по переписке</b>!',
        examples: [
          { english: 'Today is Day 30! I can speak about my life, my past and my future.', russian: 'Сегодня 30-й день! Я могу рассказать о своей жизни, прошлом и будущем.' },
        ],
      },
      // ── Шаг 2/19: Блок 1 (Кто я, возраст, откуда — to be) и Блок 2 (Жизнь и привычки — Present Simple) ──
      {
        type: 'explain',
        title: '🧱 Блоки 1 и 2: Кто я (to be) и моя жизнь (Present Simple)',
        // 🎙 ВСТАВИТЬ ГОЛОСОВОЕ (mp3, до 40 сек) — assets/audio/day30_s02_blocks12.mp3
        // ТЕКСТ (дословно, English; чётко, естественно, как живой рассказ): «Hello! My name is Alex. I am twenty-eight years old. I am from Russia, from Moscow. I am a manager, and my wife is a doctor. I live in a big flat with my family. On weekdays I usually get up at seven o'clock in the morning, drink coffee with milk and go to work by metro.»
        voiceFile: 'assets/audio/day30_s02_blocks12.mp3',
        text:
          'Начинаем наш рассказ с первых двух кирпичиков:\n\n' +
          '1️⃣ <b>Блок 1: Визитка (глагол to be — am / is / are)</b>\n' +
          'Назови имя, возраст, страну/город, профессию и пару слов о семье:\n' +
          '• <b>Hello! My name is… I am … years old.</b>\n' +
          '• <b>I am from… I am a/an [профессия].</b>\n' +
          '• <b>My family is friendly. My husband / wife / sister is…</b>\n\n' +
          '2️⃣ <b>Блок 2: Моя жизнь и обычный день (Present Simple)</b>\n' +
          'Расскажи, где ты живёшь, во сколько встаёшь, как добираешься на работу и что делаешь вечером:\n' +
          '• <b>I live in [город] in a nice flat / house.</b>\n' +
          '• <b>I usually get up at 7:00 in the morning and drink coffee with milk.</b>\n' +
          '• <b>I go to work by bus / metro / car. In the evening I come home at 7 o\'clock.</b>',
        examples: [
          { english: 'My name is Elena, I am 30 years old, and I am from Minsk.', russian: 'Меня зовут Елена, мне 30 лет, и я из Минска.' },
          { english: 'I work in an office. I usually start work at 9:00 and go home at 6:00.', russian: 'Я работаю в офисе. Обычно я начинаю работу в 9:00 и иду домой в 6:00.' },
        ],
      },
      // ── Шаг 3/19: выбор для Блока 1 (to be) ──
      {
        type: 'choice',
        question: '🧱 <b>Блок 1 (Визитка).</b> Какое предложение составлено <b>без ошибок</b>?',
        options: [
          'I am 27 years old, and I am a teacher.',
          'I have 27 years, and I teacher.',
          'My name Anna, I am from in Moscow.',
          'I am work as a doctor.',
        ],
        correctIndex: 0,
        hint: 'Для возраста и профессии в английском нужен глагол to be (am/is/are) и артикль a/an перед профессией',
        explanation: 'Отлично! Возраст и профессия строятся через <b>to be</b>: <b>I am 27 years old, and I am a teacher</b>.',
      },
      // ── Шаг 4/19: выбор для Блока 2 (Present Simple + предлоги) ──
      {
        type: 'choice',
        question: '🧱 <b>Блок 2 (Привычки).</b> Как правильно рассказать про утро и дорогу домой?',
        options: [
          'I get up in 7:00 and go to home.',
          'I get up at 7:00 and go home at 6:00.',
          'I gets up at 7:00 and goes home.',
          'I am get up on 7:00 in the morning.',
        ],
        correctIndex: 1,
        hint: 'С часами — предлог at, а со словом home после глагола go предлог to НЕ ставится',
        explanation: 'Супер! <b>I get up at 7:00 and go home at 6:00</b> — точное время с <i>at</i>, и <i>go home</i> без <i>to</i>.',
      },
      // ── Шаг 5/19: ввод для Блоков 1-2 ──
      {
        type: 'input',
        question: '✏️ Допиши два пропущенных слова через пробел (маленькими буквами), чтобы представиться:\n\n«Hello! I <b>___ ___</b> Russia.» (Привет! Я из России.)',
        answerKey: ['am from'],
        hint: 'Глагол to be для I + предлог «из»',
        explanation: 'Верно! <b>I am from Russia</b> — базовая фраза для любого знакомства.',
      },
      // ── Шаг 6/19: Блок 3 (Что я умею и люблю — can / like / love) ──
      {
        type: 'explain',
        title: '🎨 Блок 3: Что я умею и люблю (can, like, love)',
        // 🎬 ВСТАВИТЬ КРУЖОК (mp4, до 50 сек, квадрат) — assets/audio/day30_s06_block3.mp4
        // ВИЗУАЛ: преподаватель улыбается, показывает жестами плавание/готовку/чтение книги
        // ТЕКСТ (дословно, что сказать): «Третий блок делает твой рассказ живым и интересным — это твои таланты, хобби и вкусы! Здесь работают наши любимые глаголы can, like и love. С помощью can расскажи, что ты умеешь делать, и помни: после can не нужна частица to! Например: I can cook Italian food, I can drive a car, and now I can speak English! А с помощью I like и I love добавь, что приносит тебе радость: I love good coffee, warm weather and long walks in the park. At the weekend I like to read books or watch films with my friends. Просто и очень душевно!»
        videoNoteFile: 'assets/audio/day30_s06_block3.mp4',
        text:
          '3️⃣ <b>Блок 3: Мои умения и вкусы (can / like / love / would like)</b>\n\n' +
          'Этот блок раскрывает тебя как личность. Используй готовые шаблоны:\n' +
          '• <b>Умения (can + чистый глагол без to):</b>\n' +
          '  <b>I can cook very well.</b> — Я умею очень хорошо готовить.\n' +
          '  <b>I can drive a car and swim, and now I can speak English!</b>\n' +
          '  <b>I cannot (can\'t) play the guitar yet.</b> — Я пока не умею играть на гитаре.\n\n' +
          '• <b>Что ты любишь (like / love + существительное или to + V1):</b>\n' +
          '  <b>I love sunny weather, good music and Italian food.</b>\n' +
          '  <b>In my free time I like to read books, watch films and meet my friends.</b>',
        examples: [
          { english: 'I can swim and cook delicious pasta.', russian: 'Я умею плавать и готовить вкусную пасту.' },
          { english: 'At the weekend I like to walk in the park with my dog.', russian: 'На выходных я люблю гулять в парке со своей собакой.' },
        ],
      },
      // ── Шаг 7/19: выбор для Блока 3 (can / like) ──
      {
        type: 'choice',
        question: '🎨 <b>Блок 3 (Умения).</b> Выбери правильную фразу о своих талантах:',
        options: [
          'I can to speak English and to drive.',
          'I cans cook and swim very well.',
          'I can speak English and drive a car.',
          'I am can speak English now.',
        ],
        correctIndex: 2,
        hint: 'Модальный глагол can не дружит ни с am, ни с частицей to!',
        explanation: 'Точно! После <b>can</b> глаголы идут сразу в начальной форме без <i>to</i>: <b>I can speak English and drive a car</b>.',
      },
      // ── Шаг 8/19: ввод для Блока 3 ──
      {
        type: 'input',
        question: '✏️ Переведи на английский фразу из 4 слов (без точки в конце):\n\n«<b>Я люблю читать книги</b>» (используй связку <b>like to …</b>).',
        answerKey: [
          'i like to read books',
          'i love to read books',
        ],
        hint: 'I like to + глагол «читать» + «книги» во множественном числе',
        explanation: 'Отлично! <b>I like to read books</b> — готовая красивая фраза для твоего рассказа о хобби.',
      },
      // ── Шаг 9/19: Блок 4 (Моё прошлое и вчерашний день — Past Simple) ──
      {
        type: 'explain',
        title: '⏪ Блок 4: Моё прошлое и вчерашний день (Past Simple)',
        // 🎙 ВСТАВИТЬ ГОЛОСОВОЕ (mp3, до 40 сек) — assets/audio/day30_s09_block4.mp3
        // ТЕКСТ (дословно, English; чётко, с интонацией рассказа): «Last year I visited St Petersburg, and it was wonderful! Yesterday I had a busy day. I woke up early, went to the office and worked hard. In the evening I met my best friend in a cosy cafe. We drank hot tea and talked for two hours.»
        voiceFile: 'assets/audio/day30_s09_block4.mp3',
        text:
          '4️⃣ <b>Блок 4: Немного истории и вчерашний день (Past Simple)</b>\n\n' +
          'Чтобы речь звучала на уверенном уровне <b>A2</b>, покажи, что ты свободно говоришь о прошлом:\n\n' +
          '• <b>Яркое событие в прошлом (last year / last summer / two years ago):</b>\n' +
          '  <b>Last summer I went to the sea. The weather was warm and sunny!</b>\n' +
          '  <b>A month ago I started this English course.</b> — Месяц назад я начал(а) этот курс английского.\n\n' +
          '• <b>Что было вчера (yesterday):</b>\n' +
          '  <b>Yesterday I had a good day. I worked, bought some food and made dinner.</b>\n' +
          '  <b>In the evening I met my friend / watched a film, and I went to bed at 11:00.</b>',
        examples: [
          { english: 'A month ago I didn\'t know many English words, but I studied every day.', russian: 'Месяц назад я не знал(а) много английских слов, но я занимался(ась) каждый день.' },
          { english: 'Yesterday I met my sister, and we drank coffee in the city centre.', russian: 'Вчера я встретил(а) сестру, и мы пили кофе в центре города.' },
        ],
      },
      // ── Шаг 10/19: аудирование Блока 4 (Past Simple) ──
      {
        type: 'choice',
        question: '🎧 Послушай отрывок рассказа (шаг 9) ещё раз или прочитай ниже в голосовом: где рассказчик встретился с другом вчера вечером?',
        // 🎙 ВСТАВИТЬ ГОЛОСОВОЕ (mp3, до 15 сек) — assets/audio/day30_s10_listen_past.mp3
        // ТЕКСТ (дословно, English; чётко, пауза, повторить): «Yesterday evening I met my best friend in a cosy cafe, and we drank hot tea.»
        voiceFile: 'assets/audio/day30_s10_listen_past.mp3',
        options: [
          'На вокзале',
          'В супермаркете',
          'В парке у озера',
          'В уютном кафе (in a cosy cafe)',
        ],
        correctIndex: 3,
        hint: 'Прислушайся к словам в конце первого предложения перед and we drank hot tea',
        explanation: 'Верно! В аудио прозвучало: <b>«Yesterday evening I met my best friend in a cosy cafe, and we drank hot tea.»</b>',
      },
      // ── Шаг 11/19: выбор правильных форм Past Simple для Блока 4 ──
      {
        type: 'choice',
        question: '⏪ <b>Блок 4 (Прошлое).</b> Какое предложение о вчерашнем дне написано <b>БЕЗ ошибок</b>?',
        options: [
          'Yesterday I go home and see a cat.',
          'Yesterday I went home and saw a cat.',
          'Yesterday I was go to the park.',
          'Yesterday I didn\'t went to work.',
        ],
        correctIndex: 1,
        hint: 'Для вчерашнего дня нужны вторые формы глаголов go → went и see → saw',
        explanation: 'Молодец! В утверждении Past Simple используем вторую форму: <b>went</b> и <b>saw</b>.',
      },
      // ── Шаг 12/19: Блок 5 (Мои планы и мечты — going to / will / would like to) ──
      {
        type: 'explain',
        title: '🚀 Блок 5: Мои планы и мечты (going to, will, would like to)',
        // 🎙 ВСТАВИТЬ ГОЛОСОВОЕ (mp3, до 35 сек) — assets/audio/day30_s12_block5.mp3
        // ТЕКСТ (дословно, English; вдохновляюще, чётко): «And what about my future? Tomorrow I am going to relax and meet my family. Next year I am going to travel to Italy. I would like to see Rome and Venice. And of course, I will practice English every day! Thank you for listening!»
        voiceFile: 'assets/audio/day30_s12_block5.mp3',
        text:
          '5️⃣ <b>Блок 5: Красивый финал рассказа — планы и мечты!</b>\n\n' +
          'Заверши свою речь взглядом в будущее — используй три знакомые конструкции:\n\n' +
          '• <b>Конкретные планы (am / is / are going to + V1):</b>\n' +
          '  <b>Tomorrow I am going to rest and walk in the park.</b>\n' +
          '  <b>Next summer we are going to travel to another country.</b>\n\n' +
          '• <b>Мечты и желания (would like to + V1):</b>\n' +
          '  <b>I would like to visit London and speak with local people.</b>\n\n' +
          '• <b>Обещание и уверенность (will + V1):</b>\n' +
          '  <b>I think everything will be great! I will practice English every day!</b>',
        examples: [
          { english: 'Next month I am going to read my first book in English.', russian: 'В следующем месяце я собираюсь прочитать свою первую книгу на английском.' },
          { english: 'I will not stop! I will learn new words every week.', russian: 'Я не остановлюсь! Я буду учить новые слова каждую неделю.' },
        ],
      },
      // ── Шаг 13/19: выбор для Блока 5 (going to / will) ──
      {
        type: 'choice',
        question: '🚀 <b>Блок 5 (Будущее).</b> Как правильно сказать: «В следующем году я собираюсь поехать в Испанию»?',
        options: [
          'Next year I going travel to Spain.',
          'Next year I will to travel to Spain.',
          'Next year I am going to travel to Spain.',
          'Next year I am go to Spain.',
        ],
        correctIndex: 2,
        hint: 'Не забудь глагол-связку am перед going to и глагол travel после частицы to',
        explanation: 'Безупречно! Полная формула плана: <b>I am going to travel to Spain</b>.',
      },
      // ── Шаг 14/19: ввод для Блока 5 (обещание с will) ──
      {
        type: 'input',
        question: '✏️ Допиши два слова через пробел (маленькими буквами), чтобы дать себе обещание:\n\n«I <b>___ ___</b> English every day!» (Я <b>буду практиковать / учить</b> английский каждый день! — используй <b>will + practice / study / learn / speak</b>).',
        answerKey: [
          'will practice',
          'will practise',
          'will study',
          'will learn',
          'will speak',
        ],
        hint: 'Помощник будущего времени will + глагол в начальной форме без to',
        explanation: 'Супер! <b>I will practice / study / speak English every day!</b> — отличное обещание выпускника курса!',
      },
      // ── Шаг 15/19: как оформить письмо новому другу по переписке ──
      {
        type: 'explain',
        title: '✉️ Как собрать 5 блоков в письмо другу по переписке',
        // 🎙 ВСТАВИТЬ ГОЛОСОВОЕ (mp3, до 40 сек) — assets/audio/day30_s15_penpal_letter.mp3
        // ТЕКСТ (дословно, English; тепло, дружелюбно): «Dear Sam! Nice to meet you! My name is Maria, and I am twenty-six years old. I am from Russia. I work as a designer. I usually get up at eight o'clock and work from home. I can draw and cook well, and I love music. Yesterday I went to the cinema with my sister. Next summer I am going to visit Italy. Tell me about your life! Best wishes, Maria.»
        voiceFile: 'assets/audio/day30_s15_penpal_letter.mp3',
        text:
          'Если добавить к нашим 5 блокам приветствие в начале и тёплую концовку, получится настоящее <b>письмо другу по переписке (penfriend / penpal)</b>!\n\n' +
          '📬 <b>Шаблон идеального письма:</b>\n' +
          '• <b>Начало:</b> <b>Dear [Имя],</b> или <b>Hi [Имя]! Nice to meet you!</b>\n' +
          '• <b>Абзац 1 (Блоки 1–2):</b> Кто ты, сколько лет, откуда, кем работаешь и как проходит твой обычный день.\n' +
          '• <b>Абзац 2 (Блок 3):</b> Что ты умеешь делать (<i>can</i>) и что любишь (<i>like / love</i>).\n' +
          '• <b>Абзац 3 (Блоки 4–5):</b> Что интересного ты делал(а) вчера или недавно и какие у тебя планы на будущее.\n' +
          '• <b>Концовка с вопросом к другу:</b>\n' +
          '  <b>What about you? Tell me about your city and your hobbies!</b>\n' +
          '  <b>Best wishes, [Твоё имя]</b> (С наилучшими пожеланиями, …)',
        examples: [
          { english: 'Dear Sam! Nice to meet you! Let me tell you about my life.', russian: 'Дорогой Сэм! Приятно познакомиться! Позволь рассказать тебе о моей жизни.' },
          { english: 'Tell me about your family! Best wishes, Anna.', russian: 'Расскажи мне о своей семье! С наилучшими пожеланиями, Анна.' },
        ],
      },
      // ── Шаг 16/19: выбор фразы для концовки письма ──
      {
        type: 'choice',
        question: '✉️ Какой фразой принято вежливо и тепло заканчивать дружеское письмо перед своим именем?',
        options: [
          'Excuse me, where is the bank,',
          'How much is it,',
          'Can I have the bill,',
          'Best wishes,',
        ],
        correctIndex: 3,
        hint: 'Переводится как «С наилучшими пожеланиями,»',
        explanation: 'Конечно! <b>Best wishes, [Имя]</b> — самая универсальная и тёплая подпись в конце дружеского письма или сообщения.',
      },
      // ── Шаг 17/19: свободное задание 1 — произнеси/запиши 5 блоков о себе ──
      {
        type: 'free',
        question: '🎤 <b>Главное испытание курса, часть 1: Твои 5 минут речи!</b>\n\nСобери свой рассказ по <b>5 блокам</b> (напиши <b>8–12 предложений</b> и обязательно <b>прочитай их вслух 2–3 раза</b>, засекая время!):\n1) Кто ты, возраст, откуда, кто по профессии (<i>am/is/are</i>)\n2) Твой обычный день и привычки (<i>Present Simple + in/on/at</i>)\n3) Что ты умеешь и любишь (<i>can / like / love</i>)\n4) Что ты делал(а) вчера или в прошлом году (<i>Past Simple</i>)\n5) Твои планы на завтра и на этот год (<i>going to / will</i>)',
        exampleAnswer: 'Hello! My name is Dmitry. I am 29 years old, and I am from Ekaterinburg. I am an engineer. I live in a comfortable flat with my wife. I usually wake up at 7:00 in the morning, drink black coffee and go to work by car. I can swim, drive and speak English! In my free time I like to watch films and play football with my friends. Yesterday I had a great day: I worked, bought a gift for my mother and cooked dinner. Next summer we are going to travel to the mountains, and I will practice English every day!',
        tip: 'Не спеши! Пиши простыми, чёткими предложениями — по 2 предложения на каждый из 5 блоков, а затем с выражением расскажи эту историю вслух',
      },
      // ── Шаг 18/19: свободное задание 2 — финальное письмо другу по переписке ──
      {
        type: 'free',
        question: '✉️ <b>Главное испытание курса, часть 2: Финальное письмо другу по переписке!</b>\n\nПредставь, что у тебя появился англоязычный друг <b>Alex</b> из Лондона. Напиши ему письмо:\n• Начни с <b>Dear Alex! Nice to meet you!</b>\n• Коротко расскажи о себе, своём городе, хобби, вчерашнем дне и планах\n• Задай Алексу <b>2–3 вопроса</b> (используй <i>What / Where / Do you… / Can you…</i>)\n• Закончи письмо подписью <b>Best wishes, [Твоё имя]</b>',
        exampleAnswer: 'Dear Alex! Nice to meet you! My name is Olga, I am from Russia. I live in Kazan and work in a shop. I love warm weather, tea with lemon and good books. Yesterday I walked in the city centre and met my friend. Next month I am going to start a new hobby. What about you? Where do you work in London? What do you like to do at the weekend? Write to me soon! Best wishes, Olga.',
        tip: 'Обязательно задай другу 2–3 вопроса в конце письма — ведь настоящее общение всегда строится на диалоге!',
      },
      // ── Шаг 19/19: торжественный финал курса и приглашение продолжать в боте ──
      {
        type: 'explain',
        title: '🏁 Итоги дня 30 · С выпускным! 🎉',
        // 🎬 ВСТАВИТЬ КРУЖОК (mp4, до 60 сек, квадрат) — assets/audio/day30_s19_graduation.mp4
        // ВИЗУАЛ: преподаватель в кадре искренне аплодирует, улыбается, показывает жест победы и приглашает в главное меню бота
        // ТЕКСТ (дословно, что сказать): «Браво! Я аплодирую тебе стоя! Ты прошёл все тридцать дней курса «Английский с нуля за тридцать дней» от самого начала и до победного финала! Только подумай: тридцать уроков, сотни слов, все главные времена, тридцать неправильных глаголов, живые диалоги в кафе, магазине и городе, и сегодня — твой собственный большой рассказ и письмо на английском! Ты доказал, что дисциплина и ежедневные шаги творят чудеса. Но наше путешествие не заканчивается! Прямо здесь, в этом боте, тебя ждёт огромный тренажёр словарного запаса по уровням: A1-A2 для закрепления базы, B1-B2 для выхода на средний уровень и даже C1-C2! А ещё — проверочные тесты и практика каждый день. Я безумно горжусь тобой! Congratulations and see you in the bot!»
        videoNoteFile: 'assets/audio/day30_s19_graduation.mp4',
        text:
          '🎉 <b>Сегодня ты освоил(а):</b>\n\n' +
          '✅ Структуру <b>5-минутной речи о себе из 5 блоков</b>:\n' +
          '  1) Кто я, возраст, откуда (<i>to be</i>)\n' +
          '  2) Моя жизнь, работа, привычки (<i>Present Simple</i>)\n' +
          '  3) Что я умею и люблю (<i>can / like</i>)\n' +
          '  4) Моё прошлое и вчерашний день (<i>Past Simple</i>)\n' +
          '  5) Мои планы и мечты (<i>going to / will</i>)\n' +
          '✅ Написание полноценного <b>письма другу по переписке</b> с вопросами собеседнику\n\n' +
          '🏆 <b>ПОЗДРАВЛЯЕМ С ОКОНЧАНИЕМ 30-ДНЕВНОГО КУРСА!</b>\n' +
          'Ты прошёл(ла) путь от алфавита до живой связной речи в трёх временах. Это настоящее достижение, которым можно гордиться!\n\n' +
          '🚀 <b>Что дальше? Продолжай расти прямо в нашем боте:</b>\n' +
          '• 📚 <b>Тренажёр словарного запаса по уровням:</b>\n' +
          '  — <b>A1–A2</b> (базовый и предсредний — закрепи и расширь фундамент)\n' +
          '  — <b>B1–B2</b> (средний и продвинутый — для свободных бесед и поездок)\n' +
          '  — <b>C1–C2</b> (высокий уровень — для фильмов, книг и работы)\n' +
          '• 🧠 <b>Интерактивные тесты</b> для проверки уровня и регулярной тренировки памяти\n\n' +
          'Жми кнопку завершения урока и переходи к тренировке слов и тестам в меню бота. В добрый путь! 🌟',
        examples: [
          { english: 'Congratulations! You did it!', russian: 'Поздравляем! Ты сделал(а) это!' },
          { english: 'Keep going and never stop learning!', russian: 'Продолжай идти вперёд и никогда не переставай учиться!' },
        ],
      },
    ],
  },
