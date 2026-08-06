/* =========================================================================
   Hai să ne vedem: invitații rapide, cu cer înstelat și licurici
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
    { id: 'bere',      e: '🍺', l: 'O bere',    p: 'o bere' },
    { id: 'inghetata', e: '🍦', l: 'Înghețată', p: 'o înghețată' },
    { id: 'mancare',   e: '🍕', l: 'Mâncare',   p: 'ceva de mâncat' },
    { id: 'film',      e: '🎬', l: 'Film',      p: 'un film' },
    { id: 'sport',     e: '🏀', l: 'Baschet',   p: 'un baschet' },
    { id: 'vorbit',    e: '💬', l: 'Vorbit',    p: 'o vorbă lungă' },
  ],
  p: [
    { id: 'parc',    e: '🌳', l: 'În parc',    p: 'în parc' },
    { id: 'terasa',  e: '☂️', l: 'Pe terasă',  p: 'pe o terasă' },
    { id: 'oras',    e: '🏙️', l: 'În oraș',    p: 'prin oraș' },
    { id: 'teren',   e: '🏟️', l: 'La teren',   p: 'pe teren' },
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
    { id: 'bere',      e: '🍺', l: 'Bere',      p: 'o bere' },
    { id: 'suc',       e: '🧃', l: 'Suc',       p: 'un suc' },
    { id: 'apa',       e: '💧', l: 'Apă',       p: 'o apă' },
    { id: 'limonada',  e: '🍋', l: 'Limonadă',  p: 'o limonadă' },
    { id: 'vin',       e: '🍷', l: 'Un pahar de vin', p: 'un pahar de vin' },
  ],
};

/* Ieșirile „cu prietenii”. Nu întrebăm pe nimeni cu cine se vede: alegerea de
   la „Ce facem?” spune destul. Bere sau baschet schimbă și rândul de inimă, și
   ponturile, fără să apară vreun buton în plus pe ecran. */
const AMICALE = new Set(['bere', 'sport']);

const HOURS = ['11:00', '17:00', '19:00', '21:00'];

/* Rândul de inimă: de ce întrebi, nu ce faceți. Stă imediat sub invitație,
   fiindcă acolo se citește, și e singurul loc din text unde vorbești la
   persoana întâi. Restul sunt detalii; ăsta e mesajul.

   Sunt scrise să meargă și pentru o prietenă, și pentru cineva care îți place:
   spun că ți-e greu să întrebi și că vrei să vină, fără să promită nimic. */
const INIMA = [
  'Dacă te-ai întrebat vreodată dacă mă gândesc la tine: uite răspunsul.',
  'Am șters mesajul ăsta de trei ori. A patra oară l-am trimis.',
  'Nu știu să fac asta elegant, așa că o spun simplu: mi-ar plăcea să te văd.',
  'Mi-e puțin frică să întreb. Mi-ar fi mai frică să n-o fac.',
  'Am tot amânat mesajul ăsta. Gata cu amânatul.',
  'Zi da și mi-ai făcut săptămâna. Zi nu și tot mă bucur că am întrebat.',
  'Ție poate îți sună banal. Mie mi-a luat trei zile să întreb.',
  'Nu-ți cer mult: o oră și puțină atenție. Restul aranjez eu.',
  'Mi-ar plăcea o seară în care să nu ne grăbim nicăieri.',
  // Ultima iese pe formularul neatins, adică exact la cine doar apasă
  // „Trimite”. De aia e cea mai blândă din listă și stă aici, la coadă.
  'Nu prea am curaj să întreb, dar chiar vreau să te văd.',
];

/* Aceeași idee, dar pentru bere și baschet: tot despre „mi-ar plăcea să vii”,
   doar că fără nimic romantic în ea. Dacă ghicim greșit ocazia, cel mai rău
   caz e un mesaj prietenos, nu unul stânjenitor. */
const INIMA_AMICI = [
  'Ne-am văzut ultima oară acum prea mult. Hai să reparăm asta.',
  'Fără ocazie, fără motiv. Doar că merită.',
  'Am ajuns să ne vedem doar prin story-uri. Hai să schimbăm asta.',
  'Zi da, că altfel stau acasă și mă uit iar la același serial.',
  'Am nevoie de o oră în care să râd. Te-am ales pe tine.',
  'Hai, că avem de povestit vreo trei luni.',
  'Nu-mi trebuie decât o oră și un motiv bun. Motivul ești tu.',
  'Dacă zici nu, mă descurc. Dar ar fi mult mai bine cu tine.',
  'Mi-e dor să ieșim ca pe vremuri. Hai să ne vedem.',
];

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

/* Butonul de „nu” nu cedează din prima: se roagă de tine. Ultima rugăminte
   îți spune limpede ce să faci, ca gluma să rămână glumă: dacă chiar nu poți
   veni, ajungi la „nu” din trei atingeri, nu din nouăsprezece. */
const NO_PLEAS = [
  '🥺 pleaseeee?',
  '😢 nici măcar o oră?',
  '💔 bine. mai apasă o dată și te cred',
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
  { e: '🍺', t: 'O bere',        sub: 'azi, în oraș',
    v: { a: 'bere', p: 'oras', t: '19:00', m: 'acolo', w: 'lejer', b: 'bere', day: 0 } },
  { e: '🏀', t: 'Baschet',       sub: 'mâine, la teren',
    v: { a: 'sport', p: 'teren', t: '17:00', m: 'acolo', w: 'lejer', b: 'apa', day: 1 } },
];

