/**
 * Teste pentru `firestore.rules`, rulate pe emulatorul Firebase.
 *
 *   cd tools/rules-test && npm test
 *
 * Fiecare regulă are aici și cazul care trebuie să treacă, și cel care trebuie
 * respins. Regulile sunt singurul lucru care apără baza de date, fiindcă cheile din
 * `firebaseConfig` sunt publice prin design.
 */
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

let env;

const ID = 'inv-de-test';
const PAYLOAD = {
  s: 'Dani', g: 'f', a: 'plimbare', p: 'parc', d: '2026-08-10',
  t: '19:00', m: 'masina', w: 'lejer', b: 'cafea', n: '',
};

/** Contrapropunerea invitatului: alt loc, altă zi, altă oră. */
const COUNTER = { p: 'terasa', d: '2026-08-12', t: '20:00' };

/** Invitație validă, exact cum o trimite aplicația. */
function newInvite(uid, name = 'Dani') {
  return {
    fromUid: uid,
    fromName: name,
    toUid: null,
    toName: null,
    payload: { ...PAYLOAD },
    status: 'trimisa',
    reply: null,
    createdAt: serverTimestamp(),
  };
}

const as = (uid) => env.authenticatedContext(uid).firestore();
const anonim = () => env.unauthenticatedContext().firestore();

/** Pune date direct în bază, sărind peste reguli, ca să pregătim scenariul. */
async function seed(fn) {
  await env.withSecurityRulesDisabled(async (ctx) => fn(ctx.firestore()));
}

