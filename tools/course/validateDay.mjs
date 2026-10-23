// Usage: node tools/course/validateDay.mjs <N> [<N> ...]   (or "all")
// Validates tools/course/parts/dayNN.part.js — a JS object literal for one lesson (with trailing comma).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const partsDir = path.join(here, 'parts');
const NO_PDF = new Set([28, 30]);

export async function validateDay(n) {
  const nn = String(n).padStart(2, '0');
  const file = path.join(partsDir, `day${nn}.part.js`);
  const errs = [];
  const warn = [];
  if (!fs.existsSync(file)) return { errs: [`${file} not found`], warn, steps: 0 };
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);

  // ── compile
  const tmp = path.join(partsDir, `_tmp_day${nn}.mjs`);
  fs.writeFileSync(tmp, `const d = [\n${src}\n];\nexport default d;\n`);
  let arr;
  try {
    arr = (await import(pathToFileURL(tmp).href + `?t=${Date.now()}`)).default;
  } catch (e) {
    fs.unlinkSync(tmp);
    return { errs: [`SYNTAX ERROR: ${e.message}`], warn, steps: 0 };
  }
  fs.unlinkSync(tmp);
  if (arr.length !== 1) return { errs: [`file must contain exactly 1 lesson object, got ${arr.length}`], warn, steps: 0 };
  const L = arr[0];

  if (L.day !== n) errs.push(`day must be ${n}, got ${L.day}`);
  if (!L.title || L.title.length < 5) errs.push('title missing');
  if (!L.objective || L.objective.length < 10) errs.push('objective missing');
  if (!(L.estimatedMinutes >= 25 && L.estimatedMinutes <= 45)) errs.push('estimatedMinutes must be 25..45');
  if (NO_PDF.has(n)) {
    if (L.pdfFile) errs.push(`day ${n} must NOT have pdfFile`);
  } else if (L.pdfFile !== `assets/lessons/day${nn}.pdf`) errs.push(`pdfFile must be 'assets/lessons/day${nn}.pdf'`);

  const steps = L.steps ?? [];
  if (steps.length < 15 || steps.length > 20) errs.push(`steps must be 15..20, got ${steps.length}`);
  const cnt = { explain: 0, choice: 0, input: 0, free: 0 };
  const tagRe = /<(?!\/?(?:b|i|u|code)>)/;
  const checkHtml = (label, s) => {
    if (typeof s !== 'string') return;
    if (tagRe.test(s)) errs.push(`${label}: raw "<" (only <b> <i> <u> <code> allowed)`);
    if (/&(?!amp;|lt;|gt;|quot;|#)/.test(s)) errs.push(`${label}: raw "&" — write "and" or &amp;`);
    for (const t of ['b', 'i', 'u', 'code']) {
      const o = (s.match(new RegExp(`<${t}>`, 'g')) || []).length;
      const c = (s.match(new RegExp(`</${t}>`, 'g')) || []).length;
      if (o !== c) errs.push(`${label}: unbalanced <${t}> tags`);
    }
    if (s.length > 1700) errs.push(`${label}: text too long (${s.length} > 1700)`);
  };
  const mediaRe = new RegExp(`^assets/audio/day${nn}_s(\\d{2})_[a-z0-9_]+\\.(mp3|mp4)$`);
  let mediaCount = 0;
  const seenMedia = new Set();

  steps.forEach((s, i) => {
    const num = i + 1;
    const lab = `step ${num}`;
    if (!cnt.hasOwnProperty(s.type)) { errs.push(`${lab}: bad type ${s.type}`); return; }
    cnt[s.type]++;
    for (const f of ['audioFile', 'voiceFile', 'videoNoteFile']) {
      if (s[f] !== undefined) {
        mediaCount++;
        const m = mediaRe.exec(s[f]);
        if (!m) errs.push(`${lab}: ${f} "${s[f]}" must look like assets/audio/day${nn}_sSS_slug.mp3|mp4`);
        else if (Number(m[1]) !== num) errs.push(`${lab}: ${f} has s${m[1]} but this is step ${num}`);
        if (f === 'voiceFile' && !/\.(mp3|ogg)$/.test(s[f])) errs.push(`${lab}: voiceFile must be mp3/ogg`);
        if (f === 'videoNoteFile' && !/\.mp4$/.test(s[f])) errs.push(`${lab}: videoNoteFile must be mp4`);
        if (seenMedia.has(s[f])) errs.push(`${lab}: duplicate media path ${s[f]}`);
        seenMedia.add(s[f]);
      }
    }
    if (s.type === 'explain') {
      if (!s.title) errs.push(`${lab}: explain needs title`);
      if (!s.text || s.text.length < 80) errs.push(`${lab}: explain text too short`);
      checkHtml(`${lab} title`, s.title); checkHtml(`${lab} text`, s.text);
      if (s.examples) {
        for (const e of s.examples) { if (!e.english || !e.russian) errs.push(`${lab}: bad example`); checkHtml(`${lab} example`, e.english + e.russian); }
      }
    } else if (s.type === 'choice') {
      checkHtml(`${lab} question`, s.question); checkHtml(`${lab} explanation`, s.explanation);
      if (!Array.isArray(s.options) || s.options.length < 3 || s.options.length > 4) errs.push(`${lab}: options must be 3..4`);
      else {
        if (new Set(s.options).size !== s.options.length) errs.push(`${lab}: duplicate options`);
        if (!(Number.isInteger(s.correctIndex) && s.correctIndex >= 0 && s.correctIndex < s.options.length)) errs.push(`${lab}: correctIndex out of range`);
        s.options.forEach((o) => { if (!o || o.length > 40) errs.push(`${lab}: option "${o}" empty or >40 chars`); });
      }
      if (!s.hint || s.hint.length > 120) errs.push(`${lab}: hint missing or >120 chars`);
      if (!s.explanation || s.explanation.length < 15) errs.push(`${lab}: explanation too short`);
    } else if (s.type === 'input') {
      checkHtml(`${lab} question`, s.question); checkHtml(`${lab} explanation`, s.explanation);
      if (!Array.isArray(s.answerKey) || !s.answerKey.length) errs.push(`${lab}: answerKey empty`);
      else s.answerKey.forEach((k) => {
        if (k !== k.toLowerCase()) errs.push(`${lab}: answerKey "${k}" must be lowercase`);
        if (k !== k.trim() || /\s{2,}/.test(k)) errs.push(`${lab}: answerKey "${k}" has extra spaces`);
        if (/[.,!?;:]$/.test(k)) errs.push(`${lab}: answerKey "${k}" must not end with punctuation`);
        if (k.includes("'") && !s.answerKey.includes(k.replace(/'/g, '\u2019'))) errs.push(`${lab}: answerKey "${k}" has ' but no curly-apostrophe twin (’)`);
      });
      if (s.matchMode && !['exact', 'startsWith'].includes(s.matchMode)) errs.push(`${lab}: bad matchMode`);
      if (!s.hint || s.hint.length > 120) errs.push(`${lab}: hint missing or >120 chars`);
      if (!s.explanation || s.explanation.length < 15) errs.push(`${lab}: explanation too short`);
    } else if (s.type === 'free') {
      checkHtml(`${lab} question`, s.question); checkHtml(`${lab} tip`, s.tip);
      if (!s.exampleAnswer || !s.tip) errs.push(`${lab}: free needs exampleAnswer and tip`);
    }
    if (s.type !== 'explain' && (!s.question || s.question.length < 10)) errs.push(`${lab}: question missing`);
  });

  if (steps[0]?.type !== 'explain') errs.push('first step must be explain');
  if (steps.length && steps[steps.length - 1].type !== 'explain') errs.push('last step must be explain (recap "Итоги дня")');
  if (cnt.explain < 4) errs.push(`need >=4 explain, got ${cnt.explain}`);
  if (cnt.choice < 4) errs.push(`need >=4 choice, got ${cnt.choice}`);
  if (cnt.input < 3) errs.push(`need >=3 input, got ${cnt.input}`);
  if (cnt.free < 1) errs.push('need >=1 free');
  const cis = steps.filter((s) => s.type === 'choice').map((s) => s.correctIndex);
  if (cis.length >= 4 && new Set(cis).size < 3) errs.push(`correctIndex not varied enough: ${cis.join(',')}`);
  if (mediaCount < 5) errs.push(`need >=5 media fields (audioFile/voiceFile/videoNoteFile) per day, got ${mediaCount}`);
  if (mediaCount > 14) warn.push(`many media (${mediaCount}) — fine but check workload`);

  // ── comment checks (source-based)
  lines.forEach((ln, idx) => {
    if (/^\s*(audioFile|voiceFile|videoNoteFile):/.test(ln)) {
      let ok = false;
      for (let k = idx - 1; k >= Math.max(0, idx - 14); k--) {
        if (/^\s*\/\/.*ВСТАВИТЬ/.test(lines[k])) { ok = true; break; }
        if (!/^\s*\/\//.test(lines[k])) break;
      }
      if (!ok) errs.push(`line ${idx + 1}: media field without a "// ... ВСТАВИТЬ ..." comment block directly above`);
    }
    if (/^\s*pdfFile:/.test(ln)) {
      let c = 0, hasText = false;
      for (let k = idx - 1; k >= 0 && /^\s*\/\//.test(lines[k]); k--) { c++; if (/ВСТАВИТЬ/.test(lines[k])) hasText = true; }
      if (c < 40) errs.push(`line ${idx + 1}: PDF comment block above pdfFile has only ${c} lines, need >= 40 (full PDF text)`);
      if (!hasText) errs.push(`line ${idx + 1}: PDF comment must contain "ВСТАВИТЬ"`);
    }
  });
  // media comment must have TEXT lines
  const mediaComments = src.match(/\/\/[^\n]*ВСТАВИТЬ[^\n]*/g) || [];
  if (mediaComments.length < mediaCount) warn.push(`ВСТАВИТЬ comments (${mediaComments.length}) < media fields + pdf (${mediaCount}+1)`);
  return { errs, warn, steps: steps.length, cnt, mediaCount };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let args = process.argv.slice(2);
  if (args[0] === 'all') args = Array.from({ length: 30 }, (_, i) => String(i + 1));
  let bad = 0;
  for (const a of args) {
    const r = await validateDay(Number(a));
    const head = `Day ${a}: steps=${r.steps} media=${r.mediaCount ?? '-'} ${r.cnt ? JSON.stringify(r.cnt) : ''}`;
    if (r.errs.length) { bad++; console.log(`❌ ${head}`); r.errs.forEach((e) => console.log('   - ' + e)); }
    else console.log(`✅ ${head}`);
    r.warn.forEach((w) => console.log('   ! ' + w));
  }
  process.exit(bad ? 1 : 0);
}
