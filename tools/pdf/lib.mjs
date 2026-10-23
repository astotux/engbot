// Small HTML helpers for the handbook
export const esc = (s) => String(s);

export const page = (section, body) => ({ section, body });

export const head = (chip, title, lead) =>
  `<span class="chip">${chip}</span><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}`;

export const tip = (icon, title, text, kind = '') =>
  `<div class="tip ${kind}"><div class="ic">${icon}</div><div><b>${title}</b>${text}</div></div>`;

export const card = (title, body, kind = '') =>
  `<div class="card ${kind}"><h4>${title}</h4>${body}</div>`;

export const grid = (cols, items) => `<div class="grid g${cols}">${items.join('')}</div>`;

export const formula = (html) => `<div class="formula">${html}</div>`;

/** rows: array of arrays; cells in column 0 get class "en" if firstEn */
export const table = (heads, rows, firstEn = true) =>
  `<table><thead><tr>${heads.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
    .map(
      (r) =>
        `<tr>${r
          .map((c, i) => `<td${i === 0 && firstEn ? ' class="en"' : ''}>${c}</td>`)
          .join('')}</tr>`
    )
    .join('')}</tbody></table>`;

/** words: [en, ru] pairs -> two-column list */
export const words = (list) =>
  `<div class="wordlist">${list
    .map(([en, ru]) => `<div class="wl"><b>${en}</b><span>${ru}</span></div>`)
    .join('')}</div>`;

/** lines: [side('l'|'r'), en, ru] */
export const dialog = (nameL, nameR, lines) =>
  `<div class="dlg">${lines
    .map(
      ([s, en, ru]) =>
        `<div class="b ${s}"><div class="who">${s === 'l' ? nameL : nameR}</div>${en}<small>${ru}</small></div>`
    )
    .join('')}</div>`;

export const steps = (list) =>
  `<div class="steps">${list
    .map((t, i) => `<div class="s"><span class="num">${i + 1}</span><div>${t}</div></div>`)
    .join('')}</div>`;

export const checklist = (items, nextNote = '') =>
  `<div class="card indigo" style="margin-top:2.5mm"><h4>☑️ Чек-лист дня — отметь, что освоил(а):</h4><div class="grid g2" style="gap:1.5mm 4mm;margin-top:1.5mm">${items
    .map((it) => `<div style="display:flex;align-items:center;gap:2mm;font-size:9.2pt"><span class="cb"></span><span>${it}</span></div>`)
    .join('')}</div>${nextNote ? `<div class="small" style="margin-top:2mm;padding-top:1.5mm;border-top:1px dashed #c7d2fe;color:var(--indigo-d)">➡️ <b>Дальше:</b> ${nextNote}</div>` : ''}</div>`;

export const practice = (tasks, answers) =>
  `<h2>✍️ Мини-практика</h2><div class="grid g2" style="gap:2mm">${tasks
    .map(
      (q, i) =>
        `<div class="card w" style="display:flex;gap:2mm;align-items:flex-start;padding:1.8mm 2.8mm"><span class="num" style="width:5.2mm;height:5.2mm;font-size:8pt">${i + 1}</span><div style="flex:1;font-size:9.1pt">${q}</div></div>`
    )
    .join('')}</div><div class="card mint" style="margin-top:2mm;padding:2mm 3.2mm;font-size:8.9pt"><b>✅ Ответы:</b> ${answers}</div>`;