async function seedInvite(extra = {}) {
  await seed((db) =>
    setDoc(doc(db, 'invites', ID), {
      ...newInvite('ana'),
      createdAt: new Date('2026-08-01T10:00:00Z'),
      ...extra,
    }),
  );
}

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-hai-sa-ne-vedem',
    firestore: {
      rules: readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

after(async () => {
  await env?.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
});

/* ═════════════════════════════════════════════════════════ creare ═══════ */

describe('creare invitație', () => {
  test('expeditorul poate crea o invitație cu propriul cont', async () => {
    await assertSucceeds(setDoc(doc(as('ana'), 'invites', ID), newInvite('ana')));
  });

  test('nu poți crea o invitație în numele altcuiva', async () => {
    await assertFails(setDoc(doc(as('ana'), 'invites', ID), newInvite('bogdan')));
  });

  test('nedeconectat nu poate crea nimic', async () => {
    await assertFails(setDoc(doc(anonim(), 'invites', ID), newInvite('ana')));
  });

  test('nu poți porni cu un răspuns deja dat', async () => {
    await assertFails(setDoc(doc(as('ana'), 'invites', ID), {
      ...newInvite('ana'),
      status: 'da',
    }));
  });

  test('nu poți porni cu blocul de răspuns completat', async () => {
    await assertFails(setDoc(doc(as('ana'), 'invites', ID), {
      ...newInvite('ana'),
      reply: { answer: 'da', at: serverTimestamp() },
    }));
  });

  test('nu poți pune destinatar din start', async () => {
    await assertFails(setDoc(doc(as('ana'), 'invites', ID), {
      ...newInvite('ana'),
      toUid: 'bogdan',
    }));
  });

  test('câmpurile străine sunt refuzate', async () => {
    await assertFails(setDoc(doc(as('ana'), 'invites', ID), {
      ...newInvite('ana'),
      esteAdmin: true,
    }));
  });

  test('payload-ul cu chei străine e refuzat', async () => {
    await assertFails(setDoc(doc(as('ana'), 'invites', ID), {
      ...newInvite('ana'),
      payload: { ...PAYLOAD, script: '<img onerror=1>' },
    }));
  });

  test('numele peste 80 de caractere e refuzat', async () => {
    await assertFails(setDoc(doc(as('ana'), 'invites', ID), newInvite('ana', 'x'.repeat(81))));
  });

  test('nota peste 200 de caractere e refuzată', async () => {
    await assertFails(setDoc(doc(as('ana'), 'invites', ID), {
      ...newInvite('ana'),
      payload: { ...PAYLOAD, n: 'x'.repeat(201) },
    }));
  });

  test('textul rescris de expeditor încape în invitație', async () => {
    await assertSucceeds(setDoc(doc(as('ana'), 'invites', ID), {
      ...newInvite('ana'),
      payload: { ...PAYLOAD, x: 'Bă, hai la o bere diseară. Fac eu cinste.' },
    }));
  });

  test('textul rescris peste 600 de caractere e refuzat', async () => {
    await assertFails(setDoc(doc(as('ana'), 'invites', ID), {
      ...newInvite('ana'),
      payload: { ...PAYLOAD, x: 'x'.repeat(601) },
    }));
  });

  test('invitațiile vechi, fără cheia `x`, rămân valide', async () => {
    // PAYLOAD n-are `x`: regula îl citește cu `get` și un gol implicit.
    await assertSucceeds(setDoc(doc(as('ana'), 'invites', ID), newInvite('ana')));
  });

  test('data de creare trebuie să vină de la server', async () => {
    await assertFails(setDoc(doc(as('ana'), 'invites', ID), {
      ...newInvite('ana'),
      createdAt: new Date('2020-01-01'),
    }));
  });
});

/* ═══════════════════════════════════════════════════════ citire ═════════ */

describe('citirea unei invitații', () => {
  test('expeditorul își vede invitația', async () => {
    await seedInvite();
    await assertSucceeds(getDoc(doc(as('ana'), 'invites', ID)));
  });

  test('cine are linkul poate deschide o invitație nerevendicată', async () => {
    await seedInvite();
    await assertSucceeds(getDoc(doc(as('bogdan'), 'invites', ID)));
  });

  test('nedeconectat nu vede nimic, nici cu link', async () => {
    await seedInvite();
    await assertFails(getDoc(doc(anonim(), 'invites', ID)));
  });

  test('destinatarul revendicat își vede invitația', async () => {
    await seedInvite({ toUid: 'bogdan', toName: 'Bogdan' });
    await assertSucceeds(getDoc(doc(as('bogdan'), 'invites', ID)));
  });

  test('după revendicare, un al treilea nu mai poate citi', async () => {
    await seedInvite({ toUid: 'bogdan', toName: 'Bogdan' });
    await assertFails(getDoc(doc(as('cristi'), 'invites', ID)));
  });
});

/* ═════════════════════════════════════════════════════ listare ══════════ */

describe('listarea invitațiilor', () => {
  beforeEach(async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'invites', 'a1'), {
        ...newInvite('ana'), createdAt: new Date(), toUid: 'bogdan', toName: 'Bogdan',
      });
      await setDoc(doc(db, 'invites', 'a2'), { ...newInvite('ana'), createdAt: new Date() });
      await setDoc(doc(db, 'invites', 'c1'), { ...newInvite('cristi'), createdAt: new Date() });
    });
  });

  test('îți poți lista invitațiile trimise', async () => {
    const db = as('ana');
    await assertSucceeds(getDocs(query(collection(db, 'invites'), where('fromUid', '==', 'ana'))));
  });

  test('îți poți lista invitațiile primite', async () => {
    const db = as('bogdan');
    await assertSucceeds(getDocs(query(collection(db, 'invites'), where('toUid', '==', 'bogdan'))));
  });

  test('nu poți răsfoi toate invitațiile din bază', async () => {
    await assertFails(getDocs(collection(as('cristi'), 'invites')));
  });

  test('nu poți lista invitațiile altcuiva', async () => {
    const db = as('cristi');
    await assertFails(getDocs(query(collection(db, 'invites'), where('fromUid', '==', 'ana'))));
  });

  test('nu poți răsfoi invitațiile nerevendicate ale lumii', async () => {
    const db = as('cristi');
    await assertFails(getDocs(query(collection(db, 'invites'), where('toUid', '==', null))));
  });
});

