/**
 * Cardul care apare când trimiți linkul pe WhatsApp, Messenger sau iMessage.
 *
 *   node tools/make-social-card.js       → social-card.png (1200×630)
 *
 * De ce există: cercetarea din RESEARCH.md spune că previzualizarea linkului e
 * jumătate din produsul concurenței. Fără ea, în conversație apare un
 * dreptunghi gol cu un URL în el.
 *
 * Fără nicio dependință și fără font: literele sunt segmente de dreaptă,
 * desenate cu aceeași distanță-până-la-segment ca muchiile din
 * `make-graph-icons.js`, iar cerul e cel din aplicație, cu stele adevărate.
 * Așa cardul rămâne al nostru și se poate regenera oricând, oriunde.
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/* ---------- PNG ---------- */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

/** Ca la iconițe, dar dreptunghiular: cardurile sociale nu sunt pătrate. */
function encodePng(w, h, rgb) {
  const stride = w * 3;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0;                       // filtru „none”
    rgb.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // biți / canal
  ihdr[9] = 2;  // RGB, fără alfa: cardul e opac oricum
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- Unelte de desen ---------- */

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
const cover = (d, r, soft) => clamp01((r - d) / soft + 0.5);
const hex = h => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : clamp01(((px - ax) * dx + (py - ay) * dy) / len2);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

/* Culorile temei de noapte, exact cele din styles.css. */
const BG = hex('#080c1e');
const BG2 = hex('#131a3d');
const TEXT = hex('#eef1ff');
const ACCENT = hex('#ffd76a');

/* ---------- Litere din segmente ---------- */

/**
 * Fiecare literă e o listă de linii frânte într-o cutie 0..1 (y în jos), plus
 * lățimea ei relativă. Doar ce ne trebuie pentru „HAI SĂ NE VEDEM”: un font
 * întreg ar fi o dependință, iar noi avem de scris trei cuvinte.
 */
const GLYPHS = {
  H: { w: 0.86, s: [[[0, 0], [0, 1]], [[0.86, 0], [0.86, 1]], [[0, 0.52], [0.86, 0.52]]] },
  A: { w: 0.92, s: [[[0, 1], [0.46, 0]], [[0.46, 0], [0.92, 1]], [[0.17, 0.66], [0.75, 0.66]]] },
  I: { w: 0.10, s: [[[0.05, 0], [0.05, 1]]] },
  S: {
    w: 0.82,
    s: [[
      [0.82, 0.17], [0.66, 0.02], [0.22, 0.02], [0.02, 0.17], [0.02, 0.34],
      [0.20, 0.47], [0.62, 0.53], [0.80, 0.66], [0.80, 0.83], [0.60, 0.98],
      [0.16, 0.98], [0.00, 0.83],
    ]],
  },
  N: { w: 0.86, s: [[[0, 1], [0, 0]], [[0, 0], [0.86, 1]], [[0.86, 1], [0.86, 0]]] },
  E: { w: 0.76, s: [[[0, 0], [0, 1]], [[0, 0], [0.76, 0]], [[0, 0.5], [0.64, 0.5]], [[0, 1], [0.76, 1]]] },
  V: { w: 0.92, s: [[[0, 0], [0.46, 1]], [[0.46, 1], [0.92, 0]]] },
  D: {
    w: 0.88,
    s: [
      [[0, 0], [0, 1]],
      [[0, 0], [0.48, 0], [0.78, 0.14], [0.88, 0.5], [0.78, 0.86], [0.48, 1], [0, 1]],
    ],
  },
  M: { w: 1.06, s: [[[0, 1], [0, 0]], [[0, 0], [0.53, 0.62]], [[0.53, 0.62], [1.06, 0]], [[1.06, 0], [1.06, 1]]] },
  // Căciula de pe Ă stă deasupra cutiei, de aia are y negativ.
  'Ă': {
    w: 0.92,
    s: [
      [[0, 1], [0.46, 0]], [[0.46, 0], [0.92, 1]], [[0.17, 0.66], [0.75, 0.66]],
      [[0.20, -0.32], [0.31, -0.20], [0.61, -0.20], [0.72, -0.32]],
    ],
  },
  ' ': { w: 0.34, s: [] },
};

const TRACK = 0.16;   // spațiu între litere, în unități de înălțime

/** Segmentele unui cuvânt, în unități de înălțime, plus lățimea totală. */
function layout(word) {
  const segs = [];
  let x = 0;
  for (const ch of word) {
    const g = GLYPHS[ch];
    if (!g) throw new Error(`Litera „${ch}” nu e desenată încă.`);
    for (const line of g.s) {
      for (let i = 0; i < line.length - 1; i++) {
        segs.push([x + line[i][0], line[i][1], x + line[i + 1][0], line[i + 1][1]]);
      }
    }
    x += g.w + TRACK;
  }
  return { segs, width: Math.max(0, x - TRACK) };
}

/* ---------- Cerul ---------- */

/** Zgomot determinist: același card la fiecare rulare, fără Math.random. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeStars(w, h, count) {
  const rand = rng(20260806);
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push({
      x: rand() * w,
      y: rand() * h,
      r: 0.7 + rand() * rand() * 2.6,
      a: 0.25 + rand() * 0.65,
    });
  }
  return out;
}

/* ---------- Cardul ---------- */

const W = 1200, H = 630;

function draw() {
  const buf = Buffer.alloc(W * H * 3);
  const stars = makeStars(W, H, 260);

  // Textul: două rânduri, centrate, cu al doilea pe culoarea de accent.
  // Ambele rânduri primesc aceeași înălțime de literă — altfel titlul ar arăta
  // ca două titluri — iar mărimea o dă rândul cel mai lat, ca să încapă.
  const WORDS = [
    { word: 'HAI SĂ', color: TEXT },
    { word: 'NE VEDEM', color: ACCENT },
  ].map(r => ({ ...r, ...layout(r.word) }));

  const size = Math.min(128, 880 / Math.max(...WORDS.map(r => r.width)));
  const top = 172;
  const rows = WORDS.map((r, i) => ({
    ...r,
    size,
    y: top + i * size * 1.34,
    x: (W - r.width * size) / 2,
  }));

  const stroke = size * 0.088;
  const soft = 1.1;

  // Linia de accent stă sub ultimul rând, la distanță de el: în loc de un
  // subtitlu pe care nu-l putem scrie, un semn că mai urmează ceva.
  const ruleY = Math.round(rows[rows.length - 1].y + size + 74);

  // Luna, sus-dreapta: un disc din care mușcăm alt disc.
  const moon = { x: 1010, y: 132, r: 54, bite: { x: 976, y: 112, r: 50 } };

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // Fundal: pânza aplicației, mai deschisă spre colțul de sus-dreapta,
      // ca lumina să pară că vine de la lună.
      const t = clamp01(((x / W) * 0.55 + (1 - y / H) * 0.45));
      let r = BG[0] + (BG2[0] - BG[0]) * t * 0.75;
      let g = BG[1] + (BG2[1] - BG[1]) * t * 0.75;
      let b = BG[2] + (BG2[2] - BG[2]) * t * 0.75;

      const put = (col, a) => {
        if (a <= 0) return;
        r += (col[0] - r) * a;
        g += (col[1] - g) * a;
        b += (col[2] - b) * a;
      };

      // Stelele stau sub text, ca literele să rămână curate.
      for (const s of stars) {
        const d = Math.hypot(x - s.x, y - s.y);
        if (d < s.r + 2) put(TEXT, cover(d, s.r, 1.3) * s.a);
      }

      const dm = Math.hypot(x - moon.x, y - moon.y);
      if (dm < moon.r + 2) {
        const db = Math.hypot(x - moon.bite.x, y - moon.bite.y);
        put(ACCENT, cover(dm, moon.r, 1.4) * (1 - cover(db, moon.bite.r, 1.4)) * 0.92);
      }

      for (const row of rows) {
        for (const s of row.segs) {
          const d = distToSegment(
            x, y,
            row.x + s[0] * row.size, row.y + s[1] * row.size,
            row.x + s[2] * row.size, row.y + s[3] * row.size,
          );
          if (d < stroke + 2) put(row.color, cover(d, stroke, soft));
        }
      }

      const under = distToSegment(x, y, 470, ruleY, 730, ruleY);
      put(ACCENT, cover(under, 3, 1.1) * 0.55);

      const i = (y * W + x) * 3;
      buf[i] = Math.round(clamp01(r / 255) * 255);
      buf[i + 1] = Math.round(clamp01(g / 255) * 255);
      buf[i + 2] = Math.round(clamp01(b / 255) * 255);
    }
  }
  return buf;
}

const file = path.join(__dirname, '..', 'social-card.png');
fs.writeFileSync(file, encodePng(W, H, draw()));
console.log(`social-card.png  ${W}×${H}  ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
