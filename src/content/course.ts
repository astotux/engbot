export interface Example {
  english: string;
  russian: string;
}

export interface Lesson {
  day: number;
  title: string;
  objective: string;
  explanation: string;
  examples: Example[];
  exercise: string;
  answerKey: string[];
  hint: string;
  review: string;
  estimatedMinutes: number;
}

export const LESSONS: Lesson[] = [
  {
    day: 1,
    title: 'Привет! Знакомство и приветствия',
    objective: 'Научиться здороваться и представляться по-английски.',
    explanation:
      'В английском есть несколько способов поздороваться. "Hello" — нейтральное приветствие, "Hi" — дружеское. Чтобы сказать как дела — "How are you?", а ответить можно: "Fine, thank you."',
    examples: [
      { english: 'Hello! My name is Anna.', russian: 'Привет! Меня зовут Анна.' },
      { english: 'Hi! I am from Russia.', russian: 'Привет! Я из России.' },
      { english: 'Nice to meet you!', russian: 'Приятно познакомиться!' },
      { english: 'How are you? — Fine, thank you.', russian: 'Как дела? — Хорошо, спасибо.' },
    ],
    exercise:
      'Переведи на английский: "Привет! Меня зовут [твоё имя]. Я из России. Приятно познакомиться!"',
    answerKey: ['Hello! My name is', 'I am from Russia', 'Nice to meet you'],
    hint: 'Используй: Hello / Hi, My name is..., I am from Russia, Nice to meet you!',
    review:
      'Сегодня мы выучили: Hello, Hi, My name is..., I am from..., Nice to meet you, How are you?, Fine thank you.',
    estimatedMinutes: 15,
  },
  {
    day: 2,
    title: 'Местоимения: я, ты, он, она',
    objective: 'Освоить личные местоимения в английском.',
    explanation:
      'Личные местоимения: I (я), You (ты/вы), He (он), She (она), It (оно), We (мы), They (они). В английском ВСЕГДА нужно использовать местоимение — нельзя сказать "Говорит" без "He/She".',
    examples: [
      { english: 'I am a student.', russian: 'Я студент.' },
      { english: 'She is a teacher.', russian: 'Она учитель.' },
      { english: 'They are friends.', russian: 'Они друзья.' },
      { english: 'It is a cat.', russian: 'Это кошка.' },
    ],
    exercise: 'Выбери правильное местоимение: ___ is my friend. (Он) → He / She / It / They',
    answerKey: ['He'],
    hint: 'He = он, She = она, It = предмет/животное, They = они',
    review: 'I, You, He, She, It, We, They — запомни все 7 местоимений.',
    estimatedMinutes: 15,
  },
  {
    day: 3,
    title: 'Глагол to be: am, is, are',
    objective: 'Научиться строить утверждения с глаголом "быть".',
    explanation:
      '"To be" (быть) — самый важный глагол. Формы: I am, You are, He/She/It is, We are, They are. Сокращения: I\'m, You\'re, He\'s, She\'s, It\'s, We\'re, They\'re.',
    examples: [
      { english: 'I am happy.', russian: 'Я счастлив(а).' },
      { english: 'He is a doctor.', russian: 'Он врач.' },
      { english: 'We are students.', russian: 'Мы студенты.' },
      { english: 'She\'s from Moscow.', russian: 'Она из Москвы.' },
    ],
    exercise: 'Вставь правильную форму: She ___ a teacher. We ___ friends.',
    answerKey: ['is', 'are'],
    hint: 'She → is, We → are',
    review: 'I am / You are / He is / She is / It is / We are / They are',
    estimatedMinutes: 20,
  },
  {
    day: 4,
    title: 'Отрицания: am not, is not, are not',
    objective: 'Научиться строить отрицательные предложения.',
    explanation:
      'Чтобы отрицать, добавь "not" после am/is/are. Сокращения: isn\'t (is not), aren\'t (are not). "Am not" не сокращается в стандартном английском.',
    examples: [
      { english: 'I am not tired.', russian: 'Я не устал(а).' },
      { english: 'He isn\'t a student.', russian: 'Он не студент.' },
      { english: 'They aren\'t from here.', russian: 'Они не отсюда.' },
      { english: 'It\'s not a problem.', russian: 'Это не проблема.' },
    ],
    exercise: 'Сделай отрицание: "She is happy." → She ___ ___ happy.',
    answerKey: ["She isn't happy", "She is not happy"],
    hint: 'is + not = isn\'t',
    review: 'am not / isn\'t (is not) / aren\'t (are not)',
    estimatedMinutes: 15,
  },
  {
    day: 5,
    title: 'Вопросы с to be',
    objective: 'Научиться задавать общие вопросы и отвечать на них.',
    explanation:
      'Чтобы задать вопрос с am/is/are, просто поставь их в начало предложения. Is he a student? → Yes, he is. / No, he isn\'t. Are you ready? → Yes, I am. / No, I\'m not.',
    examples: [
      { english: 'Are you a student?', russian: 'Ты студент?' },
      { english: 'Is she from Moscow?', russian: 'Она из Москвы?' },
      { english: 'Yes, I am.', russian: 'Да, я (являюсь).' },
      { english: 'No, she isn\'t.', russian: 'Нет, она не (является).' },
    ],
    exercise: 'Составь вопрос: "He is tired." → ___ he tired?',
    answerKey: ['Is he tired?', 'Is he tired'],
    hint: 'Поставь is/are/am в начало предложения.',
    review: 'Am I...? / Is he/she/it...? / Are you/we/they...?',
    estimatedMinutes: 20,
  },
  {
    day: 6,
    title: 'Числа и возраст',
    objective: 'Научиться называть числа от 1 до 100 и говорить о возрасте.',
    explanation:
      'Числа 1–20 нужно запомнить. Дальше: twenty-one (21), thirty (30), forty (40) и т.д. Возраст: "I am 25 years old." или просто "I am 25."',
    examples: [
      { english: 'I am twenty-five years old.', russian: 'Мне двадцать пять лет.' },
      { english: 'She is thirty.', russian: 'Ей тридцать.' },
      { english: 'How old are you?', russian: 'Сколько тебе лет?' },
      { english: 'My brother is twelve years old.', russian: 'Моему брату двенадцать лет.' },
    ],
    exercise: 'Напиши по-английски: "Мне 28 лет."',
    answerKey: ['I am 28 years old', 'I am twenty-eight years old', 'I\'m 28 years old'],
    hint: 'I am + число + years old.',
    review: 'one, two, three... ten, eleven, twelve, thirteen... twenty, thirty, forty, fifty.',
    estimatedMinutes: 20,
  },
  {
    day: 7,
    title: 'Мини-тест: дни 1–6',
    objective: 'Закрепить знания первых шести дней.',
    explanation:
      'Сегодня — повторение. Проверим, как ты усвоил(а) приветствия, местоимения, глагол to be и числа. Отвечай как можешь — это обучающий тест, ошибаться нормально.',
    examples: [
      { english: 'Hello! Nice to meet you.', russian: 'Привет! Приятно познакомиться.' },
      { english: 'She is twenty years old.', russian: 'Ей двадцать лет.' },
      { english: 'We aren\'t tired.', russian: 'Мы не устали.' },
    ],
    exercise:
      'Переведи: "Привет! Меня зовут Миша. Мне 20 лет. Я студент. Я не из Москвы."',
    answerKey: [
      'Hello! My name is Misha',
      'I am 20 years old',
      'I am a student',
      "I'm not from Moscow",
      'I am not from Moscow',
    ],
    hint: 'Используй: Hello, My name is, I am ... years old, I am a student, I am not from...',
    review:
      'Итог недели: приветствия, местоимения (I/You/He/She/It/We/They), глагол to be (am/is/are), отрицания (not), вопросы, числа и возраст.',
    estimatedMinutes: 25,
  },
  {
    day: 8,
    title: 'Present Simple: основы',
    objective: 'Понять структуру настоящего простого времени.',
    explanation:
      'Present Simple описывает регулярные действия. Формула: I/You/We/They + глагол, He/She/It + глагол + s/es. Например: I work, He works. Это время для привычек и фактов.',
    examples: [
      { english: 'I work every day.', russian: 'Я работаю каждый день.' },
      { english: 'She works at a school.', russian: 'Она работает в школе.' },
      { english: 'They live in Moscow.', russian: 'Они живут в Москве.' },
      { english: 'He reads books.', russian: 'Он читает книги.' },
    ],
    exercise: 'Поставь глагол в правильную форму: She ___ (read) every evening.',
    answerKey: ['reads'],
    hint: 'She → добавь -s к глаголу.',
    review: 'I work / He works / She plays / They play — для he/she/it всегда +s.',
    estimatedMinutes: 20,
  },
  {
    day: 9,
    title: 'Повседневные действия',
    objective: 'Выучить глаголы повседневной жизни.',
    explanation:
      'Полезные глаголы: wake up (просыпаться), eat (есть), go (идти), work (работать), sleep (спать), watch (смотреть), read (читать), cook (готовить), listen (слушать), walk (ходить).',
    examples: [
      { english: 'I wake up at 7 a.m.', russian: 'Я просыпаюсь в 7 утра.' },
      { english: 'She eats breakfast at home.', russian: 'Она завтракает дома.' },
      { english: 'They watch TV in the evening.', russian: 'Они смотрят телевизор вечером.' },
      { english: 'He walks to work.', russian: 'Он ходит на работу пешком.' },
    ],
    exercise: 'Переведи: "Я читаю книги и слушаю музыку."',
    answerKey: ['I read books and listen to music', 'I read books and I listen to music'],
    hint: 'read = читать, listen to = слушать',
    review:
      'wake up, eat, go, work, sleep, watch, read, cook, listen, walk — запомни эти 10 глаголов.',
    estimatedMinutes: 20,
  },
  {
    day: 10,
    title: 'Do и does: отрицания',
    objective: 'Научиться строить отрицания в Present Simple.',
    explanation:
      'Для отрицания используем don\'t (do not) и doesn\'t (does not). I/You/We/They + don\'t + глагол. He/She/It + doesn\'t + глагол (без s!). Например: She doesn\'t work на выходных.',
    examples: [
      { english: "I don't like coffee.", russian: 'Я не люблю кофе.' },
      { english: "She doesn't work on weekends.", russian: 'Она не работает по выходным.' },
      { english: "They don't live here.", russian: 'Они здесь не живут.' },
      { english: "He doesn't eat meat.", russian: 'Он не ест мясо.' },
    ],
    exercise: "Сделай отрицание: 'He works late.' → He ___ ___ late.",
    answerKey: ["He doesn't work late", "He does not work late"],
    hint: "He/She/It → doesn't (does not) + глагол без -s",
    review: "don't + verb (I/You/We/They) / doesn't + verb (He/She/It)",
    estimatedMinutes: 20,
  },
  {
    day: 11,
    title: 'Вопросы с do и does',
    objective: 'Задавать вопросы в Present Simple.',
    explanation:
      'Для вопросов: Do + I/You/We/They + глагол? Does + He/She/It + глагол? Ответы: Yes, I do. / No, I don\'t. Yes, she does. / No, she doesn\'t.',
    examples: [
      { english: 'Do you like tea?', russian: 'Ты любишь чай?' },
      { english: 'Does he work here?', russian: 'Он работает здесь?' },
      { english: 'Yes, I do.', russian: 'Да (люблю / делаю).' },
      { english: "No, he doesn't.", russian: 'Нет, он не работает.' },
    ],
    exercise: 'Составь вопрос: "She likes music." → ___ she like music?',
    answerKey: ['Does she like music?', 'Does she like music'],
    hint: 'She → Does',
    review: 'Do you...? / Does he...? — Yes, I do / No, I don\'t / Yes, he does / No, he doesn\'t',
    estimatedMinutes: 20,
  },
  {
    day: 12,
    title: 'Частотные наречия',
    objective: 'Выражать, как часто что-то происходит.',
    explanation:
      'Наречия частоты: always (всегда), usually (обычно), often (часто), sometimes (иногда), rarely (редко), never (никогда). Они стоят ПЕРЕД основным глаголом, но ПОСЛЕ am/is/are.',
    examples: [
      { english: 'I always drink coffee in the morning.', russian: 'Я всегда пью кофе утром.' },
      { english: 'She sometimes works late.', russian: 'Она иногда работает допоздна.' },
      { english: 'He is never late.', russian: 'Он никогда не опаздывает.' },
      { english: 'They rarely eat fast food.', russian: 'Они редко едят фастфуд.' },
    ],
    exercise: 'Вставь наречие: I ___ eat breakfast. (всегда)',
    answerKey: ['I always eat breakfast'],
    hint: 'always = всегда, ставь перед глаголом eat',
    review: 'always > usually > often > sometimes > rarely > never',
    estimatedMinutes: 15,
  },
  {
    day: 13,
    title: 'Время и распорядок дня',
    objective: 'Научиться говорить о времени и своём расписании.',
    explanation:
      'Время: What time is it? — It\'s two o\'clock. Для расписания: at + время (at 8 a.m.), in the morning/afternoon/evening, at night. Фразы: I get up, I have breakfast, I go to work.',
    examples: [
      { english: "I get up at 7 a.m.", russian: 'Я встаю в 7 утра.' },
      { english: 'She has lunch at noon.', russian: 'Она обедает в полдень.' },
      { english: 'We go to bed at 11 p.m.', russian: 'Мы ложимся спать в 11 вечера.' },
      { english: 'What time do you start work?', russian: 'В какое время ты начинаешь работать?' },
    ],
    exercise: 'Переведи: "Я обычно завтракаю в 8 утра."',
    answerKey: ['I usually have breakfast at 8 a.m.', 'I usually eat breakfast at 8 a.m.'],
    hint: 'usually + have/eat breakfast + at + время',
    review: 'get up, have breakfast/lunch/dinner, go to work, go to bed — ключевые фразы распорядка дня.',
    estimatedMinutes: 20,
  },
  {
    day: 14,
    title: 'Практический тест: Present Simple',
    objective: 'Закрепить Present Simple, отрицания и вопросы.',
    explanation:
      'Проверочный день. Перед тестом напомним: утвердительные (I work), отрицательные (I don\'t work / She doesn\'t work), вопросы (Do you work? / Does she work?).',
    examples: [
      { english: 'I usually wake up at 7 a.m.', russian: 'Я обычно просыпаюсь в 7 утра.' },
      { english: "He doesn't like mornings.", russian: 'Он не любит утра.' },
      { english: 'Do they live in Moscow?', russian: 'Они живут в Москве?' },
    ],
    exercise:
      'Переведи весь абзац: "Он работает в офисе. Он не работает по выходным. Работает ли он каждый день?"',
    answerKey: [
      'He works in an office',
      "He doesn't work on weekends",
      'Does he work every day?',
    ],
    hint: 'office = офис, on weekends = по выходным, every day = каждый день',
    review: 'Present Simple: утверждение / отрицание / вопрос — три формы, три правила.',
    estimatedMinutes: 25,
  },
  {
    day: 15,
    title: 'Предпочтения: like, love, hate',
    objective: 'Рассказывать о том, что нравится и не нравится.',
    explanation:
      'Глаголы: like (нравится), love (очень нравится/любить), enjoy (получать удовольствие), hate (ненавидеть), don\'t like (не нравится). После них существительное или глагол +ing: I like reading.',
    examples: [
      { english: 'I love coffee.', russian: 'Я обожаю кофе.' },
      { english: 'She likes watching movies.', russian: 'Ей нравится смотреть фильмы.' },
      { english: "He doesn't like mornings.", russian: 'Ему не нравятся утра.' },
      { english: 'They hate traffic jams.', russian: 'Они ненавидят пробки.' },
    ],
    exercise: 'Переведи: "Я люблю читать книги, но не люблю готовить."',
    answerKey: [
      "I love reading books, but I don't like cooking",
      "I like reading books, but I don't like cooking",
    ],
    hint: 'love/like + глагол-ing, don\'t like + глагол-ing',
    review: 'like/love/enjoy/hate + noun или + verb-ing',
    estimatedMinutes: 20,
  },
  {
    day: 16,
    title: 'Модальный глагол can',
    objective: 'Говорить о возможностях и умениях.',
    explanation:
      'Can = мочь, уметь. Форма одинакова для всех: I can, She can, They can. Отрицание: can\'t (cannot). Вопрос: Can you...? Ответ: Yes, I can. / No, I can\'t.',
    examples: [
      { english: 'I can swim.', russian: 'Я умею плавать.' },
      { english: "She can't drive.", russian: 'Она не умеет водить.' },
      { english: 'Can you help me?', russian: 'Ты можешь мне помочь?' },
      { english: 'Yes, I can!', russian: 'Да, конечно!' },
    ],
    exercise: "Составь вопрос: 'She can cook.' → ___ she cook?",
    answerKey: ['Can she cook?', 'Can she cook'],
    hint: 'Can + подлежащее + глагол?',
    review: 'can + verb (без to) / can\'t + verb / Can + subject + verb?',
    estimatedMinutes: 15,
  },
  {
    day: 17,
    title: 'В кафе: еда и напитки',
    objective: 'Научиться заказывать еду и общаться в кафе.',
    explanation:
      'В кафе пригодятся фразы: Can I have...? (Можно мне...?), I\'d like... (Я бы хотел...), What do you recommend? (Что вы рекомендуете?). Еда: coffee, tea, water, juice, sandwich, soup, salad, cake.',
    examples: [
      { english: 'Can I have a coffee, please?', russian: 'Можно мне кофе, пожалуйста?' },
      { english: "I'd like a sandwich.", russian: 'Я бы хотел сэндвич.' },
      { english: 'How much is it?', russian: 'Сколько это стоит?' },
      { english: 'The bill, please.', russian: 'Счёт, пожалуйста.' },
    ],
    exercise: 'Как сказать по-английски: "Можно мне чай с молоком, пожалуйста?"',
    answerKey: ['Can I have tea with milk, please?', 'Can I have a tea with milk, please?'],
    hint: 'Can I have + что + please?',
    review:
      'Can I have...? / I\'d like... / How much is it? / The bill, please — четыре фразы для кафе.',
    estimatedMinutes: 20,
  },
  {
    day: 18,
    title: 'Покупки и цены',
    objective: 'Совершать покупки и обсуждать цены.',
    explanation:
      'На шопинге: How much does it cost? (Сколько это стоит?), It costs 500 rubles. (Стоит 500 рублей.), I\'ll take it. (Я возьму.), Do you have it in...? (Есть ли у вас...?)',
    examples: [
      { english: 'How much does this cost?', russian: 'Сколько это стоит?' },
      { english: "It's 1000 rubles.", russian: 'Это 1000 рублей.' },
      { english: "I'll take the blue one.", russian: 'Я возьму синий.' },
      { english: 'Do you have it in size M?', russian: 'Есть ли это в размере M?' },
    ],
    exercise: 'Переведи: "Сколько стоит эта сумка?"',
    answerKey: ['How much does this bag cost?', 'How much is this bag?'],
    hint: 'How much does... cost? или How much is...?',
    review: 'How much? / It costs... / I\'ll take it. / Do you have...?',
    estimatedMinutes: 20,
  },
  {
    day: 19,
    title: 'Направления и места',
    objective: 'Спросить и объяснить, как добраться.',
    explanation:
      'Полезные фразы: Where is...? (Где находится...?), Turn left/right (Повернуть налево/направо), Go straight (Идите прямо), It\'s near/far (Это близко/далеко), next to (рядом с), opposite (напротив).',
    examples: [
      { english: 'Where is the nearest metro station?', russian: 'Где ближайшее метро?' },
      { english: 'Go straight and turn left.', russian: 'Идите прямо и поверните налево.' },
      { english: "It's next to the park.", russian: 'Это рядом с парком.' },
      { english: "It's about 5 minutes on foot.", russian: 'Это примерно 5 минут пешком.' },
    ],
    exercise: 'Переведи: "Банк находится напротив аптеки."',
    answerKey: ['The bank is opposite the pharmacy.', 'The bank is opposite the drugstore.'],
    hint: 'opposite = напротив, pharmacy/drugstore = аптека',
    review: 'Where is...? / Turn left/right / Go straight / next to / opposite / on foot',
    estimatedMinutes: 20,
  },
  {
    day: 20,
    title: 'Семья и описание людей',
    objective: 'Рассказать о членах семьи и описать людей.',
    explanation:
      'Члены семьи: mother/mom, father/dad, brother, sister, grandmother/grandma, grandfather/grandpa, wife, husband, son, daughter. Описание: tall (высокий), short (низкий), young (молодой), old (старый), kind (добрый).',
    examples: [
      { english: 'My mother is kind and smart.', russian: 'Моя мама добрая и умная.' },
      { english: 'I have one brother and two sisters.', russian: 'У меня есть один брат и две сестры.' },
      { english: 'My father is tall.', russian: 'Мой папа высокий.' },
      { english: 'She is my grandmother.', russian: 'Это моя бабушка.' },
    ],
    exercise: 'Напиши 2 предложения о своей семье по-английски.',
    answerKey: [],
    hint: 'I have a... / My ... is ...',
    review:
      'mother, father, brother, sister, grandmother, grandfather + прилагательные для описания.',
    estimatedMinutes: 20,
  },
  {
    day: 21,
    title: 'Диалоги из жизни',
    objective: 'Практиковать живые бытовые диалоги.',
    explanation:
      'Сегодня применяем всё, что выучили за дни 15–20. Отрабатываем реальные ситуации: в кафе, в магазине, на улице, разговор о семье.',
    examples: [
      { english: 'A: Can I help you? B: Yes, I\'m looking for a jacket.', russian: 'A: Могу помочь? B: Да, я ищу куртку.' },
      { english: 'A: How much is this? B: It\'s 2500 rubles.', russian: 'A: Сколько стоит? B: 2500 рублей.' },
      { english: 'A: Excuse me, where is the bank? B: It\'s on the left.', russian: 'A: Извините, где банк? B: Слева.' },
    ],
    exercise:
      'Составь мини-диалог в кафе: ты хочешь заказать чай и кусок торта. Спроси стоимость.',
    answerKey: [],
    hint: 'Can I have...? / How much is...? / The bill, please.',
    review: 'Повторение дней 15–20: предпочтения, can, кафе, покупки, направления, семья.',
    estimatedMinutes: 25,
  },
  {
    day: 22,
    title: 'Повторение основных конструкций',
    objective: 'Укрепить все изученные грамматические структуры.',
    explanation:
      'Сегодня — полное повторение: глагол to be, Present Simple, отрицания, вопросы, can, частотные наречия. Проверим, как они работают вместе.',
    examples: [
      { english: 'She is a doctor. She works at a hospital.', russian: 'Она врач. Она работает в больнице.' },
      { english: "He can't drive, but he always takes the bus.", russian: 'Он не умеет водить, но всегда ездит на автобусе.' },
      { english: 'Do they like coffee? No, they prefer tea.', russian: 'Они любят кофе? Нет, они предпочитают чай.' },
    ],
    exercise:
      'Переведи: "Моя сестра не работает по выходным. Она обычно читает книги дома."',
    answerKey: [
      "My sister doesn't work on weekends. She usually reads books at home.",
      "My sister does not work on weekends. She usually reads books at home.",
    ],
    hint: 'doesn\'t work on weekends / usually reads books at home',
    review: 'to be / Present Simple / отрицания / вопросы / can / частотные наречия.',
    estimatedMinutes: 25,
  },
  {
    day: 23,
    title: 'Планы на будущее: going to',
    objective: 'Говорить о намерениях и ближайших планах.',
    explanation:
      '"Going to" используется для планов и намерений. Формула: am/is/are + going to + глагол. Например: I\'m going to travel. She\'s going to study English.',
    examples: [
      { english: "I'm going to travel next summer.", russian: 'Я собираюсь путешествовать следующим летом.' },
      { english: "She's going to learn to drive.", russian: 'Она собирается научиться водить.' },
      { english: 'What are you going to do tomorrow?', russian: 'Что ты собираешься делать завтра?' },
      { english: "We're not going to be late.", russian: 'Мы не собираемся опаздывать.' },
    ],
    exercise: "Переведи: 'Я собираюсь выучить английский.'",
    answerKey: ["I'm going to learn English", 'I am going to learn English'],
    hint: "I'm going to + глагол",
    review: "be going to + verb — для намерений и конкретных планов.",
    estimatedMinutes: 20,
  },
  {
    day: 24,
    title: 'Прошедшее время: глагол to be',
    objective: 'Говорить о прошлом с was и were.',
    explanation:
      'В прошедшем времени: I/He/She/It → was, You/We/They → were. Отрицание: wasn\'t / weren\'t. Вопрос: Was he...? Were you...?',
    examples: [
      { english: 'I was at home yesterday.', russian: 'Я был(а) дома вчера.' },
      { english: 'They were happy.', russian: 'Они были счастливы.' },
      { english: "She wasn't at work.", russian: 'Её не было на работе.' },
      { english: 'Were you tired?', russian: 'Ты устал(а)?' },
    ],
    exercise: 'Вставь was или were: He ___ a student. We ___ in Moscow.',
    answerKey: ['was', 'were'],
    hint: 'He → was, We → were',
    review: 'was (I/He/She/It) / were (You/We/They) / wasn\'t / weren\'t / Was...? / Were...?',
    estimatedMinutes: 20,
  },
  {
    day: 25,
    title: 'Прошедшее время: правильные глаголы',
    objective: 'Образовывать прошедшее время правильных глаголов.',
    explanation:
      'Past Simple правильных глаголов: глагол + ed. Worked, played, watched, started, walked. Отрицание: didn\'t + глагол (без -ed). Вопрос: Did + подлежащее + глагол?',
    examples: [
      { english: 'I worked yesterday.', russian: 'Я работал(а) вчера.' },
      { english: "She didn't watch TV.", russian: 'Она не смотрела телевизор.' },
      { english: 'Did you sleep well?', russian: 'Ты хорошо спал(а)?' },
      { english: 'They played football last week.', russian: 'Они играли в футбол на прошлой неделе.' },
    ],
    exercise: "Сделай отрицание: 'I worked on Sunday.' → I ___ work on Sunday.",
    answerKey: ["I didn't work on Sunday", 'I did not work on Sunday'],
    hint: "didn't + глагол без -ed",
    review: "verb + ed (утверждение) / didn't + verb (отрицание) / Did + subject + verb? (вопрос)",
    estimatedMinutes: 20,
  },
  {
    day: 26,
    title: 'Составление вопросов',
    objective: 'Строить вопросы с вопросительными словами.',
    explanation:
      'Вопросительные слова: What (что), Who (кто), Where (где), When (когда), Why (почему), How (как), How much/many (сколько). Формула: вопросительное слово + вспомогательный глагол + подлежащее + глагол.',
    examples: [
      { english: 'What do you do?', russian: 'Кем ты работаешь? / Что ты делаешь?' },
      { english: 'Where does she live?', russian: 'Где она живёт?' },
      { english: 'Why did he leave?', russian: 'Почему он ушёл?' },
      { english: 'How many brothers do you have?', russian: 'Сколько у тебя братьев?' },
    ],
    exercise: 'Составь вопрос: "She lives in Paris." → Where ___ she ___?',
    answerKey: ['Where does she live?', 'Where does she live'],
    hint: 'Where + does + she + live (без -s)',
    review: 'What / Who / Where / When / Why / How / How much / How many + вспомогательный глагол',
    estimatedMinutes: 20,
  },
  {
    day: 27,
    title: 'Диалоги и рассказ о себе',
    objective: 'Свободно рассказать о себе и ответить на типичные вопросы.',
    explanation:
      'Типичные вопросы на знакомстве: What\'s your name? Where are you from? What do you do? Do you have a family? What do you like? Практикуем полные ответы.',
    examples: [
      { english: 'My name is Olga. I\'m from Russia.', russian: 'Меня зовут Ольга. Я из России.' },
      { english: 'I work as a designer.', russian: 'Я работаю дизайнером.' },
      { english: 'I have a husband and two kids.', russian: 'У меня муж и двое детей.' },
      { english: 'I love travelling and reading.', russian: 'Я люблю путешествовать и читать.' },
    ],
    exercise: 'Напиши 4–5 предложений о себе по-английски.',
    answerKey: [],
    hint: 'My name is... I am from... I work as... I have... I like/love...',
    review: 'name / from / work / family / hobbies — пять базовых тем для рассказа о себе.',
    estimatedMinutes: 25,
  },
  {
    day: 28,
    title: 'Типичные ошибки',
    objective: 'Распознавать и избегать частых ошибок.',
    explanation:
      'Самые частые ошибки: 1) She go (нужно She goes), 2) I am not agree (нужно I don\'t agree / I disagree), 3) I have 30 years (нужно I am 30), 4) How many time? (нужно How much time?), 5) She don\'t (нужно She doesn\'t).',
    examples: [
      { english: 'Неверно: She go to work. → Верно: She goes to work.', russian: 'Для he/she/it нужно +s' },
      { english: 'Неверно: I have 25 years. → Верно: I am 25 years old.', russian: 'Возраст — через to be' },
      { english: "Неверно: She don't like. → Верно: She doesn't like.", russian: 'She → doesn\'t' },
    ],
    exercise: 'Исправь ошибку: "He don\'t work here."',
    answerKey: ["He doesn't work here"],
    hint: "He → doesn't (not don't)",
    review:
      'he/she/it → +s или does/doesn\'t | возраст → I am | времени → How much time | согласие → I agree/disagree',
    estimatedMinutes: 20,
  },
  {
    day: 29,
    title: 'Повторение ключевой лексики',
    objective: 'Закрепить самые важные слова и фразы курса.',
    explanation:
      'Повторяем топ-50 самых полезных слов: числа, глаголы действия, прилагательные, слова для вопросов, фразы вежливости. Это слова, которые нужны в 90% бытовых ситуаций.',
    examples: [
      { english: 'please, thank you, sorry, excuse me', russian: 'пожалуйста, спасибо, извините, простите' },
      { english: 'yes, no, ok, maybe, of course', russian: 'да, нет, ок, может быть, конечно' },
      { english: 'good, bad, big, small, new, old', russian: 'хорошо, плохо, большой, маленький, новый, старый' },
      { english: 'now, today, tomorrow, yesterday', russian: 'сейчас, сегодня, завтра, вчера' },
    ],
    exercise:
      'Переведи: "Извините, я не понимаю. Можете повторить, пожалуйста?"',
    answerKey: [
      "Sorry, I don't understand. Can you repeat that, please?",
      "Excuse me, I don't understand. Can you say it again, please?",
    ],
    hint: 'Sorry/Excuse me, I don\'t understand. Can you repeat/say that again, please?',
    review:
      'please / thank you / sorry / excuse me / yes / no / of course — самые важные вежливые слова.',
    estimatedMinutes: 20,
  },
  {
    day: 30,
    title: 'Финальный тест и итоги курса',
    objective: 'Проверить знания за весь курс и подвести итоги.',
    explanation:
      'Финальный день! Пройдём мини-тест по всем темам курса. Отвечай честно — это для твоего прогресса, а не для оценки. После теста ты получишь сводку своих достижений.',
    examples: [
      { english: "I've completed 30 days of learning English!", russian: 'Я завершил(а) 30 дней изучения английского!' },
      { english: 'Practice makes perfect.', russian: 'Практика делает совершенным.' },
      { english: "Every journey begins with a single step.", russian: 'Каждое путешествие начинается с первого шага.' },
    ],
    exercise:
      'Напиши по-английски: "За 30 дней я выучил(а) приветствия, настоящее время, как спрашивать дорогу и заказывать еду. Я продолжу учить английский."',
    answerKey: [],
    hint:
      'In 30 days I learned greetings, Present Simple, how to ask for directions and order food. I will continue learning English.',
    review:
      'Поздравляем с завершением курса! Ты освоил(а) базовые конструкции английского языка: приветствия, времена, вопросы, бытовые ситуации. Это отличная основа для продолжения.',
    estimatedMinutes: 30,
  },
];

export function getLessonByDay(day: number): Lesson | undefined {
  return LESSONS.find((l) => l.day === day);
}
