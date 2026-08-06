/**
 * Configurarea Firebase.
 *
 * Valorile de mai jos sunt PUBLICE prin design: apar oricum în orice browser
 * care deschide aplicația, oricât le-ai ascunde. Nu ele apără baza de date, ci
 * `firestore.rules`. De aia regulile alea au teste (`tools/rules-test/`).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Ce trebuie să fie bifat în consolă ca aplicația să meargă:
 *
 *  1. Authentication → Sign-in method → **Google** activat.
 *  2. Authentication → Settings → Authorized domains → să conțină
 *     `daniel9502.github.io` (localhost e deja acolo).
 *  3. Firestore Database creat (regiunea `eur3` sau `europe-west`).
 *     Atenție: aplicația folosește **Firestore**, nu Realtime Database.
 *  4. Regulile urcate:
 *
 *         firebase login
 *         firebase use app-d-24f03
 *         firebase deploy --only firestore:rules,firestore:indexes
 *
 * Dacă ceva lipsește, ecranul de intrare îți spune ce, în loc să crape.
 * ─────────────────────────────────────────────────────────────────────────
 */
window.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyC74TpPpEHTXQCxieL8XeZnoI0G65iZ_Wg',
  authDomain: 'app-d-24f03.firebaseapp.com',
  projectId: 'app-d-24f03',
  storageBucket: 'app-d-24f03.firebasestorage.app',
  messagingSenderId: '1025230272738',
  appId: '1:1025230272738:web:873dd4c380c52bc8d786bb',
};

/* Nu e configurat încă? Aplicația o spune frumos, nu crapă. */
window.FIREBASE_READY = !String(window.FIREBASE_CONFIG.apiKey).startsWith('PUNE-');
