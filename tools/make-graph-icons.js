/**
 * Iconițele PWA pentru exploratorul de graf. Fără nicio dependință: desenăm
 * pixel cu pixel și împachetăm în PNG cu zlib-ul din Node.
 *
 *   node tools/make-graph-icons.js
 *
 * Motivul e chiar graful: un nod central cu sateliți, în culorile paletei
 * categorice folosite de aplicație.
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

function encodePng(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filtru „none”
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;  // biți / canal
  ihdr[9] = 6;  // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---------- Desen ---------- */

const clamp01 = v => (v < 0 ? 0 : v > 1 ? 1 : v);
/** Acoperire cu margine moale, ca să nu iasă zimțat. */
const cover = (d, r, soft) => clamp01((r - d) / soft + 0.5);
const dist = (x, y, cx, cy) => Math.hypot(x - cx, y - cy);

/** Distanța de la un punct la un segment, pentru muchii cu margini netede. */
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : clamp01(((px - ax) * dx + (py - ay) * dy) / len2);
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t));
}

const hex = h => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

/* Paleta categorică validată, varianta pentru fundal închis. */
const SURFACE = hex('#1a1a19');
const RULE = hex('#4a4a46');
const SERIES = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9']
  .map(hex);

/* Motivul, în coordonate 0..1. Strâns spre centru cu SHRINK, ca să încapă în
   zona sigură a măștilor rotunde de pe Android. */
const SHRINK = 0.86;
const pull = (v) => 0.5 + (v - 0.5) * SHRINK;

const NODES = [
  { x: 0.50, y: 0.51, r: 0.118, c: 0 },  // hub-ul
  { x: 0.24, y: 0.29, r: 0.063, c: 1 },
  { x: 0.77, y: 0.27, r: 0.055, c: 2 },
  { x: 0.83, y: 0.61, r: 0.071, c: 3 },
  { x: 0.29, y: 0.75, r: 0.059, c: 4 },
  { x: 0.60, y: 0.85, r: 0.047, c: 6 },
  { x: 0.15, y: 0.55, r: 0.043, c: 5 },
].map(n => ({ ...n, x: pull(n.x), y: pull(n.y), r: n.r * SHRINK }));

/* Hub-ul spre toți sateliții, plus două legături între ei, ca să arate a graf,
   nu a stea. */
const EDGES = [
  [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [1, 6], [3, 5],
];

function draw(size) {
  const buf = Buffer.alloc(size * size * 4);
  const soft = size / 220 + 0.5;
  const edgeWidth = size * 0.0075;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;

      // fundal: pânza aplicației, cu o urmă de lumină spre centru
      const toCenter = dist(x, y, size / 2, size * 0.46) / size;
      const lift = Math.exp(-((toCenter / 0.42) ** 2)) * 14;
      let r = SURFACE[0] + lift;
      let g = SURFACE[1] + lift;
      let b = SURFACE[2] + lift;

      const put = (col, a) => {
        if (a <= 0) return;
        r += (col[0] - r) * a;
        g += (col[1] - g) * a;
        b += (col[2] - b) * a;
      };

      // muchiile, sub noduri
      for (const [ai, bi] of EDGES) {
        const a = NODES[ai], bn = NODES[bi];
        const d = distToSegment(x, y, a.x * size, a.y * size, bn.x * size, bn.y * size);
        put(RULE, cover(d, edgeWidth, soft) * 0.85);
      }

      // nodurile, fiecare cu un inel pe culoarea pânzei, la fel ca în aplicație
      for (const n of NODES) {
        const d = dist(x, y, n.x * size, n.y * size);
        const ring = n.r * size + size * 0.012;
        put(SURFACE, cover(d, ring, soft));
        put(SERIES[n.c], cover(d, n.r * size, soft));
      }

      buf[i] = Math.round(clamp01(r / 255) * 255);
      buf[i + 1] = Math.round(clamp01(g / 255) * 255);
      buf[i + 2] = Math.round(clamp01(b / 255) * 255);
      buf[i + 3] = 255;
    }
  }
  return buf;
}

/* ---------- Scriere ---------- */

const out = path.join(__dirname, '..', 'graph');
for (const size of [192, 512]) {
  const file = path.join(out, `icon-${size}.png`);
  fs.writeFileSync(file, encodePng(size, draw(size)));
  console.log(`graph/icon-${size}.png  ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
}
