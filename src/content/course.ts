// ─── Типы ────────────────────────────────────────────────────────────────────

export interface Example {
  english: string;
  russian: string;
}

/** Шаг типа «объяснение + примеры» — просто читаем, без ответа */
export interface ExplainStep {
  type: 'explain';
  title: string;
  text: string;
  examples?: Example[];
  /** Путь к аудио-файлу для кружка (video_note). Например assets/audio/day1_step1.mp4 */
  audioFile?: string;
}

/** Шаг типа «выбор из вариантов» — inline-кнопки */
export interface ChoiceStep {
  type: 'choice';
  question: string;
  /** Аудио-кружок с вопросом — пользователь слушает и выбирает */
  audioFile?: string;
  options: string[];          // варианты ответа
  correctIndex: number;       // индекс правильного
  hint: string;               // короткая подсказка без ответа
  explanation: string;        // объяснение ПОСЛЕ правильного ответа
}

/** Шаг типа «вписать ответ» — текстовый ввод */
export interface InputStep {
  type: 'input';
  question: string;
  audioFile?: string;
  answerKey: string[];        // допустимые варианты (нормализуются)
  /** 'exact' (по умолчанию) — точное совпадение, 'startsWith' — начинается с одного из вариантов */
  matchMode?: 'exact' | 'startsWith';
  hint: string;
  explanation: string;
}

/** Шаг типа «свободный ответ» — принимаем всё, показываем пример */
export interface FreeStep {
  type: 'free';
  question: string;
  audioFile?: string;
  exampleAnswer: string;
  tip: string;
}

export type LessonStep = ExplainStep | ChoiceStep | InputStep | FreeStep;

export interface Lesson {
  day: number;
  title: string;
  objective: string;
  steps: LessonStep[];
  /** Путь к PDF для этого дня. Например assets/lessons/day01.pdf */
  pdfFile?: string;
  estimatedMinutes: number;
}

// ─── Уроки ───────────────────────────────────────────────────────────────────