/* ════════════════════════════════════════════════════ revendicare ═══════ */

describe('revendicarea invitației', () => {
  const claim = { toUid: 'bogdan', toName: 'Bogdan' };

  test('primul care deschide linkul devine destinatar', async () => {
    await seedInvite();
    await assertSucceeds(updateDoc(doc(as('bogdan'), 'invites', ID), claim));
  });

  test('expeditorul nu-și poate revendica propria invitație', async () => {
    await seedInvite();
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), { toUid: 'ana', toName: 'Ana' }));
  });

  test('o invitație deja revendicată nu mai poate fi luată', async () => {
    await seedInvite({ toUid: 'bogdan', toName: 'Bogdan' });
    await assertFails(updateDoc(doc(as('cristi'), 'invites', ID), {
      toUid: 'cristi', toName: 'Cristi',
    }));
  });

  test('nu poți revendica pe numele altcuiva', async () => {
    await seedInvite();
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), {
      toUid: 'cristi', toName: 'Cristi',
    }));
  });

  test('la revendicare nu poți schimba conținutul invitației', async () => {
    await seedInvite();
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), {
      ...claim,
      payload: { ...PAYLOAD, p: 'alt-loc' },
    }));
  });

  test('la revendicare nu poți sări direct la un răspuns', async () => {
    await seedInvite();
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), { ...claim, status: 'da' }));
  });
});

/* ═════════════════════════════════════════════════════ răspuns ══════════ */

describe('răspunsul la invitație', () => {
  const answer = (status = 'da') => ({
    status,
    reply: { answer: status, note: '', at: serverTimestamp() },
  });

  beforeEach(() => seedInvite({ toUid: 'bogdan', toName: 'Bogdan' }));

  test('destinatarul poate răspunde', async () => {
    await assertSucceeds(updateDoc(doc(as('bogdan'), 'invites', ID), answer('da')));
  });

  test('merg toate cele patru răspunsuri', async () => {
    for (const status of ['da', 'negociem', 'alta-data', 'nu-pot']) {
      await env.clearFirestore();
      await seedInvite({ toUid: 'bogdan', toName: 'Bogdan' });
      await assertSucceeds(updateDoc(doc(as('bogdan'), 'invites', ID), answer(status)));
    }
  });

  test('un străin nu poate răspunde', async () => {
    await assertFails(updateDoc(doc(as('cristi'), 'invites', ID), answer('da')));
  });

  test('nici expeditorul nu poate răspunde în locul lui', async () => {
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), answer('da')));
  });

  test('un status inventat e refuzat', async () => {
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), {
      status: 'poate-cine-stie',
      reply: { answer: 'poate-cine-stie', at: serverTimestamp() },
    }));
  });

  test('răspunsul nu poate contrazice statusul', async () => {
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), {
      status: 'da',
      reply: { answer: 'nu-pot', at: serverTimestamp() },
    }));
  });

  test('nu poți modifica invitația odată cu răspunsul', async () => {
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), {
      ...answer('da'),
      payload: { ...PAYLOAD, t: '03:00' },
    }));
  });

  test('nu poți rescrie expeditorul', async () => {
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), {
      ...answer('da'),
      fromUid: 'bogdan',
    }));
  });

  test('data răspunsului trebuie să vină de la server', async () => {
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), {
      status: 'da',
      reply: { answer: 'da', at: new Date('2020-01-01') },
    }));
  });

  test('mesajul răspunsului e limitat la 400 de caractere', async () => {
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), {
      status: 'da',
      reply: { answer: 'da', note: 'x'.repeat(401), at: serverTimestamp() },
    }));
  });

  test('câmpurile străine în răspuns sunt refuzate', async () => {
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), {
      status: 'da',
      reply: { answer: 'da', note: '', at: serverTimestamp(), esteAdmin: true },
    }));
  });

  /* --- contrapropunerea structurată (0.2) --- */

  const cu = (status, counter = { ...COUNTER }) => ({
    ...answer(status),
    reply: { ...answer(status).reply, counter },
  });

  test('contrapropunerea pleacă odată cu răspunsul', async () => {
    await assertSucceeds(updateDoc(doc(as('bogdan'), 'invites', ID), cu('negociem')));
  });

  test('și „altă dată” poate propune altceva', async () => {
    await assertSucceeds(updateDoc(doc(as('bogdan'), 'invites', ID), cu('alta-data')));
  });

  test('un „da” n-are ce contrapropune', async () => {
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), cu('da')));
  });

  test('nici un „nu pot”', async () => {
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), cu('nu-pot')));
  });

  test('câmpurile străine în contrapropunere sunt refuzate', async () => {
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID),
      cu('negociem', { ...COUNTER, cinePlateste: 'ana' })));
  });

  test('contrapropunerea ține doar șiruri', async () => {
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID),
      cu('negociem', { ...COUNTER, t: 20 })));
  });

  test('invitatul nu poate bate palma în locul expeditorului', async () => {
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), {
      ...cu('negociem'),
      deal: { ...COUNTER, at: serverTimestamp() },
    }));
  });
});