const SURPRISE_TOASTS = [
  'Gata, ți-am ales eu 🎲',
  'Am decis pentru tine. Cu plăcere 😌',
  'Zarurile au vorbit 🎲',
  'Dacă nu-ți place, mai apasă o dată 🙃',
  'Combinația asta n-a dat greș niciodată*  (*niciodată testată)',
];

/* Ponturi pentru bere și baschet: se aleg după ce faceți, nu după cine ești.
   La un meci nu contează dacă ești băiat sau fată, contează să ai adidașii. */
const TIPS_AMICI = {
  bere: [
    'Fă tu cinste cu prima rundă. Se ține minte. 🍻',
    'Vino cu o poveste bună. Restul se rezolvă singur.',
    'Stabiliți din start cine conduce înapoi. E mai ușor acum decât după. 🚗',
    'Telefonul în buzunar. O oră fără el n-a omorât pe nimeni. 📵',
    'Nu începe cu „hai doar una”. Nu te crede nimeni. 😄',
    'Întreabă-l ce mai face și chiar ascultă răspunsul. 👂',
  ],
  sport: [
    'Ia mingea ta. A lui e dezumflată din vara trecută. 🏀',
    'Adidașii buni, nu ăia „de oraș”. Genunchii îți mulțumesc. 👟',
    'Adu apă. Sună plictisitor până în minutul zece. 💧',
    'Un tricou de schimb în rucsac. Crezi că nu-ți trebuie. Îți trebuie. 👕',
    'Încălzește-te. Ai trecut de vârsta la care mergea și fără. 🤸',
    'Ține scorul cu voce tare, altfel câștigă amândoi. 😅',
  ],
};

/** Ponturile pentru invitat: complementare cu ale expeditorului. */
function tipPoolFor(who) {
  return TIPS_AMICI[state.a] || TIPS[who] || TIPS.x;
}
function otherSide(who) {
  return who === 'b' ? 'f' : who === 'f' ? 'b' : 'x';
}

/* ------------------------------------------------------- 2. STARE ȘI URL */

/* Cheile din care se scrie invitația. `x` e textul rescris de expeditor: dacă
   are ceva în el, el pleacă mai departe, iar restul cheilor rămân doar pentru
   dată, ceas și calendar. Seed-ul glumelor se calculează fără `x`, ca textul
   generat să nu sară în altul când te apuci să-l editezi. */
const SEED_KEYS = ['s', 'g', 'a', 'p', 'd', 't', 'm', 'w', 'b', 'n'];
const KEYS = [...SEED_KEYS, 'x'];

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
  m: 'masina', w: 'lejer', b: 'cafea', n: '', x: '',
};

/* Citirea unei invitații primite scrie peste `state`, de aia ținem minte de
   unde am plecat, ca întoarcerea la compozitor să nu-ți lase în formular
   invitația altcuiva. */
const DEFAULTS = { ...state };

/* `rx` e răspunsul rescris de mână, la fel ca `x` la invitație. */
const reply = { ra: '', rn: '', rp: '', rd: '', rt: '', rm: '', rx: '' };

/* Ce s-a convenit până la urmă, când invitatul a propus altceva și
   expeditorul a bătut palma: `{ p, d, t }`, sau `null` dacă n-a fost cazul.
   Îl ținem separat de `state`, ca invitația trimisă să rămână exact cum a
   plecat. Ceasul și calendarul se uită întâi aici. */
let agreed = null;

/** Locul, ziua și ora care contează acum: înțelegerea, dacă există. */
const settled = () => agreed || { p: state.p, d: state.d, t: state.t };

/* Numele tău vine din contul Google, nu-l mai cerem în formular. Îl ținem
   separat de `state.s`, fiindcă acolo ajunge și numele altcuiva când citești
   o invitație primită. */
let myName = '';

/* Invitația salvată în cloud pentru compoziția curentă. Se rupe la orice
   schimbare, ca linkul trimis să spună mereu ce scrie pe ecran. */
let draftId = '';

function opt(group, id) {
  const list = OPTIONS[group];
  return list.find(o => o.id === id) || list[0];
}

/* --- Memorie locală: a doua invitație pornește de unde ai rămas --- */

const STORE_KEY = 'ultima-invitatie';

/* Mesajul (`n`) și textul rescris (`x`) se scriu de fiecare dată de la zero,
   iar numele (`s`) vine din cont: n-are rost să le ținem minte. */
const REMEMBER_KEYS = KEYS.filter(k => !['n', 's', 'x'].includes(k));

function remember() {
  draftId = '';   // s-a schimbat compoziția: linkul vechi nu mai e valabil
  try {
    const keep = {};
    REMEMBER_KEYS.forEach(k => { keep[k] = state[k]; });
    localStorage.setItem(STORE_KEY, JSON.stringify(keep));
  } catch (_) { /* modul privat sau spațiu plin */ }
}

