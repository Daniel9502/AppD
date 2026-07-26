/* =========================================================================
   Hai să ne vedem — invitații rapide, cu cer înstelat și licurici
   ========================================================================= */

'use strict';

/* ---------------------------------------------------------------- 1. DATE */

const OPTIONS = {
  g: [
    { id: 'b', e: '🙋‍♂️', l: 'Băiat' },
    { id: 'f', e: '🙋‍♀️', l: 'Fată' },
    { id: 'x', e: '🙈', l: 'Nu zic' },
  ],
  a: [
    { id: 'plimbare',  e: '🚶', l: 'Plimbare',  p: 'o plimbare' },
    { id: 'cafea',     e: '☕', l: 'Cafea',     p: 'o cafea' },
    { id: 'inghetata', e: '🍦', l: 'Înghețată', p: 'o înghețată' },
    { id: 'mancare',   e: '🍕', l: 'Mâncare',   p: 'ceva de mâncat' },
    { id: 'film',      e: '🎬', l: 'Film',      p: 'un film' },
    { id: 'vorbit',    e: '💬', l: 'Vorbit',    p: 'o vorbă lungă' },
  ],
  p: [
    { id: 'parc',    e: '🌳', l: 'În parc',    p: 'în parc' },
    { id: 'terasa',  e: '☂️', l: 'Pe terasă',  p: 'pe o terasă' },
    { id: 'oras',    e: '🏙️', l: 'În oraș',    p: 'prin oraș' },
    { id: 'lac',     e: '🌊', l: 'La lac',     p: 'la lac' },
    { id: 'undezici', e: '🤷', l: 'Unde zici tu', p: 'unde zici tu' },
  ],
  m: [
    { id: 'masina', e: '🚗', l: 'Te iau eu',  s: 'Te iau eu cu mașina, ai șofer personal pe seara asta. 🚗' },
    { id: 'jos',    e: '🚶', l: 'Pe jos',     s: 'Mergem pe jos: e sănătos, e gratis și mai și povestim. 🚶' },
    { id: 'acolo',  e: '📍', l: 'Ne vedem acolo', s: 'Ne vedem direct acolo, ca doi oameni organizați. 📍' },
  ],
  w: [
    { id: 'lejer',   e: '😎', l: 'Lejer',   s: 'Ținuta: lejer. Trening acceptat, dar purtat cu demnitate. 😎' },
    { id: 'frumos',  e: '✨', l: 'Frumos',  s: 'Ținuta: frumos. Adică nu ce porți când scoți gunoiul. ✨' },
    { id: 'elegant', e: '🤵', l: 'Elegant', s: 'Ținuta: elegant. Da, e cazul să calci ceva. 🤵' },
  ],
  b: [
    { id: 'cafea',     e: '☕', l: 'Cafea',     p: 'o cafea' },
    { id: 'suc',       e: '🧃', l: 'Suc',       p: 'un suc' },
    { id: 'apa',       e: '💧', l: 'Apă',       p: 'o apă' },
    { id: 'limonada',  e: '🍋', l: 'Limonadă',  p: 'o limonadă' },
    { id: 'vin',       e: '🍷', l: 'Un pahar de vin', p: 'un pahar de vin' },
  ],
};

const HOURS = ['11:00', '17:00', '19:00', '21:00'];

const JOKES = [
  'Dacă zici nu, mă prefac că n-am întrebat. 🙈',
  'Vin cu bună dispoziție inclusă în preț.',
  'Am pregătit trei glume proaste. Poate patru.',
  'Am și un plan B, dar planul A ești tu.',
  'Promit maximum două povești pe care le-ai mai auzit.',
  'Rezervarea e făcută. În capul meu, dar e confirmată.',
  'Nu e nicio presiune. Am reîmprospătat pagina doar de vreo șase ori.',
  'Garantat: zero discuții despre vreme. Maximum una.',
  'Anulez orice altceva aveam. Oricum n-aveam nimic.',
  'Butonul verde e mai mare decât celelalte. Nu e o coincidență. 👀',
  'Dacă e să plouă, ne mutăm undeva unde nu plouă. Sunt strateg.',
];

const REPLY_CLOSERS = [
  'Aduc și eu bună dispoziție, se pare că e la modă. 😄',
  'Am zis da suspect de repede, hai să ne facem că n-am observat.',
  'Îmi place ideea. Îmi place și că te-ai gândit la ea.',
  'Vin. Și vin la timp, ceea ce ar fi o premieră.',
  'Am zis da înainte să citesc tot. Bun semn, nu?',
];

