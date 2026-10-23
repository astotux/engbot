/**
 * Контент для мини-игр:
 * 1) Конструктор фраз (Собери предложение из слов)
 * 2) Тренажёр диалогов (Симулятор реальной жизни 💬)
 */

export interface PhraseBuilderItem {
  id: number;
  russianPrompt: string;
  words: string[]; // правильный порядок слов
  hint: string;
  level: 'A1' | 'A2' | 'B1';
}

export interface DialogueTurn {
  speakerName: string;
  speakerLineEn: string;
  speakerLineRu: string;
  options: Array<{
    textEn: string;
    textRu: string;
    isCorrect: boolean;
    feedback: string;
  }>;
}

export interface DialogueScenario {
  id: string;
  title: string;
  emoji: string;
  description: string;
  turns: DialogueTurn[];
}

export const PHRASE_BUILDER_ITEMS: PhraseBuilderItem[] = [
  // ─── A1: Базовые повседневные фразы ──────────────────────────────────────────
  {
    id: 1,
    russianPrompt: 'Я хотел бы чашку кофе, пожалуйста.',
    words: ['I', 'would', 'like', 'a', 'cup', 'of', 'coffee', 'please'],
    hint: 'Начни с «I would like...» (Я хотел бы...)',
    level: 'A1',
  },
  {
    id: 2,
    russianPrompt: 'Где находится ближайшая станция метро?',
    words: ['Where', 'is', 'the', 'nearest', 'subway', 'station'],
    hint: 'Вопрос начинается с вопросительного слова «Where is...»',
    level: 'A1',
  },
  {
    id: 3,
    russianPrompt: 'Сколько стоит этот билет?',
    words: ['How', 'much', 'does', 'this', 'ticket', 'cost'],
    hint: 'Используй конструкцию «How much does ... cost»',
    level: 'A1',
  },
  {
    id: 4,
    russianPrompt: 'Я учу английский язык каждый день.',
    words: ['I', 'study', 'English', 'every', 'day'],
    hint: 'Подлежащее + сказуемое + дополнение + обстоятельство времени',
    level: 'A1',
  },
  {
    id: 5,
    russianPrompt: 'Могу я оплатить это банковской картой?',
    words: ['Can', 'I', 'pay', 'for', 'this', 'by', 'credit', 'card'],
    hint: 'Вопрос о возможности: «Can I pay...»',
    level: 'A1',
  },
  {
    id: 6,
    russianPrompt: 'У меня есть бронь на сегодняшнюю ночь.',
    words: ['I', 'have', 'a', 'reservation', 'for', 'tonight'],
    hint: 'Начни с «I have a reservation...»',
    level: 'A1',
  },
  {
    id: 7,
    russianPrompt: 'Могу я примерить эту куртку в примерочной?',
    words: ['Can', 'I', 'try', 'this', 'jacket', 'on'],
    hint: 'Фразовый глагол «примерить» — «try ... on»',
    level: 'A1',
  },
  {
    id: 8,
    russianPrompt: 'Не могли бы вы говорить немного помедленнее?',
    words: ['Could', 'you', 'speak', 'a', 'little', 'slower', 'please'],
    hint: 'Вежливая просьба: «Could you speak...»',
    level: 'A1',
  },
  {
    id: 9,
    russianPrompt: 'Какой здесь пароль от беспроводного интернета?',
    words: ['What', 'is', 'the', 'Wi-Fi', 'password', 'here'],
    hint: 'Вопрос начинается с «What is the...»',
    level: 'A1',
  },
  {
    id: 10,
    russianPrompt: 'Она обычно пьёт зелёный чай по утрам.',
    words: ['She', 'usually', 'drinks', 'green', 'tea', 'in', 'the', 'morning'],
    hint: 'Наречие частоты «usually» ставится перед смысловым глаголом «drinks»',
    level: 'A1',
  },
  {
    id: 11,
    russianPrompt: 'Мы ищем хороший итальянский ресторан.',
    words: ['We', 'are', 'looking', 'for', 'a', 'good', 'Italian', 'restaurant'],
    hint: 'Present Continuous: «We are looking for...» (Мы ищем...)',
    level: 'A1',
  },
  {
    id: 12,
    russianPrompt: 'Извините, как мне добраться до центра города?',
    words: ['Excuse', 'me', 'how', 'can', 'I', 'get', 'to', 'the', 'city', 'center'],
    hint: 'Начни с вежливого обращения «Excuse me, how can I...»',
    level: 'A1',
  },

  // ─── A2: Живые диалоги, путешествия и планы ──────────────────────────────────
  {
    id: 13,
    russianPrompt: 'Не могли бы вы принести нам счёт?',
    words: ['Could', 'you', 'bring', 'us', 'the', 'bill', 'please'],
    hint: 'Вежливая просьба начинается с «Could you bring...»',
    level: 'A2',
  },
  {
    id: 14,
    russianPrompt: 'Мы собираемся навестить наших друзей завтра.',
    words: ['We', 'are', 'going', 'to', 'visit', 'our', 'friends', 'tomorrow'],
    hint: 'Конструкция планов на будущее: «We are going to...»',
    level: 'A2',
  },
  {
    id: 15,
    russianPrompt: 'Во сколько завтра отправляется последний поезд?',
    words: ['What', 'time', 'does', 'the', 'last', 'train', 'leave', 'tomorrow'],
    hint: 'Начни с «What time does...»',
    level: 'A2',
  },
  {
    id: 16,
    russianPrompt: 'Я забыл свой зонтик в такси вчера вечером.',
    words: ['I', 'left', 'my', 'umbrella', 'in', 'the', 'taxi', 'last', 'night'],
    hint: 'Используй Past Simple глагола leave — «I left...»',
    level: 'A2',
  },
  {
    id: 17,
    russianPrompt: 'Сколько времени занимает дорога до аэропорта?',
    words: ['How', 'long', 'does', 'it', 'take', 'to', 'get', 'to', 'the', 'airport'],
    hint: 'Устойчивая конструкция: «How long does it take to...»',
    level: 'A2',
  },
  {
    id: 18,
    russianPrompt: 'У вас есть эта рубашка на размер больше?',
    words: ['Do', 'you', 'have', 'this', 'shirt', 'in', 'a', 'larger', 'size'],
    hint: 'Начни с «Do you have this shirt...»',
    level: 'A2',
  },
  {
    id: 19,
    russianPrompt: 'Я бы предпочёл столик у окна, если можно.',
    words: ['I', 'would', 'prefer', 'a', 'table', 'by', 'the', 'window'],
    hint: 'Начни с «I would prefer a table...»',
    level: 'A2',
  },
  {
    id: 20,
    russianPrompt: 'Не забудь позвонить мне, когда приедешь домой.',
    words: ['Do', 'not', 'forget', 'to', 'call', 'me', 'when', 'you', 'get', 'home'],
    hint: 'Просьба: «Do not forget to call me...»',
    level: 'A2',
  },
  {
    id: 21,
    russianPrompt: 'Вчера шёл сильный дождь, поэтому мы остались дома.',
    words: ['It', 'was', 'raining', 'heavily', 'so', 'we', 'stayed', 'at', 'home'],
    hint: 'Начни с описания погоды в прошлом: «It was raining heavily...»',
    level: 'A2',
  },
  {
    id: 22,
    russianPrompt: 'Тебе следует записаться на приём к врачу сегодня.',
    words: ['You', 'should', 'make', 'an', 'appointment', 'with', 'a', 'doctor', 'today'],
    hint: 'Совет через модальный глагол: «You should make an appointment...»',
    level: 'A2',
  },
  {
    id: 23,
    russianPrompt: 'Этот фильм гораздо интереснее, чем книга.',
    words: ['This', 'movie', 'is', 'much', 'more', 'interesting', 'than', 'the', 'book'],
    hint: 'Сравнительная степень: «much more interesting than...»',
    level: 'A2',
  },
  {
    id: 24,
    russianPrompt: 'Вы не подскажете, во сколько закрывается этот музей?',
    words: ['Could', 'you', 'tell', 'me', 'what', 'time', 'this', 'museum', 'closes'],
    hint: 'Косвенный вопрос: «Could you tell me what time...» (прямой порядок слов в конце)',
    level: 'A2',
  },

  // ─── B1: Уверенная речь, опыт, работа и сложные конструкции ──────────────────
  {
    id: 25,
    russianPrompt: 'Она никогда раньше не была в Лондоне.',
    words: ['She', 'has', 'never', 'been', 'to', 'London', 'before'],
    hint: 'Present Perfect: «She has never been...»',
    level: 'B1',
  },
  {
    id: 26,
    russianPrompt: 'Извините, я не совсем понял ваш вопрос.',
    words: ['Sorry', 'I', 'did', 'not', 'quite', 'understand', 'your', 'question'],
    hint: 'Начни с «Sorry I did not...»',
    level: 'B1',
  },
  {
    id: 27,
    russianPrompt: 'Я работаю в этой международной компании уже три года.',
    words: ['I', 'have', 'been', 'working', 'at', 'this', 'company', 'for', 'three', 'years'],
    hint: 'Present Perfect Continuous: «I have been working...»',
    level: 'B1',
  },
  {
    id: 28,
    russianPrompt: 'Если погода будет хорошей, мы пойдём на прогулку в парк.',
    words: ['If', 'the', 'weather', 'is', 'nice', 'we', 'will', 'go', 'for', 'a', 'walk'],
    hint: 'First Conditional: после «If» используем Present Simple («is»), а во второй части — «will»',
    level: 'B1',
  },
  {
    id: 29,
    russianPrompt: 'Я с нетерпением жду нашей встречи на следующей неделе.',
    words: ['I', 'am', 'looking', 'forward', 'to', 'meeting', 'you', 'next', 'week'],
    hint: 'После «looking forward to» всегда используется глагол с окончанием -ing («meeting»)',
    level: 'B1',
  },
  {
    id: 30,
    russianPrompt: 'На твоём месте я бы принял это предложение о работе.',
    words: ['If', 'I', 'were', 'you', 'I', 'would', 'accept', 'this', 'job', 'offer'],
    hint: 'Second Conditional (совет): «If I were you, I would...»',
    level: 'B1',
  },
  {
    id: 31,
    russianPrompt: 'Вы не возражаете, если я открою окно на пару минут?',
    words: ['Would', 'you', 'mind', 'if', 'I', 'opened', 'the', 'window'],
    hint: 'Вежливая конструкция: «Would you mind if I opened...»',
    level: 'B1',
  },
  {
    id: 32,
    russianPrompt: 'Чем больше ты практикуешь английский, тем увереннее говоришь.',
    words: ['The', 'more', 'you', 'practice', 'English', 'the', 'more', 'confidently', 'you', 'speak'],
    hint: 'Двойное сравнение: «The more ..., the more ...»',
    level: 'B1',
  },
  {
    id: 33,
    russianPrompt: 'К тому времени как мы приехали, концерт уже начался.',
    words: ['By', 'the', 'time', 'we', 'arrived', 'the', 'concert', 'had', 'already', 'started'],
    hint: 'Past Perfect для предшествующего действия: «had already started»',
    level: 'B1',
  },
  {
    id: 34,
    russianPrompt: 'Мне было трудно привыкнуть к левостороннему движению.',
    words: ['It', 'was', 'hard', 'for', 'me', 'to', 'get', 'used', 'to', 'driving'],
    hint: 'Конструкция «привыкнуть к чему-либо» — «to get used to + V-ing»',
    level: 'B1',
  },
  {
    id: 35,
    russianPrompt: 'Не могли бы вы прислать мне подробности по электронной почте?',
    words: ['Could', 'you', 'please', 'send', 'me', 'the', 'details', 'by', 'email'],
    hint: 'Деловая просьба: «Could you please send me...»',
    level: 'B1',
  },
];

