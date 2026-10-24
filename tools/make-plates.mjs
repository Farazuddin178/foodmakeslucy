/* =====================================================================
   Lucy Makes Food — sketchbook plates.
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
/* Each plate is built from one of Lucy's shorts.  Where her description
   carries the recipe, the right-hand page is hers ("Her recipe"); the
   others are labelled as the general method. */
const r1 = rng(7);

function numbered(rows, y0, gap) {
  return rows.map(([t, ...lines], i) => {
    const y = y0 + i * gap;
    return wash(`<circle cx="975" cy="${y}" r="24" fill="${C.tomato}"/>`, 0.7) + ink(`<circle cx="975" cy="${y}" r="24"/>`, 1.6) +
      serif(975, y + 11, String(i + 1), { size: 30, anchor: "middle" }) + serif(1020, y + 12, t, { size: 36 }) +
      lines.map((l, k) => hand(1022, y + 48 + k * 32, l, { size: 28 })).join("");
  }).join("");
}

function cheezits() {
  let fill = "", lines = "";
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const x = 200 + c * 100 + (r1() - 0.5) * 8, y = 462 + r * 100 + (r1() - 0.5) * 8, a = ((r1() - 0.5) * 10).toFixed(1);
    const sq = `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="78" height="78" rx="9" transform="rotate(${a} ${x + 39} ${y + 39})"/>`;
    fill += sq.replace("/>", ` fill="#f2922b"/>`);
    lines += sq + `<circle cx="${(x + 39).toFixed(1)}" cy="${(y + 39).toFixed(1)}" r="3.5" fill="${INK}"/>`;
  }
  const top = "M650 770 L800 730 L830 770 L680 810 Z", front = "M650 770 L680 810 L680 890 L650 850 Z", side = "M680 810 L830 770 L830 850 L680 890 Z";
  const items = ["8 oz sharp cheddar", "4 tbsp cold unsalted butter", "½ tsp salt", "120 g (1 cup) all-purpose flour", "2 tbsp cold water"];
  return head(1, "Made from scratch", "Homemade Cheez-Its") +
    wash(fill, 0.75) + ink(lines, 1.8) +
    wash(`<path d="${top}" fill="${C.butter}"/><path d="${front}" fill="${C.saffron}"/><path d="${side}" fill="${C.saffron}"/>`, 0.75) +
    ink(`<path d="${top}"/><path d="${front}"/><path d="${side}"/>`, 2) +
    hand(640, 680, "a hole in each one —", { size: 25, rot: -4 }) + hand(652, 710, "it stops them puffing", { size: 25, rot: -4 }) +
    caps(960, 352, "Her recipe") +
    items.map((t, i) => ink(`<rect x="962" y="${384 + i * 54}" width="18" height="18" rx="3"/>`, 1.6) + hand(996, 401 + i * 54, t, { size: 32, fill: INK })).join("") +
    serif(960, 712, "350°F · 15–18 minutes", { size: 40 }) + hand(962, 756, "until deep golden brown.", { size: 30 }) +
    hand(960, 890, "cold butter, cold water, cut small.", { fill: C.tomato, size: 30 }) +
    stamp(1);
}