/* Ponturi: ce să iei cu tine. Se rotesc la fiecare atingere. */
const TIPS = {
  b: [
    'Ia o floare. Una singură. Nu e cerere în căsătorie, e o cafea. 🌷',
    'Un minion de pluș bate orice mesaj lung. Testat pe teren. 💛',
    'Floare sau minion? Dacă nu te decizi, ia amândouă. 🌹🍌',
    'Vino cu 5 minute mai devreme. E gratis și impresionează.',
    'Ține o floare la spate și scoate-o ca din întâmplare. Clasic, dar funcționează. 🌼',
    'Ciocolată de rezervă în buzunar. N-a supărat pe nimeni vreodată. 🍫',
    'Întreabă-o ceva și chiar ascultă răspunsul. Nivel: expert. 👂',
    'Telefonul pe silențios. Bonus: pari adult responsabil. 📵',
  ],
  f: [
    'Ia un stick cu melodiile tale. În mașină, tu pui muzica. 🎵',
    'Un stick cu poze sau piese preferate: cadou mic, efect uriaș. 💾',
    'Vino cu o glumă proastă pregătită. Sparge gheața instant. 😄',
    'Un stick, un breloc haios sau o ciocolată. Ceva mic, dar al tău. 🎁',
    'Parfumul care îți place ȚIE. Restul se rezolvă singur. ✨',
    'Ia un pulover în plus. Seara răcorește, romantismul nu ține de cald. 🧥',
    'Dacă râzi la glumele lui proaste, îți datorează o înghețată. 🍦',
    'Fă o poză. Peste un an o să fie „ții minte prima dată?”. 📸',
  ],
  x: [
    'Adu ceva mic. Un fleac. Contează gestul, nu prețul. 🎁',
    'Zâmbește când ajungi. Ăsta e tot secretul. 😊',
    'Telefonul pe silențios. Poți supraviețui o oră, promit. 📵',
    'Vino cu 5 minute mai devreme. E gratis și impresionează. ⏰',
    'O floare, o ciocolată sau un minion. Alege ce te reprezintă. 🌷🍫',
    'Nu repeta ce vrei să zici. Oricum o să spui altceva. 🙃',
  ],
};

/* Șabloane: o atingere completează toată invitația. */
const PRESETS = [
  { e: '☕', t: 'Cafea rapidă',  sub: 'azi, pe terasă',
    v: { a: 'cafea', p: 'terasa', t: '17:00', m: 'acolo', w: 'lejer', b: 'cafea', day: 0 } },
  { e: '🌳', t: 'Plimbare',      sub: 'mâine, în parc',
    v: { a: 'plimbare', p: 'parc', t: '19:00', m: 'masina', w: 'lejer', b: 'suc', day: 1 } },
  { e: '🍦', t: 'Înghețată',     sub: 'azi, prin oraș',
    v: { a: 'inghetata', p: 'oras', t: '19:00', m: 'jos', w: 'lejer', b: 'limonada', day: 0 } },
  { e: '🌆', t: 'Seară frumoasă', sub: 'sâmbătă, elegant',
    v: { a: 'mancare', p: 'terasa', t: '21:00', m: 'masina', w: 'elegant', b: 'vin', day: 'sat' } },
];

const SURPRISE_TOASTS = [
  'Gata, ți-am ales eu 🎲',
  'Am decis pentru tine. Cu plăcere 😌',
  'Zarurile au vorbit 🎲',
  'Dacă nu-ți place, mai apasă o dată 🙃',
  'Combinația asta n-a dat greș niciodată*  (*niciodată testată)',
];

/** Ponturile pentru invitat: complementare cu ale expeditorului. */
function tipPoolFor(who) {
  return TIPS[who] || TIPS.x;
}
function otherSide(who) {
  return who === 'b' ? 'f' : who === 'f' ? 'b' : 'x';
}

/* ------------------------------------------------------- 2. STARE ȘI URL */

const KEYS = ['s', 'g', 'a', 'p', 'd', 't', 'm', 'w', 'b', 'n'];
const RKEYS = ['ra', 'rn', 'rp', 'rd', 'rt', 'rm'];

function isoOffset(days) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function nextSaturday() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

const state = {
  s: '', g: 'x', a: 'plimbare', p: 'parc', d: isoOffset(1), t: '19:00',
  m: 'masina', w: 'lejer', b: 'cafea', n: '',
};

const reply = { ra: '', rn: '', rp: '', rd: '', rt: '', rm: '' };

function opt(group, id) {
  const list = OPTIONS[group];
  return list.find(o => o.id === id) || list[0];
}

/* --- Memorie locală: a doua invitație pornește de unde ai rămas --- */

const STORE_KEY = 'ultima-invitatie';

function remember() {
  try {
    const keep = {};
    KEYS.forEach(k => { if (k !== 'n') keep[k] = state[k]; });
    localStorage.setItem(STORE_KEY, JSON.stringify(keep));
  } catch (_) { /* modul privat sau spațiu plin */ }
}

function recall() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (_) { return; }
  if (!saved) return;
  KEYS.forEach(k => { if (typeof saved[k] === 'string') state[k] = saved[k]; });
  // O dată trecută n-are sens: o mutăm pe mâine.
  if (state.d && state.d < isoOffset(0)) state.d = isoOffset(1);
}

function buildUrl(extra) {
  const params = new URLSearchParams();
  KEYS.forEach(k => { if (state[k]) params.set(k, state[k]); });
  if (extra) RKEYS.forEach(k => { if (extra[k]) params.set(k, extra[k]); });
  const base = location.href.split('#')[0].split('?')[0];
  return `${base}?${params.toString()}`;
}

/* ------------------------------------------------------------- 3. TEXTE */

function relDate(iso) {
  if (!iso) return 'când zici tu';
  const d = new Date(`${iso}T12:00`);
  if (isNaN(d)) return 'când zici tu';
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return 'azi';
  if (diff === 1) return 'mâine';
  if (diff === 2) return 'poimâine';
  return d.toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' });
}

/** Alege o glumă stabilă: aceeași invitație → aceeași glumă, la toată lumea. */
function pick(pool, seedStr) {
  let h = 7;
  for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
  return pool[h % pool.length];
}

