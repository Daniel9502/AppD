/**
 * Generează iconițele PWA fără nicio dependință: desenăm pixel cu pixel
 * și împachetăm rezultatul în PNG cu zlib-ul din Node.
 *
 *   node tools/make-icons.js
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
const cover = (dist, r, soft) => clamp01((r - dist) / soft + 0.5);
const dist = (x, y, cx, cy) => Math.hypot(x - cx, y - cy);

/** Generator determinist, ca iconițele să iasă identic la fiecare rulare. */
function lcg(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function draw(size) {
  const buf = Buffer.alloc(size * size * 4);
  const soft = size / 220 + 0.5;

  const rnd = lcg(20260726);
  const stars = Array.from({ length: 34 }, () => ({
    x: rnd() * size,
    y: rnd() * size * 0.92,
    r: (0.2 + rnd() * 0.55) * (size / 100),
    a: 0.35 + rnd() * 0.6,
  }));

  const moon = { x: size * 0.635, y: size * 0.375, r: size * 0.20 };
  const bite = { x: size * 0.555, y: size * 0.315, r: size * 0.185 };
  const fly = { x: size * 0.36, y: size * 0.68, r: size * 0.028 };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const t = y / size;

      // fundal: degrade vertical bleumarin
      let r = 10 + t * 17;
      let g = 15 + t * 20;
      let b = 38 + t * 42;

      const put = (cr, cg, cb, a) => {
        if (a <= 0) return;
        r += (cr - r) * a;
        g += (cg - g) * a;
        b += (cb - b) * a;
      };

      // stele
      for (const s of stars) {
        const a = cover(dist(x, y, s.x, s.y), s.r, soft) * s.a;
        if (a > 0.002) put(255, 255, 255, a);
      }

      // halou verzui-auriu de licurici
      const dFly = dist(x, y, fly.x, fly.y);
      const halo = Math.exp(-((dFly / (size * 0.115)) ** 2));
      put(190, 255, 130, halo * 0.42);
      put(255, 252, 205, cover(dFly, fly.r, soft));

      // semilună: cerc plin minus un cerc decalat
      const inMoon = cover(dist(x, y, moon.x, moon.y), moon.r, soft);
      const inBite = cover(dist(x, y, bite.x, bite.y), bite.r, soft);
      put(255, 233, 168, clamp01(inMoon - inBite));

      buf[i] = Math.round(clamp01(r / 255) * 255);
      buf[i + 1] = Math.round(clamp01(g / 255) * 255);
      buf[i + 2] = Math.round(clamp01(b / 255) * 255);
      buf[i + 3] = 255;
    }
  }
  return buf;
}

/* ---------- Scriere ---------- */

const out = path.join(__dirname, '..');
for (const size of [192, 512]) {
  const file = path.join(out, `icon-${size}.png`);
  fs.writeFileSync(file, encodePng(size, draw(size)));
  console.log(`icon-${size}.png  ${(fs.statSync(file).size / 1024).toFixed(1)} KB`);
}
