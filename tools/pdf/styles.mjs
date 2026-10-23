export const css = `
@page { size: A4 portrait; margin: 0; }
:root {
  --ink:#1b1b3a; --muted:#6b6f8d; --line:#e6e8f5; --bg:#f6f7fd;
  --indigo:#4f46e5; --indigo-d:#3730a3; --indigo-l:#eef0ff;
  --amber:#f59e0b; --amber-l:#fff6e0;
  --mint:#10b981; --mint-l:#e3f8f0;
  --rose:#f43f5e; --rose-l:#ffe8ec;
  --sky:#0ea5e9; --sky-l:#e2f4fd;
}
* { box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
html,body { margin:0; padding:0; font-family:'Segoe UI','Inter',Arial,sans-serif; color:var(--ink); font-size:9.6pt; line-height:1.38; }
.page { width:210mm; height:297mm; position:relative; overflow:hidden; page-break-after:always; break-after:page; background:#fff; padding:12mm 15mm 16mm; }
.page:last-child { page-break-after:auto; break-after:auto; }
.hdr { display:flex; justify-content:space-between; align-items:center; font-size:8pt; letter-spacing:.12em; text-transform:uppercase; color:var(--muted); border-bottom:1px solid var(--line); padding-bottom:3mm; margin-bottom:4mm; }
.hdr b { color:var(--indigo); }
.ftr { position:absolute; left:16mm; right:16mm; bottom:8mm; display:flex; justify-content:space-between; font-size:8pt; color:var(--muted); }
.ftr .pn { background:var(--indigo); color:#fff; border-radius:10px; padding:1px 9px; font-weight:700; }
.chip { display:inline-block; background:var(--indigo-l); color:var(--indigo); font-weight:700; font-size:8.5pt; letter-spacing:.1em; text-transform:uppercase; padding:3px 11px; border-radius:20px; }
h1 { font-size:22pt; line-height:1.1; margin:3mm 0 2mm; letter-spacing:-.02em; }
h1 em { font-style:normal; color:var(--indigo); }
h2 { font-size:12pt; margin:3.5mm 0 2mm; display:flex; align-items:center; gap:7px; }
h2::before { content:''; width:5px; height:15px; border-radius:3px; background:var(--indigo); display:inline-block; }
h3 { font-size:11pt; margin:3mm 0 1.5mm; color:var(--indigo-d); }
p { margin:0 0 2.5mm; }
.lead { font-size:10.5pt; color:var(--muted); margin-bottom:3mm; }
.grid { display:grid; gap:3.5mm; }
.g2 { grid-template-columns:1fr 1fr; } .g3 { grid-template-columns:1fr 1fr 1fr; } .g4 { grid-template-columns:repeat(4,1fr); }
.card { background:var(--bg); border:1px solid var(--line); border-radius:12px; padding:2.6mm 3.5mm; }
.card.w { background:#fff; }
.card h4 { margin:0 0 1.5mm; font-size:10.5pt; }
.card.indigo { background:var(--indigo-l); border-color:#d9dcff; }
.card.amber { background:var(--amber-l); border-color:#fde7b0; }
.card.mint { background:var(--mint-l); border-color:#b8ecd9; }
.card.rose { background:var(--rose-l); border-color:#ffc9d2; }
.card.sky { background:var(--sky-l); border-color:#bde6f8; }
.tip { display:flex; gap:3mm; border-radius:12px; padding:3mm 4mm; margin:2.5mm 0; border-left:5px solid var(--amber); background:var(--amber-l); }
.tip.good { border-color:var(--mint); background:var(--mint-l); }
.tip.bad { border-color:var(--rose); background:var(--rose-l); }
.tip.info { border-color:var(--indigo); background:var(--indigo-l); }
.tip .ic { font-size:15pt; line-height:1.1; }
.tip > div:last-child { flex:1; } .tip .ic { flex:none; width:7mm; font-family:'Segoe UI Emoji','Noto Color Emoji',sans-serif; } .tip > div:last-child > b:first-child { display:block; margin-bottom:.5mm; }
table { width:100%; border-collapse:separate; border-spacing:0; border:1px solid var(--line); border-radius:10px; overflow:hidden; margin:2mm 0 3mm; font-size:9.2pt; }
th { background:var(--indigo); color:#fff; text-align:left; padding:1.4mm 3mm; font-size:8.8pt; letter-spacing:.05em; text-transform:uppercase; }
td { padding:0.9mm 3mm; border-top:1px solid var(--line); vertical-align:top; }
tr:nth-child(even) td { background:#fafaff; }
td.en, .en { font-weight:700; color:var(--indigo-d); }
.tr { color:var(--muted); }
.ipa { color:var(--sky); font-family:'Segoe UI',Arial,sans-serif; font-size:9pt; }
.ex { color:var(--muted); font-style:italic; }
.formula { background:var(--ink); color:#fff; border-radius:12px; padding:3.5mm 5mm; font-size:12pt; font-weight:700; text-align:center; margin:2.5mm 0; letter-spacing:.01em; }
.formula span { color:#fbbf24; } .formula i { color:#6ee7b7; font-style:normal; }
.pill { display:inline-block; padding:1px 8px; border-radius:12px; font-size:8.5pt; font-weight:700; margin:0 2px 1px 0; }
.pill.i { background:var(--indigo-l); color:var(--indigo); } .pill.m { background:var(--mint-l); color:#047857; }
.pill.a { background:var(--amber-l); color:#b45309; } .pill.r { background:var(--rose-l); color:#be123c; } .pill.s { background:var(--sky-l); color:#0369a1; }
.dlg { display:flex; flex-direction:column; gap:2.2mm; margin:2mm 0 3.5mm; }
.b { max-width:84%; padding:1.8mm 3.6mm; border-radius:14px; font-size:10pt; line-height:1.35; }
.b small { display:inline; color:var(--muted); font-size:8.6pt; }
.b small::before { content:' — '; }
.b.l { background:var(--indigo-l); border-bottom-left-radius:4px; align-self:flex-start; }
.b.r { background:var(--mint-l); border-bottom-right-radius:4px; align-self:flex-end; }
.who { display:inline; margin-right:2mm; font-size:7pt; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--muted); }
.bad-t { color:var(--rose); text-decoration:line-through; } .good-t { color:#047857; font-weight:700; }
.num { display:inline-flex; width:6.5mm; height:6.5mm; border-radius:50%; background:var(--indigo); color:#fff; font-weight:700; font-size:9pt; align-items:center; justify-content:center; margin-right:2mm; flex:none; }
.steps div.s { display:flex; align-items:flex-start; margin-bottom:2.2mm; }
.cols2 { column-count:2; column-gap:6mm; }
.cols2 > * { break-inside:avoid; }
.wordlist { display:grid; grid-template-columns:1fr 1fr; gap:0 6mm; }
.wl { display:flex; justify-content:space-between; border-bottom:1px dashed var(--line); padding:0.7mm 0; font-size:9.4pt; }
.wl b { color:var(--indigo-d); } .wl span { color:var(--muted); }
.small { font-size:9pt; color:var(--muted); }
.cb { display:inline-block; width:4mm; height:4mm; border:1.5px solid var(--indigo); border-radius:1.2mm; vertical-align:middle; }
.cover { background:linear-gradient(155deg,#1e1b4b 0%,#3730a3 55%,#6366f1 100%); color:#fff; padding:0; }
.cover .blob { position:absolute; border-radius:50%; }
.sec { background:linear-gradient(155deg,#1e1b4b 0%,#4f46e5 100%); color:#fff; padding:0; }
`;