/* ═══════════════════════════════════════════════ bate palma (0.2) ═══════ */

/**
 * Acceptul e singurul lucru care se mai adaugă la o invitație după trimitere,
 * de aia are cele mai multe garanții: o singură dată, doar de expeditor, doar
 * pe un răspuns care chiar a propus altceva, și exact ce s-a propus.
 */
describe('acceptarea contrapropunerii', () => {
  const negociat = {
    toUid: 'bogdan',
    toName: 'Bogdan',
    status: 'negociem',
    reply: {
      answer: 'negociem',
      note: 'hai mai bine marți',
      at: new Date('2026-08-02T10:00:00Z'),
      counter: { ...COUNTER },
    },
  };

  const batePalma = (deal = { ...COUNTER }) => ({ deal: { ...deal, at: serverTimestamp() } });

  test('expeditorul acceptă ce i s-a propus', async () => {
    await seedInvite(negociat);
    await assertSucceeds(updateDoc(doc(as('ana'), 'invites', ID), batePalma()));
  });

  test('merge și pe „altă dată”', async () => {
    await seedInvite({
      ...negociat,
      status: 'alta-data',
      reply: { ...negociat.reply, answer: 'alta-data' },
    });
    await assertSucceeds(updateDoc(doc(as('ana'), 'invites', ID), batePalma()));
  });

  test('accepți exact ce s-a propus, nu ce ai vrea tu', async () => {
    await seedInvite(negociat);
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID),
      batePalma({ ...COUNTER, t: '07:00' })));
  });

  test('nici locul nu poate fi strecurat altul', async () => {
    await seedInvite(negociat);
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID),
      batePalma({ ...COUNTER, p: 'la-mine' })));
  });

  test('destinatarul nu-și acceptă singur contrapropunerea', async () => {
    await seedInvite(negociat);
    await assertFails(updateDoc(doc(as('bogdan'), 'invites', ID), batePalma()));
  });

  test('un străin nu bate nicio palmă', async () => {
    await seedInvite(negociat);
    await assertFails(updateDoc(doc(as('cristi'), 'invites', ID), batePalma()));
  });

  test('nu se bate palma de două ori', async () => {
    await seedInvite({
      ...negociat,
      deal: { ...COUNTER, at: new Date('2026-08-03T10:00:00Z') },
    });
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), batePalma()));
  });

  test('nu se acceptă un răspuns care n-a propus nimic', async () => {
    await seedInvite({
      ...negociat,
      reply: { answer: 'negociem', note: 'nu știu', at: new Date('2026-08-02T10:00:00Z') },
    });
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), batePalma()));
  });

  test('nu se acceptă un „nu pot”, oricâte i-ai lipi în el', async () => {
    await seedInvite({
      ...negociat,
      status: 'nu-pot',
      reply: { ...negociat.reply, answer: 'nu-pot' },
    });
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), batePalma()));
  });

  test('nici o invitație care încă așteaptă răspuns', async () => {
    await seedInvite({ toUid: 'bogdan', toName: 'Bogdan' });
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), batePalma()));
  });

  test('acceptul nu schimbă statusul', async () => {
    await seedInvite(negociat);
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), {
      ...batePalma(),
      status: 'da',
    }));
  });

  test('acceptul nu rescrie răspunsul primit', async () => {
    await seedInvite(negociat);
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), {
      ...batePalma(),
      reply: { ...negociat.reply, note: 'a zis da, jur' },
    }));
  });

  test('acceptul nu atinge invitația', async () => {
    await seedInvite(negociat);
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), {
      ...batePalma(),
      payload: { ...PAYLOAD, p: 'la-mine' },
    }));
  });

  test('data înțelegerii vine de la server', async () => {
    await seedInvite(negociat);
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), {
      deal: { ...COUNTER, at: new Date('2020-01-01') },
    }));
  });

  test('câmpurile străine în înțelegere sunt refuzate', async () => {
    await seedInvite(negociat);
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), {
      deal: { ...COUNTER, at: serverTimestamp(), platesteEl: true },
    }));
  });

  test('nu se strecoară alte chei în document pe lângă înțelegere', async () => {
    await seedInvite(negociat);
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), {
      ...batePalma(),
      esteAdmin: true,
    }));
  });
});