function recall() {
  let saved;
  try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (_) { return; }
  if (!saved) return;
  REMEMBER_KEYS.forEach(k => { if (typeof saved[k] === 'string') state[k] = saved[k]; });
  // O dată trecută n-are sens: o mutăm pe mâine.
  if (state.d && state.d < isoOffset(0)) state.d = isoOffset(1);
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

/** Textul care pleacă mai departe: al tău dacă l-ai rescris, altfel al nostru. */
function buildInvite() {
  return state.x.trim() || autoInvite();
}

function autoInvite() {
  const a = opt('a', state.a), p = opt('p', state.p);
  const who = state.s.trim() ? `${state.s.trim()} te invită la` : 'Te invit la';
  const when = relDate(state.d);
  const at = state.t ? `, pe la ${state.t}` : '';

  const seed = SEED_KEYS.map(k => state[k]).join('|');

  const lines = [
    `${a.e} ${who} ${a.p} ${p.p} ${when}${at}.`,
    pick(AMICALE.has(state.a) ? INIMA_AMICI : INIMA, `inima|${seed}`),
    opt('m', state.m).s,
    opt('w', state.w).s,
    `Se bea ${opt('b', state.b).p}. ${opt('b', state.b).e}`,
  ];
  if (state.n.trim()) lines.push(`„${state.n.trim()}”`);
  lines.push(pick(JOKES, seed));
  return lines.join('\n');
}

/** La fel ca la invitație: ce ai rescris tu bate ce am scris noi. */
function buildReply() {
  return reply.rx.trim() || autoReply();
}

function autoReply() {
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
  const w = settled();
  if (!w.d) return null;
  const d = new Date(`${w.d}T${w.t || '19:00'}`);
  return isNaN(d) ? null : d;
}

/**
 * Cât mai e până la întâlnire. Fără argumente vorbește despre invitația de pe
 * ecran; cu ele, despre oricare alta — lista „urmează” are mai multe deodată.
 */
function countdownText(at, hhmm) {
  const d = at || eventDate();
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
  const t = hhmm === undefined ? settled().t : hhmm;
  if (days === 1) return `⏳ Mâine${t ? `, la ${t}` : ''}`;
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
  const where = opt('p', settled().p).p;

  // Dacă s-a bătut palma, invitația originală rămâne în descriere, dar cu
  // înțelegerea scrisă sub ea: altfel ar arăta o dată care nu mai e adevărată.
  const body = agreed
    ? `${buildInvite()}\n\nNe-am înțeles până la urmă: ${where}, ${relDate(agreed.d)}${agreed.t ? `, pe la ${agreed.t}` : ''}.`
    : buildInvite();

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hai sa ne vedem//RO',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${settled().d}-${(settled().t || '19:00').replace(':', '')}-${state.a}@hai-sa-ne-vedem`,
    `DTSTAMP:${utc(new Date())}`,
    `DTSTART:${local(d)}`,
    `DTEND:${local(end)}`,
    fold(`SUMMARY:${esc(summary)}`),
    fold(`LOCATION:${esc(where)}`),
    fold(`DESCRIPTION:${esc(body)}`),
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

const VIEWS = ['view-auth', 'view-compose', 'view-invite', 'view-answer', 'view-inbox'];

function show(viewId) {
  const swap = () => {
    VIEWS.forEach(id => {
      $(id).classList.toggle('hidden', id !== viewId);
    });
    window.scrollTo(0, 0);
  };
  // Tranziție lină acolo unde browserul o suportă; altfel, schimbare directă.
  // O tranziție sărită (navigare rapidă, pagină ascunsă) își respinge
  // promisiunile: nu e o eroare, dar fără catch ar umple consola cu una.
  if (document.startViewTransition) {
    const t = document.startViewTransition(swap);
    t.ready.catch(() => {});
    t.finished.catch(() => {});
  } else swap();
}

/* ------------------------------------------------- 6. VIEW: COMPOZITOR */

const composeGroups = [
  // „Eu sunt” lipsește dinadins: nu intră în invitație, schimbă doar ponturile,
  // așa că butoanele lui stau în cardul de pont (vezi renderWho).
  { key: 'a', label: 'Ce facem?',   items: optItems('a') },
  { key: 'p', label: 'Unde?',       items: optItems('p') },
  { key: 'd', label: 'Când?',       items: dateItems(), custom: 'date', customLabel: 'Altă dată' },
  { key: 't', label: 'La ce oră?',  items: hourItems(), custom: 'time', customLabel: 'Altă oră' },
  // Cele de mai jos sunt ascunse implicit: invitația merge și fără ele.
  { key: 'm', label: 'Cum ajungem?',items: optItems('m'), extra: true },
  { key: 'w', label: 'Ținuta',      items: optItems('w'), extra: true },
  { key: 'b', label: 'Ce bem?',     items: optItems('b'), extra: true },
];

const composeSyncs = [];
let tipIndex = 0;

/** Cele trei butoane mici din capul pontului: schimbă doar pontul. */
function renderWho() {
  const host = $('tip-who');
  host.textContent = '';
  OPTIONS.g.forEach(o => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'who';
    b.textContent = o.e;
    b.title = `Ponturi pentru: ${o.l}`;
    b.setAttribute('aria-label', `Ponturi pentru: ${o.l}`);
    b.setAttribute('aria-pressed', state.g === o.id ? 'true' : 'false');
    b.addEventListener('click', () => {
      state.g = o.id;
      tipIndex = 0;
      renderWho();
      renderTip();
      remember();
      buzz();
    });
    host.append(b);
  });
}

function renderTip() {
  // La bere sau baschet pontul nu depinde de cine ești, deci butoanele alea
  // n-ar face nimic dacă le-am lăsa la vedere.
  $('tip-who').classList.toggle('hidden', AMICALE.has(state.a));

  const pool = tipPoolFor(state.g);
  const el = $('tip-text');
  el.textContent = pool[tipIndex % pool.length];
  el.style.animation = 'none';
  void el.offsetWidth;          // forțăm reluarea animației
  el.style.animation = '';
}

/* ---- Rescrierea textului: aceeași mecanică la invitație și la răspuns ----
   Textul rămâne al tău din clipa în care îl atingi. Chip-urile nu ți-l mai
   suprascriu, ca să nu-ți pierzi ce ai scris dintr-o atingere greșită; „↺
   textul automat” îl dă înapoi când vrei. */

function autoGrow(ta) {
  ta.style.height = 'auto';
  ta.style.height = `${ta.scrollHeight}px`;
}

/**
 * Leagă un card de previzualizare la un câmp de text.
 * `read` întoarce textul curent, `write` îl pune în stare, `auto` îl șterge.
 */
function wireEditor({ view, edit, label, editBtn, resetBtn, hint, read, write, isCustom, onChange }) {
  const ta = $(edit);

  const paint = () => {
    const custom = isCustom();
    $(view).textContent = read();
    $(label).textContent = custom ? 'textul tău' : $(label).dataset.auto;
    $(resetBtn).classList.toggle('hidden', !custom);
  };

  const open = (yes) => {
    ta.classList.toggle('hidden', !yes);
    $(view).classList.toggle('hidden', yes);
    $(editBtn).textContent = yes ? '✔️ Gata' : '✏️ Schimbă textul';
    if (hint) $(hint).classList.toggle('hidden', !yes);
    if (yes) { ta.value = read(); autoGrow(ta); ta.focus(); }
  };

  $(label).dataset.auto = $(label).textContent;

  $(editBtn).addEventListener('click', () => {
    open(ta.classList.contains('hidden'));
    buzz();
  });

  ta.addEventListener('input', () => {
    write(ta.value);
    autoGrow(ta);
    paint();
    onChange();
  });

  $(resetBtn).addEventListener('click', () => {
    write('');
    ta.value = read();
    autoGrow(ta);
    paint();
    onChange();
    buzz();
  });

  return { paint, close: () => open(false) };
}

let inviteEditor = null;
let replyEditor = null;

function renderPreview() {
  if (inviteEditor) inviteEditor.paint();
  else $('preview').textContent = buildInvite();
}

/** Ce faceți schimbă și tonul: la bere sau baschet, alt pont și alt rând de inimă. */
function onComposeChange(key) {
  renderPreview();
  remember();
  if (key === 'a') { tipIndex = 0; renderTip(); }
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
  tipIndex = 0;
  renderTip();
  remember();
  buzz(18);
  toast(`${p.e} Gata! Poți trimite.`);
  // Butonul de trimis e oricum sub degetul tău, așa că urcăm la text: să vezi
  // ce s-a schimbat, nu unde să apeși.
  $('preview').scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  inviteEditor = wireEditor({
    view: 'preview', edit: 'preview-edit', label: 'preview-label',
    editBtn: 'edit-btn', resetBtn: 'reset-btn', hint: 'edit-hint',
    read: buildInvite,
    write: (v) => { state.x = v; },
    isCustom: () => !!state.x.trim(),
    onChange: remember,
  });

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
    tipIndex = 0;
    renderTip();
    remember();
    buzz(18);
    toast(rnd(SURPRISE_TOASTS));
    $('preview').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* Trimiterea salvează invitația în cloud și împarte linkul ei. Cele trei
     butoane folosesc aceeași invitație: se creează una singură, iar draftul
     se rupe de fiecare dată când schimbi ceva în compozitor. */
  const withUrl = async (btn, run) => {
    btn.disabled = true;
    try {
      run(await ensureInvite());
    } catch (err) {
      toast(cloudErr(err));
    } finally {
      btn.disabled = false;
    }
  };

  // Un singur buton mare: meniul de share al telefonului are deja WhatsApp,
  // Messenger și SMS. Copierea linkului rămâne, dar discret, pentru desktop.
  $('send-btn').addEventListener('click', (e) => {
    buzz();
    withUrl(e.currentTarget, url =>
      shareOrCopy(buildInvite(), url, 'Invitația e copiată, dă-i paste 💌'));
  });
  $('copy-btn').addEventListener('click', (e) =>
    withUrl(e.currentTarget, async url => {
      await copyText(url);
      toast('Link copiat 🔗');
    }));

  renderWho();
  renderPreview();
  renderTip();
}

/* ------------------------------------------------ 7. VIEW: INVITAȚIA */

let counterSyncs = [];

function renderReplyPreview() {
  if (replyEditor) replyEditor.paint();
  else $('reply-preview').textContent = buildReply();
}

function openReply(answer) {
  reply.ra = answer;
  reply.rx = '';                 // alt răspuns, alt text: pornim de la al nostru
  if (replyEditor) replyEditor.close();
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

/**
 * Ce pleacă structurat pe lângă textul răspunsului, la răspunsurile care chiar
 * propun altceva. Fără el, expeditorul ar trebui să citească proza și să
 * refacă invitația de mână.
 *
 * La „altă dată” nu se schimbă locul: ecranul nici nu-l întreabă, deci luăm
 * locul din invitație, nu ce a rămas prin `reply.rp` de la altă apăsare.
 */
function counterOffer() {
  if (reply.ra !== 'neg' && reply.ra !== 'late') return null;
  return {
    p: reply.ra === 'neg' ? reply.rp : state.p,
    d: reply.rd,
    t: reply.rt,
  };
}

/* --- Butonul care se roagă de tine --- */

let noTries = 0;
let noLabel = '';

const noButton = () => document.querySelector('#answer-buttons .btn-no');

/**
 * Îl aduce la starea de repaus. `pastBegging` îl lasă potolit după ce a cedat
 * o dată: dacă te răzgândești și apeși iar „nu”, nu te mai bate la cap.
 */
function calmNoButton(pastBegging) {
  noTries = pastBegging ? NO_PLEAS.length : 0;
  noButton().textContent = noLabel;
  $('answer-buttons').style.setProperty('--beg', '0');
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
  if (!noLabel) noLabel = noButton().textContent.trim();
  calmNoButton(false);

  $('invite-text').textContent = buildInvite();
  renderCountdown();

  guestTipIndex = Math.floor(Math.random() * 8);
  renderGuestTip();

  // Ecranul se deschide de câte ori vrei, din link sau din listă. Legăm o
  // singură dată, altfel s-ar aduna ascultători și câte un ceas nou de fiecare.
  if (initInvite.wired) return;
  initInvite.wired = true;

  setInterval(renderCountdown, 30000);

  replyEditor = wireEditor({
    view: 'reply-preview', edit: 'reply-edit', label: 'reply-preview-label',
    editBtn: 'reply-edit-btn', resetBtn: 'reply-reset-btn',
    read: buildReply,
    write: (v) => { reply.rx = v; },
    isCustom: () => !!reply.rx.trim(),
    onChange: () => {},
  });

  $('cal-btn').addEventListener('click', () => { buzz(); downloadIcs(); });

  $('guest-tip-card').addEventListener('click', () => {
    guestTipIndex++;
    renderGuestTip();
    buzz();
  });

  document.querySelectorAll('#answer-buttons .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const no = btn.dataset.answer === 'no';

      // Fiecare rugăminte umflă butonul verde și subțiază „nu”-ul.
      if (no && noTries < NO_PLEAS.length) {
        btn.textContent = NO_PLEAS[noTries++];
        $('answer-buttons').style.setProperty('--beg', String(noTries));
        buzz(12);
        return;
      }

      document.querySelectorAll('#answer-buttons .btn').forEach(b => b.classList.remove('btn-primary'));
      if (btn.dataset.answer !== 'yes') btn.classList.add('btn-primary');
      if (no) calmNoButton(true);
      openReply(btn.dataset.answer);
    });
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

  $('reply-send-btn').addEventListener('click', async (e) => {
    buzz();
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      await Cloud.reply(currentInviteId, STATUS_OF[reply.ra] || 'da', buildReply(), counterOffer());
      $('answer-buttons').classList.add('hidden');
      $('reply-panel').classList.add('hidden');
      $('reply-actions').classList.add('hidden');
      setInviteState('Răspuns trimis ✅ I-a ajuns pe loc.');
      toast('Gata, i-am spus 📤');
    } catch (err) {
      toast(cloudErr(err));
    } finally {
      btn.disabled = false;
    }
  });
}