export const LESSONS: Lesson[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ДЕНЬ 1 — Приветствия
  // ═══════════════════════════════════════════════════════════════════════════
  {
    day: 1,
    title: 'Привет! Знакомство и приветствия',
    objective: 'Научиться здороваться и представляться по-английски',
    pdfFile: 'assets/lessons/day01.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '👋 Как здороваться',
        text:
          'В английском есть несколько способов поздороваться:\n\n' +
          '• <b>Hello</b> — нейтральное (привет / здравствуйте)\n' +
          '• <b>Hi</b> — дружеское (привет)\n' +
          '• <b>Good morning</b> — доброе утро\n' +
          '• <b>Good evening</b> — добрый вечер\n\n' +
          'Чтобы представиться:\n' +
          '• <b>My name is Anna</b> — Меня зовут Анна\n' +
          '• <b>I\'m from Russia</b> — Я из России\n' +
          '• <b>Nice to meet you!</b> — Приятно познакомиться!',
        examples: [
          { english: 'Hello! My name is Anna.', russian: 'Привет! Меня зовут Анна.' },
          { english: 'Hi! I\'m from Russia.', russian: 'Привет! Я из России.' },
          { english: 'Nice to meet you!', russian: 'Приятно познакомиться!' },
        ],
        audioFile: 'assets/audio/day01_greetings.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай и выбери: как сказать «Привет» по-дружески?',
        audioFile: 'assets/audio/day01_q1.mp4',
        options: ['Hello', 'Hi', 'Good morning', 'Goodbye'],
        correctIndex: 1,
        hint: 'Это короткое слово из двух букв 😉',
        explanation: '<b>Hi</b> — дружеское «привет». <b>Hello</b> — чуть более официальное.',
      },
      {
        type: 'input',
        question: '✏️ Как сказать по-английски: «Меня зовут [твоё имя]»?\n\nНапиши: <i>My name is ...</i>',
        answerKey: ['my name is'],
        matchMode: 'startsWith',
        hint: 'Начни с "My name is" и добавь своё имя',
        explanation: '<b>My name is ...</b> — стандартная форма представления. Запомни эту фразу!',
      },
      {
        type: 'explain',
        title: '💬 Как спросить «Как дела?»',
        text:
          '• <b>How are you?</b> — Как дела?\n' +
          '• <b>Fine, thank you</b> — Хорошо, спасибо\n' +
          '• <b>Not bad</b> — Неплохо\n' +
          '• <b>Great!</b> — Отлично!\n\n' +
          'В разговоре часто отвечают и спрашивают в ответ:\n' +
          '<i>Fine, thank you. And you?</i> — Хорошо, спасибо. А ты?',
        examples: [
          { english: 'How are you? — Fine, thank you!', russian: 'Как дела? — Хорошо, спасибо!' },
          { english: 'And you? — Great!', russian: 'А ты? — Отлично!' },
        ],
      },
      {
        type: 'choice',
        question: 'Как ответить на вопрос «How are you?»',
        options: ['My name is Tom', 'Fine, thank you!', 'Good morning!', 'Goodbye!'],
        correctIndex: 1,
        hint: 'Ищи ответ, который говорит о самочувствии',
        explanation: '<b>Fine, thank you!</b> — классический ответ. Можно также: Great! / Not bad. / Good!',
      },
      {
        type: 'free',
        question: '🗣 Свободное задание!\n\nНапиши мини-диалог знакомства:\n«Привет! Меня зовут... Я из... Как дела?»',
        exampleAnswer: 'Hi! My name is Alex. I\'m from Russia. How are you?',
        tip: 'Используй: Hi / Hello, My name is, I\'m from, How are you?',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ДЕНЬ 2 — Местоимения
  // ═══════════════════════════════════════════════════════════════════════════
  {
    day: 2,
    title: 'Личные местоимения: I, You, He, She...',
    objective: 'Освоить все личные местоимения английского языка',
    pdfFile: 'assets/lessons/day02.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Личные местоимения',
        text:
          'В английском нельзя опустить местоимение — оно обязательно!\n\n' +
          '• <b>I</b> — я\n' +
          '• <b>You</b> — ты / вы\n' +
          '• <b>He</b> — он\n' +
          '• <b>She</b> — она\n' +
          '• <b>It</b> — оно (предметы, животные)\n' +
          '• <b>We</b> — мы\n' +
          '• <b>They</b> — они\n\n' +
          '⚠️ «I» всегда пишется с большой буквы!',
        examples: [
          { english: 'I am a student.', russian: 'Я студент.' },
          { english: 'She is my friend.', russian: 'Она моя подруга.' },
          { english: 'They are from Moscow.', russian: 'Они из Москвы.' },
          { english: 'It is a cat.', russian: 'Это кот.' },
        ],
        audioFile: 'assets/audio/day02_pronouns.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай: какое местоимение нужно?\n\n«___ is my brother.» (Он — мой брат.)',
        audioFile: 'assets/audio/day02_q1.mp4',
        options: ['I', 'She', 'He', 'They'],
        correctIndex: 2,
        hint: 'Речь идёт о мужчине',
        explanation: '<b>He</b> = он. Используется для мужчин и мальчиков.',
      },
      {
        type: 'choice',
        question: 'Выбери правильное местоимение:\n«___ are my parents.» (Они — мои родители.)',
        options: ['He', 'She', 'It', 'They'],
        correctIndex: 3,
        hint: 'Родители — это несколько человек',
        explanation: '<b>They</b> = они. Используется для групп людей или предметов.',
      },
      {
        type: 'input',
        question: '✏️ Переведи на английский:\n«Мы студенты.»\n\nНачни с местоимения...',
        answerKey: ['we are students', 'we\'re students'],
        hint: 'Мы = We, студенты = students',
        explanation: '<b>We are students.</b> — правильный ответ. We = мы, are = форма глагола to be.',
      },
      {
        type: 'choice',
        question: 'Кошка сидит на диване. Как сказать «Она милая»?',
        options: ['He is cute', 'She is cute', 'It is cute', 'They are cute'],
        correctIndex: 2,
        hint: 'Кошка — это животное, а не человек',
        explanation: '<b>It is cute</b> — для животных используем <b>it</b>, не he/she (если пол не важен). Но носители часто говорят she для кошек — это тоже допустимо.',
      },
      {
        type: 'free',
        question: '🗣 Составь 3 предложения о себе и своей семье, используя разные местоимения.',
        exampleAnswer: 'I am Anna. He is my brother. They are my parents.',
        tip: 'I / He / She / We / They — попробуй использовать хотя бы 3 разных',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ДЕНЬ 3 — Глагол to be
  // ═══════════════════════════════════════════════════════════════════════════
  {
    day: 3,
    title: 'Глагол to be: am, is, are',
    objective: 'Строить утверждения с глаголом «быть»',
    pdfFile: 'assets/lessons/day03.pdf',
    estimatedMinutes: 25,
    steps: [
      {
        type: 'explain',
        title: '📖 Глагол to be',
        text:
          'Глагол <b>to be</b> (быть) — самый важный в английском!\n\n' +
          '<b>Полная форма → Сокращение:</b>\n' +
          '• I am → I\'m\n' +
          '• You are → You\'re\n' +
          '• He is → He\'s\n' +
          '• She is → She\'s\n' +
          '• It is → It\'s\n' +
          '• We are → We\'re\n' +
          '• They are → They\'re\n\n' +
          'В разговоре почти всегда используют сокращения!',
        examples: [
          { english: 'I\'m happy.', russian: 'Я счастлив(а).' },
          { english: 'He\'s a doctor.', russian: 'Он врач.' },
          { english: 'We\'re from Russia.', russian: 'Мы из России.' },
          { english: 'They\'re friends.', russian: 'Они друзья.' },
        ],
        audioFile: 'assets/audio/day03_tobe.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай и выбери правильную форму:\n«She ___ a teacher.»',
        audioFile: 'assets/audio/day03_q1.mp4',
        options: ['am', 'is', 'are', 'be'],
        correctIndex: 1,
        hint: 'She — это он/она? Одно лицо или несколько?',
        explanation: '<b>She is</b> (She\'s) — для he/she/it всегда используем <b>is</b>.',
      },
      {
        type: 'choice',
        question: 'Выбери правильный вариант:\n«We ___ students.»',
        options: ['am', 'is', 'are', 'be'],
        correctIndex: 2,
        hint: 'We — это сколько человек?',
        explanation: '<b>We are</b> (We\'re) — для you/we/they всегда <b>are</b>.',
      },
      {
        type: 'input',
        question: '✏️ Вставь правильную форму:\n«I ___ from Moscow.»',
        answerKey: ['am', "i am from moscow", "i'm from moscow"],
        matchMode: 'startsWith' as const,
        hint: 'Только одна форма подходит для I',
        explanation: '<b>I am</b> (I\'m) — для «я» только <b>am</b>. Никаких других вариантов!',
      },
      {
        type: 'input',
        question: '✏️ Переведи на английский (можно сокращение):\n«Они друзья.»',
        answerKey: ['they are friends', "they're friends"],
        hint: 'Они = They, друзья = friends',
        explanation: '<b>They are friends.</b> или <b>They\'re friends.</b> — оба варианта правильные.',
      },
      {
        type: 'free',
        question: '🗣 Расскажи о себе 3-4 предложениями, используя am/is/are:\nКто ты? Откуда? Чем занимаешься?',
        exampleAnswer: 'I\'m Anna. I\'m from Russia. I\'m a student. My sister is 25. She\'s a doctor.',
        tip: 'I\'m... / He\'s... / She\'s... / We\'re...',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ДЕНЬ 4 — Отрицания
  // ═══════════════════════════════════════════════════════════════════════════
  {
    day: 4,
    title: 'Отрицания: am not, isn\'t, aren\'t',
    objective: 'Строить отрицательные предложения',
    pdfFile: 'assets/lessons/day04.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Как строить отрицания',
        text:
          'Добавляем <b>not</b> после am/is/are:\n\n' +
          '• I am not → I\'m not\n' +
          '• He/She/It is not → <b>isn\'t</b>\n' +
          '• You/We/They are not → <b>aren\'t</b>\n\n' +
          '⚠️ «am not» не сокращается в стандартном английском!\n' +
          '(Нельзя сказать amn\'t)',
        examples: [
          { english: 'I\'m not tired.', russian: 'Я не устал(а).' },
          { english: 'He isn\'t a student.', russian: 'Он не студент.' },
          { english: 'They aren\'t from here.', russian: 'Они не отсюда.' },
          { english: 'It\'s not a problem.', russian: 'Это не проблема.' },
        ],
        audioFile: 'assets/audio/day04_negation.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай и выбери правильное отрицание:\n«She ___ happy.» (Она не счастлива.)',
        audioFile: 'assets/audio/day04_q1.mp4',
        options: ['am not', 'isn\'t', 'aren\'t', 'not is'],
        correctIndex: 1,
        hint: 'She → is → отрицание?',
        explanation: '<b>She isn\'t</b> = She is not. Для he/she/it используем isn\'t.',
      },
      {
        type: 'input',
        question: '✏️ Сделай отрицание:\n«They are busy.» → «They ___ busy.»',
        answerKey: ["aren't", 'are not', "they aren't busy", 'they are not busy'],
        hint: 'They → are → отрицание = ?',
        explanation: '<b>They aren\'t busy.</b> = They are not busy. Для they/we/you используем aren\'t.',
      },
      {
        type: 'choice',
        question: 'Как сказать «Я не из Лондона»?',
        options: [
          'I isn\'t from London',
          'I aren\'t from London',
          'I\'m not from London',
          'I not from London',
        ],
        correctIndex: 2,
        hint: 'Для I используется особая форма отрицания',
        explanation: '<b>I\'m not from London.</b> — для I только «am not» (сокращается в I\'m not).',
      },
      {
        type: 'input',
        question: '✏️ Переведи на английский:\n«Это не кот, это собака.»',
        answerKey: ["it isn't a cat, it's a dog", "it is not a cat, it is a dog", "it's not a cat, it's a dog"],
        hint: 'It isn\'t... it\'s...',
        explanation: '<b>It isn\'t a cat, it\'s a dog.</b> — отличная фраза! Запомни эту структуру.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ДЕНЬ 5 — Вопросы
  // ═══════════════════════════════════════════════════════════════════════════
  {
    day: 5,
    title: 'Вопросы с to be',
    objective: 'Задавать общие вопросы и давать краткие ответы',
    pdfFile: 'assets/lessons/day05.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Как задавать вопросы',
        text:
          'Чтобы задать вопрос — ставим am/is/are В НАЧАЛО:\n\n' +
          '• <b>Am I</b> right? — Я прав(а)?\n' +
          '• <b>Is he</b> a doctor? — Он врач?\n' +
          '• <b>Are you</b> from Russia? — Ты из России?\n\n' +
          '<b>Краткие ответы:</b>\n' +
          '• Yes, I am. / No, I\'m not.\n' +
          '• Yes, he is. / No, he isn\'t.\n' +
          '• Yes, they are. / No, they aren\'t.',
        examples: [
          { english: 'Are you a student? — Yes, I am.', russian: 'Ты студент? — Да.' },
          { english: 'Is she from Moscow? — No, she isn\'t.', russian: 'Она из Москвы? — Нет.' },
          { english: 'Are they friends? — Yes, they are.', russian: 'Они друзья? — Да.' },
        ],
        audioFile: 'assets/audio/day05_questions.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай вопрос и выбери правильный краткий ответ:\n«Is he a teacher?»\n(Да, он учитель.)',
        audioFile: 'assets/audio/day05_q1.mp4',
        options: ['Yes, he is.', 'Yes, I am.', 'Yes, they are.', 'Yes, she is.'],
        correctIndex: 0,
        hint: 'В вопросе Is he — значит ответ тоже про he',
        explanation: '<b>Yes, he is.</b> — краткий ответ всегда повторяет подлежащее и глагол из вопроса.',
      },
      {
        type: 'input',
        question: '✏️ Составь вопрос:\n«She is tired.» → «___ she tired?»',
        answerKey: ['is she tired?', 'is she tired'],
        hint: 'Переставь is и she местами',
        explanation: '<b>Is she tired?</b> — просто меняем порядок: глагол идёт перед подлежащим.',
      },
      {
        type: 'choice',
        question: 'Как задать вопрос «Они из России?»',
        options: [
          'Is they from Russia?',
          'Are they from Russia?',
          'They are from Russia?',
          'Do they from Russia?',
        ],
        correctIndex: 1,
        hint: 'They → are → как строится вопрос?',
        explanation: '<b>Are they from Russia?</b> — для they/we/you вопрос начинается с Are.',
      },
      {
        type: 'input',
        question: '✏️ Дай краткий отрицательный ответ на вопрос:\n«Are you from London?» → «No, ___»',
        answerKey: ["no, i'm not", 'no, i am not'],
        hint: 'No + I + am + not',
        explanation: '<b>No, I\'m not.</b> — краткий отрицательный ответ для I.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ДЕНЬ 6 — Числа и возраст
  // ═══════════════════════════════════════════════════════════════════════════
  {
    day: 6,
    title: 'Числа и возраст',
    objective: 'Называть числа и говорить о возрасте',
    pdfFile: 'assets/lessons/day06.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Числа от 1 до 20',
        text:
          '1-10: <b>one, two, three, four, five, six, seven, eight, nine, ten</b>\n\n' +
          '11-20: <b>eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty</b>\n\n' +
          'Дальше:\n' +
          '• 21 — <b>twenty-one</b>\n' +
          '• 30 — <b>thirty</b>\n' +
          '• 40 — <b>forty</b> (без u!)\n' +
          '• 50 — <b>fifty</b>\n' +
          '• 100 — <b>one hundred</b>\n\n' +
          '<b>Возраст:</b> I am 25 years old. / I\'m 25.',
        examples: [
          { english: 'I\'m twenty-five years old.', russian: 'Мне двадцать пять лет.' },
          { english: 'How old are you?', russian: 'Сколько тебе лет?' },
          { english: 'She\'s thirty-two.', russian: 'Ей тридцать два.' },
        ],
        audioFile: 'assets/audio/day06_numbers.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай число и выбери правильный вариант:',
        audioFile: 'assets/audio/day06_q1.mp4',
        options: ['thirteen', 'thirty', 'fourteen', 'forty'],
        correctIndex: 1,
        hint: '-teen = подростковые числа (13-19), -ty = десятки (20,30,40...)',
        explanation: '<b>Thirty</b> = 30. Тринадцать = thirteen (13). Следи за окончанием: -teen vs -ty.',
      },
      {
        type: 'input',
        question: '✏️ Напиши по-английски:\n«Мне 28 лет.»',
        answerKey: ["i'm 28 years old", 'i am 28 years old', "i'm twenty-eight years old", 'i am twenty-eight years old', "i'm", 'i am'],
        matchMode: 'startsWith' as const,
        hint: 'I\'m + число + years old',
        explanation: '<b>I\'m 28 years old.</b> или <b>I\'m twenty-eight.</b> — оба варианта правильные.',
      },
      {
        type: 'choice',
        question: 'Как спросить возраст по-английски?',
        options: [
          'What is your age?',
          'How old are you?',
          'How many years you have?',
          'What age have you?',
        ],
        correctIndex: 1,
        hint: 'Самая распространённая фраза — короткая и простая',
        explanation: '<b>How old are you?</b> — стандартный вопрос о возрасте. Запомни именно эту фразу!',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ДЕНЬ 7 — Мини-тест недели 1
  // ═══════════════════════════════════════════════════════════════════════════
  {
    day: 7,
    title: '🏆 Тест: итоги первой недели',
    objective: 'Закрепить знания дней 1–6',
    pdfFile: 'assets/lessons/day07.pdf',
    estimatedMinutes: 25,
    steps: [
      {
        type: 'explain',
        title: '📋 Повторение недели',
        text:
          'За эту неделю ты изучил(а):\n\n' +
          '✅ Приветствия: Hello, Hi, How are you?\n' +
          '✅ Местоимения: I, You, He, She, It, We, They\n' +
          '✅ Глагол to be: am / is / are\n' +
          '✅ Отрицания: isn\'t / aren\'t / I\'m not\n' +
          '✅ Вопросы: Is he...? / Are you...?\n' +
          '✅ Числа и возраст\n\n' +
          'Сейчас проверим всё вместе! 💪',
      },
      {
        type: 'choice',
        question: '1. Как сказать «Она не студентка»?',
        options: ['She isn\'t a student', 'She aren\'t a student', 'She am not a student', 'She not student'],
        correctIndex: 0,
        hint: 'She → is → отрицание?',
        explanation: '<b>She isn\'t a student.</b> = She is not a student.',
      },
      {
        type: 'input',
        question: '2. Переведи: «Привет! Меня зовут Миша. Мне 20 лет.»',
        answerKey: ["hi! my name is misha. i'm 20", "hello! my name is misha. i'm 20 years old", "hi, my name is misha, i'm 20", 'hi! my name is', 'hello! my name is', 'hi, my name is'],
        matchMode: 'startsWith' as const,
        hint: 'Hi! My name is... I\'m...',
        explanation: '<b>Hi! My name is Misha. I\'m 20 years old.</b>',
      },
      {
        type: 'choice',
        question: '3. Выбери правильный вариант:\n«___ you from Moscow?»',
        options: ['Is', 'Am', 'Are', 'Be'],
        correctIndex: 2,
        hint: 'you → ?',
        explanation: '<b>Are you from Moscow?</b> — для you используем are.',
      },
      {
        type: 'choice',
        question: '4. Как сказать «Нам 25 лет»?',
        options: ["We're 25 years old", "We is 25 years old", "We am 25 years old", "Us are 25"],
        correctIndex: 0,
        hint: 'We + правильная форма to be',
        explanation: '<b>We\'re 25 years old.</b> = We are 25 years old.',
      },
      {
        type: 'free',
        question: '5. Финальное задание! 🎯\n\nНапиши небольшой текст о себе (4-5 предложений):\nИмя, возраст, откуда, кто ты, одна деталь о семье.',
        exampleAnswer: 'Hi! My name is Misha. I\'m 20 years old. I\'m from Russia. I\'m a student. My sister is 25. She\'s a doctor.',
        tip: 'Используй am/is/are, местоимения и числа',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ДЕНЬ 8 — Present Simple
  // ═══════════════════════════════════════════════════════════════════════════
  {
    day: 8,
    title: 'Present Simple: основы',
    objective: 'Понять и использовать настоящее простое время',
    pdfFile: 'assets/lessons/day08.pdf',
    estimatedMinutes: 25,
    steps: [
      {
        type: 'explain',
        title: '📖 Present Simple — когда используем?',
        text:
          'Present Simple описывает:\n' +
          '• Регулярные действия: <i>I work every day</i>\n' +
          '• Факты: <i>The sun rises in the east</i>\n' +
          '• Привычки: <i>She drinks coffee every morning</i>\n\n' +
          '<b>Правило:</b>\n' +
          '• I/You/We/They + глагол: <b>I work, They play</b>\n' +
          '• He/She/It + глагол + <b>s/es</b>: <b>He works, She plays</b>\n\n' +
          'Исключения: go → goes, do → does, have → has',
        examples: [
          { english: 'I work every day.', russian: 'Я работаю каждый день.' },
          { english: 'She works at a school.', russian: 'Она работает в школе.' },
          { english: 'They live in Moscow.', russian: 'Они живут в Москве.' },
          { english: 'He goes to the gym.', russian: 'Он ходит в спортзал.' },
        ],
        audioFile: 'assets/audio/day08_present_simple.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай и выбери правильную форму:\n«She ___ every evening.» (читает)',
        audioFile: 'assets/audio/day08_q1.mp4',
        options: ['read', 'reads', 'reading', 'is read'],
        correctIndex: 1,
        hint: 'She → добавить -s или -es к глаголу',
        explanation: '<b>She reads</b> — для he/she/it в Present Simple всегда добавляем -s.',
      },
      {
        type: 'input',
        question: '✏️ Поставь глагол в правильную форму:\n«He ___ (go) to work by bus.»',
        answerKey: ['goes', 'he goes to work by bus'],
        hint: 'He → goes (go + es, исключение!)',
        explanation: '<b>He goes</b> — глагол go имеет особую форму: goes (не "gos").',
      },
      {
        type: 'choice',
        question: 'Какое предложение правильное?',
        options: [
          'She live in Paris',
          'She lives in Paris',
          'She is live in Paris',
          'She living in Paris',
        ],
        correctIndex: 1,
        hint: 'She → нужно ли добавлять -s?',
        explanation: '<b>She lives in Paris.</b> — she требует +s: live → lives.',
      },
      {
        type: 'input',
        question: '✏️ Переведи:\n«Они играют в футбол каждые выходные.»',
        answerKey: ['they play football every weekend', 'they play soccer every weekend'],
        hint: 'They → глагол без -s, football = football/soccer',
        explanation: '<b>They play football every weekend.</b> — для they форма глагола не меняется.',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ДЕНЬ 9 — Повседневные действия
  // ═══════════════════════════════════════════════════════════════════════════
  {
    day: 9,
    title: 'Повседневные действия',
    objective: 'Рассказывать о своём распорядке дня',
    pdfFile: 'assets/lessons/day09.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Глаголы повседневной жизни',
        text:
          '<b>Утро:</b>\n' +
          '• wake up — просыпаться\n' +
          '• get up — вставать\n' +
          '• have breakfast — завтракать\n' +
          '• brush teeth — чистить зубы\n\n' +
          '<b>День:</b>\n' +
          '• go to work/school — идти на работу/учёбу\n' +
          '• have lunch — обедать\n' +
          '• work/study — работать/учиться\n\n' +
          '<b>Вечер:</b>\n' +
          '• come home — приходить домой\n' +
          '• have dinner — ужинать\n' +
          '• watch TV — смотреть телевизор\n' +
          '• go to bed — ложиться спать',
        examples: [
          { english: 'I wake up at 7 a.m.', russian: 'Я просыпаюсь в 7 утра.' },
          { english: 'She has lunch at noon.', russian: 'Она обедает в полдень.' },
          { english: 'He watches TV in the evening.', russian: 'Он смотрит ТВ вечером.' },
          { english: 'They go to bed at 11 p.m.', russian: 'Они ложатся спать в 11 вечера.' },
        ],
        audioFile: 'assets/audio/day09_daily.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай и выбери перевод:\n«I have breakfast at 8 a.m.»',
        audioFile: 'assets/audio/day09_q1.mp4',
        options: [
          'Я обедаю в 8 утра',
          'Я завтракаю в 8 утра',
          'Я ужинаю в 8 утра',
          'Я просыпаюсь в 8 утра',
        ],
        correctIndex: 1,
        hint: 'breakfast = ?',
        explanation: '<b>I have breakfast</b> = завтракать. lunch = обед, dinner/supper = ужин.',
      },
      {
        type: 'input',
        question: '✏️ Переведи:\n«Она смотрит телевизор каждый вечер.»',
        answerKey: ['she watches tv every evening', 'she watches television every evening'],
        hint: 'She → watch → watches (добавь -es!)',
        explanation: '<b>She watches TV every evening.</b> — watch → watches (для she добавляем -es).',
      },
      {
        type: 'free',
        question: '🗣 Опиши свой типичный день!\nИспользуй 5-6 предложений с глаголами из урока.',
        exampleAnswer: 'I wake up at 7 a.m. I have breakfast at 8. I go to work at 9. I have lunch at 1 p.m. I come home at 6. I watch TV and go to bed at 11.',
        tip: 'wake up → have breakfast → go to... → come home → go to bed',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ДЕНЬ 10 — Отрицания в Present Simple
  // ═══════════════════════════════════════════════════════════════════════════
  {
    day: 10,
    title: "Don't и doesn't: отрицания",
    objective: 'Строить отрицания в Present Simple',
    pdfFile: 'assets/lessons/day10.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: "📖 Don't и doesn't",
        text:
          '<b>Формула отрицания в Present Simple:</b>\n\n' +
          '• I/You/We/They + <b>don\'t</b> + глагол\n' +
          '• He/She/It + <b>doesn\'t</b> + глагол (без -s!)\n\n' +
          '⚠️ Важно: после doesn\'t глагол стоит БЕЗ -s!\n' +
          'Неверно: ~~She doesn\'t works~~\n' +
          'Верно: <b>She doesn\'t work</b>',
        examples: [
          { english: "I don't like coffee.", russian: 'Я не люблю кофе.' },
          { english: "She doesn't work on weekends.", russian: 'Она не работает по выходным.' },
          { english: "They don't live here.", russian: 'Они здесь не живут.' },
          { english: "He doesn't eat meat.", russian: 'Он не ест мясо.' },
        ],
        audioFile: 'assets/audio/day10_dont.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай и выбери правильное отрицание:\n«He ___ like mornings.»',
        audioFile: 'assets/audio/day10_q1.mp4',
        options: ["don't", "doesn't", "isn't", "not"],
        correctIndex: 1,
        hint: 'He → does → отрицание?',
        explanation: "<b>He doesn't like mornings.</b> — для he/she/it используем doesn't.",
      },
      {
        type: 'choice',
        question: 'Какое предложение правильное?',
        options: [
          "She doesn't works here",
          "She don't work here",
          "She doesn't work here",
          "She not work here",
        ],
        correctIndex: 2,
        hint: 'После doesn\'t глагол без -s!',
        explanation: "<b>She doesn't work here.</b> — после doesn't глагол в начальной форме (без -s).",
      },
      {
        type: 'input',
        question: '✏️ Сделай отрицание:\n«I drink coffee every morning.» → «I ___ coffee every morning.»',
        answerKey: ["don't drink", "i don't drink coffee every morning"],
        hint: 'I → don\'t',
        explanation: "<b>I don't drink coffee every morning.</b>",
      },
      {
        type: 'input',
        question: '✏️ Переведи:\n«Они не живут в Москве.»',
        answerKey: ["they don't live in moscow", 'they do not live in moscow'],
        hint: "They → don't",
        explanation: "<b>They don't live in Moscow.</b>",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ДЕНЬ 11-30 — остальные дни с той же структурой
  // (для краткости — 3 шага, можно расширить)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    day: 11,
    title: 'Вопросы: Do и Does',
    objective: 'Задавать вопросы в Present Simple',
    pdfFile: 'assets/lessons/day11.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Вопросы в Present Simple',
        text:
          '<b>Формула вопроса:</b>\n\n' +
          '• <b>Do</b> + I/you/we/they + глагол?\n' +
          '• <b>Does</b> + he/she/it + глагол?\n\n' +
          '<b>Краткие ответы:</b>\n' +
          '• Yes, I do. / No, I don\'t.\n' +
          '• Yes, she does. / No, she doesn\'t.',
        examples: [
          { english: 'Do you like tea?', russian: 'Ты любишь чай?' },
          { english: 'Does he work here?', russian: 'Он работает здесь?' },
          { english: 'Yes, I do.', russian: 'Да.' },
          { english: "No, he doesn't.", russian: 'Нет.' },
        ],
        audioFile: 'assets/audio/day11_questions.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай и выбери: какое слово начинает вопрос?\n«___ she like music?»',
        audioFile: 'assets/audio/day11_q1.mp4',
        options: ['Do', 'Does', 'Is', 'Are'],
        correctIndex: 1,
        hint: 'she → does или do?',
        explanation: '<b>Does she like music?</b> — для he/she/it вопрос начинается с Does.',
      },
      {
        type: 'input',
        question: '✏️ Составь вопрос:\n«They play football.» → «___ they play football?»',
        answerKey: ['do they play football?', 'do they play football'],
        hint: 'They → Do или Does?',
        explanation: '<b>Do they play football?</b> — для they используем Do.',
      },
      {
        type: 'choice',
        question: 'Как ответить «Нет» на вопрос «Does she work here?»',
        options: ["No, she don't.", "No, she doesn't.", "No, she isn't.", "No, she not."],
        correctIndex: 1,
        hint: 'Does → краткий отрицательный ответ?',
        explanation: "<b>No, she doesn't.</b> — краткий ответ на Does-вопрос.",
      },
    ],
  },
  {
    day: 12,
    title: 'Частотные наречия',
    objective: 'Говорить как часто что-то происходит',
    pdfFile: 'assets/lessons/day12.pdf',
    estimatedMinutes: 15,
    steps: [
      {
        type: 'explain',
        title: '📖 Наречия частоты',
        text:
          'Шкала от 100% до 0%:\n\n' +
          '• <b>always</b> (всегда) — 100%\n' +
          '• <b>usually</b> (обычно) — 80%\n' +
          '• <b>often</b> (часто) — 60%\n' +
          '• <b>sometimes</b> (иногда) — 40%\n' +
          '• <b>rarely</b> (редко) — 20%\n' +
          '• <b>never</b> (никогда) — 0%\n\n' +
          '<b>Место в предложении:</b> ПЕРЕД основным глаголом, но ПОСЛЕ am/is/are',
        examples: [
          { english: 'I always drink coffee.', russian: 'Я всегда пью кофе.' },
          { english: 'She is never late.', russian: 'Она никогда не опаздывает.' },
          { english: 'They sometimes eat out.', russian: 'Они иногда едят в ресторане.' },
        ],
        audioFile: 'assets/audio/day12_adverbs.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Где правильное место для «usually»?\n«I ___ have breakfast at home.»',
        audioFile: 'assets/audio/day12_q1.mp4',
        options: ['usually I have', 'I usually have ✓', 'I have usually', 'I have usually breakfast'],
        correctIndex: 1,
        hint: 'Наречие стоит перед основным глаголом',
        explanation: '<b>I usually have breakfast at home.</b> — usually стоит перед have.',
      },
      {
        type: 'input',
        question: '✏️ Переведи: «Она иногда работает допоздна.»',
        answerKey: ['she sometimes works late', 'she sometimes works until late'],
        hint: 'sometimes + работает = works (she!)',
        explanation: '<b>She sometimes works late.</b> — sometimes перед глаголом, works с -s для she.',
      },
    ],
  },
  {
    day: 13,
    title: 'Время и распорядок дня',
    objective: 'Говорить о времени и расписании',
    pdfFile: 'assets/lessons/day13.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Как говорить о времени',
        text:
          '<b>Части дня:</b>\n' +
          '• in the morning — утром\n' +
          '• in the afternoon — днём\n' +
          '• in the evening — вечером\n' +
          '• at night — ночью\n' +
          '• at noon — в полдень\n' +
          '• at midnight — в полночь\n\n' +
          '<b>Точное время:</b>\n' +
          '• at 7 a.m. — в 7 утра\n' +
          '• at 3 p.m. — в 15:00\n' +
          '• at half past 8 — в 8:30\n' +
          '• at quarter to 9 — без четверти 9',
        examples: [
          { english: 'I get up at 7 a.m.', russian: 'Я встаю в 7 утра.' },
          { english: 'She has lunch at noon.', russian: 'Она обедает в полдень.' },
          { english: 'We go to bed at half past 10.', russian: 'Мы ложимся спать в 10:30.' },
        ],
        audioFile: 'assets/audio/day13_time.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай и выбери перевод:\n«at half past seven»',
        audioFile: 'assets/audio/day13_q1.mp4',
        options: ['в 7:00', 'в 7:15', 'в 7:30', 'в 7:45'],
        correctIndex: 2,
        hint: 'half = половина',
        explanation: '<b>Half past seven</b> = 7:30. Half = половина часа.',
      },
      {
        type: 'input',
        question: '✏️ Переведи: «Я обычно завтракаю в 8 утра.»',
        answerKey: ['i usually have breakfast at 8 a.m.', 'i usually have breakfast at 8', 'i usually eat breakfast at 8 a.m.'],
        hint: 'I usually have breakfast at...',
        explanation: '<b>I usually have breakfast at 8 a.m.</b>',
      },
    ],
  },
  {
    day: 14,
    title: '🏆 Тест: Present Simple',
    objective: 'Проверить знание дней 8–13',
    pdfFile: 'assets/lessons/day14.pdf',
    estimatedMinutes: 25,
    steps: [
      {
        type: 'explain',
        title: '📋 Повторение',
        text:
          'За вторую неделю ты изучил(а):\n\n' +
          '✅ Present Simple: I work / He works\n' +
          "✅ Отрицания: don't / doesn't\n" +
          '✅ Вопросы: Do you? / Does she?\n' +
          '✅ Частотные наречия: always, usually, often...\n' +
          '✅ Повседневные действия\n' +
          '✅ Время и части дня\n\n' +
          'Поехали! 🚀',
      },
      {
        type: 'choice',
        question: '1. Какое предложение правильное?',
        options: [
          "She don't like coffee",
          "She doesn't likes coffee",
          "She doesn't like coffee",
          "She not like coffee",
        ],
        correctIndex: 2,
        hint: "doesn't + глагол без -s",
        explanation: "<b>She doesn't like coffee.</b>",
      },
      {
        type: 'input',
        question: '2. Переведи: «Он всегда ест завтрак в 8 утра.»',
        answerKey: ['he always has breakfast at 8 a.m.', 'he always eats breakfast at 8 a.m.', 'he always has breakfast at 8'],
        hint: 'He always has/eats breakfast at...',
        explanation: '<b>He always has breakfast at 8 a.m.</b>',
      },
      {
        type: 'choice',
        question: '3. Как спросить «Ты живёшь в Москве?»',
        options: ['Is you live in Moscow?', 'Do you live in Moscow?', 'Does you live in Moscow?', 'Are you live in Moscow?'],
        correctIndex: 1,
        hint: 'you → Do или Does?',
        explanation: '<b>Do you live in Moscow?</b>',
      },
      {
        type: 'free',
        question: '4. Финальное задание!\n\nОпиши свой типичный день — 5 предложений.\nИспользуй частотные наречия и точное время.',
        exampleAnswer: 'I usually wake up at 7 a.m. I always have breakfast at 8. I go to work at 9. I sometimes have lunch at the cafe. I never go to bed after midnight.',
        tip: 'always / usually / sometimes / never + время (at 7 a.m., at noon...)',
      },
    ],
  },
  {
    day: 15,
    title: 'Предпочтения: like, love, hate',
    objective: 'Рассказывать о том, что нравится и не нравится',
    pdfFile: 'assets/lessons/day15.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Глаголы предпочтений',
        text:
          '• <b>love</b> — обожать\n• <b>like</b> — нравится\n• <b>enjoy</b> — получать удовольствие\n• <b>don\'t like</b> — не нравится\n• <b>hate</b> — ненавидеть\n\n' +
          '<b>После них:</b> существительное ИЛИ глагол+ing\n' +
          'I like <b>coffee</b>. / I like <b>reading</b>.',
        examples: [
          { english: 'I love travelling.', russian: 'Я обожаю путешествовать.' },
          { english: "She doesn't like mornings.", russian: 'Ей не нравятся утра.' },
          { english: 'He hates traffic jams.', russian: 'Он ненавидит пробки.' },
        ],
        audioFile: 'assets/audio/day15_preferences.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Выбери правильный вариант:\n«I love ___ books.»',
        audioFile: 'assets/audio/day15_q1.mp4',
        options: ['read', 'reads', 'reading', 'to reading'],
        correctIndex: 2,
        hint: 'После love/like/hate → глагол + ing',
        explanation: '<b>I love reading books.</b> — после love используем -ing форму.',
      },
      {
        type: 'input',
        question: '✏️ Переведи: «Он не любит вставать рано.»',
        answerKey: ["he doesn't like getting up early", "he doesn't like waking up early", "he doesn't like to get up early"],
        hint: "doesn't like + глагол-ing",
        explanation: "<b>He doesn't like getting up early.</b>",
      },
      {
        type: 'free',
        question: '🗣 Расскажи о своих предпочтениях!\nЧто ты любишь / не любишь / ненавидишь?',
        exampleAnswer: 'I love travelling and reading. I like cooking at home. I don\'t like waking up early. I hate traffic jams.',
        tip: 'love / like / enjoy / don\'t like / hate + noun или verb-ing',
      },
    ],
  },
  {
    day: 16,
    title: 'Модальный глагол can',
    objective: 'Говорить о возможностях и умениях',
    pdfFile: 'assets/lessons/day16.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Can — могу, умею',
        text:
          '<b>Can</b> = мочь, уметь\n\n' +
          '• Форма одинакова для всех: I/you/he/she/we/they <b>can</b>\n' +
          '• Отрицание: <b>can\'t</b> (cannot)\n' +
          '• Вопрос: <b>Can</b> you...?\n' +
          '• Ответы: Yes, I <b>can</b>. / No, I <b>can\'t</b>.\n\n' +
          '⚠️ После can глагол БЕЗ to и без -s!',
        examples: [
          { english: 'I can swim.', russian: 'Я умею плавать.' },
          { english: "She can't drive.", russian: 'Она не умеет водить.' },
          { english: 'Can you help me?', russian: 'Ты можешь мне помочь?' },
        ],
        audioFile: 'assets/audio/day16_can.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Выбери правильный вариант:\n«She ___ speak English.»',
        audioFile: 'assets/audio/day16_q1.mp4',
        options: ["can't speaks", "can speaks", "can speak", "cans speak"],
        correctIndex: 2,
        hint: 'После can глагол без изменений',
        explanation: "<b>She can speak English.</b> — после can глагол в начальной форме.",
      },
      {
        type: 'input',
        question: '✏️ Составь вопрос:\n«She can cook.» → «___ she cook?»',
        answerKey: ['can she cook?', 'can she cook'],
        hint: 'Вынеси can в начало',
        explanation: '<b>Can she cook?</b> — can выносится в начало вопроса.',
      },
      {
        type: 'free',
        question: '🗣 Расскажи что ты умеешь и что не умеешь делать!\n(3-4 предложения)',
        exampleAnswer: "I can speak Russian and English. I can cook. I can't drive yet. Can you swim?",
        tip: 'I can... / I can\'t... / Can you...?',
      },
    ],
  },
  {
    day: 17,
    title: 'В кафе: еда и напитки',
    objective: 'Делать заказ в кафе по-английски',
    pdfFile: 'assets/lessons/day17.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Фразы для кафе',
        text:
          '<b>Заказ:</b>\n' +
          '• Can I have...? — Можно мне...?\n' +
          '• I\'d like... — Я бы хотел(а)...\n' +
          '• Could I get...? — Можно мне получить...?\n\n' +
          '<b>Напитки:</b> coffee, tea, juice, water, milk\n' +
          '<b>Еда:</b> sandwich, salad, soup, cake, pizza\n\n' +
          '<b>Полезные фразы:</b>\n' +
          '• How much is it? — Сколько стоит?\n' +
          '• The bill, please. — Счёт, пожалуйста.',
        examples: [
          { english: 'Can I have a coffee, please?', russian: 'Можно мне кофе, пожалуйста?' },
          { english: "I'd like a sandwich.", russian: 'Я бы хотел(а) сэндвич.' },
          { english: 'How much is it?', russian: 'Сколько это стоит?' },
        ],
        audioFile: 'assets/audio/day17_cafe.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай — что заказывает клиент?',
        audioFile: 'assets/audio/day17_q1.mp4',
        options: ['Кофе и пирог', 'Чай и сэндвич', 'Сок и салат', 'Воду и пиццу'],
        correctIndex: 1,
        hint: 'Слушай ключевые слова: tea, sandwich',
        explanation: 'Клиент заказал <b>чай и сэндвич</b>: «I\'d like tea and a sandwich, please.»',
      },
      {
        type: 'input',
        question: '✏️ Как сказать: «Можно мне чай с молоком, пожалуйста?»',
        answerKey: ['can i have tea with milk, please?', 'can i have a tea with milk, please?', "i'd like tea with milk, please"],
        hint: 'Can I have... please?',
        explanation: '<b>Can I have tea with milk, please?</b>',
      },
      {
        type: 'free',
        question: '🗣 Разыграй диалог в кафе!\nТы клиент: закажи 2 напитка и 1 еду, спроси стоимость.',
        exampleAnswer: "Hi! Can I have a coffee and a juice, please? I'd also like a sandwich. How much is it? The bill, please.",
        tip: 'Can I have... / I\'d like... / How much? / The bill, please.',
      },
    ],
  },
  {
    day: 18,
    title: 'Покупки и цены',
    objective: 'Совершать покупки и обсуждать цены',
    pdfFile: 'assets/lessons/day18.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Фразы для шопинга',
        text:
          '• How much does it cost? — Сколько это стоит?\n' +
          '• How much is it? — Сколько это стоит?\n' +
          '• It\'s 500 rubles. — Это 500 рублей.\n' +
          '• I\'ll take it. — Я возьму.\n' +
          '• Do you have it in...? — Есть ли у вас в...?\n' +
          '• Can I try it on? — Можно примерить?\n' +
          '• It\'s too expensive. — Слишком дорого.',
        examples: [
          { english: 'How much is this jacket?', russian: 'Сколько стоит эта куртка?' },
          { english: "It's 3,000 rubles.", russian: 'Это 3000 рублей.' },
          { english: 'Do you have it in blue?', russian: 'Есть ли это в синем?' },
        ],
        audioFile: 'assets/audio/day18_shopping.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Как ответить на «How much is it?»\nЕсли цена 1500 рублей:',
        audioFile: 'assets/audio/day18_q1.mp4',
        options: ["It's 1500 rubles.", 'It costs 1500 rubles.', 'The price is 1500.', 'Все варианты верны ✓'],
        correctIndex: 3,
        hint: 'Есть несколько способов назвать цену',
        explanation: 'Все три варианта правильные! Самый простой: <b>It\'s 1500 rubles.</b>',
      },
      {
        type: 'input',
        question: '✏️ Переведи: «Сколько стоят эти туфли?»',
        answerKey: ['how much are these shoes?', 'how much do these shoes cost?', 'how much is this pair of shoes?'],
        hint: 'How much are/do... ?',
        explanation: '<b>How much are these shoes?</b> или <b>How much do these shoes cost?</b>',
      },
    ],
  },
  {
    day: 19,
    title: 'Направления и места',
    objective: 'Спрашивать дорогу и объяснять путь',
    pdfFile: 'assets/lessons/day19.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Как спросить дорогу',
        text:
          '<b>Вопросы:</b>\n' +
          '• Where is the nearest...? — Где ближайший...?\n' +
          '• How do I get to...? — Как добраться до...?\n' +
          '• Excuse me, could you help me? — Извините, не могли бы помочь?\n\n' +
          '<b>Направления:</b>\n' +
          '• Turn left/right — повернуть налево/направо\n' +
          '• Go straight — идти прямо\n' +
          '• It\'s on the left/right — это слева/справа\n' +
          '• next to — рядом с\n' +
          '• opposite — напротив\n' +
          '• on foot — пешком',
        examples: [
          { english: 'Where is the nearest metro?', russian: 'Где ближайшее метро?' },
          { english: 'Go straight and turn left.', russian: 'Идите прямо и поверните налево.' },
          { english: "It's next to the park.", russian: 'Это рядом с парком.' },
        ],
        audioFile: 'assets/audio/day19_directions.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай и выбери направление:',
        audioFile: 'assets/audio/day19_q1.mp4',
        options: ['Направо', 'Налево', 'Прямо', 'Назад'],
        correctIndex: 2,
        hint: 'Слушай: go straight',
        explanation: '<b>Go straight</b> = идти прямо.',
      },
      {
        type: 'input',
        question: '✏️ Переведи: «Банк находится напротив аптеки.»',
        answerKey: ['the bank is opposite the pharmacy', 'the bank is opposite the drugstore'],
        hint: 'opposite = напротив',
        explanation: '<b>The bank is opposite the pharmacy.</b>',
      },
    ],
  },
  {
    day: 20,
    title: 'Семья и описание людей',
    objective: 'Рассказывать о семье и описывать людей',
    pdfFile: 'assets/lessons/day20.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Члены семьи',
        text:
          '<b>Близкие:</b> mother/mom, father/dad, brother, sister, son, daughter, wife, husband\n\n' +
          '<b>Остальные:</b> grandmother/grandma, grandfather/grandpa, aunt, uncle, cousin\n\n' +
          '<b>Описание:</b>\n' +
          '• tall/short — высокий/низкий\n' +
          '• young/old — молодой/старый\n' +
          '• kind — добрый\n' +
          '• funny — смешной\n' +
          '• smart — умный\n' +
          '• have + цвет + hair — иметь ... волосы',
        examples: [
          { english: 'My mother is kind and smart.', russian: 'Моя мама добрая и умная.' },
          { english: 'I have one brother and two sisters.', russian: 'У меня один брат и две сестры.' },
          { english: 'My father has brown hair.', russian: 'У моего папы каштановые волосы.' },
        ],
        audioFile: 'assets/audio/day20_family.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Послушай и выбери перевод:\n«My grandmother is very kind.»',
        audioFile: 'assets/audio/day20_q1.mp4',
        options: [
          'Моя тётя очень добрая',
          'Моя бабушка очень добрая',
          'Моя мама очень добрая',
          'Моя сестра очень добрая',
        ],
        correctIndex: 1,
        hint: 'grandmother = ?',
        explanation: '<b>Grandmother</b> = бабушка. Grandma — разговорная форма.',
      },
      {
        type: 'free',
        question: '🗣 Расскажи о своей семье!\n4-5 предложений: кто есть, сколько лет, как выглядит.',
        exampleAnswer: 'I have a mother, a father and one brother. My mother is 50. She is kind and smart. My brother is 22. He is tall and funny.',
        tip: 'I have... / My ... is ... / He/She is ...',
      },
    ],
  },
  {
    day: 21,
    title: 'Диалоги из жизни',
    objective: 'Практиковать живые бытовые разговоры',
    pdfFile: 'assets/lessons/day21.pdf',
    estimatedMinutes: 25,
    steps: [
      {
        type: 'explain',
        title: '📖 Полезные фразы для разговора',
        text:
          '• Excuse me — Извините\n' +
          '• Sorry — Прошу прощения\n' +
          '• Of course — Конечно\n' +
          '• No problem — Нет проблем\n' +
          '• I don\'t understand — Я не понимаю\n' +
          '• Can you repeat? — Можете повторить?\n' +
          '• Speak slower, please — Говорите медленнее\n' +
          '• What does ... mean? — Что значит...?',
        examples: [
          { english: "Excuse me, I don't understand. Can you repeat?", russian: 'Извините, я не понимаю. Можете повторить?' },
          { english: 'Of course! No problem.', russian: 'Конечно! Нет проблем.' },
        ],
        audioFile: 'assets/audio/day21_dialogs.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Как сказать «Я не понимаю. Можно медленнее?»',
        audioFile: 'assets/audio/day21_q1.mp4',
        options: [
          "I not understand. More slow please.",
          "I don't understand. Speak slower, please.",
          "I can't understand. More slowly.",
          "I no understand. Slow please.",
        ],
        correctIndex: 1,
        hint: "I don't... + speak slower",
        explanation: "<b>I don't understand. Speak slower, please.</b> — правильный и вежливый вариант.",
      },
      {
        type: 'free',
        question: '🗣 Практика!\nСоставь 3 мини-диалога:\n1. В кафе\n2. Спрашиваешь дорогу\n3. Знакомишься',
        exampleAnswer: '1. — Can I have a coffee? — Of course!\n2. — Excuse me, where is the metro? — Go straight!\n3. — Hi! I\'m Anna. — Nice to meet you!',
        tip: 'Используй фразы из дней 1-21',
      },
    ],
  },
  {
    day: 22,
    title: 'Повторение: всё вместе',
    objective: 'Закрепить все изученные конструкции',
    pdfFile: 'assets/lessons/day22.pdf',
    estimatedMinutes: 25,
    steps: [
      {
        type: 'explain',
        title: '📋 Три недели за 5 минут',
        text:
          '✅ <b>Неделя 1:</b> to be (am/is/are), местоимения, числа\n' +
          "✅ <b>Неделя 2:</b> Present Simple, don't/doesn't, Do/Does?\n" +
          '✅ <b>Неделя 3:</b> like/love/hate, can, кафе, покупки, семья\n\n' +
          'Сегодня — комплексная тренировка всего материала!',
      },
      {
        type: 'choice',
        question: 'Какое предложение правильное?',
        options: [
          "She doesn't likes coffee and she isn't drink tea.",
          "She doesn't like coffee and she doesn't drink tea.",
          "She not like coffee and not drink tea.",
          "She don't like coffee and she don't drink tea.",
        ],
        correctIndex: 1,
        hint: "doesn't + глагол без -s, для she",
        explanation: "<b>She doesn't like coffee and she doesn't drink tea.</b> — оба глагола без -s после doesn't.",
      },
      {
        type: 'input',
        question: '✏️ Переведи весь абзац:\n«Моя сестра не работает по выходным. Она обычно читает книги дома.»',
        answerKey: ["my sister doesn't work on weekends. she usually reads books at home.", "my sister does not work on weekends. she usually reads books at home."],
        hint: "doesn't work / usually reads",
        explanation: "<b>My sister doesn't work on weekends. She usually reads books at home.</b>",
      },
      {
        type: 'free',
        question: '🗣 Финальный рассказ недели!\nОпиши себя, свою семью и типичный день — 6-8 предложений.',
        exampleAnswer: "Hi! I'm Alex. I'm 28. I'm from Moscow. I work as a teacher. I usually wake up at 7. I love reading and travelling. I can speak English and Russian. My family is great!",
        tip: 'Используй I\'m / I work / I usually / I love / I can',
      },
    ],
  },
  {
    day: 23,
    title: 'Планы на будущее: going to',
    objective: 'Говорить о намерениях и планах',
    pdfFile: 'assets/lessons/day23.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Be going to',
        text:
          '<b>Going to</b> = собираться что-то сделать\n\n' +
          'Формула: <b>am/is/are + going to + глагол</b>\n\n' +
          '• I\'m going to...\n• She\'s going to...\n• We\'re going to...\n\n' +
          'Отрицание: I\'m <b>not</b> going to...\n' +
          'Вопрос: <b>Are</b> you going to...?',
        examples: [
          { english: "I'm going to travel next summer.", russian: 'Я собираюсь путешествовать следующим летом.' },
          { english: "She's going to learn to drive.", russian: 'Она собирается научиться водить.' },
          { english: 'Are you going to call him?', russian: 'Ты собираешься ему позвонить?' },
        ],
        audioFile: 'assets/audio/day23_going_to.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Выбери правильный вариант:\n«He ___ going to study tonight.»',
        audioFile: 'assets/audio/day23_q1.mp4',
        options: ["am", "is", "are", "be"],
        correctIndex: 1,
        hint: 'He → is/am/are?',
        explanation: "<b>He is going to study tonight.</b> — He → is.",
      },
      {
        type: 'input',
        question: '✏️ Переведи: «Я собираюсь выучить английский.»',
        answerKey: ["i'm going to learn english", 'i am going to learn english'],
        hint: "I'm going to + learn",
        explanation: "<b>I'm going to learn English.</b>",
      },
      {
        type: 'free',
        question: '🗣 Расскажи о своих планах!\nЧто ты собираешься сделать на этой неделе / в этом году?',
        exampleAnswer: "I'm going to finish this course. I'm going to practise English every day. I'm not going to give up!",
        tip: "I'm going to... / I'm not going to...",
      },
    ],
  },
  {
    day: 24,
    title: 'Прошедшее время: was / were',
    objective: 'Говорить о прошлом с was и were',
    pdfFile: 'assets/lessons/day24.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Was и Were',
        text:
          'Прошедшее время глагола to be:\n\n' +
          '• I / He / She / It → <b>was</b>\n' +
          '• You / We / They → <b>were</b>\n\n' +
          'Отрицание: <b>wasn\'t</b> / <b>weren\'t</b>\n' +
          'Вопрос: <b>Was</b> he...? / <b>Were</b> you...?',
        examples: [
          { english: 'I was at home yesterday.', russian: 'Я был(а) дома вчера.' },
          { english: 'They were happy.', russian: 'Они были счастливы.' },
          { english: "She wasn't at work.", russian: 'Её не было на работе.' },
          { english: 'Were you tired?', russian: 'Ты устал(а)?' },
        ],
        audioFile: 'assets/audio/day24_past_be.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Выбери: was или were?\n«We ___ at the cinema yesterday.»',
        audioFile: 'assets/audio/day24_q1.mp4',
        options: ['was', 'were', 'is', 'are'],
        correctIndex: 1,
        hint: 'We → was или were?',
        explanation: '<b>We were at the cinema.</b> — We → were.',
      },
      {
        type: 'input',
        question: '✏️ Сделай отрицание:\n«She was tired.» → «She ___ tired.»',
        answerKey: ["wasn't", "was not", "she wasn't tired", "she was not tired"],
        hint: "was → wasn't",
        explanation: "<b>She wasn't tired.</b> = She was not tired.",
      },
    ],
  },
  {
    day: 25,
    title: 'Past Simple: правильные глаголы',
    objective: 'Говорить о прошлых действиях',
    pdfFile: 'assets/lessons/day25.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Past Simple: правило',
        text:
          '<b>Правильные глаголы + ed:</b>\n' +
          '• work → <b>worked</b>\n' +
          '• play → <b>played</b>\n' +
          '• watch → <b>watched</b>\n' +
          '• start → <b>started</b>\n\n' +
          '<b>Отрицание:</b> didn\'t + глагол (без -ed!)\n' +
          '<b>Вопрос:</b> Did + подлежащее + глагол?\n\n' +
          '⚠️ После didn\'t и Did глагол в начальной форме!',
        examples: [
          { english: 'I worked yesterday.', russian: 'Я работал(а) вчера.' },
          { english: "She didn't watch TV.", russian: 'Она не смотрела телевизор.' },
          { english: 'Did you sleep well?', russian: 'Ты хорошо спал(а)?' },
        ],
        audioFile: 'assets/audio/day25_past_simple.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Выбери правильную форму:\n«They ___ football last week.»',
        audioFile: 'assets/audio/day25_q1.mp4',
        options: ['play', 'plays', 'played', 'are playing'],
        correctIndex: 2,
        hint: 'last week = в прошлом → нужна прошедшая форма',
        explanation: '<b>They played football last week.</b> — play + ed = played.',
      },
      {
        type: 'input',
        question: '✏️ Сделай отрицание:\n«I worked on Sunday.» → «I ___ on Sunday.»',
        answerKey: ["didn't work", "i didn't work on sunday", "did not work", "i did not work on sunday"],
        hint: "didn't + глагол без -ed",
        explanation: "<b>I didn't work on Sunday.</b> — didn't + work (не worked!).",
      },
      {
        type: 'free',
        question: '🗣 Расскажи что ты делал(а) вчера!\n4-5 предложений в Past Simple.',
        exampleAnswer: "Yesterday I woke up at 8. I had breakfast. I worked from 9 to 6. In the evening I watched TV. I didn't go out.",
        tip: 'woke up, had, worked, watched, didn\'t...',
      },
    ],
  },
  {
    day: 26,
    title: 'Вопросительные слова',
    objective: 'Строить вопросы с What, Where, When, Why, How',
    pdfFile: 'assets/lessons/day26.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Вопросительные слова',
        text:
          '• <b>What</b> — что / какой\n' +
          '• <b>Who</b> — кто\n' +
          '• <b>Where</b> — где / куда\n' +
          '• <b>When</b> — когда\n' +
          '• <b>Why</b> — почему\n' +
          '• <b>How</b> — как\n' +
          '• <b>How much</b> — сколько (стоит)\n' +
          '• <b>How many</b> — сколько (штук)\n\n' +
          'Формула: <b>Вопр. слово + вспом. глагол + подлеж. + глагол?</b>',
        examples: [
          { english: 'What do you do?', russian: 'Кем ты работаешь?' },
          { english: 'Where does she live?', russian: 'Где она живёт?' },
          { english: 'How many brothers do you have?', russian: 'Сколько у тебя братьев?' },
        ],
        audioFile: 'assets/audio/day26_questions.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Выбери правильный вопрос:\n«___ does she live?» (Где она живёт?)',
        audioFile: 'assets/audio/day26_q1.mp4',
        options: ['What', 'When', 'Where', 'Why'],
        correctIndex: 2,
        hint: 'Нас интересует место',
        explanation: '<b>Where does she live?</b> — Where = где.',
      },
      {
        type: 'input',
        question: '✏️ Составь вопрос:\n«She lives in Paris.» → «Where ___ she ___?»',
        answerKey: ['where does she live?', 'where does she live'],
        hint: 'Where + does + she + глагол без -s',
        explanation: '<b>Where does she live?</b> — does выносится, глагол без -s.',
      },
      {
        type: 'choice',
        question: 'Как спросить «Сколько у тебя братьев?»',
        options: ['How much brothers do you have?', 'How many brothers do you have?', 'How brothers have you?', 'What brothers do you have?'],
        correctIndex: 1,
        hint: 'Братьев можно посчитать — how much или how many?',
        explanation: '<b>How many brothers do you have?</b> — How many = для счётных существительных.',
      },
    ],
  },
  {
    day: 27,
    title: 'Рассказ о себе',
    objective: 'Свободно отвечать на типичные вопросы о себе',
    pdfFile: 'assets/lessons/day27.pdf',
    estimatedMinutes: 25,
    steps: [
      {
        type: 'explain',
        title: '📖 Типичные вопросы на знакомстве',
        text:
          '• What\'s your name? — Как тебя зовут?\n' +
          '• Where are you from? — Откуда ты?\n' +
          '• What do you do? — Кем ты работаешь?\n' +
          '• Do you have a family? — Есть ли у тебя семья?\n' +
          '• What do you like? — Что тебе нравится?\n' +
          '• What are your hobbies? — Какие у тебя хобби?\n\n' +
          '<b>Профессии:</b> teacher, doctor, engineer, designer, manager, student',
        examples: [
          { english: 'My name is Olga. I\'m from Russia.', russian: 'Меня зовут Ольга. Я из России.' },
          { english: 'I work as a designer.', russian: 'Я работаю дизайнером.' },
          { english: 'I love travelling and reading.', russian: 'Я люблю путешествовать и читать.' },
        ],
        audioFile: 'assets/audio/day27_about_me.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Как сказать «Я работаю учителем»?',
        audioFile: 'assets/audio/day27_q1.mp4',
        options: ['I am work as teacher', 'I work as a teacher', 'I working like teacher', 'I do teacher'],
        correctIndex: 1,
        hint: 'work as a + профессия',
        explanation: '<b>I work as a teacher.</b> — «работать кем-то» = work as a ...',
      },
      {
        type: 'free',
        question: '🗣 Расскажи о себе всё что знаешь!\nОтветь на все 6 вопросов выше в одном тексте.',
        exampleAnswer: "My name is Alex. I'm from Moscow, Russia. I work as an engineer. I have a wife and one child. I love football and travelling. My hobbies are reading and cooking.",
        tip: 'name / from / work / family / like / hobbies',
      },
    ],
  },
  {
    day: 28,
    title: 'Типичные ошибки',
    objective: 'Распознавать и исправлять частые ошибки',
    pdfFile: 'assets/lessons/day28.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Топ-5 ошибок русскоязычных',
        text:
          '<b>1. Возраст:</b>\n' +
          '❌ I have 25 years. → ✅ <b>I am 25 years old.</b>\n\n' +
          '<b>2. He/She без -s:</b>\n' +
          '❌ She go to work. → ✅ <b>She goes to work.</b>\n\n' +
          '<b>3. She с don\'t:</b>\n' +
          '❌ She don\'t like it. → ✅ <b>She doesn\'t like it.</b>\n\n' +
          '<b>4. Согласие:</b>\n' +
          '❌ I am not agree. → ✅ <b>I disagree.</b> / <b>I don\'t agree.</b>\n\n' +
          '<b>5. How many time:</b>\n' +
          '❌ How many time? → ✅ <b>How much time?</b>',
      },
      {
        type: 'choice',
        question: '🎧 Исправь ошибку:\n«He don\'t work here.»',
        audioFile: 'assets/audio/day28_q1.mp4',
        options: [
          "He don't work here",
          "He doesn't works here",
          "He doesn't work here",
          "He isn't work here",
        ],
        correctIndex: 2,
        hint: "He → doesn't, глагол без -s",
        explanation: "<b>He doesn't work here.</b> — He требует doesn't, не don't.",
      },
      {
        type: 'input',
        question: '✏️ Исправь предложение:\n«I have 30 years old.»',
        answerKey: ['i am 30 years old', "i'm 30 years old", 'i am 30', "i'm", 'i am'],
        matchMode: 'startsWith' as const,
        hint: 'Возраст — через am/is/are, не have',
        explanation: '<b>I am 30 years old.</b> — в английском возраст выражается через to be, не have.',
      },
      {
        type: 'choice',
        question: 'Как правильно сказать «Сколько времени?»',
        options: ['How many time?', 'How much time?', 'How time?', 'What time many?'],
        correctIndex: 1,
        hint: 'Время — счётное или несчётное?',
        explanation: '<b>How much time?</b> — время (time) несчётное, поэтому how much.',
      },
    ],
  },
  {
    day: 29,
    title: 'Ключевая лексика курса',
    objective: 'Повторить самые важные слова и фразы',
    pdfFile: 'assets/lessons/day29.pdf',
    estimatedMinutes: 20,
    steps: [
      {
        type: 'explain',
        title: '📖 Топ фразы вежливости',
        text:
          '<b>Вежливость:</b>\n' +
          '• please — пожалуйста\n' +
          '• thank you / thanks — спасибо\n' +
          '• you\'re welcome — пожалуйста (ответ)\n' +
          '• sorry — извините / прости\n' +
          '• excuse me — простите (привлечь внимание)\n\n' +
          '<b>Полезные выражения:</b>\n' +
          '• of course — конечно\n' +
          '• no problem — нет проблем\n' +
          '• I see — понятно\n' +
          '• I mean — я имею в виду\n' +
          '• actually — на самом деле',
        examples: [
          { english: "Sorry, I don't understand. Can you repeat?", russian: 'Простите, я не понимаю. Можете повторить?' },
          { english: 'Of course! No problem.', russian: 'Конечно! Нет проблем.' },
          { english: "Actually, I'm from Moscow.", russian: 'На самом деле, я из Москвы.' },
        ],
        audioFile: 'assets/audio/day29_vocabulary.mp4',
      },
      {
        type: 'choice',
        question: '🎧 Что ответить на «Thank you so much!»?',
        audioFile: 'assets/audio/day29_q1.mp4',
        options: ['Sorry!', 'Please!', "You're welcome!", 'Excuse me!'],
        correctIndex: 2,
        hint: 'Это ответ на благодарность',
        explanation: "<b>You're welcome!</b> — стандартный ответ на «спасибо». Также: No problem! / Of course!",
      },
      {
        type: 'input',
        question: '✏️ Переведи:\n«Простите, я не понимаю. Можете повторить медленнее?»',
        answerKey: ["sorry, i don't understand. can you repeat slower?", "excuse me, i don't understand. can you speak slower?", "sorry, i don't understand. could you repeat more slowly?"],
        hint: "Sorry/Excuse me, I don't understand. Can you repeat / speak slower?",
        explanation: "<b>Sorry, I don't understand. Can you repeat slower?</b>",
      },
    ],
  },
  {
    day: 30,
    title: '🎓 Финальный день: итоги курса',
    objective: 'Финальный тест и подведение итогов',
    pdfFile: 'assets/lessons/day30.pdf',
    estimatedMinutes: 30,
    steps: [
      {
        type: 'explain',
        title: '🎉 Поздравляем! Ты дошёл(дошла) до финала!',
        text:
          'За 30 дней ты изучил(а):\n\n' +
          '✅ Глагол to be (am/is/are/was/were)\n' +
          '✅ Личные местоимения\n' +
          '✅ Present Simple (утвердит. / отриц. / вопрос)\n' +
          '✅ Модальный глагол can\n' +
          '✅ Going to (планы)\n' +
          '✅ Past Simple (правильные глаголы)\n' +
          '✅ Частотные наречия\n' +
          '✅ Бытовые ситуации: кафе, покупки, дорога\n' +
          '✅ Семья и описание людей\n' +
          '✅ 200+ слов и выражений\n\n' +
          'Финальный тест из 4 заданий 👇',
      },
      {
        type: 'choice',
        question: '1. Выбери правильное предложение:',
        options: [
          "She don't usually go to work by bus.",
          "She doesn't usually goes to work by bus.",
          "She doesn't usually go to work by bus.",
          "She isn't usually go to work by bus.",
        ],
        correctIndex: 2,
        hint: "doesn't + глагол без -s",
        explanation: "<b>She doesn't usually go to work by bus.</b>",
      },
      {
        type: 'input',
        question: '2. Переведи на английский:\n«Вчера я работал(а) допоздна. Я не смотрел(а) телевизор.»',
        answerKey: ["yesterday i worked late. i didn't watch tv.", "i worked late yesterday. i didn't watch television."],
        hint: "worked (прош. вр.) / didn't watch",
        explanation: "<b>Yesterday I worked late. I didn't watch TV.</b>",
      },
      {
        type: 'choice',
        question: '3. Как правильно спросить возраст?',
        options: ['How many years have you?', 'How old are you?', 'What is your years?', 'How much old are you?'],
        correctIndex: 1,
        hint: 'Самая простая и правильная форма',
        explanation: "<b>How old are you?</b> — единственно правильный вариант.",
      },
      {
        type: 'free',
        question: '4. 🏆 Финальное задание!\n\nНапиши письмо новому другу по переписке на английском:\n• Кто ты\n• Откуда ты\n• Что делаешь\n• Что любишь\n• Планы на будущее\n\n(минимум 7 предложений)',
        exampleAnswer: "Hi! My name is Anna. I'm 25 years old. I'm from Moscow, Russia. I work as a teacher. I love reading books and travelling. I sometimes go to the cinema. I can speak Russian and English. I'm going to visit London next year. Nice to meet you!",
        tip: 'Используй всё что выучил(а) за 30 дней!',
      },
    ],
  },
];

// ─── Утилиты ─────────────────────────────────────────────────────────────────

export function getLessonByDay(day: number): Lesson | undefined {
  return LESSONS.find((l) => l.day === day);
}

export function getTotalSteps(day: number): number {
  return getLessonByDay(day)?.steps.length ?? 0;
}

export function getStep(day: number, stepIndex: number): LessonStep | undefined {
  return getLessonByDay(day)?.steps[stepIndex];
}