function buildInvite() {
  const a = opt('a', state.a), p = opt('p', state.p);
  const who = state.s.trim() ? `${state.s.trim()} te invită la` : 'Te invit la';
  const when = relDate(state.d);
  const at = state.t ? `, pe la ${state.t}` : '';

  const lines = [
    `${a.e} ${who} ${a.p} ${p.p} ${when}${at}.`,
    opt('m', state.m).s,
    opt('w', state.w).s,
    `Se bea ${opt('b', state.b).p}. ${opt('b', state.b).e}`,
  ];
  if (state.n.trim()) lines.push(`„${state.n.trim()}”`);
  lines.push(pick(JOKES, KEYS.map(k => state[k]).join('|')));
  return lines.join('\n');
}

function buildReply() {
  const name = reply.rn.trim();
  const me = name ? `${name}: ` : '';
  const lines = [];

  if (reply.ra === 'yes') {
    lines.push(`${me}DA! 🎉`);
    lines.push(`Vin ${relDate(state.d)}${state.t ? `, pe la ${state.t}` : ''}, ${opt('p', state.p).p}.`);
    lines.push(pick(REPLY_CLOSERS, name + state.d));
  } else if (reply.ra === 'neg') {
    lines.push(`${me}Îmi place ideea, dar am o contrapropunere 😄`);
    lines.push(`Eu zic ${opt('p', reply.rp).p}, ${relDate(reply.rd)}${reply.rt ? `, pe la ${reply.rt}` : ''}.`);
    lines.push('Restul rămâne exact cum ai zis tu. Ai gusturi bune.');
  } else if (reply.ra === 'late') {
    lines.push(`${me}Da, dar hai altă dată 🗓️`);
    lines.push(`Eu aș putea ${relDate(reply.rd)}${reply.rt ? `, pe la ${reply.rt}` : ''}.`);
    lines.push('Ideea rămâne în picioare, doar data se mută.');
  } else {
    lines.push(`${me}Nu pot acum 😅`);
    lines.push('Dar întreabă-mă din nou, data viitoare am șanse mari să zic da.');
  }

  if (reply.rm.trim()) lines.push(`„${reply.rm.trim()}”`);
  return lines.join('\n');
}

/* [ochiul de sus, titlu fără nume, titlu cu nume] */
const ANSWER_TITLES = {
  yes:  ['🎉 ai primit un răspuns', 'A zis DA!',           'a zis DA!'],
  neg:  ['😄 ai primit un răspuns', 'Contrapropunere',     'are o contrapropunere'],
  late: ['🗓️ ai primit un răspuns', 'Da, dar altă dată',   'zice: hai altă dată'],
  no:   ['😅 ai primit un răspuns', 'Nu de data asta',     'nu poate acum'],
};

/* ------------------------------------- 3b. CEAS ȘI CALENDAR */

/** Acordul numeralului în română: 1 minut, 5 minute, 20 de minute. */
function ro(n, one, many) {
  if (n === 1) return `${n} ${one}`;
  const r = n % 100;
  return r >= 1 && r <= 19 ? `${n} ${many}` : `${n} de ${many}`;
}

function eventDate() {
  if (!state.d) return null;
  const d = new Date(`${state.d}T${state.t || '19:00'}`);
  return isNaN(d) ? null : d;
}

function countdownText() {
  const d = eventDate();
  if (!d) return '';
  const now = new Date();
  const ms = d - now;

  if (ms < -2 * 3600e3) return '';
  if (ms <= 0) return '🎉 Chiar acum!';

  // Sub trei ore contează ceasul, nu calendarul: la 23:59, „peste 8 minute”
  // e mai util decât „mâine, la 00:07”.
  const min = Math.round(ms / 60000);
  if (min < 60) return `⏳ Peste ${ro(min, 'minut', 'minute')}!`;
  if (min < 180) return `⏳ Peste ${ro(Math.round(ms / 3600e3), 'oră', 'ore')}`;

  const midnight = x => { const c = new Date(x); c.setHours(0, 0, 0, 0); return c; };
  const days = Math.round((midnight(d) - midnight(now)) / 86400000);

  if (days === 0) return `⏳ Azi, peste ${ro(Math.round(ms / 3600e3), 'oră', 'ore')}`;
  if (days === 1) return `⏳ Mâine${state.t ? `, la ${state.t}` : ''}`;
  return `⏳ Mai sunt ${ro(days, 'zi', 'zile')}`;
}