/* ------------------------------------------- 8. VIEW: RĂSPUNSUL PRIMIT */

function initAnswer() {
  const [eyebrow, plain, named] = ANSWER_TITLES[reply.ra] || ANSWER_TITLES.yes;
  $('answer-eyebrow').textContent = eyebrow;
  $('answer-title').textContent = reply.rn.trim() ? `${reply.rn.trim()} ${named}` : plain;
  $('answer-text').textContent = `${buildReply()}\n\nla invitația ta:\n${buildInvite()}`;
  renderAnswerCal();

  // Ecranul se poate deschide de mai multe ori, din listă, așa că legăm o dată.
  if (!initAnswer.wired) {
    initAnswer.wired = true;
    $('answer-cal-btn').addEventListener('click', () => { buzz(); downloadIcs(); });
    $('new-btn').addEventListener('click', goCompose);
    $('accept-btn').addEventListener('click', acceptCounter);
  }

  if (reply.ra === 'yes') setTimeout(confetti, 320);
}

/** În calendar se pune ce e sigur: un „da”, sau o palmă bătută. */
function renderAnswerCal() {
  const worth = (reply.ra === 'yes' || agreed) && eventDate();
  $('answer-cal-btn').classList.toggle('hidden', !worth);
}

/* ---- Contrapropunerea, văzută de expeditor ---- */

