/* =====================================================================
   Food Makes Lucy — sketchbook plates.
   Each plate is an open notebook spread drawn as SVG (ink lines run
   through a wobble filter, colour goes down as granulating washes) and
   rasterised by headless Chrome to a 1760×1240 transparent PNG — the
   exact frame the page-curl and loupe in index.html are measured for:
   paper from 5.1% to 94.9% across, 21.8% to 78.2% down.

   node tools/make-plates.mjs            → assets/plates/*.webp
   (needs Python + Pillow for the WebP step: pip install pillow)
   CHROME=/path/to/chrome node tools/…   if Chrome isn't found
   ===================================================================== */
import { writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "assets", "plates");
const TMP = join(ROOT, "tools", ".build");
const W = 1760, H = 1240;
const BOOK = { x0: 90, x1: 1670, y0: 270, y1: 970, gut: 880 };

const INK = "#2b2721", SOFT = "#5a4e42", FAINT = "rgba(43,39,33,.45)";
const C = {
  tomato: "#e8553e", saffron: "#f4a93b", butter: "#f7d774", herb: "#6fa35a",
  sky: "#7cb8c9", plum: "#a8577e", blush: "#f2a7a0", wood: "#c98b55",
  crust: "#9c5a2c", carrot: "#f07f2e", steel: "#9fb0bb", cream: "#f1dcb0",
};

/* ------------------------------------------------------------ helpers */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const wash = (shapes, o = 0.6) =>
  `<g filter="url(#wash)" opacity="${o}" style="mix-blend-mode:multiply">${shapes}</g>`;
const ink = (shapes, w = 2.4, color = INK) =>
  `<g filter="url(#ink)" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${shapes}</g>`;
const text = (x, y, t, { size = 30, font = "Caveat", fill = SOFT, anchor = "start", ls = 0, rot = 0, italic = false } = {}) =>
  `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" fill="${fill}" text-anchor="${anchor}"` +
  (ls ? ` letter-spacing="${ls}"` : "") + (italic ? ` font-style="italic"` : "") +
  (rot ? ` transform="rotate(${rot} ${x} ${y})"` : "") + `>${esc(t)}</text>`;
const hand = (x, y, t, o = {}) => text(x, y, t, { size: 30, ...o });
const caps = (x, y, t, o = {}) =>
  text(x, y, t.toUpperCase(), { font: "Newsreader", size: 15, ls: 3.4, fill: FAINT, ...o });
const serif = (x, y, t, o = {}) => text(x, y, t, { font: "Instrument Serif", size: 36, fill: INK, ...o });

function head(n, cat, title) {
  return caps(150, 338, `Plate ${String(n).padStart(2, "0")} · ${cat}`) +
    serif(148, 398, title, { size: 52 });
}
function stamp(n) {
  return wash(`<rect x="1544" y="852" width="48" height="48" rx="7" fill="${C.tomato}"/>`, 0.85) +
    serif(1568, 889, "L", { size: 36, anchor: "middle", fill: "#fff6ea" }) +
    caps(1592, 932, `No. ${String(n).padStart(2, "0")}`, { anchor: "end", ls: 2, size: 14 });
}