/** Fișier .ics, ca invitația să ajungă direct în calendarul telefonului. */
function buildIcs() {
  const d = eventDate();
  if (!d) return null;
  const end = new Date(d.getTime() + 90 * 60000);

  const p = n => String(n).padStart(2, '0');
  const local = x => `${x.getFullYear()}${p(x.getMonth() + 1)}${p(x.getDate())}T${p(x.getHours())}${p(x.getMinutes())}00`;
  const utc = x => x.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const esc = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

  // RFC 5545: liniile nu trec de 75 de octeți, se continuă cu un spațiu.
  const enc = new TextEncoder();
  const fold = line => {
    const out = [];
    let cur = '', bytes = 0;
    for (const ch of line) {
      const n = enc.encode(ch).length;
      if (bytes + n > 73) { out.push(cur); cur = ' '; bytes = 1; }
      cur += ch;
      bytes += n;
    }
    out.push(cur);
    return out.join('\r\n');
  };

  const who = state.s.trim();
  const summary = `${opt('a', state.a).l}${who ? ` cu ${who}` : ''}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hai sa ne vedem//RO',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${state.d}-${(state.t || '19:00').replace(':', '')}-${state.a}@hai-sa-ne-vedem`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${local(d)}`,
    `DTEND:${local(end)}`,
    fold(`SUMMARY:${esc(summary)}`),
    fold(`LOCATION:${esc(opt('p', state.p).p)}`),
    fold(`DESCRIPTION:${esc(buildInvite())}`),
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

/* ----------------------------------------------------------- 4. CHIP-URI */

const $ = id => document.getElementById(id);

function chipEl(emoji, label, active) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'chip';
  b.setAttribute('aria-pressed', active ? 'true' : 'false');
  b.innerHTML = `<span class="emoji" aria-hidden="true">${emoji}</span>`;
  b.append(label);
  return b;
}

/**
 * Randează un grup de chip-uri.
 * def: { label, key, items:[{id,e,l}], custom:'date'|'time' }
 * store: obiectul de stare pe care îl modifică (state sau reply)
 */
function renderGroup(parent, def, store, onChange) {
  const wrap = document.createElement('div');
  wrap.className = 'group';

  const lab = document.createElement('span');
  lab.className = 'group-label';
  lab.textContent = def.label;
  wrap.append(lab);

  const chips = document.createElement('div');
  chips.className = 'chips';
  chips.setAttribute('role', 'group');
  chips.setAttribute('aria-label', def.label);
  wrap.append(chips);

  const buttons = [];
  def.items.forEach(item => {
    const b = chipEl(item.e, item.l, store[def.key] === item.v);
    b.addEventListener('click', () => {
      store[def.key] = item.v;
      sync();
      buzz();
      onChange(def.key);
    });
    buttons.push({ b, v: item.v });
    chips.append(b);
  });

  let custom = null;
  if (def.custom) {
    const row = document.createElement('div');
    row.className = 'custom-row';
    custom = document.createElement('input');
    custom.type = def.custom;
    custom.setAttribute('aria-label', def.customLabel || def.label);
    if (def.custom === 'date') custom.min = isoOffset(0);
    custom.addEventListener('change', () => {
      if (!custom.value) return;
      store[def.key] = custom.value;
      sync();
      onChange(def.key);
    });
    row.append(custom);
    wrap.append(row);
  }

  function sync() {
    buttons.forEach(({ b, v }) => b.setAttribute('aria-pressed', store[def.key] === v ? 'true' : 'false'));
    if (custom) custom.value = store[def.key] || '';
  }

  sync();
  parent.append(wrap);
  return sync;
}

function dateItems() {
  return [
    { e: '☀️', l: 'Azi',     v: isoOffset(0) },
    { e: '🌤️', l: 'Mâine',   v: isoOffset(1) },
    { e: '🎈', l: 'Sâmbătă', v: nextSaturday() },
  ];
}

function hourItems() {
  return HOURS.map(h => ({ e: '🕐', l: h, v: h }));
}

function optItems(group) {
  return OPTIONS[group].map(o => ({ e: o.e, l: o.l, v: o.id }));
}

/* ------------------------------------------------------------ 5. UTILE UI */

let toastTimer = 0;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

function buzz(ms = 8) {
  if (navigator.vibrate) navigator.vibrate(ms);
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) { /* trecem pe varianta de rezervă */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.append(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
  ta.remove();
  if (!ok) prompt('Copiază de aici:', text);
  return ok;
}

async function shareOrCopy(text, url, okMsg) {
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Hai să ne vedem', text, url });
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }
  await copyText(`${text}\n\n${url}`);
  toast(okMsg);
}

function whatsapp(text, url) {
  window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n\n${url}`)}`, '_blank', 'noopener');
}

function downloadIcs() {
  const ics = buildIcs();
  if (!ics) { toast('Alege întâi o dată 🗓️'); return; }
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'invitatie.ics';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  toast('Deschide fișierul ca să-l pui în calendar 📅');
}

function show(viewId) {
  const swap = () => {
    ['view-compose', 'view-invite', 'view-answer'].forEach(id => {
      $(id).classList.toggle('hidden', id !== viewId);
    });
    window.scrollTo(0, 0);
  };
  // Tranziție lină acolo unde browserul o suportă; altfel, schimbare directă.
  if (document.startViewTransition) document.startViewTransition(swap);
  else swap();
}

/* ------------------------------------------------- 6. VIEW: COMPOZITOR */

const composeGroups = [
  { key: 'g', label: 'Eu sunt',     items: optItems('g') },
  { key: 'a', label: 'Ce facem?',   items: optItems('a') },
  { key: 'p', label: 'Unde?',       items: optItems('p') },
  { key: 'd', label: 'Când?',       items: dateItems(), custom: 'date', customLabel: 'Altă dată' },
  { key: 't', label: 'La ce oră?',  items: hourItems(), custom: 'time', customLabel: 'Altă oră' },
  // Cele de mai jos sunt ascunse implicit — invitația merge și fără ele.
  { key: 'm', label: 'Cum ajungem?',items: optItems('m'), extra: true },
  { key: 'w', label: 'Ținuta',      items: optItems('w'), extra: true },
  { key: 'b', label: 'Ce bem?',     items: optItems('b'), extra: true },
];

const composeSyncs = [];
let tipIndex = 0;

function renderTip() {
  const pool = tipPoolFor(state.g);
  const el = $('tip-text');
  el.textContent = pool[tipIndex % pool.length];
  el.style.animation = 'none';
  void el.offsetWidth;          // forțăm reluarea animației
  el.style.animation = '';
}

function renderPreview() {
  $('preview').textContent = buildInvite();
}

/** Pontul se schimbă doar când schimbi cine ești, nu la fiecare literă. */
function onComposeChange(key) {
  renderPreview();
  remember();
  if (key === 'g') { tipIndex = 0; renderTip(); }
}

/** Dacă ora aleasă a trecut deja azi, mutăm întâlnirea pe mâine. */
function ensureFuture() {
  const d = eventDate();
  if (d && d < new Date()) state.d = isoOffset(1);
}

function applyPreset(p) {
  Object.entries(p.v).forEach(([k, v]) => { if (k !== 'day') state[k] = v; });
  state.d = p.v.day === 'sat' ? nextSaturday() : isoOffset(p.v.day);
  ensureFuture();
  composeSyncs.forEach(fn => fn());
  renderPreview();
  remember();
  buzz(18);
  toast(`${p.e} Gata! Poți trimite.`);
  $('send-btn').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderPresets() {
  const host = $('presets');
  PRESETS.forEach(p => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'preset';

    const t = document.createElement('span');
    t.className = 'preset-title';
    t.textContent = `${p.e} ${p.t}`;

    const s = document.createElement('span');
    s.className = 'preset-sub';
    s.textContent = p.sub;

    b.append(t, s);
    b.addEventListener('click', () => applyPreset(p));
    host.append(b);
  });
}

function initCompose() {
  recall();
  renderPresets();

  const host = $('chip-groups');
  const extraHost = $('extra-groups');
  composeGroups.forEach(def => {
    composeSyncs.push(renderGroup(def.extra ? extraHost : host, def, state, onComposeChange));
  });

  $('extra-toggle').addEventListener('click', () => {
    const open = extraHost.classList.toggle('hidden') === false;
    $('extra-toggle').setAttribute('aria-expanded', String(open));
    $('extra-toggle').textContent = open ? '➖ Ascunde detaliile' : '➕ Detalii: transport, ținută, ce bem';
    buzz();
  });

  $('tip-card').addEventListener('click', () => {
    tipIndex++;
    renderTip();
    buzz();
  });

  $('senderName').value = state.s;
  $('senderName').addEventListener('input', e => {
    state.s = e.target.value;
    renderPreview();
    remember();
  });

  $('note').addEventListener('input', e => {
    state.n = e.target.value;
    renderPreview();
  });

  $('note-toggle').addEventListener('click', () => {
    const ta = $('note');
    const open = ta.classList.toggle('hidden') === false;
    $('note-toggle').setAttribute('aria-expanded', String(open));
    $('note-toggle').textContent = open ? '➖ Ascunde mesajul' : '➕ Adaugă un mesaj de la tine';
    if (open) ta.focus();
  });

  $('surprise-btn').addEventListener('click', () => {
    const rnd = list => list[Math.floor(Math.random() * list.length)];
    state.a = rnd(OPTIONS.a).id;
    state.p = rnd(OPTIONS.p).id;
    state.m = rnd(OPTIONS.m).id;
    state.w = rnd(OPTIONS.w).id;
    state.b = rnd(OPTIONS.b).id;
    state.d = rnd([isoOffset(0), isoOffset(1), nextSaturday()]);
    state.t = rnd(HOURS);
    ensureFuture();
    composeSyncs.forEach(fn => fn());
    renderPreview();
    remember();
    buzz(18);
    toast(rnd(SURPRISE_TOASTS));
  });

  $('send-btn').addEventListener('click', () => {
    buzz();
    shareOrCopy(buildInvite(), buildUrl(), 'Invitația e copiată, dă-i paste 💌');
  });
  $('wa-btn').addEventListener('click', () => whatsapp(buildInvite(), buildUrl()));
  $('copy-btn').addEventListener('click', async () => {
    await copyText(buildUrl());
    toast('Link copiat 🔗');
  });

  renderPreview();
  renderTip();
}

/* ------------------------------------------------ 7. VIEW: INVITAȚIA */

let counterSyncs = [];

function renderReplyPreview() {
  $('reply-preview').textContent = buildReply();
}

function openReply(answer) {
  reply.ra = answer;
  reply.rp = reply.rp || state.p;
  reply.rd = reply.rd || (answer === 'late' ? isoOffset(2) : state.d);
  reply.rt = reply.rt || state.t;

  const host = $('counter-groups');
  host.textContent = '';
  counterSyncs = [];

  const defs = [];
  if (answer === 'neg') defs.push({ key: 'rp', label: 'Eu aș prefera', items: optItems('p') });
  if (answer === 'neg' || answer === 'late') {
    defs.push({ key: 'rd', label: 'Când pot eu', items: dateItems(), custom: 'date', customLabel: 'Altă dată' });
    defs.push({ key: 'rt', label: 'La ce oră',  items: hourItems(), custom: 'time', customLabel: 'Altă oră' });
  }
  defs.forEach(def => counterSyncs.push(renderGroup(host, def, reply, renderReplyPreview)));

  $('reply-panel').classList.remove('hidden');
  $('reply-actions').classList.remove('hidden');
  renderReplyPreview();

  if (answer === 'yes') confetti();
  buzz(answer === 'yes' ? 30 : 8);

  requestAnimationFrame(() => {
    $('reply-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

let guestTipIndex = 0;

function renderGuestTip() {
  const pool = tipPoolFor(otherSide(state.g));
  const el = $('guest-tip-text');
  el.textContent = pool[guestTipIndex % pool.length];
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
}

function renderCountdown() {
  const txt = countdownText();
  const el = $('countdown');
  el.textContent = txt;
  el.classList.toggle('hidden', !txt);
}

function initInvite() {
  $('invite-text').textContent = buildInvite();

  renderCountdown();
  setInterval(renderCountdown, 30000);

  $('cal-btn').addEventListener('click', () => { buzz(); downloadIcs(); });

  guestTipIndex = Math.floor(Math.random() * 8);
  renderGuestTip();
  $('guest-tip-card').addEventListener('click', () => {
    guestTipIndex++;
    renderGuestTip();
    buzz();
  });

  document.querySelectorAll('#answer-buttons .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#answer-buttons .btn').forEach(b => b.classList.remove('btn-primary'));
      if (btn.dataset.answer !== 'yes') btn.classList.add('btn-primary');
      openReply(btn.dataset.answer);
    });
  });

  $('recipientName').addEventListener('input', e => {
    reply.rn = e.target.value;
    renderReplyPreview();
  });
  $('replyNote').addEventListener('input', e => {
    reply.rm = e.target.value;
    renderReplyPreview();
  });
  $('reply-note-toggle').addEventListener('click', () => {
    const ta = $('replyNote');
    const open = ta.classList.toggle('hidden') === false;
    $('reply-note-toggle').setAttribute('aria-expanded', String(open));
    $('reply-note-toggle').textContent = open ? '➖ Ascunde mesajul' : '➕ Adaugă un mesaj';
    if (open) ta.focus();
  });

  $('reply-send-btn').addEventListener('click', () => {
    buzz();
    shareOrCopy(buildReply(), buildUrl(reply), 'Răspunsul e copiat, dă-i paste 📤');
  });
  $('reply-wa-btn').addEventListener('click', () => whatsapp(buildReply(), buildUrl(reply)));
  $('reply-copy-btn').addEventListener('click', async () => {
    await copyText(`${buildReply()}\n\n${buildUrl(reply)}`);
    toast('Răspuns copiat 📋');
  });
}

/* ------------------------------------------- 8. VIEW: RĂSPUNSUL PRIMIT */

function initAnswer() {
  const [eyebrow, plain, named] = ANSWER_TITLES[reply.ra] || ANSWER_TITLES.yes;
  $('answer-eyebrow').textContent = eyebrow;
  $('answer-title').textContent = reply.rn.trim() ? `${reply.rn.trim()} ${named}` : plain;
  $('answer-text').textContent = `${buildReply()}\n\nla invitația ta:\n${buildInvite()}`;

  // Dacă a zis da, are sens să pui întâlnirea în calendar.
  if (reply.ra === 'yes' && eventDate()) {
    const cal = $('answer-cal-btn');
    cal.classList.remove('hidden');
    cal.addEventListener('click', () => { buzz(); downloadIcs(); });
  }

  $('new-btn').addEventListener('click', () => {
    location.href = location.href.split('#')[0].split('?')[0];
  });

  if (reply.ra === 'yes') setTimeout(confetti, 320);
}

/* --------------------------------------------------------- 9. CONFETTI */

function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const c = document.createElement('canvas');
  c.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:15;pointer-events:none';
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = innerWidth, h = innerHeight;
  c.width = w * dpr; c.height = h * dpr;
  document.body.append(c);
  const x = c.getContext('2d');
  x.scale(dpr, dpr);

  const glyphs = ['🎉', '✨', '💛', '🌟', '💫'];
  const bits = Array.from({ length: 46 }, () => ({
    x: w / 2 + (Math.random() - .5) * w * .5,
    y: h * .45 + (Math.random() - .5) * 60,
    vx: (Math.random() - .5) * 9,
    vy: -Math.random() * 13 - 5,
    r: Math.random() * Math.PI,
    vr: (Math.random() - .5) * .28,
    s: 16 + Math.random() * 14,
    g: glyphs[(Math.random() * glyphs.length) | 0],
  }));

  const start = performance.now();
  (function step(now) {
    const life = now - start;
    if (life > 2600) { c.remove(); return; }
    x.clearRect(0, 0, w, h);
    x.globalAlpha = life > 1900 ? 1 - (life - 1900) / 700 : 1;
    for (const b of bits) {
      b.vy += .38;
      b.vx *= .992;
      b.x += b.vx;
      b.y += b.vy;
      b.r += b.vr;
      x.save();
      x.translate(b.x, b.y);
      x.rotate(b.r);
      x.font = `${b.s}px serif`;
      x.textAlign = 'center';
      x.fillText(b.g, 0, 0);
      x.restore();
    }
    requestAnimationFrame(step);
  })(start);
}

/* ------------------------------------------- 10. CERUL CU LICURICI 🌙✨ */

const sky = $('sky');
const sctx = sky.getContext('2d', { alpha: true });
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

let W = 0, H = 0, DPR = 1;
let starLayer = null, glowSprite = null;
let flies = [], twinklers = [], shots = [], nextShot = 4000;
let skyRaf = 0, lastFrame = 0;

function makeGlow() {
  const s = 64, c = document.createElement('canvas');
  c.width = c.height = s;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0.00, 'rgba(255,252,205,1)');
  grd.addColorStop(0.18, 'rgba(255,232,130,0.55)');
  grd.addColorStop(0.45, 'rgba(210,255,150,0.16)');
  grd.addColorStop(1.00, 'rgba(180,255,120,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  return c;
}

function makeStars() {
  const c = document.createElement('canvas');
  c.width = Math.max(1, W * DPR);
  c.height = Math.max(1, H * DPR);
  const g = c.getContext('2d');
  g.scale(DPR, DPR);

  // Ceață galactică — două pete moi, ca să nu fie cerul „plat”
  for (let i = 0; i < 2; i++) {
    const cx = W * (0.25 + 0.5 * i), cy = H * (0.2 + 0.45 * i), rad = Math.max(W, H) * 0.55;
    const grd = g.createRadialGradient(cx, cy, 0, cx, cy, rad);
    grd.addColorStop(0, i ? 'rgba(120,90,200,0.10)' : 'rgba(70,120,210,0.12)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, W, H);
  }

  const count = Math.min(230, Math.round((W * H) / 5200));
  for (let i = 0; i < count; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const r = Math.random() < 0.88 ? Math.random() * 0.8 + 0.3 : Math.random() * 0.9 + 1.1;
    const a = Math.random() * 0.6 + 0.35;
    const tint = Math.random();
    g.fillStyle = tint < 0.12 ? `rgba(190,215,255,${a})`
                : tint > 0.93 ? `rgba(255,232,190,${a})`
                : `rgba(255,255,255,${a})`;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();

    if (r > 1.2) { // halou fin pentru stelele mari
      g.fillStyle = `rgba(255,255,255,${a * 0.10})`;
      g.beginPath();
      g.arc(x, y, r * 3.4, 0, Math.PI * 2);
      g.fill();
    }
  }
  return c;
}

function initSky() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth;
  H = innerHeight;
  sky.width = Math.max(1, W * DPR);
  sky.height = Math.max(1, H * DPR);
  sctx.setTransform(DPR, 0, 0, DPR, 0, 0);

  starLayer = makeStars();
  if (!glowSprite) glowSprite = makeGlow();

  const flyCount = Math.max(7, Math.min(18, Math.round((W * H) / 42000)));
  flies = Array.from({ length: flyCount }, () => ({
    x: Math.random() * W,
    y: H * 0.35 + Math.random() * H * 0.65,
    ang: Math.random() * Math.PI * 2,
    spd: 0.12 + Math.random() * 0.22,
    size: 2.2 + Math.random() * 2.2,
    phase: Math.random() * Math.PI * 2,
    rate: 0.0011 + Math.random() * 0.0016,
  }));

  twinklers = Array.from({ length: 14 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H * 0.8,
    r: 0.7 + Math.random() * 1.1,
    phase: Math.random() * Math.PI * 2,
    rate: 0.0008 + Math.random() * 0.0016,
  }));

  nextShot = 3000 + Math.random() * 7000;
  shots = [];
}

function spawnShot(x, y) {
  if (shots.length > 6) return;
  shots.push({
    x: x != null ? x : Math.random() * W * 0.7,
    y: y != null ? y : Math.random() * H * 0.35,
    len: 90 + Math.random() * 120,
    life: 0,
    dur: 620,
  });
}

function drawSky(now, dt) {
  sctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  sctx.clearRect(0, 0, W, H);
  sctx.globalCompositeOperation = 'source-over';
  sctx.globalAlpha = 1;
  if (starLayer) sctx.drawImage(starLayer, 0, 0, W, H);

  sctx.globalCompositeOperation = 'lighter';

  // Stele care clipesc
  for (const t of twinklers) {
    const b = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * t.rate + t.phase));
    sctx.globalAlpha = b * 0.85;
    sctx.fillStyle = '#fff';
    sctx.beginPath();
    sctx.arc(t.x, t.y, t.r, 0, Math.PI * 2);
    sctx.fill();
  }

  // Licurici
  for (const f of flies) {
    f.ang += (Math.random() - 0.5) * 0.35;
    f.x += Math.cos(f.ang) * f.spd * dt * 0.06;
    f.y += Math.sin(f.ang) * f.spd * dt * 0.045;
    if (f.x < -40) f.x = W + 40; else if (f.x > W + 40) f.x = -40;
    if (f.y < H * 0.18) f.y = H * 0.18 + 2; else if (f.y > H + 40) f.y = H * 0.3;

    const pulse = 0.5 + 0.5 * Math.sin(now * f.rate + f.phase);
    const b = pulse * pulse * pulse;          // impulsuri scurte, pauze lungi
    if (b < 0.02) continue;

    const r = f.size * 9;
    sctx.globalAlpha = b * 0.9;
    sctx.drawImage(glowSprite, f.x - r, f.y - r, r * 2, r * 2);

    sctx.globalAlpha = Math.min(1, b * 1.15);
    sctx.fillStyle = '#fffde0';
    sctx.beginPath();
    sctx.arc(f.x, f.y, f.size * 0.42, 0, Math.PI * 2);
    sctx.fill();
  }

  // Stele căzătoare: una din când în când, plus una la fiecare atingere a cerului
  nextShot -= dt;
  if (nextShot <= 0) {
    spawnShot();
    nextShot = 9000 + Math.random() * 14000;
  }
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    s.life += dt;
    const k = s.life / s.dur;
    if (k >= 1) { shots.splice(i, 1); continue; }

    const travel = k * (W * 0.45);
    const hx = s.x + travel, hy = s.y + travel * 0.55;
    const tx = hx - s.len * 0.9, ty = hy - s.len * 0.5;
    const grd = sctx.createLinearGradient(tx, ty, hx, hy);
    grd.addColorStop(0, 'rgba(255,255,255,0)');
    grd.addColorStop(1, 'rgba(255,255,255,0.9)');
    sctx.globalAlpha = Math.sin(k * Math.PI);
    sctx.strokeStyle = grd;
    sctx.lineWidth = 1.8;
    sctx.lineCap = 'round';
    sctx.beginPath();
    sctx.moveTo(tx, ty);
    sctx.lineTo(hx, hy);
    sctx.stroke();
  }

  sctx.globalAlpha = 1;
  sctx.globalCompositeOperation = 'source-over';
}

function skyFrame(now) {
  const dt = Math.min(48, now - (lastFrame || now));
  lastFrame = now;
  drawSky(now, dt);
  skyRaf = requestAnimationFrame(skyFrame);
}

function startSky() {
  if (skyRaf || document.documentElement.dataset.theme !== 'night') return;
  if (!starLayer) initSky();
  if (reducedMotion.matches) { drawSky(performance.now(), 16); return; }
  lastFrame = 0;
  skyRaf = requestAnimationFrame(skyFrame);
}

function stopSky() {
  cancelAnimationFrame(skyRaf);
  skyRaf = 0;
}

let resizeTimer = 0;
addEventListener('resize', () => {
  if (document.documentElement.dataset.theme !== 'night') return;
  // Pe telefon, bara de adresă care se ascunde declanșează resize — filtrăm zgomotul.
  if (Math.abs(innerWidth - W) < 2 && Math.abs(innerHeight - H) < 120) return;
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    stopSky();
    initSky();
    startSky();
  }, 220);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopSky(); else startSky();
});

// Atingi cerul pe lângă butoane → cade o stea de acolo. 🌠
document.addEventListener('click', e => {
  if (!skyRaf || document.documentElement.dataset.theme !== 'night') return;
  if (e.target.closest('button, input, textarea, select, a, label')) return;
  spawnShot(e.clientX - 60, e.clientY - 35);
}, { passive: true });

/* --------------------------------------------------------- 11. TEMA */

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $('theme-icon').textContent = theme === 'night' ? '🌙' : '☀️';
  document.querySelector('meta[name="theme-color"]')
    .setAttribute('content', theme === 'night' ? '#080c1e' : '#fff6ea');
  if (theme === 'night') {
    startSky();
  } else {
    stopSky();
    sctx.clearRect(0, 0, W, H);
  }
}

function autoTheme() {
  const h = new Date().getHours();
  return (h >= 19 || h < 7) ? 'night' : 'day';
}

function initTheme() {
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (_) { /* modul privat */ }
  applyTheme(saved || autoTheme());

  $('theme-btn').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'night' ? 'day' : 'night';
    applyTheme(next);
    buzz(12);
    try { localStorage.setItem('theme', next); } catch (_) { /* ignorăm */ }
    toast(next === 'night' ? 'Noapte bună 🌙' : 'Bună dimineața ☀️');
  });
}

/* ------------------------------------------------------ 12. PORNIRE */

function readUrl() {
  const q = new URLSearchParams(location.search);
  let hasInvite = false;
  KEYS.forEach(k => {
    const v = q.get(k);
    if (v !== null) { state[k] = v; hasInvite = true; }
  });
  let hasReply = false;
  RKEYS.forEach(k => {
    const v = q.get(k);
    if (v !== null) { reply[k] = v; if (k === 'ra') hasReply = true; }
  });
  return { hasInvite, hasReply };
}

/* Instalare pe ecranul telefonului: butonul apare doar dacă se poate. */
function initInstall() {
  const btn = $('install-btn');
  let deferred = null;

  addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferred = e;
    btn.classList.remove('hidden');
  });

  btn.addEventListener('click', async () => {
    if (!deferred) return;
    btn.classList.add('hidden');
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    if (outcome === 'accepted') toast('Gata, o ai pe ecran 📲');
  });

  addEventListener('appinstalled', () => {
    btn.classList.add('hidden');
    toast('Instalată! Acum pornește instant 🚀');
  });
}

/* Service worker: pornire instantanee și funcționare fără internet. */
function initServiceWorker() {
  if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;

  navigator.serviceWorker.register('./sw.js').then(reg => {
    reg.addEventListener('updatefound', () => {
      const fresh = reg.installing;
      if (!fresh) return;
      fresh.addEventListener('statechange', () => {
        if (fresh.state === 'installed' && navigator.serviceWorker.controller) {
          toast('Versiune nouă ✨ Reîncarcă pagina.');
        }
      });
    });
  }).catch(() => { /* fără cache offline, aplicația merge la fel */ });
}

(function main() {
  initTheme();

  const { hasInvite, hasReply } = readUrl();

  if (hasReply) {
    initAnswer();
    show('view-answer');
  } else if (hasInvite) {
    initInvite();
    show('view-invite');
  } else {
    initCompose();
    initInstall();
    show('view-compose');
  }

  initServiceWorker();
})();
