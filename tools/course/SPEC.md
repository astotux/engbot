# SPEC: Day lesson files for the extended 30-day course

You write **one JS object literal per day** into `tools/course/parts/dayNN.part.js` (NN = 01..30, zero-padded).
Later these are concatenated into `src/content/course_.ts` (`LESSONS_: Lesson[]`). Your file is **pure JavaScript** (no TypeScript types), it contains the object **plus trailing comma**, indented by 2 spaces, e.g. `  {\n    day: 3,\n ... \n  },`.
Validate with: `node tools/course/validateDay.mjs 3` (from the repo root `c:\Users\Артёмкакилер228\Desktop\engbot`). **Fix until it prints ✅.** Never edit any other file.

**EXEMPLAR (read it fully first, match its depth, style, comment formats and level of detail):** `tools/course/parts/day01.part.js`. In the recap use wording «Сегодня ты освоил(а):» (not «изучил(а)»). Write the files one day per tool call (do not put several days in one call; keep each call reasonably sized). Day files must not mention other days' step numbers.

Existing format reference: read `COURSE_BUILDER.md` and the first ~160 lines of `src/content/course.ts` (types `ExplainStep | ChoiceStep | InputStep | FreeStep`, `Lesson`). Reuse exactly those field names.

## Goal & audience
Telegram course "English from zero in 30 days" for Russian-speaking absolute beginners (A0 → A2). Friendly, motivating tone, address the learner as «ты». Explanations in Russian, English examples in `<b>bold</b>`. Based on the free guide "Английский с нуля за 30 дней" (the handbook covers: alphabet, reading rules, pronouns+to be, articles+plurals, numbers, time/dates, nouns, 40 verbs, adjectives, Present Simple, question words, modals, Past Simple, 30 irregular verbs, future will/going to, dialogues, prepositions, 12 beginner mistakes, mini-test, 30-day plan).