/* Invitația al cărei accept îl așteptăm. Ținută aici, nu în `dataset`, ca să
   nu punem un document întreg într-un atribut de HTML. */
let pendingCounter = null;

/** Ce s-a mutat față de invitația trimisă, rând cu rând. */
function counterRows(c) {
  return [
    { what: 'Unde', from: opt('p', state.p).l, to: opt('p', c.p).l },
    { what: 'Când', from: relDate(state.d),    to: relDate(c.d) },
    { what: 'Ora',  from: state.t || '—',      to: c.t || '—' },
  ].map(r => ({ ...r, changed: r.from !== r.to }));
}

function renderCounter(d) {
  const card = $('counter-card');
  const counter = d.reply && d.reply.counter;
  pendingCounter = null;

  // Invitațiile de dinainte de 0.2 n-au contrapropunere structurată: la ele
  // rămâne doar textul, ca până acum.
  if (!counter) { card.classList.add('hidden'); return; }
  card.classList.remove('hidden');

  const done = !!d.deal;
  const who = (d.toName || '').trim().split(' ')[0];
  $('counter-label').textContent = done
    ? '🤝 ați bătut palma'
    : `ce propune ${who || 'el'} în schimb`;

  const list = $('counter-list');
  list.textContent = '';
  for (const r of counterRows(done ? d.deal : counter)) {
    const li = document.createElement('li');
    li.className = r.changed ? 'counter-row is-new' : 'counter-row';

    const what = document.createElement('span');
    what.className = 'counter-what';
    what.textContent = r.what;

    const val = document.createElement('span');
    val.className = 'counter-val';
    if (r.changed) {
      const old = document.createElement('s');
      old.textContent = r.from;
      val.append(old, ' ', r.to);
    } else {
      val.textContent = r.to;
    }

    li.append(what, val);
    list.append(li);
  }

  $('accept-btn').classList.toggle('hidden', done);
  $('counter-note').textContent = done
    ? 'Asta rămâne. Invitația ta a plecat cum a plecat, nimeni n-a rescris-o.'
    : 'Un tap și rămâne cum zice el. Invitația ta rămâne neatinsă.';

  if (!done) pendingCounter = d;
}

