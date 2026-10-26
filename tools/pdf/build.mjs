import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { css } from './styles.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const outPdf = path.join(root, 'assets', 'free-checklist.pdf');
const tmpHtml = path.join(here, '_handbook.html');

const parts = ['part1', 'part2', 'part3', 'part4', 'part5', 'part6'];
const pages = [];
for (const p of parts) {
  if (!fs.existsSync(path.join(here, `${p}.mjs`))) continue;
  const mod = await import(`./${p}.mjs`);
  pages.push(...mod.pages);
}

const total = pages.length;
const html = pages
  .map((pg, i) => {
    const n = i + 1;
    if (pg.cls) return `<section class="page ${pg.cls}">${pg.body}</section>`;
    return `<section class="page"><div class="hdr"><span><b>ENGLISH zero</b> · Английский с нуля</span><span>${pg.section}</span></div><div class="body">${pg.body}</div><div class="ftr"><span>@engl_zero · учи английский каждый день</span><span class="pn">${n} / ${total}</span></div></section>`;
  })
  .join('\n');

const checker = `<pre id="rep" style="display:none"></pre><script>
(function(){var h=location.hash.slice(1);if(h){document.querySelectorAll('.page').forEach(function(p,i){if(String(i+1)!==h)p.style.display='none';});}})();
window.addEventListener('load',()=>{const mm=3.7795;const bad=[];
document.querySelectorAll('.page').forEach((pg,i)=>{const b=pg.querySelector('.body');if(!b)return;
const bottom=b.getBoundingClientRect().bottom-pg.getBoundingClientRect().top;
if(bottom>(297-15)*mm)bad.push((i+1)+':'+Math.round(bottom/mm-282)+'mm');});
document.getElementById('rep').textContent='OVERFLOW='+bad.join(',')+';END';});
</script>`;

const doc = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Английский с нуля</title><style>${css}</style></head><body>${html}${checker}</body></html>`;
fs.writeFileSync(tmpHtml, doc, 'utf-8');

const candidates = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];
const browser = candidates.find((c) => fs.existsSync(c));
if (!browser) throw new Error('Chrome/Edge not found');
const url = 'file:///' + tmpHtml.replace(/\\/g, '/');

const dom = execFileSync(browser, ['--headless=new', '--disable-gpu', '--dump-dom', '--virtual-time-budget=4000', url], {
  encoding: 'utf-8',
  maxBuffer: 64 * 1024 * 1024,
});
const m = dom.match(/OVERFLOW=([^;]*);END/);
console.log('Pages:', total, '| overflow:', m ? m[1] || 'none' : 'unknown');

execFileSync(browser, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${outPdf}`, url], { stdio: 'ignore' });
const buf = fs.readFileSync(outPdf);
const count = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log('PDF pages:', count, '| size KB:', Math.round(buf.length / 1024));
