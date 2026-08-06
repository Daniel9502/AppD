/**
 * Stratul de cloud: cont Google + invitații în Firestore.
 *
 * Modul ES, încărcat separat de `script.js`, ca restul aplicației să rămână
 * un script clasic. Expune `window.Cloud` și rezolvă `window.Cloud.ready`
 * când știm dacă avem sau nu utilizator.
 *
 * Ce ține fiecare invitație e descris în `firestore.rules`. Regulile alea sunt
 * singurul lucru care apără baza de date, fiindcă cheile din `firebase-config.js`
 * sunt publice prin design.
 */

const SDK = 'https://www.gstatic.com/firebasejs/11.10.0';

const Cloud = {
  configured: !!window.FIREBASE_READY,
  available: false,      // configurat ȘI încărcat cu succes
  error: '',
  user: null,
  ready: null,
};
window.Cloud = Cloud;

let resolveReady;
Cloud.ready = new Promise(r => { resolveReady = r; });

const userWatchers = new Set();
Cloud.onUser = (cb) => {
  userWatchers.add(cb);
  if (Cloud.user !== null || Cloud.available) cb(Cloud.user);
  return () => userWatchers.delete(cb);
};
const emitUser = () => userWatchers.forEach(cb => cb(Cloud.user));

/* ------------------------------------------------------------- pornire */

if (!Cloud.configured) {
  Cloud.error = 'neconfigurat';
  resolveReady(false);
} else {
  boot().catch(err => {
    Cloud.error = String(err && err.message || err);
    resolveReady(false);
  });
}

let auth, db, fb;

async function boot() {
  const [app, authMod, storeMod] = await Promise.all([
    import(`${SDK}/firebase-app.js`),
    import(`${SDK}/firebase-auth.js`),
    import(`${SDK}/firebase-firestore.js`),
  ]);
  fb = { ...authMod, ...storeMod };

  const instance = app.initializeApp(window.FIREBASE_CONFIG);
  auth = fb.getAuth(instance);
  db = fb.getFirestore(instance);
  Cloud.available = true;

  // Pe telefon fereastra de popup e adesea blocată, așa că ne întoarcem
  // dintr-un redirect. Rezultatul se citește o singură dată, la pornire.
  await fb.getRedirectResult(auth).catch(() => null);

  await new Promise(done => {
    let first = true;
    fb.onAuthStateChanged(auth, async (u) => {
      Cloud.user = u ? {
        uid: u.uid,
        name: u.displayName || (u.email || '').split('@')[0] || 'Cineva',
        email: u.email || '',
        photo: u.photoURL || '',
      } : null;
      if (Cloud.user) await touchProfile().catch(() => {});
      emitUser();
      if (first) { first = false; done(); }
    });
  });

  resolveReady(true);
}

/* ------------------------------------------------------------- cont */

Cloud.signIn = async function signIn() {
  if (!Cloud.available) throw new Error('Cloud-ul nu e pornit.');
  const provider = new fb.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  try {
    await fb.signInWithPopup(auth, provider);
  } catch (err) {
    // Popup blocat sau închis de utilizator: încercăm pe redirect.
    const code = err && err.code || '';
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await fb.signInWithRedirect(auth, provider);
      return;
    }
    throw err;
  }
};

Cloud.signOut = () => fb.signOut(auth);

function touchProfile() {
  const u = Cloud.user;
  return fb.setDoc(fb.doc(db, 'users', u.uid), {
    name: u.name.slice(0, 80),
    email: u.email,
    photo: u.photo,
    createdAt: fb.serverTimestamp(),
    lastSeenAt: fb.serverTimestamp(),
  }, { merge: true });
}

/* -------------------------------------------------------- invitații */

const PAYLOAD_KEYS = ['s', 'g', 'a', 'p', 'd', 't', 'm', 'w', 'b', 'n', 'x'];

/** Păstrăm doar cheile pe care le acceptă regulile, ca șiruri. */
function cleanPayload(state) {
  const out = {};
  for (const k of PAYLOAD_KEYS) out[k] = String(state[k] == null ? '' : state[k]);
  out.s = out.s.slice(0, 40);
  out.n = out.n.slice(0, 200);
  out.x = out.x.slice(0, 600);   // textul rescris de expeditor, dacă l-a rescris
  return out;
}

/** Creează invitația și întoarce id-ul: acela devine linkul. */
Cloud.createInvite = async function createInvite(state) {
  const u = requireUser();
  const ref = fb.doc(fb.collection(db, 'invites'));
  await fb.setDoc(ref, {
    fromUid: u.uid,
    fromName: u.name.slice(0, 80),
    toUid: null,
    toName: null,
    payload: cleanPayload(state),
    status: 'trimisa',
    reply: null,
    createdAt: fb.serverTimestamp(),
  });
  return ref.id;
};

Cloud.loadInvite = async function loadInvite(id) {
  requireUser();
  const snap = await fb.getDoc(fb.doc(db, 'invites', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

/** Primul autentificat care deschide linkul devine destinatar. */
Cloud.claimInvite = async function claimInvite(id) {
  const u = requireUser();
  await fb.updateDoc(fb.doc(db, 'invites', id), {
    toUid: u.uid,
    toName: u.name.slice(0, 80),
  });
};

Cloud.reply = async function reply(id, status, note) {
  requireUser();
  await fb.updateDoc(fb.doc(db, 'invites', id), {
    status,
    reply: {
      answer: status,
      note: String(note || '').slice(0, 400),
      at: fb.serverTimestamp(),
    },
  });
};

Cloud.deleteInvite = (id) => {
  requireUser();
  return fb.deleteDoc(fb.doc(db, 'invites', id));
};

/** Ascultă live invitațiile trimise și primite. Întoarce funcția de oprire. */
Cloud.watchMine = function watchMine(cb) {
  const u = requireUser();
  let sent = [], got = [];

  const push = () => cb({ sent, got });

  const build = (field) => fb.query(
    fb.collection(db, 'invites'),
    fb.where(field, '==', u.uid),
    fb.orderBy('createdAt', 'desc'),
  );

  const toList = (snap) => snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const stopSent = fb.onSnapshot(build('fromUid'), s => { sent = toList(s); push(); }, () => {});
  const stopGot = fb.onSnapshot(build('toUid'), s => { got = toList(s); push(); }, () => {});

  return () => { stopSent(); stopGot(); };
};

function requireUser() {
  if (!Cloud.available) throw new Error('Cloud-ul nu e pornit.');
  if (!Cloud.user) throw new Error('Trebuie să fii conectat.');
  return Cloud.user;
}