async function acceptCounter(e) {
  const d = pendingCounter;
  if (!d) return;
  const btn = e.currentTarget;
  btn.disabled = true;
  buzz(24);
  try {
    await Cloud.acceptCounter(d.id, d.reply.counter);
    // Nu mai așteptăm turul prin bază: ce am scris, aia s-a scris.
    d.deal = { ...d.reply.counter };
    agreed = { ...d.reply.counter };
    markSeen(d);              // înțelegerea e a ta, n-ai ce să afli despre ea
    renderCounter(d);
    renderAnswerCal();
    toast('Bate palma 🤝');
    confetti();
  } catch (err) {
    toast(cloudErr(err));
  } finally {
    btn.disabled = false;
  }
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

  // Ceață galactică: două pete moi, ca să nu fie cerul „plat”
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
  // Pe telefon, bara de adresă care se ascunde declanșează resize, așa că filtrăm zgomotul.
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

/* ==================================== 9. CONT, CLOUD ȘI INVITAȚIILE MELE */

/* Numele răspunsurilor: în interfață sunt yes/neg/late/no, în bază sunt
   cuvinte întregi, fiindcă regulile de securitate le verifică pe nume. */
const STATUS_OF = { yes: 'da', neg: 'negociem', late: 'alta-data', no: 'nu-pot' };
const ANSWER_OF = { da: 'yes', negociem: 'neg', 'alta-data': 'late', 'nu-pot': 'no' };
const STATUS_LABEL = {
  trimisa: '⏳ așteaptă răspuns',
  da: '🎉 a zis DA',
  negociem: '😄 vrea să negocieze',
  'alta-data': '🗓️ altă dată',
  'nu-pot': '😅 nu poate acum',
};

let currentInviteId = '';
let stopInboxWatch = null;
let inboxTab = 'got';
let inboxData = { sent: [], got: [] };

function cloudErr(err) {
  const msg = String((err && err.message) || err);
  if (/permission|insufficient/i.test(msg)) return 'N-ai voie la asta 🙈';
  if (/offline|network|unavailable|failed to get/i.test(msg)) return 'Fără internet acum 📡';
  if (/popup|cancel/i.test(msg)) return 'Ai închis fereastra 🤷';
  return 'N-a mers 😕';
}

const inviteUrl = id => `${location.href.split('#')[0].split('?')[0]}?i=${id}`;
const readInviteId = () => new URLSearchParams(location.search).get('i') || '';

/** Draftul se creează o singură dată și se rupe când schimbi ceva. */
async function ensureInvite() {
  if (!draftId) draftId = await Cloud.createInvite(state);
  return inviteUrl(draftId);
}

function applyPayload(p) {
  if (!p) return;
  KEYS.forEach(k => { if (typeof p[k] === 'string') state[k] = p[k]; });
}

/** Înțelegerea, într-un rând: „în parc, sâmbătă 8 august, pe la 20:00”. */
const dealLine = (x) => `${opt('p', x.p).p}, ${relDate(x.d)}${x.t ? `, pe la ${x.t}` : ''}`;

/** Un rând scurt pentru lista de invitații. */
function shortLine(p) {
  const at = p.t ? ` la ${p.t}` : '';
  return `${opt('a', p.a).e} ${opt('a', p.a).l} · ${opt('p', p.p).l} · ${relDate(p.d)}${at}`;
}

function setInviteState(text) {
  const el = $('invite-state');
  el.textContent = text || '';
  el.classList.toggle('hidden', !text);
}

/* ------------------------------------------------------------ cont */

function initAuthView() {
  $('google-btn').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      await Cloud.signIn();
    } catch (err) {
      toast(cloudErr(err));
    } finally {
      btn.disabled = false;
    }
  });

  const broken = !Cloud.configured || !Cloud.available;
  $('auth-card').classList.toggle('hidden', broken);
  $('auth-setup').classList.toggle('hidden', !broken);
  if (broken && Cloud.error && Cloud.error !== 'neconfigurat') {
    $('auth-error').textContent = Cloud.error;
  }
}

function paintAccount(user) {
  $('account-btn').classList.toggle('hidden', !user);
  $('account-menu').classList.add('hidden');
  $('account-btn').setAttribute('aria-expanded', 'false');
  if (!user) return;

  const img = $('account-photo');
  const initial = $('account-initial');
  if (user.photo) {
    img.src = user.photo;
    img.classList.remove('hidden');
    initial.textContent = '';
  } else {
    img.classList.add('hidden');
    initial.textContent = (user.name[0] || '?').toUpperCase();
  }
  $('account-name').textContent = user.name;
  $('account-mail').textContent = user.email;
}

function initAccountMenu() {
  const btn = $('account-btn');
  const menu = $('account-menu');

  $('account-version').textContent = `versiunea ${self.APP_VERSION}`;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = menu.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!open));
  });
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== btn) {
      menu.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  $('inbox-btn').addEventListener('click', () => {
    menu.classList.add('hidden');
    show('view-inbox');
    renderInbox();
  });

  $('signout-btn').addEventListener('click', async () => {
    menu.classList.add('hidden');
    try { await Cloud.signOut(); } catch (_) { /* oricum ne întoarce onUser */ }
  });
}

/* -------------------------------------------------- invitațiile mele */