Each day = **15–20 steps** (validator: 15..20), ~30–35 minutes. Make it maximally thorough: many small, focused steps rather than few big ones. Typical day shape (adapt, don't copy blindly):
1. explain — hook / what we learn today + recap of yesterday (with video circle)
2–N. alternate: explain (one small idea) → choice → choice → input … Every new idea is followed by 1–3 practice steps (choice / input) BEFORE the next idea.
- second to last: `free` (creative output) — the learner writes several sentences
- last: explain «🏁 Итоги дня» — bullet recap + «завтра мы…» teaser (the bot shows the "done" button after the last explain, so the last step MUST be explain)
Counts per day (validator): ≥4 explain, ≥4 choice, ≥3 input, ≥1 free. Aim for roughly 6 explain, 5–6 choice, 4–5 input, 1–2 free.
Review days (7, 14, 20, 29) are mixed practice: short explain refreshers + lots of choice/input/free. Test day 28: almost no theory — many choice/input as a graded-feeling test with encouraging explanations; the first explain describes the test rules. Final day 30: speaking/writing — retell self, past, future; last explain = congratulations + next steps (continue in the bot: vocabulary by levels A1–C2, tests, more lessons).

## Content rules
- Use ONLY grammar/vocabulary taught up to that day in exercises (e.g. no Present Simple -s before day 15; use `to be` sentences before). Vocabulary must match the handbook word lists. Level A0→A2.
- Every day must be consistent with the day plan below (topic, content list). Make sure the day really teaches everything on its list (all key words/rules), with examples `{ english, russian }` (3–6 per explain when useful).
- `choice`: 3–4 options, **vary `correctIndex`** (0,1,2,3 all used across the day), distractors plausible (typical learner mistakes), option text ≤ 40 chars, `hint` ≤ 120 chars and must NOT reveal the answer, `explanation` explains the rule briefly.
- `input`: the question must say exactly what to type. `answerKey` = array of accepted answers: **lowercase, no trailing punctuation, no double spaces**. Matching is exact after normalisation (lowercase, trim, trailing `.,!?;:` removed, spaces collapsed; apostrophes are NOT normalised). Therefore: **prefer tasks whose answer needs NO apostrophe** (ask «без сокращений» / «полной формой», or use single words/short phrases). If a key must contain `'`, also add the same key with the curly apostrophe `’` (validator enforces). Add reasonable alternative answers (synonyms, with/without article only if truly equivalent). Use `matchMode: 'startsWith'` only when the learner adds their own name/word at the end.
- `free`: creative task + `exampleAnswer` + `tip` (what to use).
- Text format: Telegram HTML — only `<b> <i> <u> <code>`; line breaks `\n`; bullets «• ». **Never write raw `<` or `&`** (write «and» instead of &). Keep each text ≤ ~1200 chars (hard limit 1700). Use emojis in titles/questions to look friendly, like the existing course.
- JS strings: use single quotes and escape apostrophes `\'`, or use double quotes for strings with apostrophes. **No backticks.** Join long strings with `+`.
- Number the steps in comments: `// ── Шаг 3/17: ... ──` (total = real step count). Titles of explain steps like `'📖 ...'`.
- Fields order inside a step: type, title/question, media comment+field(s), text/options..., etc.

## Media (YOU do NOT record anything — you leave precise comments, the owner records)
Each day needs **6–10 media fields** (validator: ≥5) spread over different steps; several per day is normal; **one step may have both a circle and a voice** (voiceFile + videoNoteFile). Use ONLY the explicit fields:
- `videoNoteFile` — circle video (mp4, ≤ 60 s, square) — for the teacher "on camera": intro, explanation of the key rule, tricky pronunciation (mouth shape), motivation, recap.
- `voiceFile` — voice message (mp3, ≤ 40 s) — pronunciation of word lists/phrases, listening questions («🎧 Послушай…»: the audio contains the sentence/question), dialogue lines, spelling.
Path pattern (validator): `assets/audio/dayNN_sSS_slug.mp3|mp4`, where SS = **this step's number (2 digits)**, slug = lowercase latin/digits/underscore, e.g. `assets/audio/day03_s01_intro.mp4`, `assets/audio/day03_s05_listen_he.mp3`.
EVERY media field must have a comment block directly above it (no blank line, no code in between), starting with a line containing the word **ВСТАВИТЬ**:

```js
      // 🎬 ВСТАВИТЬ КРУЖОК (mp4, до 60 сек, квадрат) — assets/audio/day03_s01_intro.mp4
      // ВИЗУАЛ: что в кадре (преподаватель крупно; на заднем плане/в руках — карточки с местоимениями I/you/he/she)
      // ТЕКСТ (дословно, что сказать): «Привет! Это третий день курса... Сегодня мы выучим... Say after me: I, you, he, she.»
      videoNoteFile: 'assets/audio/day03_s01_intro.mp4',
```
```js
      // 🎙 ВСТАВИТЬ ГОЛОСОВОЕ (mp3, до 40 сек) — assets/audio/day03_s05_listen_he.mp3
      // ТЕКСТ (дословно, English; говорить чётко, не быстро, пауза 1 сек между фразами): «He is my brother. ... »
      voiceFile: 'assets/audio/day03_s05_listen_he.mp3',
```
The ТЕКСТ must be the **complete verbatim script** (circle scripts ≈ 90–140 Russian words so they fit 60 s; voice scripts ≤ ~70 words). For a listening question, the audio must contain what the learner needs to hear and NOT give away the answer text on screen; the step's `question` should say «🎧 Послушай…». If the step's text already contains the whole audio content, say in the comment that the audio simply reads it aloud.

## PDF (one per day, sent at the START of the lesson before step 1; days 28 and 30 have NO pdfFile)
The lesson object has `pdfFile: 'assets/lessons/dayNN.pdf',` placed after `estimatedMinutes` and before `steps`. Directly above it put a comment block of **≥ 40 comment lines** (validator) containing the **complete text of the PDF** the owner will typeset (2–3 A4 pages), first line containing **ВСТАВИТЬ**:

```js
    // ═══════ 📄 ВСТАВИТЬ PDF-КОНСПЕКТ ДНЯ 3 ═══════
    // Файл: assets/lessons/day03.pdf | Отправляется В НАЧАЛЕ урока (до 1-го шага) | 2–3 стр. A4
    // Оформление: как гид free-checklist.pdf (индиго #4f46e5, карточки, таблицы, плашки-подсказки)
    // ───── СТРАНИЦА 1 ─────
    // Заголовок: «День 3 · Местоимения»
    // Подзаголовок: ...
    // [Таблица] Русский | English | Произношение
    //   я | I | /aɪ/
    //   ...
    // [Плашка 💡 Подсказка] ...
    // [Плашка ⚠️ Ошибка] ...
    // ───── СТРАНИЦА 2 ─────
    // ... примеры предложений с переводом, мини-упражнения (5–8 заданий) и ОТВЕТЫ к ним, чек-лист «Что я теперь умею» (галочки)
```
The PDF must be a self-contained cheat sheet: all rules, all tables/word lists of the day (with translations and transcription where useful), examples, common mistakes, a mini-practice with answers, and a «чек-лист дня». No placeholders like "…" for content — write the real text.

## Lesson header
```js
  {
    day: N,
    title: '...',            // like 'Местоимения: I, you, he, she'
    objective: '...',        // one sentence what the learner will be able to do
    estimatedMinutes: 30,    // 25..45
    // PDF comment block (≥40 lines)
    pdfFile: 'assets/lessons/dayNN.pdf',
    steps: [ ... ],
  },
```

## 30-day plan (topics; follow the handbook content)
1. Алфавит и звуки: 26 букв и их названия, гласные/согласные, долгие и короткие гласные (sit/seat), звуки /θ/ /ð/ /w/ /h/, диктовка имени по буквам.
2. Правила чтения: сочетания sh/ch/th/ph/ck/ng/wh/tion/igh/oo/ee/ea/ow/ou, «магическая e» (cap–cape), слова-исключения (one, two, people, said, friend, want, often, know, you, listen).
3. Местоимения: I/you/he/she/it/we/they, my/your/his/her/its/our/their, I всегда с большой буквы; знакомство «My name is…», «I am…» (без глагола-связки drill пока только как фраза), приветствия Hello/Hi/Good morning.
4. Глагол to be: am/is/are, сокращения (I’m, he’s…), отрицание, вопрос, краткие ответы; частая ошибка «I student»; представиться, национальность, возраст.
5. Артикли a/an/the и множественное число: правила выбора по звуку, когда the/ноль артикля, -s/-es/-ies/-ves, исключения (man–men, child–children…).
6. Числа: 0–10, 11–20, десятки, составные 21–99, 100/1000/million, порядковые, thirteen vs thirty, телефон, цена, возраст.
7. Повторение дней 1–6 (микс).
8. Время и даты: 7 дней, 12 месяцев (заглавные буквы), «What time is it?», o’clock/past/to/quarter/half, части дня (in the morning…), today/tomorrow/yesterday/now, always/usually/often/sometimes/never, как сказать дату.
9. Существительные 1: семья, люди, дом, тело (все слова из гида) + притяжательные my/your + «This is my…».
10. Существительные 2: еда и напитки, город, транспорт, работа и деньги; неисчисляемые (money, water, bread), some/a.
11. Глаголы 1–20 (be, have, do, go, come, get, make, take, see, look, watch, hear, listen, say, tell, speak, know, think, want, need) — значения, различия (see/look/watch, say/tell/speak), короткие фразы.
12. Глаголы 21–40 (like, love, eat, drink, live, work, study, read, write, buy, give, find, help, try, call, ask, wait, open, play, sleep) + связки с предлогами (get up…).
13. Прилагательные: 15 пар антонимов, цвета, чувства, порядок «прилагательное + существительное», прилагательные не меняются.
14. Повторение дней 8–14 (микс).
15. Present Simple: утверждение, формула, -s (works/watches/studies/has), когда используем, слова-маркеры (always…).
16. Present Simple: отрицание don’t/doesn’t, глагол без -s после doesn’t, типичные ошибки.
17. Present Simple: вопросы Do/Does…?, краткие ответы Yes, I do / No, he doesn’t, порядок слов.
18. Вопросительные слова: what/where/when/who/why/how/which/how much/how many/whose; построение с to be и с do/does; полезные вопросы на каждый день (name, from, age, job); спасательные фразы (Sorry? Could you say it again?).
19. Модальные: can/could/must/have to/should/may/might/would like; вежливые просьбы; mustn’t ≠ don’t have to; ошибки (cans, to swim).
20. Повторение дней 15–19 (микс).
21. Past Simple: -ed (правила и произношение /t/ /d/ /ɪd/), was/were, отрицание didn’t, вопросы Did…?, слова-маркеры (yesterday, ago, last…).
22. 30 неправильных глаголов (be, have, do, go, come, get, make, take, see, give, know, think, say, tell, find, buy, eat, drink, write, read, speak, sit, stand, run, sleep, leave, meet, pay, send, lose) — группы по звучанию, практика в предложениях.
23. Будущее: will vs be going to, формулы, won’t, вопросы, маркеры, нельзя will после if/when, ситуации выбора.
24. Диалоги: знакомство и кафе (фразы, заказать, спросить цену, please/you’re welcome/excuse me/sorry), разбор реплик, составление своего диалога.
25. Диалоги: магазин и город (размер, цена, оплата картой, как пройти: turn left/right, go straight, next to, opposite, on the corner, traffic lights).
26. Предлоги: in/on/at (время и место), to/from/with/for/by/about/under/over/between, исключения (at home, go home, by bus, at night).
27. 12 ошибок новичков (из гида) — каждая как мини-урок с тренировкой исправления.
28. Мини-тест (15+ вопросов по всему курсу, формат теста).
29. Повторение слабых мест: микс «лечим ошибки» + свободные тексты на разные времена.
30. Финал: 5 минут речи — рассказ о себе (to be, Present Simple, Past, Future), финальное письмо новому другу, поздравление, что дальше.