function colaChicken() {
  const wok = "M220 700 Q470 900 720 700 Z";
  const wing = (x, y, a) => `<path transform="translate(${x} ${y}) rotate(${a})" d="M-48 -8 C-40 -26 -6 -24 6 -14 C20 -26 46 -22 50 -4 C54 14 30 22 8 14 C-6 24 -44 22 -48 -8 Z"/>`;
  const wings = [[360, 735, -8], [470, 752, 6], [580, 735, -4], [420, 712, 12], [530, 712, -10]].map((w) => wing(...w)).join("");
  let sesame = "";
  for (let i = 0; i < 26; i++) sesame += `<ellipse cx="${(330 + r1() * 290).toFixed(0)}" cy="${(700 + r1() * 70).toFixed(0)}" rx="3" ry="1.6" transform="rotate(${(r1() * 180).toFixed(0)})" />`;
  const bottle = "M790 430 L790 470 Q770 490 772 530 Q760 560 770 600 L772 640 L828 640 L830 600 Q840 560 828 530 Q830 490 810 470 L810 430 Z";
  return head(2, "Made from scratch", "Coca-Cola Chicken") +
    wash(`<path d="${wok}" fill="#6b6862"/>`, 0.3) + wash(`<g fill="${C.crust}">${wings}</g>`, 0.8) +
    wash(`<path d="${bottle}" fill="#5a2f1c"/>`, 0.6) + wash(`<rect x="768" y="560" width="66" height="26" fill="${C.tomato}"/>`, 0.85) +
    ink(`<path d="${wok}"/><path d="M205 700 L735 700"/><path d="M722 702 L830 690" stroke-width="9"/>${wings}
      <path d="${bottle}"/><rect x="768" y="560" width="66" height="26"/>
      <path d="M380 660 q-14 -24 0 -48 q14 -24 0 -48 M470 650 q-14 -24 0 -48 q14 -24 0 -48 M560 660 q-14 -24 0 -48 q14 -24 0 -48" stroke-width="1.6" stroke-opacity=".6"/>`, 2.2) +
    `<g fill="#fff8ec" stroke="${INK}" stroke-width=".8">${sesame}</g>` +
    hand(240, 900, "1.5 lb wings · 1 cup cola · ¼ cup light soy", { size: 26 }) +
    hand(240, 932, "1 tbsp dark soy · 6 slices ginger · 2 green onions", { size: 26 }) +
    caps(960, 352, "Her recipe") +
    numbered([["Score + blanch", "two cuts a side; boil 2–3 min with ginger + wine"], ["Sear", "a little oil, medium-high, until lightly brown"],
      ["Braise", "cola, both soys, ginger, onion — LOW, lid on,", "30 to 40 minutes"], ["Reduce", "lid off, heat up, until the sauce clings"]], 400, 126) +
    hand(960, 905, "keep it low — the sugar burns fast.", { fill: C.tomato, size: 30 }) +
    stamp(2);
}

function yogurt() {
  const jar = "M300 515 L540 515 Q556 520 556 540 L556 860 Q556 880 536 880 L314 880 Q294 880 294 860 L294 540 Q294 520 300 515 Z";
  const cx = 1250, cy = 650, R = 150;
  const node = (a) => [cx + Math.cos(a * Math.PI / 180) * R, cy + Math.sin(a * Math.PI / 180) * R];
  const arrow = (a) => { const [x, y] = node(a), t = a + 90, r = (t * Math.PI) / 180, b = (d) => (d * Math.PI) / 180;
    return `<path d="M${(x - Math.cos(r + b(30)) * 14).toFixed(1)} ${(y - Math.sin(r + b(30)) * 14).toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)} L${(x - Math.cos(r - b(30)) * 14).toFixed(1)} ${(y - Math.sin(r - b(30)) * 14).toFixed(1)}"/>`; };
  const dots = [-90, 0, 90, 180].map((a) => { const [x, y] = node(a); return `<circle cx="${x}" cy="${y}" r="13"/>`; }).join("");
  return head(3, "Made from scratch", "The Infinite Yogurt Glitch") +
    wash(`<path d="${jar}" fill="${C.sky}"/>`, 0.16) + wash(`<rect x="298" y="610" width="254" height="266" fill="#fbf3dd"/>`, 0.9) +
    wash(`<rect x="280" y="470" width="290" height="44" rx="8" fill="${C.sky}"/>`, 0.6) +
    ink(`<path d="${jar}"/><rect x="280" y="470" width="290" height="44" rx="8"/><path d="M300 612 Q360 596 420 612 T552 610" stroke-width="1.5"/>
      <path d="M470 600 L520 420" stroke-width="7"/><ellipse cx="462" cy="628" rx="26" ry="12"/>`, 2.2) +
    `<path d="M322 550 L322 840" stroke="#fff" stroke-opacity=".7" stroke-width="7" stroke-linecap="round"/>` +
    wash(`<rect x="712" y="560" width="22" height="280" rx="11" fill="#fff"/><circle cx="723" cy="852" r="22" fill="${C.tomato}"/><rect x="716" y="700" width="14" height="150" fill="${C.tomato}"/>`, 0.8) +
    ink(`<rect x="712" y="540" width="22" height="300" rx="11"/><circle cx="723" cy="852" r="22"/><path d="M734 700 L752 700 M734 640 L746 640 M734 760 L746 760"/>`, 1.8) +
    hand(760, 708, "110°F", { size: 28, fill: INK }) + hand(760, 738, "43°C", { size: 24 }) +
    caps(960, 352, "Her recipe, on repeat") +
    ink(`<circle cx="${cx}" cy="${cy}" r="${R}" stroke-dasharray="1 0"/>${[-45, 45, 135, 225].map(arrow).join("")}`, 2) +
    wash(`<g fill="${C.saffron}">${dots}</g>`, 0.8) + ink(dots, 1.6) +
    hand(cx, cy - R - 26, "4 cups milk", { anchor: "middle", fill: INK, size: 30 }) +
    hand(cx + R + 22, cy - 6, "boil, then", { size: 28, fill: INK }) + hand(cx + R + 22, cy + 26, "cool to 110°F", { size: 28, fill: INK }) +
    hand(cx, cy + R + 44, "+ 2 tbsp live yogurt", { anchor: "middle", fill: INK, size: 30 }) +
    hand(cx - R - 22, cy - 6, "12–24 h", { anchor: "end", size: 28, fill: INK }) + hand(cx - R - 22, cy + 26, "somewhere warm", { anchor: "end", size: 28, fill: INK }) +
    serif(cx, cy + 4, "yogurt!", { size: 42, anchor: "middle" }) + hand(cx, cy + 40, "keep 2 tbsp back…", { anchor: "middle", size: 24 }) +
    hand(960, 890, "Instant Pot on yogurt, or the oven", { size: 26 }) + hand(960, 920, "with just the light switched on.", { size: 26 }) +
    stamp(3);
}

