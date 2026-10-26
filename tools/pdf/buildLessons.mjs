// Usage: node tools/pdf/buildLessons.mjs <day|all> [more days...]
// Builds assets/lessons/dayNN.pdf from tools/pdf/lessons/dayNN.mjs and checks for page overflow.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { css } from './styles.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const lessonsDir = path.join(here, 'lessons');
const outDir = path.join(root, 'assets', 'lessons');
fs.mkdirSync(lessonsDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });

const candidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const browser = candidates.find((c) => fs.existsSync(c));
if (!browser) throw new Error('Chrome/Edge not found');

export async function buildDayPdf(dayNum) {
  const nn = String(dayNum).padStart(2, '0');
  const modPath = path.join(lessonsDir, `day${nn}.mjs`);
  if (!fs.existsSync(modPath)) {
    return { ok: false, err: `Missing ${modPath}` };
  }
  const mod = await import(pathToFileURL(modPath).href + `?t=${Date.now()}`);
  const { day, title, pages } = mod.default ?? mod;
  if (day !== dayNum) return { ok: false, err: `day mismatch: expected ${dayNum}, got ${day}` };
  if (!Array.isArray(pages) || pages.length < 2 || pages.length > 3) {
    return { ok: false, err: `pages must have 2..3 items, got ${pages?.length}` };
  }

  const total = pages.length;
  const html = pages
    .map((body, i) => {
      const n = i + 1;
      return `<section class="page"><div class="hdr"><span><b>ENGLISH zero</b> · Конспект урока · День ${day}</span><span>${title}</span></div><div class="body">${body}</div><div class="ftr"><span>@engl_zero · Английский с нуля за 30 дней</span><span class="pn">${n} / ${total}</span></div></section>`;
    })
    .join('\n');

  const checker = `<pre id="rep" style="display:none"></pre><script>
window.addEventListener('load',()=>{const mm=3.7795;const bad=[];
document.querySelectorAll('.page').forEach((pg,i)=>{const b=pg.querySelector('.body');if(!b)return;
const bottom=b.getBoundingClientRect().bottom-pg.getBoundingClientRect().top;
if(bottom>(297-15)*mm)bad.push('p'+(i+1)+':+'+Math.round(bottom/mm-282)+'mm');});
document.getElementById('rep').textContent='OVERFLOW='+bad.join(',')+';END';});
</script>`;

  const tmpHtml = path.join(lessonsDir, `_tmp_day${nn}.html`);
  const outPdf = path.join(outDir, `day${nn}.pdf`);
  const doc = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>День ${day} — ${title}</title><style>${css}</style></head><body>${html}${checker}</body></html>`;
  fs.writeFileSync(tmpHtml, doc, 'utf-8');

  const url = 'file:///' + tmpHtml.replace(/\\/g, '/');
  let overflow = 'unknown';
  try {
    const dom = execFileSync(browser, ['--headless=new', '--disable-gpu', '--dump-dom', '--virtual-time-budget=3000', url], {
      encoding: 'utf-8',
      maxBuffer: 32 * 1024 * 1024,
    });
    const m = dom.match(/OVERFLOW=([^;]*);END/);
    overflow = m ? m[1] || 'none' : 'unknown';

    execFileSync(browser, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${outPdf}`, url], {
      stdio: 'ignore',
    });
  } finally {
    if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);
  }

  const buf = fs.readFileSync(outPdf);
  const pdfPages = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  const sizeKb = Math.round(buf.length / 1024);
  const ok = overflow === 'none' && pdfPages === total && sizeKb > 10;
  return {
    ok,
    day: dayNum,
    pdfPages,
    expectedPages: total,
    overflow,
    sizeKb,
    err: ok ? null : `overflow=${overflow}, pdfPages=${pdfPages}/${total}, sizeKb=${sizeKb}`,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let args = process.argv.slice(2);
  if (args[0] === 'all') args = Array.from({ length: 30 }, (_, i) => String(i + 1));
  let bad = 0;
  for (const a of args) {
    const r = await buildDayPdf(Number(a));
    const nn = String(a).padStart(2, '0');
    if (r.ok) {
      console.log(`✅ day${nn}.pdf: ${r.pdfPages} pages, ${r.sizeKb} KB, overflow=none`);
    } else {
      bad++;
      console.log(`❌ day${nn}.pdf: ${r.err}`);
    }
  }
  process.exit(bad ? 1 : 0);
}