export const DIALOGUE_SCENARIOS: DialogueScenario[] = [
  // ─── 1. В кофейне ────────────────────────────────────────────────────────────
  {
    id: 'coffee_shop',
    title: 'В кофейне',
    emoji: '☕️',
    description: 'Закажи любимый напиток, выбери размер и оплати заказ на кассе.',
    turns: [
      {
        speakerName: 'Бариста',
        speakerLineEn: 'Hi there! Welcome to City Coffee. What can I get for you today?',
        speakerLineRu: 'Привет! Добро пожаловать в City Coffee. Что для вас приготовить сегодня?',
        options: [
          {
            textEn: "Hi! I'd like a medium cappuccino, please.",
            textRu: 'Привет! Я бы хотел средний капучино, пожалуйста.',
            isCorrect: true,
            feedback: 'Отлично! Конструкция «I’d like ... please» звучит максимально вежливо и естественно.',
          },
          {
            textEn: 'Give me coffee fast now.',
            textRu: 'Дай мне кофе быстро сейчас.',
            isCorrect: false,
            feedback: 'Такая фраза звучит слишком грубо. В английском принято использовать «I would like...» или «Can I have...».',
          },
          {
            textEn: 'I am a medium cappuccino.',
            textRu: 'Я — средний капучино.',
            isCorrect: false,
            feedback: 'Осторожно с глаголом «to be»! «I am...» означает, что ты сам являешься напитком 😄',
          },
        ],
      },
      {
        speakerName: 'Бариста',
        speakerLineEn: 'Sure! Would you like regular milk or oat milk with that?',
        speakerLineRu: 'Конечно! Вам на обычном молоке или на овсяном?',
        options: [
          {
            textEn: 'Oat milk, please. And no sugar.',
            textRu: 'На овсяном молоке, пожалуйста. И без сахара.',
            isCorrect: true,
            feedback: 'Прекрасно! Коротко, вежливо и сразу уточнил(а) про сахар.',
          },
          {
            textEn: 'Yes, I drink milk every day.',
            textRu: 'Да, я пью молоко каждый день.',
            isCorrect: false,
            feedback: 'Это вопрос с выбором («or»), нужно назвать конкретный вариант молока.',
          },
          {
            textEn: 'I do not have a cow.',
            textRu: 'У меня нет коровы.',
            isCorrect: false,
            feedback: 'Забавно, но бариста просто уточняет вид молока для твоего капучино 😄',
          },
        ],
      },
      {
        speakerName: 'Бариста',
        speakerLineEn: 'Got it! Would you like to have it here or take away?',
        speakerLineRu: 'Принято! Будете пить здесь или возьмёте с собой?',
        options: [
          {
            textEn: 'To go, please. I am in a hurry.',
            textRu: 'С собой, пожалуйста. Я спешу.',
            isCorrect: true,
            feedback: 'Супер! «To go» или «Take away» — идеальный ответ, когда берёшь напиток с собой.',
          },
          {
            textEn: 'Yes, I like coffee very much.',
            textRu: 'Да, я очень люблю кофе.',
            isCorrect: false,
            feedback: 'На вопрос с «или — или» нельзя ответить просто «Yes».',
          },
          {
            textEn: 'Where is the airport?',
            textRu: 'Где находится аэропорт?',
            isCorrect: false,
            feedback: 'Бариста спрашивает, где ты будешь пить кофе: в зале («for here») или с собой («to go»).',
          },
        ],
      },
      {
        speakerName: 'Бариста',
        speakerLineEn: 'Alright! That will be $4.50. How would you like to pay?',
        speakerLineRu: 'Хорошо! С вас $4.50. Как бы вы хотели оплатить?',
        options: [
          {
            textEn: 'Can I pay by card, please?',
            textRu: 'Могу я оплатить картой, пожалуйста?',
            isCorrect: true,
            feedback: 'Верно! Запомни предлог: «pay by card» (оплатить картой), но «pay in cash» (наличными).',
          },
          {
            textEn: 'I pay on the table.',
            textRu: 'Я плачу на столе.',
            isCorrect: false,
            feedback: 'Чтобы сказать про оплату картой или наличными, используй «by card» или «in cash».',
          },
          {
            textEn: 'No, thank you, goodbye.',
            textRu: 'Нет, спасибо, до свидания.',
            isCorrect: false,
            feedback: 'Уходить без оплаты не стоит 😄 Бариста ждёт выбора способа оплаты.',
          },
        ],
      },
    ],
  },

  // ─── 2. Заселение в отель ────────────────────────────────────────────────────
  {
    id: 'hotel_checkin',
    title: 'Заселение в отель',
    emoji: '🏨',
    description: 'Зарегистрируйся на ресепшене, узнай про завтрак и получи ключ от номера.',
    turns: [
      {
        speakerName: 'Администратор',
        speakerLineEn: 'Good evening! Welcome to Grand Hotel. How may I help you?',
        speakerLineRu: 'Добрый вечер! Добро пожаловать в Grand Hotel. Чем могу помочь?',
        options: [
          {
            textEn: 'Good evening! I have a reservation under the name Ivanov.',
            textRu: 'Добрый вечер! У меня бронь на фамилию Иванов.',
            isCorrect: true,
            feedback: 'Идеально! Фраза «I have a reservation under the name...» — золотой стандарт при заселении.',
          },
          {
            textEn: 'I want sleep in a room.',
            textRu: 'Я хочу спать в комнате.',
            isCorrect: false,
            feedback: 'Грамматически неверно (пропущено «to») и неестественно для ресепшена.',
          },
          {
            textEn: 'How much is the hotel?',
            textRu: 'Сколько стоит весь отель?',
            isCorrect: false,
            feedback: 'Так ты спрашиваешь цену покупки всего здания отеля 😄',
          },
        ],
      },
      {
        speakerName: 'Администратор',
        speakerLineEn: 'Let me check... Yes, a double room for three nights. May I see your passport, please?',
        speakerLineRu: 'Сейчас проверю... Да, двухместный номер на три ночи. Могу я увидеть ваш паспорт?',
        options: [
          {
            textEn: 'Here you are. Is breakfast included?',
            textRu: 'Вот, пожалуйста. А завтрак включён?',
            isCorrect: true,
            feedback: 'Отлично! «Here you are» — естественная фраза, когда передаёшь предмет собеседнику.',
          },
          {
            textEn: 'No, I do not read books.',
            textRu: 'Нет, я не читаю книги.',
            isCorrect: false,
            feedback: 'Администратор просит показать паспорт («May I see your passport»).',
          },
          {
            textEn: 'Look at me please.',
            textRu: 'Посмотрите на меня, пожалуйста.',
            isCorrect: false,
            feedback: 'Для регистрации нужен документ — передай его со словами «Here you are» или «Here it is».',
          },
        ],
      },
      {
        speakerName: 'Администратор',
        speakerLineEn: 'Yes, breakfast is served from 7 to 10 AM. Here is your key card, room 305 on the third floor.',
        speakerLineRu: 'Да, завтрак подаётся с 7 до 10 утра. Вот ваша ключ-карта, номер 305 на третьем этаже.',
        options: [
          {
            textEn: 'Thank you very much! Where is the elevator?',
            textRu: 'Большое спасибо! Подскажите, где находится лифт?',
            isCorrect: true,
            feedback: 'Блестяще! Ты поблагодарил(а) и уточнил(а), как подняться на этаж.',
          },
          {
            textEn: 'You are welcome, room 305.',
            textRu: 'Пожалуйста, комната 305.',
            isCorrect: false,
            feedback: '«You are welcome» говорят в ответ на «Thank you», а здесь благодарить должен гость.',
          },
          {
            textEn: 'I wake up at 11 PM.',
            textRu: 'Я просыпаюсь в 11 вечера.',
            isCorrect: false,
            feedback: 'Логичнее поблагодарить администратора за ключ и узнать дорогу к номеру.',
          },
        ],
      },
      {
        speakerName: 'Администратор',
        speakerLineEn: 'The elevator is just around the corner on your right. Enjoy your stay!',
        speakerLineRu: 'Лифт прямо за углом справа от вас. Приятного пребывания!',
        options: [
          {
            textEn: 'Thanks a lot! Have a nice evening.',
            textRu: 'Большое спасибо! Хорошего вам вечера.',
            isCorrect: true,
            feedback: 'Отличное вежливое завершение разговора!',
          },
          {
            textEn: 'Yes, I am staying.',
            textRu: 'Да, я остаюсь.',
            isCorrect: false,
            feedback: 'На пожелание «Enjoy your stay!» принято отвечать благодарностью и ответным пожеланием.',
          },
          {
            textEn: 'Where is my key?',
            textRu: 'Где мой ключ?',
            isCorrect: false,
            feedback: 'Ключ тебе уже выдали в предыдущей реплике 😄',
          },
        ],
      },
    ],
  },

  // ─── 3. В аэропорту ──────────────────────────────────────────────────────────
  {
    id: 'airport_control',
    title: 'В аэропорту',
    emoji: '✈️',
    description: 'Пройди регистрацию на рейс, сдай багаж и ответь на вопросы паспортного контроля.',
    turns: [
      {
        speakerName: 'Сотрудник стойки',
        speakerLineEn: 'Hello! Where are you flying today? May I have your ticket and passport?',
        speakerLineRu: 'Здравствуйте! Куда вы сегодня летите? Ваш билет и паспорт, пожалуйста.',
        options: [
          {
            textEn: 'Hello! I am flying to London. Here are my documents.',
            textRu: 'Здравствуйте! Я лечу в Лондон. Вот мои документы.',
            isCorrect: true,
            feedback: 'Точно в цель! Чёткий и вежливый ответ на оба вопроса.',
          },
          {
            textEn: 'I fly yesterday to London.',
            textRu: 'Я летаю вчера в Лондон.',
            isCorrect: false,
            feedback: 'Путаница со временами: ты летишь сегодня («I am flying today»).',
          },
          {
            textEn: 'My passport is in the suitcase.',
            textRu: 'Мой паспорт внутри чемодана.',
            isCorrect: false,
            feedback: 'Без паспорта в руках зарегистрироваться на рейс не получится!',
          },
        ],
      },
      {
        speakerName: 'Сотрудник стойки',
        speakerLineEn: 'Thank you. Do you have any luggage to check in, or just hand luggage?',
        speakerLineRu: 'Спасибо. У вас есть багаж для сдачи или только ручная кладь?',
        options: [
          {
            textEn: 'I have one suitcase to check in and this backpack as carry-on.',
            textRu: 'У меня один чемодан в багаж и этот рюкзак в ручную кладь.',
            isCorrect: true,
            feedback: 'Отлично! «Check in» (сдать в багаж) и «carry-on / hand luggage» (ручная кладь) — важнейшие слова в аэропорту.',
          },
          {
            textEn: 'Yes, I like bags.',
            textRu: 'Да, мне нравятся сумки.',
            isCorrect: false,
            feedback: 'Нужно уточнить, сдаёшь ли ты чемодан на ленту или берёшь в салон.',
          },
          {
            textEn: 'Put me on the scale.',
            textRu: 'Поставьте меня на весы.',
            isCorrect: false,
            feedback: 'На ленту весов ставят чемодан («put the suitcase on the scale»), а не пассажира 😄',
          },
        ],
      },
      {
        speakerName: 'Сотрудник стойки',
        speakerLineEn: 'Alright. Would you prefer a window seat or an aisle seat?',
        speakerLineRu: 'Хорошо. Вы предпочитаете место у окна или у прохода?',
        options: [
          {
            textEn: "I'd prefer a window seat, please.",
            textRu: 'Я бы предпочёл место у окна, пожалуйста.',
            isCorrect: true,
            feedback: 'Супер! «A window seat» (у окна) и «an aisle seat» (у прохода) — обязательная лексика путешественника.',
          },
          {
            textEn: 'I sit on the floor.',
            textRu: 'Я посижу на полу.',
            isCorrect: false,
            feedback: 'В самолёте так не выйдет 😄 Выбирай «window seat» или «aisle seat».',
          },
          {
            textEn: 'Yes, open the window please.',
            textRu: 'Да, откройте окно, пожалуйста.',
            isCorrect: false,
            feedback: 'Речь идёт о выборе посадочного места у иллюминатора, а не о проветривании 😄',
          },
        ],
      },
      {
        speakerName: 'Офицер контроля',
        speakerLineEn: 'What is the purpose of your visit and how long will you stay?',
        speakerLineRu: 'Какова цель вашего визита и как долго вы пробудете в стране?',
        options: [
          {
            textEn: 'I am travelling for tourism, for one week.',
            textRu: 'Я путешествую с целью туризма, на одну неделю.',
            isCorrect: true,
            feedback: 'Отлично! Спокойный и понятный ответ для пограничного контроля.',
          },
          {
            textEn: 'I do not know why I am here.',
            textRu: 'Я не знаю, зачем я здесь.',
            isCorrect: false,
            feedback: 'Такой ответ на границе вызовет много лишних вопросов 😄',
          },
          {
            textEn: 'Because London is very big.',
            textRu: 'Потому что Лондон очень большой.',
            isCorrect: false,
            feedback: 'Офицер спрашивает цель поездки («tourism» / «business») и срок пребывания.',
          },
        ],
      },
    ],
  },

  // ─── 4. В ресторане ──────────────────────────────────────────────────────────
  {
    id: 'restaurant_dinner',
    title: 'Ужин в ресторане',
    emoji: '🍽',
    description: 'Выбери столик, сделай заказ по меню, попроси рекомендации у официанта и оплати счёт.',
    turns: [
      {
        speakerName: 'Хостес',
        speakerLineEn: 'Good evening! Welcome to Bella Italia. Do you have a table booked?',
        speakerLineRu: 'Добрый вечер! Добро пожаловать в Bella Italia. У вас забронирован столик?',
        options: [
          {
            textEn: "No, we don't. Do you have a table for two, please?",
            textRu: 'Нет. Найдётся ли у вас столик на двоих, пожалуйста?',
            isCorrect: true,
            feedback: 'Отлично! «A table for two» — стандартная фраза, чтобы попросить столик на двоих.',
          },
          {
            textEn: 'We want eat two tables.',
            textRu: 'Мы хотим съесть два стола.',
            isCorrect: false,
            feedback: 'Осторожнее с порядком слов! «A table for two» — столик для двоих человек.',
          },
          {
            textEn: 'Yes, I have a book at home.',
            textRu: 'Да, у меня дома есть книга.',
            isCorrect: false,
            feedback: 'Глагол «to book» означает «бронировать», с бумажной книгой это не связано 😄',
          },
        ],
      },
      {
        speakerName: 'Официант',
        speakerLineEn: 'Here is the menu. Are you ready to order, or do you need a few minutes?',
        speakerLineRu: 'Вот меню. Вы готовы сделать заказ или вам нужно несколько минут?',
        options: [
          {
            textEn: 'What would you recommend for the main course?',
            textRu: 'А что бы вы порекомендовали на горячее (основное блюдо)?',
            isCorrect: true,
            feedback: 'Супер! «What would you recommend?» и «main course» (основное блюдо) звучат очень естественно.',
          },
          {
            textEn: 'Bring me everything from the kitchen.',
            textRu: 'Принесите мне всё с кухни.',
            isCorrect: false,
            feedback: 'Звучит слишком смело 😄 Лучше спросить рекомендацию официанта.',
          },
          {
            textEn: 'I am ready to go home.',
            textRu: 'Я готов идти домой.',
            isCorrect: false,
            feedback: 'Мы ведь только сели за столик! «Ready to order» означает «готов сделать заказ».',
          },
        ],
      },
      {
        speakerName: 'Официант',
        speakerLineEn: 'Our grilled salmon with vegetables is amazing today! Would you like to try it?',
        speakerLineRu: 'Наш лосось на гриле с овощами сегодня просто потрясающий! Хотите попробовать?',
        options: [
          {
            textEn: "Sounds delicious! I'll have the salmon and a glass of still water.",
            textRu: 'Звучит очень вкусно! Я буду лосось и стакан воды без газа.',
            isCorrect: true,
            feedback: 'Замечательно! При заказе еды носители говорят «I’ll have...» (Я буду...), а вода без газа — «still water».',
          },
          {
            textEn: 'No, fish cannot swim on the grill.',
            textRu: 'Нет, рыба не умеет плавать на гриле.',
            isCorrect: false,
            feedback: 'Юмор — это хорошо, но официант ждёт твой заказ по меню 😄',
          },
          {
            textEn: 'I take fish in my pocket.',
            textRu: 'Я беру рыбу в карман.',
            isCorrect: false,
            feedback: 'Для заказа блюд в ресторане используй «I’ll have...» или «I’d like...».',
          },
        ],
      },
      {
        speakerName: 'Официант',
        speakerLineEn: 'I hope you enjoyed your meal! Can I get you anything else, maybe dessert?',
        speakerLineRu: 'Надеюсь, вам понравился ужин! Принести что-нибудь ещё, может быть десерт?',
        options: [
          {
            textEn: 'Everything was great, thank you! Could we have the bill, please?',
            textRu: 'Всё было великолепно, спасибо! Можем мы попросить счёт, пожалуйста?',
            isCorrect: true,
            feedback: 'Идеально! Поблагодарил(а) за ужин и вежливо попросил(а) счёт («Could we have the bill, please?»).',
          },
          {
            textEn: 'Give me money for the food.',
            textRu: 'Дайте мне деньги за еду.',
            isCorrect: false,
            feedback: 'Платит гость, а чтобы попросить счёт, скажи «Could we have the bill / check, please?».',
          },
          {
            textEn: 'No, I did not eat.',
            textRu: 'Нет, я не ел.',
            isCorrect: false,
            feedback: 'Лосось уже съеден! Пора поблагодарить официанта и попросить счёт.',
          },
        ],
      },
    ],
  },

  // ─── 5. В магазине одежды ────────────────────────────────────────────────────
  {
    id: 'clothing_store',
    title: 'В магазине одежды',
    emoji: '🛍',
    description: 'Найди нужную вещь, попроси другой размер, примерь обновку и оформи покупку.',
    turns: [
      {
        speakerName: 'Консультант',
        speakerLineEn: 'Hello! Let me know if you need any help finding your size.',
        speakerLineRu: 'Здравствуйте! Дайте знать, если вам понадобится помощь с поиском размера.',
        options: [
          {
            textEn: "Hi! Yes, please. I'm looking for a denim jacket in size Medium.",
            textRu: 'Привет! Да, пожалуйста. Я ищу джинсовую куртку в размере M.',
            isCorrect: true,
            feedback: 'Отлично! «I’m looking for...» (Я ищу...) и «in size Medium» — именно так говорят в магазинах.',
          },
          {
            textEn: 'I watch at the jackets.',
            textRu: 'Я смотрю на куртки.',
            isCorrect: false,
            feedback: 'Если просто смотришь — скажи «I’m just looking, thanks», а если ищешь вещь — «I’m looking for...».',
          },
          {
            textEn: 'How tall is this jacket?',
            textRu: 'Какого роста эта куртка?',
            isCorrect: false,
            feedback: 'Про одежду спрашивают размер («what size»), а не рост («how tall»).',
          },
        ],
      },
      {
        speakerName: 'Консультант',
        speakerLineEn: 'Here is a Medium for you. The fitting rooms are right over there.',
        speakerLineRu: 'Вот ваш размер M. Примерочные находятся прямо там.',
        options: [
          {
            textEn: 'Thank you! Can I try it on?',
            textRu: 'Спасибо! Могу я её примерить?',
            isCorrect: true,
            feedback: 'Верно! Фразовый глагол «try on» означает «примерять одежду или обувь».',
          },
          {
            textEn: 'Where is the kitchen?',
            textRu: 'Где здесь кухня?',
            isCorrect: false,
            feedback: 'Примерочная по-английски — «fitting room» или «changing room».',
          },
          {
            textEn: 'I put it on my head.',
            textRu: 'Я надену её на голову.',
            isCorrect: false,
            feedback: 'Куртку лучше примерить в примерочной: «Can I try it on?» 😄',
          },
        ],
      },
      {
        speakerName: 'Консультант',
        speakerLineEn: 'How does it fit? Is the size okay for you?',
        speakerLineRu: 'Ну как сидит? Размер вам подходит?',
        options: [
          {
            textEn: "It's a bit too tight. Do you have it in a Large?",
            textRu: 'Она немного тесновата. У вас есть такая же в размере L?',
            isCorrect: true,
            feedback: 'Супер! «Too tight» (слишком тесная) и «too loose / big» (слишком свободная) — очень полезные выражения.',
          },
          {
            textEn: 'The jacket is very angry.',
            textRu: 'Куртка очень злая.',
            isCorrect: false,
            feedback: 'Чтобы сказать, что вещь мала или тесна, используй «too small» или «too tight».',
          },
          {
            textEn: 'Yes, I am fine, how are you?',
            textRu: 'Да, у меня всё хорошо, а как вы?',
            isCorrect: false,
            feedback: 'Вопрос «How does it fit?» относится к тому, как сидит одежда.',
          },
        ],
      },
      {
        speakerName: 'Консультант',
        speakerLineEn: 'Here is the Large — it looks great on you! And it is 20% off today.',
        speakerLineRu: 'Вот размер L — на вас смотрится отлично! И сегодня на неё скидка 20%.',
        options: [
          {
            textEn: "Awesome, it fits perfectly! I'll take it.",
            textRu: 'Класс, сидит идеально! Я беру её.',
            isCorrect: true,
            feedback: 'Точно! Фраза «I’ll take it» (Я беру это) используется всегда, когда ты решил(а) купить вещь.',
          },
          {
            textEn: 'Give me 20 jackets please.',
            textRu: 'Дайте мне 20 курток, пожалуйста.',
            isCorrect: false,
            feedback: '«20% off» означает скидку 20 процентов, а не количество курток 😄',
          },
          {
            textEn: 'I am 20 years old too.',
            textRu: 'Мне тоже 20 лет.',
            isCorrect: false,
            feedback: 'Консультант обрадовал тебя скидкой 20% («20% off»). Самое время сказать «I’ll take it!».',
          },
        ],
      },
    ],
  },

  // ─── 6. Как пройти в городе ──────────────────────────────────────────────────
  {
    id: 'asking_directions',
    title: 'Ориентация в городе',
    emoji: '🗺',
    description: 'Спроси дорогу у прохожего, пойми указания по маршруту и доберись до музея.',
    turns: [
      {
        speakerName: 'Прохожий',
        speakerLineEn: 'Hi! You look a little lost. Can I help you find something?',
        speakerLineRu: 'Привет! Вы выглядите немного растерянно. Помочь вам что-нибудь найти?',
        options: [
          {
            textEn: "Excuse me! Yes, could you tell me how to get to the National Museum?",
            textRu: 'Извините! Да, не подскажете, как добраться до Национального музея?',
            isCorrect: true,
            feedback: 'Превосходно! «Could you tell me how to get to...» — самая вежливая и универсальная формула.',
          },
          {
            textEn: 'Where I am going now?',
            textRu: 'Куда я сейчас иду?',
            isCorrect: false,
            feedback: 'Прохожий точно не знает твоих планов 😄 Назови место, которое ищешь.',
          },
          {
            textEn: 'Bring the museum here.',
            textRu: 'Принесите музей сюда.',
            isCorrect: false,
            feedback: 'Спроси дорогу с помощью конструкции «How can I get to...».',
          },
        ],
      },
      {
        speakerName: 'Прохожий',
        speakerLineEn: 'Sure! Go straight down this street for two blocks, then turn left at the traffic lights.',
        speakerLineRu: 'Конечно! Идите прямо по этой улице два квартала, затем поверните налево на светофоре.',
        options: [
          {
            textEn: 'Got it: straight for two blocks and left at the traffic lights. Is it far from there?',
            textRu: 'Понял: прямо два квартала и налево на светофоре. А оттуда далеко?',
            isCorrect: true,
            feedback: 'Отличный приём! Повторить ключевые ориентиры собеседника — лучший способ убедиться, что всё понял правильно.',
          },
          {
            textEn: 'I do not have traffic lights.',
            textRu: 'У меня нет светофоров.',
            isCorrect: false,
            feedback: '«At the traffic lights» означает поворот у уличного светофора.',
          },
          {
            textEn: 'What is a street?',
            textRu: 'Что такое улица?',
            isCorrect: false,
            feedback: 'Уточни, далеко ли идти дальше: «Is it far from there?».',
          },
        ],
      },
      {
        speakerName: 'Прохожий',
        speakerLineEn: 'Not at all! It is about a ten-minute walk. You will see a big building Opposite the park.',
        speakerLineRu: 'Совсем нет! Около десяти минут пешком. Вы увидите большое здание напротив парка.',
        options: [
          {
            textEn: 'Thank you so much for your help! Have a great day!',
            textRu: 'Огромное спасибо за помощь! Отличного вам дня!',
            isCorrect: true,
            feedback: 'Блестяще! Ты уверенно разобрался(ась) с маршрутом на английском.',
          },
          {
            textEn: 'I will run for ten hours.',
            textRu: 'Я буду бежать десять часов.',
            isCorrect: false,
            feedback: '«A ten-minute walk» — это всего 10 минут спокойным шагом 😄',
          },
          {
            textEn: 'No, thank you, I stay here.',
            textRu: 'Нет, спасибо, я останусь тут.',
            isCorrect: false,
            feedback: 'Осталось всего 10 минут пешком — поблагодари прохожего за помощь!',
          },
        ],
      },
    ],
  },

  // ─── 7. У врача / в аптеке ───────────────────────────────────────────────────
  {
    id: 'doctor_visit',
    title: 'На приёме у врача',
    emoji: '🩺',
    description: 'Опиши свои симптомы врачу за границей, ответь на вопросы о самочувствии и получи рецепт.',
    turns: [
      {
        speakerName: 'Доктор Смит',
        speakerLineEn: 'Hello! Please take a seat. What seems to be the problem today?',
        speakerLineRu: 'Здравствуйте! Присаживайтесь, пожалуйста. На что жалуетесь сегодня?',
        options: [
          {
            textEn: "I've had a sore throat and a slight fever since yesterday.",
            textRu: 'У меня со вчерашнего дня болит горло и небольшая температура.',
            isCorrect: true,
            feedback: 'Очень грамотно! «A sore throat» (боль в горле) и «a slight fever» (небольшая температура) с Present Perfect («since yesterday»).',
          },
          {
            textEn: 'My throat is very sad today.',
            textRu: 'Моё горло сегодня очень грустное.',
            isCorrect: false,
            feedback: 'Про больное горло по-английски говорят «I have a sore throat».',
          },
          {
            textEn: 'I am a doctor too.',
            textRu: 'Я тоже доктор.',
            isCorrect: false,
            feedback: 'Врач спрашивает про твои симптомы («What seems to be the problem?»).',
          },
        ],
      },
      {
        speakerName: 'Доктор Смит',
        speakerLineEn: 'I see. Do you have a cough or a headache as well? Are you allergic to any medication?',
        speakerLineRu: 'Понимаю. Кашель или головная боль тоже есть? Есть ли у вас аллергия на лекарства?',
        options: [
          {
            textEn: 'I have a mild headache, but no allergies to any medicine.',
            textRu: 'У меня лёгкая головная боль, но аллергии на лекарства нет.',
            isCorrect: true,
            feedback: 'Отлично! Чётко сообщил(а) и про симптом («a mild headache»), и про отсутствие аллергии.',
          },
          {
            textEn: 'Yes, I like medicine very much.',
            textRu: 'Да, я очень люблю лекарства.',
            isCorrect: false,
            feedback: 'Вопрос «Are you allergic to...?» очень важен для безопасности — нужно сказать, есть ли аллергия.',
          },
          {
            textEn: 'My head is on my shoulders.',
            textRu: 'Моя голова у меня на плечах.',
            isCorrect: false,
            feedback: 'Головная боль по-английски — «a headache».',
          },
        ],
      },
      {
        speakerName: 'Доктор Смит',
        speakerLineEn: "It's a mild cold. I'll write you a prescription. Take these pills twice a day after meals.",
        speakerLineRu: 'Это лёгкая простуда. Я выпишу вам рецепт. Принимайте эти таблетки дважды в день после еды.',
        options: [
          {
            textEn: 'Thank you, Doctor! Where is the nearest pharmacy?',
            textRu: 'Спасибо, доктор! Подскажите, где находится ближайшая аптека?',
            isCorrect: true,
            feedback: 'Прекрасно! «Prescription» — рецепт, а «pharmacy / drugstore» — аптека.',
          },
          {
            textEn: 'I will eat the paper prescription.',
            textRu: 'Я съем бумажный рецепт.',
            isCorrect: false,
            feedback: 'Рецепт («prescription») нужно отнести в аптеку («pharmacy») 😄',
          },
          {
            textEn: 'Twice a year is good.',
            textRu: 'Дважды в год — это хорошо.',
            isCorrect: false,
            feedback: '«Twice a day» означает два раза в день, а не в год!',
          },
        ],
      },
    ],
  },

  // ─── 8. Собеседование на работу ──────────────────────────────────────────────
  {
    id: 'job_interview',
    title: 'Собеседование (Job Interview)',
    emoji: '💼',
    description: 'Расскажи о своём опыте, сильных сторонах и задай грамотный вопрос HR-менеджеру.',
    turns: [
      {
        speakerName: 'HR-менеджер Анна',
        speakerLineEn: 'Welcome! Thanks for joining the interview. Could you start by telling me a little about yourself?',
        speakerLineRu: 'Добро пожаловать! Спасибо, что подключились к интервью. Расскажите немного о себе для начала.',
        options: [
          {
            textEn: "Sure! I have three years of experience in project management and I love solving complex tasks.",
            textRu: 'Конечно! У меня три года опыта в управлении проектами, и мне нравится решать сложные задачи.',
            isCorrect: true,
            feedback: 'Идеальное начало! На собеседовании вопрос «Tell me about yourself» подразумевает краткое резюме твоего профессионального опыта.',
          },
          {
            textEn: 'I was born in a hospital and I like cats.',
            textRu: 'Я родился в больнице и люблю котиков.',
            isCorrect: false,
            feedback: 'Котики — это прекрасно, но рекрутер ждёт рассказ о твоём профессиональном бэкграунде 😄',
          },
          {
            textEn: 'Read my resume please, everything is there.',
            textRu: 'Почитайте моё резюме, пожалуйста, там всё написано.',
            isCorrect: false,
            feedback: 'Такой ответ покажется невежливым — важно уметь презентовать себя устно (Elevator Pitch).',
          },
        ],
      },
      {
        speakerName: 'HR-менеджер Анна',
        speakerLineEn: 'Impressive! What would you say is your greatest strength at work?',
        speakerLineRu: 'Впечатляет! Что бы вы назвали своей главной сильной стороной в работе?',
        options: [
          {
            textEn: 'I am very detail-oriented and I communicate effectively with the team.',
            textRu: 'Я очень внимателен к деталям и эффективно общаюсь с командой.',
            isCorrect: true,
            feedback: 'Блестяще! Выражения «detail-oriented» и «communicate effectively» — топ-лексика для любого резюме и интервью.',
          },
          {
            textEn: 'I can lift heavy boxes in the office.',
            textRu: 'Я могу поднимать тяжёлые коробки в офисе.',
            isCorrect: false,
            feedback: 'Слово «strength» на интервью означает сильные профессиональные качества (soft & hard skills), а не физическую силу 😄',
          },
          {
            textEn: 'I always go home early.',
            textRu: 'Я всегда ухожу домой пораньше.',
            isCorrect: false,
            feedback: 'Вряд ли это убедит работодателя сделать тебе оффер 😄',
          },
        ],
      },
      {
        speakerName: 'HR-менеджер Анна',
        speakerLineEn: 'That sounds great. Do you have any questions for us about the role or the company?',
        speakerLineRu: 'Звучит здорово. Есть ли у вас вопросы к нам о должности или компании?',
        options: [
          {
            textEn: 'Yes! What does a typical day in this role look like, and what are the main goals for the first three months?',
            textRu: 'Да! Как выглядит типичный день на этой позиции и каковы главные цели на первые три месяца?',
            isCorrect: true,
            feedback: 'Высший пилотаж! Такой вопрос показывает твою вовлечённость и зрелый подход к работе.',
          },
          {
            textEn: 'When is my first vacation?',
            textRu: 'Когда у меня первый отпуск?',
            isCorrect: false,
            feedback: 'На первом интервью лучше сначала спросить о задачах и команде.',
          },
          {
            textEn: 'No questions, goodbye.',
            textRu: 'Вопросов нет, до свидания.',
            isCorrect: false,
            feedback: 'Всегда полезно задать хотя бы один встречный вопрос о задачах или ожиданиях команды.',
          },
        ],
      },
    ],
  },
];
