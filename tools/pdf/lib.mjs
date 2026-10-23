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