function initInbox() {
  document.querySelectorAll('.seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      inboxTab = btn.dataset.tab;
      document.querySelectorAll('.seg-btn').forEach(b =>
        b.classList.toggle('is-on', b === btn));
      renderInbox();
    });
  });

  $('new-invite-btn').addEventListener('click', goCompose);

  // Ceasurile din „urmează” trebuie să se miște singure: „peste 3 ore” care
  // rămâne „peste 3 ore” toată seara e mai rău decât nimic.
  setInterval(() => {
    if (!$('view-inbox').classList.contains('hidden')) renderUpcoming();
  }, 30000);
}

function startInbox() {
  if (stopInboxWatch) stopInboxWatch();
  stopInboxWatch = Cloud.watchMine(data => {
    inboxData = data;
    renderNews();
    if (!$('view-inbox').classList.contains('hidden')) renderInbox();
  });
}

/* ------------------------------------------------------ ce urmează */

/** Locul, ziua și ora unei invitații, dacă s-a ajuns la o înțelegere. */
function settledOf(d) {
  if (d.deal) return d.deal;
  return d.status === 'da' ? (d.payload || {}) : null;
}

/**
 * Întâlnirile bătute în cuie care încă n-au trecut, cea mai apropiată prima.
 * Trimise și primite laolaltă: când vine sâmbătă, nu mai contează cine a
 * întrebat. Ținem trei: e un memento, nu o agendă.
 */
function upcomingList() {
  const now = Date.now();
  return [...inboxData.sent, ...inboxData.got]
    .map(d => {
      const w = settledOf(d);
      if (!w || !w.d) return null;
      const at = new Date(`${w.d}T${w.t || '19:00'}`);
      // Două ore de grație: la 20:15 încă vrei să vezi întâlnirea de la 20:00.
      if (isNaN(at) || at.getTime() < now - 2 * 3600e3) return null;
      return { d, at, w };
    })
    .filter(Boolean)
    .sort((a, b) => a.at - b.at)
    .slice(0, 3);
}

function renderUpcoming() {
  const host = $('upcoming');
  host.textContent = '';

  const items = upcomingList();
  host.classList.toggle('hidden', !items.length);
  if (!items.length) return;

  const title = document.createElement('p');
  title.className = 'upcoming-title';
  title.textContent = '🤝 urmează';
  host.append(title);

  const me = Cloud.user ? Cloud.user.uid : '';

  for (const it of items) {
    const card = document.createElement('button');
    card.className = 'upcoming-item';
    card.type = 'button';

    const when = document.createElement('span');
    when.className = 'upcoming-when';
    when.textContent = countdownText(it.at, it.w.t) || '🎉 Chiar acum!';

    const what = document.createElement('span');
    what.className = 'upcoming-what';
    const a = opt('a', (it.d.payload || {}).a);
    const other = (it.d.fromUid === me ? it.d.toName : it.d.fromName) || '';
    const withWho = other ? `, cu ${other.trim().split(' ')[0]}` : '';
    what.textContent = `${a.e} ${a.l} ${opt('p', it.w.p).p}${withWho}`;

    card.append(when, what);
    card.addEventListener('click', () => openInvite(it.d.id));
    host.append(card);
  }
}

/* --------------------------------------------------- bulina de noutăți */

/* Ce e „nou” depinde de status, nu doar de invitație: dacă cineva răspunde la
   una pe care ai văzut-o deja, bulina trebuie să reapară. De aia semnul ține
   minte și statusul, nu numai id-ul. */
const SEEN_KEY = 'vazute';
const stampOf = d => `${d.id}:${d.status}${d.deal ? ':ok' : ''}`;

function seenSet() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')); } catch (_) { return new Set(); }
}

function markSeen(d) {
  const s = seenSet();
  s.add(stampOf(d));
  // Ultimele 200: destul cât să nu uite nimic recent, prea puțin cât să conteze.
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...s].slice(-200))); } catch (_) { /* modul privat */ }
  renderNews();
}

/** Câte lucruri te așteaptă: invitații fără răspuns și răspunsuri necitite. */
function newsCount() {
  const seen = seenSet();
  const nou = d => !seen.has(stampOf(d));
  return inboxData.got.filter(d => d.status === 'trimisa' && nou(d)).length
    + inboxData.sent.filter(d => d.status !== 'trimisa' && nou(d)).length;
}

function renderNews() {
  const n = newsCount();
  const badge = $('account-badge');
  badge.textContent = n > 9 ? '9+' : String(n);
  badge.classList.toggle('hidden', n === 0);
  $('account-btn').setAttribute('aria-label', n
    ? `Contul tău — ${ro(n, 'lucru nou', 'lucruri noi')}`
    : 'Contul tău');
  // Pe desktop aplicația stă într-un tab printre douăzeci: numărul din titlu
  // e singurul lucru care se vede fără să dai clic pe el.
  document.title = n ? `(${n}) Hai să ne vedem 🌙` : 'Hai să ne vedem 🌙';
}