/* ---------------------------------------------------------- the book */
function book(inner) {
  const { x0, x1, y0, y1, gut } = BOOK;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <filter id="ink" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <filter id="wash" x="-20%" y="-20%" width="140%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="3" seed="9" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="24" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feGaussianBlur in="d" stdDeviation="1.4" result="b"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="2" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 1.32" result="ga"/>
    <feComposite in="b" in2="ga" operator="in"/>
  </filter>
  <filter id="tex"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="11"/>
    <feColorMatrix type="matrix" values="0 0 0 0 .42  0 0 0 0 .36  0 0 0 0 .27  .32 0 0 0 -.11"/></filter>
  <filter id="mottle"><feTurbulence type="fractalNoise" baseFrequency="0.006" numOctaves="2" seed="5"/>
    <feColorMatrix type="matrix" values="0 0 0 0 .86  0 0 0 0 .74  0 0 0 0 .55  .22 0 0 0 -.06"/></filter>
  <clipPath id="paper"><rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="30"/></clipPath>
  <linearGradient id="gutter" x1="0" x2="1">
    <stop offset="0" stop-color="#5a4628" stop-opacity="0"/>
    <stop offset=".47" stop-color="#5a4628" stop-opacity=".16"/>
    <stop offset=".5" stop-color="#5a4628" stop-opacity=".30"/>
    <stop offset=".53" stop-color="#5a4628" stop-opacity=".14"/>
    <stop offset="1" stop-color="#5a4628" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="edgeL" x1="0" x2="1"><stop offset="0" stop-color="#5a4628" stop-opacity=".10"/><stop offset="1" stop-color="#5a4628" stop-opacity="0"/></linearGradient>
  <linearGradient id="edgeR" x1="1" x2="0"><stop offset="0" stop-color="#5a4628" stop-opacity=".10"/><stop offset="1" stop-color="#5a4628" stop-opacity="0"/></linearGradient>
</defs>
<rect x="${x0 + 2}" y="${y0 + 5}" width="${x1 - x0 - 4}" height="${y1 - y0}" rx="30" fill="#e3d8c3"/>
<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="30" fill="#faf5ea"/>
<g clip-path="url(#paper)">
  <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" filter="url(#mottle)"/>
  <rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" filter="url(#tex)"/>
  ${inner}
  <rect x="${gut - 70}" y="${y0}" width="140" height="${y1 - y0}" fill="url(#gutter)"/>
  <rect x="${x0}" y="${y0}" width="26" height="${y1 - y0}" fill="url(#edgeL)"/>
  <rect x="${x1 - 26}" y="${y0}" width="26" height="${y1 - y0}" fill="url(#edgeR)"/>
  <line x1="${gut}" y1="${y0}" x2="${gut}" y2="${y1}" stroke="#5a4628" stroke-opacity=".22" stroke-width="1.2"/>
</g>
</svg>`;
}

/* ------------------------------------------------------------- plates */
const r1 = rng(7);

function onion() {
  const layer = (s) => `<path transform="translate(450 680) translate(0 160) scale(${s}) translate(0 -160)"
    d="M0 -210 C90 -160 180 -80 170 20 C160 120 80 170 0 170 C-80 170 -160 120 -170 20 C-180 -80 -90 -160 0 -210 Z"/>`;
  const knife = `M730 440 L730 760 L790 760 L790 610 Q788 505 730 440 Z`;
  let cells = "";
  const cell = (x, y, label, size, body) => {
    cells += hand(x, y + 34, label, { size: 36, fill: INK }) + caps(x + 300, y + 32, size, { anchor: "end", size: 13 }) + body;
  };
  // half-moons
  let moons = "", moonInk = "";
  for (let i = 0; i < 5; i++) {
    const cx = 1010 + i * 48, cy = 520, r = 52, ri = 41;
    const d = `M${cx - r} ${cy} A${r} ${r} 0 0 1 ${cx + r} ${cy} L${cx + ri} ${cy} A${ri} ${ri} 0 0 0 ${cx - ri} ${cy} Z`;
    moons += `<path d="${d}" fill="${C.butter}"/>`; moonInk += `<path d="${d}"/>`;
  }
  cell(950, 330, "half-moons", "~5 mm", wash(moons, 0.7) + ink(moonInk, 1.8));
  // dice
  let dice = "", diceInk = "";
  for (let j = 0; j < 4; j++) for (let i = 0; i < 7; i++) {
    const x = 1300 + i * 38 + r1() * 8, y = 400 + j * 34 + r1() * 8, a = (r1() - 0.5) * 30;
    const sq = `<rect x="${x}" y="${y}" width="22" height="22" rx="3" transform="rotate(${a.toFixed(1)} ${x + 11} ${y + 11})"/>`;
    dice += sq.replace("/>", ` fill="${C.butter}"/>`); diceInk += sq;
  }
  cell(1290, 330, "dice", "~6 mm", wash(dice, 0.65) + ink(diceInk, 1.6));
  // mince
  let mince = "";
  for (let i = 0; i < 140; i++) {
    const a = r1() * Math.PI * 2, rr = Math.sqrt(r1());
    const x = 1110 + Math.cos(a) * 120 * rr, y = 740 + Math.sin(a) * 58 * rr, s = 4 + r1() * 4;
    mince += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${s.toFixed(1)}" height="${s.toFixed(1)}" fill="${C.saffron}"/>`;
  }
  cell(950, 590, "mince", "~2 mm", wash(mince, 0.8) + ink(`<ellipse cx="1110" cy="742" rx="128" ry="64" stroke-dasharray="2 9" stroke-opacity=".35"/>`, 1.4));
  // slivers
  let sliv = "", slivInk = "";
  for (let i = 0; i < 9; i++) {
    const y = 680 + i * 15, x = 1310 + (i % 3) * 14, len = 220 + (i % 4) * 14;
    const d = `M${x} ${y} q${len / 2} ${-26 + (i % 2) * 8} ${len} ${-4 + (i % 3) * 4}`;
    sliv += `<path d="${d}" stroke="${C.butter}" stroke-width="9" fill="none"/>`; slivInk += `<path d="${d}"/>`;
  }
  cell(1290, 590, "slivers", "~3 mm", wash(sliv, 0.75) + ink(slivInk, 1.4));

  return head(1, "Knife work", "The Onion, Four Ways") +
    wash(`<g fill="${C.saffron}">${layer(1)}</g><g fill="#fdf0cc">${layer(0.86)}</g>`, 0.75) +
    ink(`${[1, 0.84, 0.68, 0.52, 0.36, 0.2].map(layer).join("")}
      <path d="M450 470 q6 -26 -4 -48"/><path d="M450 850 q-14 26 -30 34 M452 850 q2 26 -4 40 M456 850 q14 22 30 30"/>`, 2.2) +
    wash(`<path d="${knife}" fill="${C.steel}"/><rect x="734" y="760" width="52" height="145" rx="12" fill="${C.wood}"/>`, 0.6) +
    ink(`<path d="${knife}"/><rect x="734" y="760" width="52" height="145" rx="12"/><circle cx="760" cy="805" r="4"/><circle cx="760" cy="862" r="4"/>`, 2.2) +
    hand(500, 905, "← cut through the root,", { size: 26, rot: -3 }) + hand(522, 936, "it holds it together", { size: 26, rot: -3 }) +
    cells +
    hand(950, 880, "Claw grip, knuckles forward —", { fill: INK }) + hand(950, 915, "and let the knife do the work.", { fill: INK }) +
    stamp(1);
}

function sear() {
  const steak = "M400 640 C430 590 560 585 600 630 C640 675 610 760 540 775 C470 790 390 760 385 705 C382 675 390 655 400 640 Z";
  const handle = "M308 668 L160 650 Q148 650 148 662 L148 690 Q148 702 160 702 L308 712 Z";
  const leaves = [[712, 860], [728, 832], [744, 804], [760, 776], [776, 750]]
    .map(([x, y], i) => `<ellipse cx="${x + (i % 2 ? 14 : -14)}" cy="${y}" rx="13" ry="7" transform="rotate(${i % 2 ? -30 : 30} ${x} ${y})"/>`).join("");
  const curve = "M990 850 C1090 835 1160 610 1260 500 C1282 540 1302 566 1335 562 C1400 552 1450 524 1510 516";
  return head(2, "Heat", "The Sear") +
    wash(`<circle cx="480" cy="690" r="175" fill="#6b6862"/><path d="${handle}" fill="#6b6862"/>`, 0.32) +
    wash(`<path d="${steak}" fill="${C.crust}"/>`, 0.75) +
    wash(`<path d="${steak}" transform="translate(500 690) scale(.72) translate(-500 -690)" fill="${C.saffron}"/>`, 0.45) +
    ink(`<circle cx="480" cy="690" r="175"/><circle cx="480" cy="690" r="150" stroke-opacity=".6"/><path d="${handle}"/>
      <path d="${steak}"/><path d="M430 650 q20 -10 40 -4 M520 620 q24 4 40 16 M440 740 q30 14 60 10 M560 720 q16 -14 20 -34" stroke-width="1.4"/>
      <path d="M400 500 q12 -12 0 -24 q-12 -12 0 -24 M480 490 q12 -12 0 -24 q-12 -12 0 -24 M560 500 q12 -12 0 -24 q-12 -12 0 -24" stroke-width="1.6" stroke-opacity=".7"/>`, 2.2) +
    wash(`<g fill="${C.herb}">${leaves}</g>`, 0.75) + ink(`<path d="M700 885 Q740 820 790 745"/>${leaves}`, 1.5) +
    hand(990, 380, "Don't move it.", { size: 36, fill: INK }) + hand(1190, 380, "It lets go when it's ready.", { size: 30 }) +
    wash(`<rect x="992" y="430" width="528" height="110" fill="${C.saffron}"/>`, 0.4) +
    hand(1005, 466, "maillard zone · 140°C+ · browning = flavour", { size: 25, fill: INK }) +
    ink(`<path d="M990 420 L990 870 L1520 870"/><path d="M1510 862 L1522 870 L1510 878"/>`, 2) +
    ink(`<path d="${curve}" stroke="${C.tomato}"/>`, 3.4, C.tomato) +
    ink(`<path d="M1260 500 L1260 868" stroke-dasharray="3 10"/><circle cx="1260" cy="500" r="6"/><circle cx="1335" cy="562" r="6"/>`, 1.8) +
    hand(1272, 720, "oil shimmers → food in", { size: 26 }) + hand(1345, 604, "temp dips — so preheat!", { size: 26 }) +
    hand(1520, 904, "time", { anchor: "end", size: 26 }) + hand(972, 700, "pan temp", { size: 26, rot: -90, anchor: "middle" }) +
    stamp(2);
}

function vinaigrette() {
  const jar = "M300 495 L540 495 Q556 500 556 520 L556 860 Q556 880 536 880 L314 880 Q294 880 294 860 L294 520 Q294 500 300 495 Z";
  const wires = [-1, -0.5, 0, 0.5, 1].map((k) => `<path d="M700 720 C${700 + k * 80} 660 ${700 + k * 80} 500 700 470"/>`).join("");
  let bubbles = "";
  for (let i = 0; i < 16; i++) bubbles += `<circle cx="${(320 + r1() * 210).toFixed(0)}" cy="${(620 + r1() * 150).toFixed(0)}" r="${(3 + r1() * 6).toFixed(1)}"/>`;
  return head(3, "Emulsion", "Vinaigrette by Ratio") +
    wash(`<path d="${jar}" fill="${C.sky}"/>`, 0.18) +
    wash(`<rect x="298" y="600" width="254" height="180" fill="${C.butter}"/><rect x="298" y="780" width="254" height="96" fill="${C.blush}"/>`, 0.7) +
    wash(`<rect x="280" y="450" width="290" height="44" rx="8" fill="${C.tomato}"/>`, 0.75) +
    ink(`<path d="${jar}"/><rect x="280" y="450" width="290" height="44" rx="8"/><path d="M300 600 L552 600 M300 780 L552 780" stroke-width="1.4"/>
      <path d="M318 470 L548 470" stroke-dasharray="4 14" stroke-width="1.4"/>${bubbles}`, 2.2) +
    `<path d="M322 530 L322 840" stroke="#fff" stroke-opacity=".7" stroke-width="7" stroke-linecap="round"/>` +
    wash(`<rect x="690" y="720" width="20" height="180" rx="10" fill="${C.wood}"/>`, 0.7) +
    ink(`<rect x="690" y="720" width="20" height="180" rx="10"/>${wires}`, 1.8) +
    hand(600, 940, "oil on top, acid below — until you shake it", { size: 24, anchor: "middle" }) +
    caps(960, 400, "The ratio") +
    wash(`<rect x="960" y="430" width="480" height="70" fill="${C.butter}"/><rect x="1440" y="430" width="160" height="70" fill="${C.blush}"/>`, 0.8) +
    ink(`<rect x="960" y="430" width="640" height="70"/><path d="M1440 430 L1440 500"/><path d="M1120 430 L1120 500 M1280 430 L1280 500" stroke-dasharray="3 8" stroke-width="1.3"/>`, 2) +
    hand(1200, 545, "3 parts oil", { anchor: "middle", fill: INK, size: 32 }) + hand(1520, 545, "1 part acid", { anchor: "middle", fill: INK, size: 32 }) +
    hand(960, 630, "+ a spoon of mustard — it's the glue", { size: 32 }) +
    hand(960, 690, "+ salt, then taste. then taste again.", { size: 32 }) +
    hand(960, 750, "+ a little honey if it bites back", { size: 32 }) +
    serif(960, 860, "Taste it on a leaf, not a spoon.", { size: 36, italic: true }) +
    stamp(3);
}

function panSauce() {
  const pan = "M230 720 L640 720 Q632 800 590 812 L280 812 Q238 800 230 720 Z";
  const handle = "M638 722 L812 694 Q824 694 824 706 L824 712 Q824 722 812 724 L640 746 Z";
  const bottle = "M-14 -110 L14 -110 L14 -60 Q40 -40 40 0 L40 170 Q40 180 30 180 L-30 180 Q-40 180 -40 170 L-40 0 Q-40 -40 -14 -60 Z";
  let fond = "";
  for (let i = 0; i < 30; i++) fond += `<circle cx="${(270 + r1() * 340).toFixed(0)}" cy="${(735 + r1() * 60).toFixed(0)}" r="${(2 + r1() * 4).toFixed(1)}"/>`;
  const steps = [["Brown", "sear, lift it out. keep the sticky bits."], ["Deglaze", "splash of wine or stock. scrape!"],
    ["Reduce", "until it coats the back of a spoon."], ["Mount", "off the heat, swirl in cold butter."]];
  const rows = steps.map(([t, n], i) => {
    const y = 400 + i * 120;
    return wash(`<circle cx="975" cy="${y}" r="24" fill="${C.tomato}"/>`, 0.7) + ink(`<circle cx="975" cy="${y}" r="24"/>`, 1.6) +
      serif(975, y + 11, String(i + 1), { size: 30, anchor: "middle" }) + serif(1020, y + 12, t, { size: 38 }) + hand(1022, y + 52, n, { size: 28 });
  }).join("");
  return head(4, "Sauce", "The Pan Sauce") +
    wash(`<path d="${pan}" fill="#6b6862"/><path d="${handle}" fill="#6b6862"/>`, 0.35) +
    wash(`<ellipse cx="435" cy="722" rx="200" ry="20" fill="${C.crust}"/><g fill="${C.crust}">${fond}</g>`, 0.6) +
    ink(`<path d="${pan}"/><path d="${handle}"/><ellipse cx="435" cy="720" rx="205" ry="22" stroke-opacity=".6"/>
      <path d="M330 690 q-15 -25 0 -50 q15 -25 0 -50 M400 680 q-15 -25 0 -50 q15 -25 0 -50" stroke-width="1.6" stroke-opacity=".6"/>`, 2.2) +
    `<g transform="translate(640 520) rotate(-135)">` +
    wash(`<path d="${bottle}" fill="${C.plum}"/>`, 0.6) + wash(`<rect x="-34" y="30" width="68" height="70" fill="#fff6ea"/>`, 0.9) +
    ink(`<path d="${bottle}"/><rect x="-34" y="30" width="68" height="70"/>`, 2) + `</g>` +
    wash(`<path d="M560 600 Q520 640 500 716" stroke="${C.plum}" stroke-width="9" fill="none"/>`, 0.7) +
    hand(250, 880, "that brown stuff on the bottom is called fond.", { size: 26 }) + hand(250, 912, "it is the whole point.", { size: 26 }) +
    rows + hand(990, 905, "pinch of salt, squeeze of lemon. done.", { fill: INK }) +
    stamp(4);
}

function fridge() {
  const egg = (x) => `<ellipse cx="${x}" cy="558" rx="16" ry="21"/>`;
  const carrot = (x, y) => `<path d="M${x} ${y - 10} Q${x + 70} ${y - 8} ${x + 130} ${y} Q${x + 70} ${y + 8} ${x} ${y + 10} Q${x - 8} ${y} ${x} ${y - 10} Z"/>`;
  const greens = [[490, 670], [515, 655], [540, 672], [505, 685], [530, 690]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20"/>`).join("");
  const boxes = [["Pick a base", "rice · noodles · toast · eggs", C.butter], ["Add something fresh", "greens · herbs · citrus", C.herb],
    ["Add something crunchy", "nuts · seeds · crispy shallots", C.saffron], ["Sauce it", "plate 03 — or soy, chilli, lemon", C.blush],
    ["Eat. Then write it down.", "what worked · what didn't · what's next", C.sky]];
  const flow = boxes.map(([t, s, col], i) => {
    const y = 340 + i * 110;
    return wash(`<rect x="960" y="${y}" width="470" height="74" rx="14" fill="${col}"/>`, 0.4) +
      ink(`<rect x="960" y="${y}" width="470" height="74" rx="14"/>` + (i < 4 ? `<path d="M1195 ${y + 78} L1195 ${y + 106} M1187 ${y + 98} L1195 ${y + 107} L1203 ${y + 98}"/>` : ""), 1.8) +
      serif(982, y + 34, t, { size: 30 }) + text(982, y + 60, s, { font: "Newsreader", size: 17, fill: SOFT });
  }).join("");
  return head(5, "Improvisation", "The Fridge Raid") +
    wash(`<rect x="318" y="458" width="284" height="424" fill="${C.sky}"/>`, 0.28) +
    wash(`<path d="M300 446 L200 476 L200 870 L300 896 Z" fill="${C.sky}"/>`, 0.18) +
    wash(`<g fill="#fff3d9">${[350, 386, 422, 458].map(egg).join("")}</g>`, 0.9) +
    wash(`<rect x="500" y="512" width="50" height="66" fill="${C.tomato}"/><path d="M352 698 A30 30 0 0 1 412 698 Z" fill="${C.butter}"/>`, 0.6) +
    wash(`<g fill="${C.herb}">${greens}</g><g fill="${C.carrot}">${carrot(340, 760)}${carrot(350, 782)}</g><rect x="500" y="760" width="70" height="36" fill="${C.butter}"/>`, 0.7) +
    ink(`<rect x="300" y="440" width="320" height="460" rx="16"/><rect x="318" y="458" width="284" height="424" rx="6" stroke-opacity=".6"/>
      <path d="M318 580 L602 580 M318 700 L602 700 M318 800 L602 800"/><path d="M300 446 L200 476 L200 870 L300 896"/>
      <path d="M210 600 L290 590 M210 760 L290 760"/><rect x="225" y="540" width="20" height="56" rx="4"/><rect x="255" y="530" width="22" height="64" rx="4"/>
      ${[350, 386, 422, 458].map(egg).join("")}<rect x="500" y="512" width="50" height="66" rx="4"/><path d="M500 526 L550 526"/>
      <path d="M352 698 A30 30 0 0 1 412 698 Z"/><path d="M382 698 L382 672 M382 698 L362 678 M382 698 L402 678" stroke-width="1.2"/>
      ${greens}${carrot(340, 760)}${carrot(350, 782)}<rect x="500" y="760" width="70" height="36" rx="3"/>
      <rect x="330" y="815" width="260" height="55" rx="6"/><path d="M430 832 L490 832"/>`, 2) +
    hand(648, 470, "tuesday, 8pm.", { size: 28, rot: -4 }) + hand(652, 506, "no plan. let's go.", { size: 28, rot: -4 }) +
    flow + hand(1452, 420, "no recipe", { size: 28, rot: -6 }) + hand(1458, 452, "required.", { size: 28, rot: -6 }) +
    stamp(5);
}

function eggs() {
  const xs = [370, 640, 1120, 1390], cy = 650;
  const shell = (cx) => `M${cx} ${cy - 125} C${cx + 70} ${cy - 125} ${cx + 95} ${cy - 20} ${cx + 95} ${cy + 25} C${cx + 95} ${cy + 90} ${cx + 50} ${cy + 120} ${cx} ${cy + 120} C${cx - 50} ${cy + 120} ${cx - 95} ${cy + 90} ${cx - 95} ${cy + 25} C${cx - 95} ${cy - 20} ${cx - 70} ${cy - 125} ${cx} ${cy - 125} Z`;
  const labels = ["6 min", "7 min", "8 min", "10 min"], notes = ["runny · for toast", "jammy · for ramen", "soft · for salads", "set · for sandwiches"];
  const yolks = [
    `<circle cx="${xs[0]}" cy="${cy + 20}" r="50" fill="#f27a1c"/><path d="M${xs[0] - 12} ${cy + 64} Q${xs[0] - 16} ${cy + 112} ${xs[0] - 4} ${cy + 152} Q${xs[0] + 10} ${cy + 166} ${xs[0] + 18} ${cy + 150} Q${xs[0] + 22} ${cy + 110} ${xs[0] + 16} ${cy + 62} Z" fill="#f27a1c"/>`,
    `<circle cx="${xs[1]}" cy="${cy + 20}" r="50" fill="#f39a2d"/><circle cx="${xs[1]}" cy="${cy + 20}" r="30" fill="#f07b1f"/>`,
    `<circle cx="${xs[2]}" cy="${cy + 20}" r="50" fill="#f6c453"/><circle cx="${xs[2]}" cy="${cy + 20}" r="24" fill="#f39a2d"/>`,
    `<circle cx="${xs[3]}" cy="${cy + 20}" r="50" fill="#f4d675"/>`,
  ];
  return head(6, "Timing", "The Egg Clock") +
    wash(xs.map((x) => `<path d="${shell(x)}" fill="${C.cream}" transform="translate(6 8)"/>`).join(""), 0.35) +
    xs.map((x) => `<path d="${shell(x)}" fill="#fffcf4"/>`).join("") +
    wash(yolks.join(""), 0.85) +
    ink(xs.map((x) => `<path d="${shell(x)}"/><circle cx="${x}" cy="${cy + 20}" r="50" stroke-width="1.4"/>`).join(""), 2.2) +
    xs.map((x, i) => serif(x, 498, labels[i], { size: 44, anchor: "middle" }) + hand(x, 818, notes[i], { anchor: "middle", size: 29 })).join("") +
    ink(`<path d="M250 870 L1500 870 M1488 862 L1500 870 L1488 878"/>${xs.map((x) => `<path d="M${x} 862 L${x} 878"/>`).join("")}`, 1.8) +
    hand(960, 345, "water at a rolling boil first. eggs in. timer on.", { fill: INK }) +
    hand(960, 385, "then straight into ice for 2 minutes.", { fill: INK }) +
    stamp(6);
}

function balance() {
  const cx = 470, cy = 700, R = 190, axes = ["Salt", "Sour", "Sweet", "Bitter", "Umami"];
  const pt = (k, v) => { const a = (-90 + 72 * k) * Math.PI / 180; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
  const poly = (vals) => vals.map((v, k) => pt(k, v).map((n) => n.toFixed(1)).join(",")).join(" ");
  const before = [0.75, 0.2, 0.35, 0.3, 0.55], after = [0.66, 0.66, 0.45, 0.3, 0.72];
  const grid = [0.33, 0.66, 1].map((v) => `<polygon points="${poly([v, v, v, v, v])}" stroke-opacity=".35" stroke-width="1.2"/>`).join("") +
    axes.map((_, k) => { const [x, y] = pt(k, 1); return `<path d="M${cx} ${cy} L${x.toFixed(1)} ${y.toFixed(1)}" stroke-opacity=".3" stroke-width="1.2"/>`; }).join("");
  const lab = axes.map((a, k) => {
    const [x, y] = pt(k, 1.17), anchor = k === 0 ? "middle" : k < 3 ? "start" : "end";
    return serif(x, y + (k === 0 ? 0 : 12), a, { size: 32, anchor });
  }).join("");
  const qs = [["Tastes flat?", "add acid — lemon, vinegar, something pickled."], ["Too sharp?", "soften it with fat, or a pinch of sugar."],
    ["Too salty?", "acid first, then bulk it out."], ["Too heavy?", "something fresh: herbs, leaves, crunch."]];
  const seg = [0, 60, 120, 180, 240, 300].map((a) => { const r = a * Math.PI / 180; return `<path d="M1540 410 L${(1540 + Math.cos(r) * 38).toFixed(1)} ${(410 + Math.sin(r) * 38).toFixed(1)}"/>`; }).join("");
  return head(7, "Seasoning", "Balancing a Dish") +
    ink(grid, 1.4) +
    wash(`<polygon points="${poly(after)}" fill="${C.tomato}"/>`, 0.5) +
    ink(`<polygon points="${poly(before)}" stroke-dasharray="4 9" stroke-opacity=".7"/>`, 2) +
    ink(`<polygon points="${poly(after)}"/>${after.map((v, k) => { const [x, y] = pt(k, v); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${INK}"/>`; }).join("")}`, 2.2) +
    lab +
    ink(`<path d="M600 452 L632 452" stroke-dasharray="4 7"/>`, 2) + hand(642, 460, "first taste", { size: 24 }) +
    wash(`<rect x="600" y="478" width="32" height="18" fill="${C.tomato}"/>`, 0.6) + hand(642, 494, "+ a squeeze of lemon", { size: 24 }) +
    qs.map(([q, a], i) => serif(960, 405 + i * 120, q, { size: 38 }) + hand(962, 447 + i * 120, a, { size: 29 })).join("") +
    wash(`<circle cx="1540" cy="410" r="44" fill="${C.butter}"/>`, 0.85) + ink(`<circle cx="1540" cy="410" r="44"/><circle cx="1540" cy="410" r="38" stroke-width="1.2"/>${seg}`, 1.6) +
    caps(962, 900, "Taste · adjust · taste again", { size: 14 }) +
    stamp(7);
}

function dough() {
  const bowl = "M240 720 L700 720 Q690 860 470 880 Q250 860 240 720 Z";
  const dome = "M300 722 Q330 580 470 575 Q610 580 640 722 Z";
  let flour = "";
  for (let i = 0; i < 70; i++) flour += `<circle cx="${(230 + r1() * 480).toFixed(0)}" cy="${(520 + r1() * 70).toFixed(0)}" r="${(1 + r1() * 2.4).toFixed(1)}"/>`;
  const grains = [0, 1, 2, 3, 4, 5].map((i) => {
    const t = i / 5, x = 790 - t * 40, y = 620 + t * 110;
    return `<ellipse cx="${x - 10}" cy="${y}" rx="7" ry="13" transform="rotate(-30 ${x - 10} ${y})"/><ellipse cx="${x + 10}" cy="${y + 6}" rx="7" ry="13" transform="rotate(10 ${x + 10} ${y + 6})"/>`;
  }).join("");
  const rows = [["Bagel", 58], ["Sandwich loaf", 64], ["Baguette", 68], ["Ciabatta", 78], ["Focaccia", 82]];
  const mix = (a, b, t) => "#" + [0, 2, 4].map((o) => Math.round(parseInt(a.slice(1 + o, 3 + o), 16) * (1 - t) + parseInt(b.slice(1 + o, 3 + o), 16) * t).toString(16).padStart(2, "0")).join("");
  const bars = rows.map(([n, v], i) => {
    const y = 430 + i * 80, w = v * 5;
    return serif(960, y + 30, n, { size: 32 }) +
      wash(`<rect x="1180" y="${y}" width="${w}" height="40" fill="${mix(C.butter, C.sky, i / 4)}"/>`, 0.75) +
      ink(`<rect x="1180" y="${y}" width="${w}" height="40"/>`, 1.8) +
      text(1180 + w + 10, y + 28, v + "%", { font: "Newsreader", size: 19, fill: INK });
  }).join("");
  return head(8, "Baking", "Dough by Hydration") +
    wash(`<path d="${bowl}" fill="${C.sky}"/>`, 0.45) + wash(`<path d="${dome}" fill="${C.cream}"/>`, 0.8) +
    ink(`<path d="${bowl}"/><ellipse cx="470" cy="720" rx="230" ry="22"/><path d="${dome}"/>
      <path d="M380 660 q40 -30 90 -24 M420 700 q50 -24 110 -10" stroke-width="1.4" stroke-opacity=".6"/>`, 2.2) +
    `<g fill="#b9a68a" opacity=".55">${flour}</g>` +
    wash(`<g fill="${C.saffron}">${grains}</g>`, 0.7) + ink(`<path d="M800 600 Q770 760 740 900"/>${grains}`, 1.5) +
    hand(960, 370, "hydration = water ÷ flour", { size: 36, fill: INK }) + bars +
    hand(960, 880, "wetter dough → bigger holes, stickier hands.", { fill: INK }) +
    stamp(8);
}

function carrots() {
  const carrot = (x, y, a, len, burnt) => {
    const d = `M0 -13 Q${len * 0.5} -11 ${len} 0 Q${len * 0.5} 11 0 13 Q-8 0 0 -13 Z`;
    const g = `transform="translate(${x} ${y}) rotate(${a})"`;
    return { fill: `<path ${g} d="${d}" fill="${C.carrot}"/>`, burn: burnt ? `<path ${g} d="M4 -10 Q${len * 0.3} -12 ${len * 0.55} -6 M10 9 Q${len * 0.4} 12 ${len * 0.7} 4" stroke="${C.crust}" stroke-width="8" fill="none"/>` : "", ink: `<path ${g} d="${d}"/><path ${g} d="M${len * 0.3} -9 l4 8 M${len * 0.55} -7 l3 7" stroke-width="1.2"/>` };
  };
  const A = [[240, 590, 8, 190], [250, 660, -4, 200], [235, 730, 6, 185], [250, 800, -2, 195]].map(([x, y, a, l]) => carrot(x, y, a, l, false));
  const B = [[540, 590, -6, 190], [530, 660, 4, 200], [545, 730, -3, 185], [535, 800, 5, 195]].map(([x, y, a, l]) => carrot(x, y, a, l, true));
  const all = [...A, ...B];
  const dots = (x, y, n) => [0, 1, 2, 3, 4].map((i) => `<circle cx="${x + i * 26}" cy="${y}" r="8"${i < n ? ` fill="${C.tomato}" fill-opacity=".8"` : ""}/>`).join("");
  const scores = [["sweetness", 3, 5], ["tenderness", 5, 3], ["char", 2, 4]];
  return head(9, "Experiment", "Roast Carrots, Two Ways") +
    wash(`<rect x="200" y="530" width="600" height="350" rx="14" fill="#6b6862"/>`, 0.22) +
    wash(all.map((c) => c.fill).join(""), 0.75) + wash(all.map((c) => c.burn).join(""), 0.6) +
    ink(`<rect x="200" y="530" width="600" height="350" rx="14"/><rect x="214" y="544" width="572" height="322" rx="8" stroke-opacity=".5"/>
      <path d="M500 548 L500 862" stroke-dasharray="6 10"/>${all.map((c) => c.ink).join("")}`, 2) +
    hand(350, 508, "A · 200°C", { anchor: "middle", size: 34, fill: INK }) + hand(650, 508, "B · 230°C", { anchor: "middle", size: 34, fill: INK }) +
    hand(500, 932, "same tray, same oil, same salt, 30 min", { anchor: "middle", size: 26 }) +
    caps(960, 352, "Hypothesis") + hand(960, 392, "hotter oven = sweeter, darker edges.", { size: 32, fill: INK }) +
    caps(960, 452, "Variable") + hand(960, 492, "oven temperature. nothing else.", { size: 32, fill: INK }) +
    caps(960, 552, "Result") + serif(1205, 590, "A", { size: 28, anchor: "middle" }) + serif(1405, 590, "B", { size: 28, anchor: "middle" }) +
    scores.map(([m, a, b], i) => hand(960, 632 + i * 42, m, { size: 30 }) + ink(dots(1153, 624 + i * 42, a) + dots(1353, 624 + i * 42, b), 1.6)).join("") +
    caps(960, 790, "Next time") + hand(960, 830, "230°C — but cut them thicker.", { size: 32, fill: INK }) +
    stamp(9);
}

/* -------------------------------------------------------------- build */
const PLATES = [
  ["onion", onion], ["sear", sear], ["vinaigrette", vinaigrette], ["pan-sauce", panSauce], ["fridge-raid", fridge],
  ["egg-clock", eggs], ["balance", balance], ["hydration", dough], ["roast-carrots", carrots],
];
const CHROME = process.env.CHROME || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium",
].find(existsSync);
if (!CHROME) throw new Error("Chrome not found — set CHROME=/path/to/chrome");

const fonts = `@font-face{font-family:'Instrument Serif';src:url(../../assets/fonts/instrument-serif.woff2)}
@font-face{font-family:'Instrument Serif';font-style:italic;src:url(../../assets/fonts/instrument-serif-italic.woff2)}
@font-face{font-family:'Newsreader';font-weight:200 600;src:url(../../assets/fonts/newsreader.woff2)}
@font-face{font-family:'Caveat';font-weight:500;src:url(../../assets/fonts/caveat.woff2)}`;

mkdirSync(TMP, { recursive: true });
mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
for (const [name, draw] of PLATES) {
  if (only && only !== name) continue;
  const html = join(TMP, name + ".html");
  writeFileSync(html, `<!doctype html><meta charset="utf-8"><style>${fonts}
html,body{margin:0;background:transparent;overflow:hidden}svg{display:block}</style>${book(draw())}`);
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--default-background-color=00000000", `--window-size=${W},${H}`, "--virtual-time-budget=4000",
    `--screenshot=${join(TMP, name + ".png")}`, pathToFileURL(html).href], { stdio: "ignore" });
  console.log("plate", name);
}
execFileSync(process.env.PYTHON || "python", ["-I", join(ROOT, "tools", "to-webp.py"), TMP, OUT], { stdio: "inherit" });
rmSync(TMP, { recursive: true, force: true });