function rosti() {
  let shreds = "";
  for (let i = 0; i < 90; i++) {
    const a = r1() * Math.PI * 2, rr = Math.sqrt(r1()) * 128, x = 470 + Math.cos(a) * rr, y = 690 + Math.sin(a) * rr, t = r1() * 180;
    shreds += `<path transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${t.toFixed(0)})" d="M-14 0 q14 -5 28 0"/>`;
  }
  const handle = "M308 668 L160 650 Q148 650 148 662 L148 690 Q148 702 160 702 L308 712 Z";
  return head(4, "World Cup kitchen · Switzerland", "Rösti") +
    wash(`<circle cx="470" cy="690" r="175" fill="#6b6862"/><path d="${handle}" fill="#6b6862"/>`, 0.3) +
    wash(`<circle cx="470" cy="690" r="140" fill="${C.saffron}"/>`, 0.75) + wash(`<circle cx="470" cy="690" r="112" fill="${C.butter}"/>`, 0.6) +
    ink(`<circle cx="470" cy="690" r="175"/><circle cx="470" cy="690" r="150" stroke-opacity=".5"/><path d="${handle}"/><circle cx="470" cy="690" r="140"/>`, 2.2) +
    ink(shreds, 1.2, C.crust) +
    wash(`<rect x="700" y="470" width="90" height="230" rx="10" fill="${C.steel}"/>`, 0.5) +
    ink(`<rect x="700" y="470" width="90" height="230" rx="10"/><path d="M745 470 L745 430 M725 430 L765 430"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<path d="M716 ${495 + k * 25} q12 -8 24 0 M752 ${495 + k * 25} q12 -8 24 0" stroke-width="1.4"/>`).join("")}`, 2) +
    hand(660, 760, "coarse side", { size: 26, rot: -4 }) +
    caps(960, 352, "The method") +
    numbered([["Grate", "starchy potatoes, coarse side"], ["Squeeze", "wring out every drop in a towel — really"],
      ["Press", "into hot butter, flatten, then leave it"], ["Flip", "slide onto a plate, invert, brown again"]], 410, 118) +
    hand(960, 905, "shatter-crisp outside, soft inside.", { fill: C.tomato, size: 30 }) +
    stamp(4);
}

function plov() {
  const pot = "M230 560 L710 560 Q700 880 470 890 Q240 880 230 560 Z";
  const layers = [[C.crust, 770, 125], [C.carrot, 690, 80], [C.cream, 590, 100]];
  let carrots = "", rice = "";
  for (let i = 0; i < 40; i++) carrots += `<rect x="${(250 + r1() * 420).toFixed(0)}" y="${(700 + r1() * 55).toFixed(0)}" width="30" height="5" transform="rotate(${((r1() - 0.5) * 50).toFixed(0)} 450 720)"/>`;
  for (let i = 0; i < 90; i++) rice += `<ellipse cx="${(250 + r1() * 430).toFixed(0)}" cy="${(600 + r1() * 80).toFixed(0)}" rx="5" ry="2" transform="rotate(${(r1() * 180).toFixed(0)} 450 640)"/>`;
  const swatch = [[C.crust, "meat + onions, browned hard"], [C.carrot, "carrots, in thick matchsticks"], [C.cream, "rice, spread flat — no stirring"], ["#fff6e4", "a whole head of garlic, tucked in"]];
  return head(5, "World Cup kitchen · Uzbekistan", "Uzbek Plov") +
    `<defs><clipPath id="potIn"><path d="${pot}"/></clipPath></defs>` +
    `<g clip-path="url(#potIn)">` + wash(layers.map(([c, y, h]) => `<rect x="220" y="${y}" width="500" height="${h}" fill="${c}"/>`).join(""), 0.65) +
    wash(`<g fill="${C.carrot}">${carrots}</g>`, 0.8) + ink(rice, 1, SOFT) + `</g>` +
    wash(`<circle cx="470" cy="630" r="40" fill="#fff6e4"/>`, 0.95) +
    ink(`<path d="${pot}"/><path d="M215 560 L725 560"/><path d="M230 600 Q180 600 180 640 M710 600 Q760 600 760 640"/>
      <circle cx="470" cy="630" r="40"/><path d="M470 590 L470 670 M450 596 Q440 630 452 666 M490 596 Q500 630 488 666"/>`, 2.2) +
    hand(470, 530, "built bottom-up, like a lasagne", { anchor: "middle", size: 26 }) +
    caps(960, 352, "The method · layers") +
    swatch.map(([c, t], i) => wash(`<rect x="962" y="${392 + i * 76}" width="44" height="34" rx="6" fill="${c}"/>`, 0.85) +
      ink(`<rect x="962" y="${392 + i * 76}" width="44" height="34" rx="6"/>`, 1.6) + hand(1024, 418 + i * 76, `${i + 1} · ${t}`, { size: 31, fill: INK })).join("") +
    hand(962, 740, "+ cumin, salt, and enough water to just cover.", { size: 29 }) +
    serif(960, 830, "Lid on, heat low, let the steam finish it.", { size: 32, italic: true }) +
    stamp(5);
}

function butter() {
  const jar = "M250 515 L450 515 Q466 520 466 540 L466 860 Q466 880 446 880 L264 880 Q244 880 244 860 L244 540 Q244 520 250 515 Z";
  const top = "M560 700 L760 660 L820 700 L620 740 Z", front = "M560 700 L620 740 L620 840 L560 800 Z", side = "M620 740 L820 700 L820 800 L620 840 Z";
  return head(6, "Made from scratch", "Cultured Butter at Home") +
    wash(`<path d="${jar}" fill="${C.sky}"/>`, 0.16) + wash(`<rect x="248" y="600" width="214" height="276" fill="#fbf3dd"/>`, 0.9) +
    ink(`<path d="${jar}"/><path d="M250 600 Q300 588 350 600 T462 598" stroke-width="1.4"/>`, 2.2) +
    hand(355, 700, "cream", { anchor: "middle", size: 30 }) + hand(355, 734, "+ culture", { anchor: "middle", size: 26 }) +
    ink(`<path d="M490 700 Q520 690 540 700 M528 690 L542 700 L528 710"/>`, 2) +
    wash(`<path d="${top}" fill="${C.butter}"/><path d="${front}" fill="${C.saffron}"/><path d="${side}" fill="${C.butter}"/>`, 0.85) +
    wash(`<path d="M630 742 L810 706 L810 760 L630 796 Z" fill="#fff6ea"/>`, 0.7) +
    ink(`<path d="${top}"/><path d="${front}"/><path d="${side}"/><path d="M630 742 L810 706 L810 760 L630 796 Z" stroke-width="1.4"/>`, 2) +
    hand(720, 775, "BUTTER", { anchor: "middle", size: 22, rot: -11, fill: C.tomato }) +
    hand(560, 900, "…and a glass of real buttermilk", { size: 26 }) +
    caps(960, 352, "The method") +
    numbered([["Culture", "cream + a spoon of live yogurt or buttermilk"], ["Wait", "a warm day: it thickens and turns tangy"],
      ["Churn", "whip past whipped cream until it breaks"], ["Wash", "squeeze, rinse in ice water, salt it"]], 410, 118) +
    hand(960, 905, "tastes like a French bakery.", { fill: C.tomato, size: 30 }) +
    stamp(6);
}

function anatomy() {
  const xs = [330, 630, 1130, 1430], y0 = 480, w = 200, h = 350;
  const phone = (cx) => `<rect x="${cx - w / 2}" y="${y0}" width="${w}" height="${h}" rx="28"/><rect x="${cx - 26}" y="${y0 + 12}" width="52" height="9" rx="4.5"/>`;
  const labels = ["The hook", "The cook", "The taste", "The recipe"], times = ["0:00", "0:03", "0:20", "description"];
  const steam = (x, y) => `<path d="M${x} ${y} q-10 -18 0 -36 q10 -18 0 -36"/>`;
  const inside =
    hand(xs[0], 600, "this cake", { anchor: "middle", size: 34, fill: INK }) + hand(xs[0], 640, "cost HOW", { anchor: "middle", size: 34, fill: INK }) +
    hand(xs[0], 680, "MUCH???", { anchor: "middle", size: 40, fill: C.tomato }) +
    wash(`<ellipse cx="${xs[1]}" cy="700" rx="70" ry="22" fill="#6b6862"/><ellipse cx="${xs[1]}" cy="694" rx="52" ry="14" fill="${C.saffron}"/>`, 0.6) +
    ink(`<ellipse cx="${xs[1]}" cy="700" rx="70" ry="22"/><path d="M${xs[1] + 68} 700 L${xs[1] + 92} 692"/>${steam(xs[1] - 20, 668)}${steam(xs[1] + 18, 668)}`, 2) +
    ink(`<path d="M${xs[2] - 6} 560 L${xs[2] - 6} 720 M${xs[2] - 22} 560 L${xs[2] - 22} 610 Q${xs[2] - 22} 628 ${xs[2] - 6} 630 Q${xs[2] + 10} 628 ${xs[2] + 10} 610 L${xs[2] + 10} 560 M${xs[2] - 6} 560 L${xs[2] - 6} 610"/>
      <path d="M${xs[2] + 50} 590 l8 -8 M${xs[2] + 62} 610 l12 0 M${xs[2] - 60} 590 l-8 -8"/>`, 2) +
    wash(`<circle cx="${xs[2] - 6}" cy="548" r="14" fill="${C.saffron}"/>`, 0.8) +
    hand(xs[2], 780, "…okay wow.", { anchor: "middle", size: 30, fill: INK }) +
    ink(`<rect x="${xs[3] - 80}" y="570" width="160" height="200" stroke="none"/>` + [0, 1, 2, 3, 4, 5].map((k) => `<path d="M${xs[3] - 70} ${590 + k * 32} L${xs[3] + (k % 3 === 2 ? 20 : 70)} ${590 + k * 32}"/>`).join(""), 2) +
    caps(xs[3] - 70, 560, "ingredients", { size: 12, ls: 2 });
  return head(7, "How she makes them", "Anatomy of a Lucy Short") +
    xs.map((x) => wash(`<rect x="${x - w / 2}" y="${y0}" width="${w}" height="${h}" rx="28" fill="${C.sky}"/>`, 0.14)).join("") +
    ink(xs.map(phone).join(""), 2.2) + inside +
    xs.map((x, i) => serif(x, 462, labels[i], { size: 30, anchor: "middle" }) + caps(x, 868, times[i], { anchor: "middle", size: 14 })).join("") +
    ink(`<path d="M230 900 L1500 900 M1488 892 L1500 900 L1488 908"/>`, 1.6) +
    hand(960, 345, "8 to 36 seconds, start to finish.", { fill: INK }) +
    hand(960, 385, "no fluff. often, the full recipe waits below.", { size: 28 }) +
    stamp(7);
}

function worldCup() {
  const stamps = [["Spain", "tortilla"], ["Belgium", "carbonnade"], ["France", "coq au vin"], ["Switzerland", "rösti"],
    ["Egypt", "national dish"], ["Uzbekistan", "plov"], ["S. Korea", "bibimbap"], ["Norway", "fiskesuppe"],
    ["Iraq", "dolma"], ["Sweden", "meatballs"], ["Brazil", "brigadeiro"], ["Trinidad", "fried chicken"]];
  const cols = [C.tomato, C.herb, C.saffron, C.sky, C.plum];
  const grid = stamps.map(([c, d], i) => {
    const x = 960 + (i % 4) * 160, y = 330 + Math.floor(i / 4) * 160, a = ((r1() - 0.5) * 10).toFixed(1), col = cols[i % 5];
    const round = i % 3 === 1;
    const shape = round ? `<circle cx="${x + 70}" cy="${y + 66}" r="64"/>` : `<rect x="${x + 4}" y="${y + 6}" width="132" height="120" rx="10"/>`;
    return `<g transform="rotate(${a} ${x + 70} ${y + 66})">` + wash(shape.replace("/>", ` fill="${col}"/>`), 0.28) +
      ink(shape.replace("/>", ` stroke-dasharray="${round ? "5 6" : "1 0"}"/>`), 1.8, col) +
      caps(x + 70, y + 54, c, { anchor: "middle", size: 12, ls: 1.6, fill: INK }) + hand(x + 70, y + 90, d, { anchor: "middle", size: 24, fill: INK }) + `</g>`;
  }).join("");
  const pins = [[400, 560], [430, 600], [470, 585], [520, 640], [560, 700], [600, 600], [380, 720], [340, 640], [500, 770], [640, 680]];
  return head(8, "World Cup kitchen", "A World Cup of Dinners") +
    wash(`<circle cx="470" cy="680" r="200" fill="${C.sky}"/>`, 0.4) +
    wash(`<path d="M330 600 q40 -40 90 -20 q30 30 80 10 q40 30 10 70 q-50 10 -70 50 q-40 0 -60 -40 q-60 -20 -50 -70 Z M520 720 q50 -20 90 20 q0 50 -40 70 q-50 -10 -50 -90 Z" fill="${C.herb}"/>`, 0.5) +
    ink(`<circle cx="470" cy="680" r="200"/><ellipse cx="470" cy="680" rx="90" ry="200" stroke-opacity=".4"/><path d="M270 680 L670 680 M290 600 L650 600 M290 760 L650 760" stroke-opacity=".4"/>`, 2) +
    pins.map(([x, y]) => wash(`<circle cx="${x}" cy="${y - 18}" r="9" fill="${C.tomato}"/>`, 0.9) + ink(`<circle cx="${x}" cy="${y - 18}" r="9"/><path d="M${x} ${y - 9} L${x} ${y}"/>`, 1.6)).join("") +
    hand(470, 925, "one country at a time.", { anchor: "middle", size: 28 }) +
    grid + hand(960, 905, "…and counting.", { fill: C.tomato, size: 30 }) +
    stamp(8);
}

function numbers() {
  const top = [["where am i from?", 3.8], ["how much money did i make", 3.1], ["guess who cooked dinner", 1.2], ["all my friends lied to me", 1.1],
    ["homemade soda", 0.58], ["Homemade Cheez Its", 0.531], ["my dog ate chocolate", 0.524], ["Eating in NYC for $20", 0.498]];
  const fmt = (v) => (v >= 1 ? v.toFixed(1) + "M" : Math.round(v * 1000) + "K");
  const bars = top.map(([t, v], i) => {
    const y = 380 + i * 62, w = Math.round((v / 3.8) * 300);
    return hand(960, y + 24, t, { size: 25, fill: INK }) +
      wash(`<rect x="1240" y="${y}" width="${w}" height="30" fill="${i < 4 ? C.tomato : C.saffron}"/>`, 0.7) +
      ink(`<rect x="1240" y="${y}" width="${w}" height="30"/>`, 1.6) + text(1250 + w, y + 22, fmt(v), { font: "Newsreader", size: 17, fill: INK });
  }).join("");
  const stat = (y, n, l) => serif(150, y, n, { size: 92 }) + caps(154, y + 34, l);
  return head(9, "By the numbers", "Lucy, by the Numbers") +
    stat(530, "84.1K", "subscribers") + stat(700, "77", "videos") + stat(870, "50.7M", "views") +
    ink(`<path d="M520 470 q60 -30 120 10 M630 470 l12 10 l-14 8"/><path d="M560 830 l10 -24 l10 24 l24 10 l-24 10 l-10 24 l-10 -24 l-24 -10 Z" stroke-width="1.6"/>`, 2) +
    hand(520, 530, "as of october 2026", { size: 26, rot: -3 }) +
    caps(960, 352, "Most-watched shorts") + bars +
    hand(960, 905, "the personal ones travel furthest.", { fill: C.tomato, size: 30 }) +
    stamp(9);
}

/* -------------------------------------------------------------- build */
const PLATES = [
  ["cheez-its", cheezits], ["cola-chicken", colaChicken], ["yogurt", yogurt], ["rosti", rosti], ["plov", plov],
  ["cultured-butter", butter], ["anatomy", anatomy], ["world-cup", worldCup], ["numbers", numbers],
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