/* ══════════════════════════════════════════ imutabilitate & ștergere ════ */

describe('invitația e imutabilă, iar ștergerea e a expeditorului', () => {
  test('nici expeditorul nu-și mai poate schimba invitația trimisă', async () => {
    await seedInvite();
    await assertFails(updateDoc(doc(as('ana'), 'invites', ID), {
      payload: { ...PAYLOAD, p: 'alt-loc' },
    }));
  });

  test('expeditorul își poate șterge invitația', async () => {
    await seedInvite();
    await assertSucceeds(deleteDoc(doc(as('ana'), 'invites', ID)));
  });

  test('destinatarul nu poate șterge invitația primită', async () => {
    await seedInvite({ toUid: 'bogdan', toName: 'Bogdan' });
    await assertFails(deleteDoc(doc(as('bogdan'), 'invites', ID)));
  });

  test('un străin nu poate șterge nimic', async () => {
    await seedInvite();
    await assertFails(deleteDoc(doc(as('cristi'), 'invites', ID)));
  });
});

/* ═════════════════════════════════════════════════════ profiluri ════════ */

describe('profiluri', () => {
  const profil = {
    name: 'Ana', email: 'ana@example.com', photo: '',
    createdAt: serverTimestamp(), lastSeenAt: serverTimestamp(),
  };

  test('îți poți scrie propriul profil', async () => {
    await assertSucceeds(setDoc(doc(as('ana'), 'users', 'ana'), profil));
  });

  test('nu poți scrie profilul altuia', async () => {
    await assertFails(setDoc(doc(as('ana'), 'users', 'bogdan'), profil));
  });

  test('câmpurile străine în profil sunt refuzate', async () => {
    await assertFails(setDoc(doc(as('ana'), 'users', 'ana'), { ...profil, rol: 'admin' }));
  });

  test('poți citi profilul cuiva, numele apare pe invitații', async () => {
    await seed((db) => setDoc(doc(db, 'users', 'ana'), { ...profil, createdAt: new Date(), lastSeenAt: new Date() }));
    await assertSucceeds(getDoc(doc(as('bogdan'), 'users', 'ana')));
  });

  test('nimeni nu poate răsfoi lista de utilizatori', async () => {
    await assertFails(getDocs(collection(as('ana'), 'users')));
  });

  test('profilurile nu se pot șterge', async () => {
    await seed((db) => setDoc(doc(db, 'users', 'ana'), { ...profil, createdAt: new Date(), lastSeenAt: new Date() }));
    await assertFails(deleteDoc(doc(as('ana'), 'users', 'ana')));
  });
});