function renderInbox() {
  renderUpcoming();

  const list = $('inbox-list');
  list.textContent = '';

  const items = inboxTab === 'got' ? inboxData.got : inboxData.sent;
  if (!items.length) {
    const empty = document.createElement('p');
    empty.className = 'inbox-empty';
    empty.textContent = inboxTab === 'got'
      ? 'Nimic primit încă. Când te invită cineva, apare aici.'
      : 'N-ai trimis nicio invitație încă.';
    list.append(empty);
    return;
  }

  for (const d of items) {
    const card = document.createElement('button');
    card.className = 'inbox-item';
    card.type = 'button';

    const who = document.createElement('span');
    who.className = 'inbox-who';
    who.textContent = inboxTab === 'got'
      ? `de la ${d.fromName}`
      : (d.toName ? `către ${d.toName}` : 'încă nedeschisă');

    const what = document.createElement('span');
    what.className = 'inbox-what';
    // Dacă s-a bătut palma, rândul arată înțelegerea, nu ce scria la plecare.
    what.textContent = d.deal
      ? `${opt('a', (d.payload || {}).a).e} ${dealLine(d.deal)}`
      : shortLine(d.payload || {});

    const status = document.createElement('span');
    status.className = d.deal ? 'inbox-status st-da' : `inbox-status st-${d.status}`;
    status.textContent = d.deal ? '🤝 ați bătut palma' : (STATUS_LABEL[d.status] || d.status);

    card.append(who, what, status);
    card.addEventListener('click', () => {
      if (inboxTab === 'sent' && d.status !== 'trimisa') showAnswer(d);
      else openInvite(d.id);
    });
    list.append(card);
  }
}

/* ------------------------------------------------------------ rutare */

/** Deschide o invitație după id: o revendică dacă e liberă, apoi o arată. */
async function openInvite(id) {
  let d;
  try {
    d = await Cloud.loadInvite(id);
  } catch (err) {
    toast(cloudErr(err));
    return goCompose();
  }
  if (!d) {
    toast('Invitația nu mai există 🤷');
    return goCompose();
  }

  currentInviteId = id;
  markSeen(d);
  applyPayload(d.payload);
  agreed = d.deal ? { p: d.deal.p, d: d.deal.d, t: d.deal.t } : null;
  initInvite();

  const mine = d.fromUid === Cloud.user.uid;
  const forMe = d.toUid === Cloud.user.uid;
  const free = !d.toUid;

  // Cine poate răspunde: doar destinatarul, și doar dacă n-a răspuns deja.
  const canAnswer = (free || forMe) && !mine && d.status === 'trimisa';

  $('answer-buttons').classList.toggle('hidden', !canAnswer);
  $('reply-panel').classList.add('hidden');
  $('reply-actions').classList.add('hidden');

  if (agreed) {
    // Palma bătută bate orice alt status: e singurul lucru care mai contează.
    setInviteState(`🤝 V-ați înțeles: ${dealLine(agreed)}`);
  } else if (mine) {
    setInviteState(d.status === 'trimisa'
      ? 'E invitația ta. ' + STATUS_LABEL.trimisa
      : `E invitația ta. ${STATUS_LABEL[d.status]}`);
  } else if (d.status !== 'trimisa') {
    setInviteState(`Ai răspuns deja: ${STATUS_LABEL[d.status]}`);
  } else if (!free && !forMe) {
    setInviteState('Invitația asta a fost deschisă de altcineva 🙈');
  } else {
    setInviteState('');
    if (free) {
      // Primul autentificat care deschide linkul devine destinatarul.
      try { await Cloud.claimInvite(id); } catch (_) { /* a apucat altcineva */ }
    }
    reply.rn = myName;
  }

  show('view-invite');
}

/** Înapoi la compozitor: invitația citită nu are ce căuta în ce compui tu. */
function goCompose() {
  history.replaceState(null, '', location.pathname);
  agreed = null;              // înțelegerea era a invitației citite, nu a ta
  Object.assign(state, DEFAULTS, { d: isoOffset(1) });
  recall();                    // ce compuneai tu ultima dată, dacă exista ceva
  state.s = myName;
  state.n = $('note').value;   // ce scrisesei tu, nu ce scria în invitația citită
  remember();                  // rupe și draftul vechi: linkul trebuie să fie nou
  if (inviteEditor) inviteEditor.close();
  composeSyncs.forEach(fn => fn());
  renderWho();
  renderTip();
  renderPreview();
  show('view-compose');
}

function showAnswer(d) {
  markSeen(d);
  applyPayload(d.payload);
  agreed = d.deal ? { p: d.deal.p, d: d.deal.d, t: d.deal.t } : null;
  reply.ra = ANSWER_OF[d.status] || 'yes';
  reply.rn = d.toName || '';
  initAnswer();
  // Textul răspunsului îl luăm așa cum l-a scris el, din bază.
  const note = (d.reply && d.reply.note) || STATUS_LABEL[d.status];
  $('answer-text').textContent = `${note}\n\nla invitația ta:\n${buildInvite()}`;
  renderCounter(d);
  show('view-answer');
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

(async function main() {
  initTheme();
  initServiceWorker();
  initAccountMenu();

  const cloudUp = await Cloud.ready;
  initAuthView();

  // Fără cloud nu există cont, deci nu există aplicație: rămânem pe ecranul
  // care explică ce lipsește, în loc să lăsăm compozitorul care n-ar trimite.
  if (!cloudUp) {
    show('view-auth');
    return;
  }

  // Compozitorul și lista se leagă o singură dată, indiferent câte
  // conectări/deconectări urmează.
  let wired = false;

  Cloud.onUser(async (user) => {
    paintAccount(user);

    if (!user) {
      if (stopInboxWatch) { stopInboxWatch(); stopInboxWatch = null; }
      inboxData = { sent: [], got: [] };
      renderNews();
      show('view-auth');
      return;
    }

    // Numele din cont intră direct în invitație, de aia nu-l mai cerem.
    myName = user.name.trim().slice(0, 24);
    state.s = myName;
    $('hello').textContent = `Bună, ${myName.split(' ')[0]}!`;

    if (!wired) {
      wired = true;
      initCompose();
      initInstall();
      initInbox();
    } else {
      renderPreview();
    }
    startInbox();

    const id = readInviteId();
    if (id) await openInvite(id);
    else show('view-compose');
  });
})();
