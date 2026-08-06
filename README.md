# Hai să ne vedem 🌙

Invitații rapide, haioase, trimise printr-un link. Intri cu contul Google, restul merge singur.

**Live:** https://daniel9502.github.io/AppD/

## Cum funcționează

1. Intri cu contul Google. **Amândoi** aveți nevoie de cont: și cel care invită, și cel invitat.
2. **Nu trebuie să alegi nimic.** Invitația e deja scrisă când se deschide ecranul,
   iar butonul **Trimite** stă lipit de marginea de jos, vizibil din prima clipă.
   Dacă vrei altceva, ai șabloane, patru întrebări din chip-uri și un loc de mesaj,
   toate opționale, toate mai jos.
3. Apeși **Trimite invitația** → invitația se salvează și se deschide meniul de share al telefonului (WhatsApp, Messenger, SMS...).
4. Persoana primește un link. Îl deschide, intră în cont, vede invitația și un **pont** despre ce să ia cu ea.
5. Răspunde cu un buton: *DA!*, *hai să negociem*, *altă dată* sau *nu pot acum*.
6. Răspunsul îți apare direct în **📬 Invitațiile mele**, live. Fără link înapoi.

Numele nu se scrie nicăieri: vine din contul Google, și al tău și al celui care
răspunde. Formularul n-are niciun câmp obligatoriu de completat cu mâna.

Invitațiile stau în Firestore. Linkul e cheia: cine îl are poate deschide o
invitație nerevendicată, iar primul care o deschide devine destinatarul ei.
După aceea nimeni altcineva n-o mai poate vedea sau atinge.

> Versiunile de dinainte țineau totul în query string, fără cont și fără bază de
> date. Era mai ușor de trimis, dar răspunsul trebuia adus înapoi tot cu un link.
> Contul obligatoriu a fost un compromis conștient: se pierde ușurința, se câștigă
> răspunsurile care ajung singure.

## Ce e înăuntru

- **Poți rescrie orice.** Sub previzualizare e **✏️ Schimbă textul**: se deschide
  un câmp cu textul întreg, îl schimbi cum vrei, iar el pleacă exact așa. Din
  clipa aia textul e al tău și chip-urile nu ți-l mai suprascriu, ca să nu-l
  pierzi dintr-o atingere greșită; **↺ textul automat** ți-l dă înapoi. La fel
  și pentru cine răspunde: își poate rescrie răspunsul înainte să-l trimită.
- **Rândul de inimă.** Sub invitație, la persoana întâi, scrie de ce întrebi,
  nu ce faceți: *„Nu prea am curaj să întreb, dar chiar vreau să te văd.”*
  Sunt zece variante, alese stabil (aceeași invitație arată la fel pentru
  amândoi). Formularul neatins scoate mereu varianta cea mai blândă.
- **Merge și între prieteni.** Dacă alegi 🍺 *O bere* sau 🏀 *Baschet*, se
  schimbă singur tonul: alt rând de inimă (*„Hai, că avem de povestit vreo trei
  luni.”*) și alte ponturi (*„Ia mingea ta, a lui e dezumflată din vara
  trecută.”*). Nu întreabă nimeni pe nimeni cu cine se vede: alegerea de la
  *Ce facem?* spune destul, iar butoanele de „ponturi pentru” se ascund, fiindcă
  la un meci nu contează dacă ești băiat sau fată, contează să ai adidașii.
- **Cer înstelat cu licurici** noaptea: canvas, licurici care pâlpâie, stele care clipesc și câte o stea căzătoare din când în când. Ziua: fundal cald, fără animații.
- **Temă automată** după oră (noapte între 19:00 și 07:00), cu buton de comutare care se ține minte.
- **Ponturi** diferite pentru băieți și fete; atinge cardul pentru altul. Cele trei
  butoane mici din capul cardului aleg pentru cine e pontul; nu intră în invitație,
  de aia stau acolo și nu ca încă o întrebare în formular.
- **Butonul 🎲 Alege tu în locul meu** completează tot random, când n-ai chef să alegi.
- **Butonul de „nu” se roagă de tine.** Prima atingere zice *pleaseeee?*, a doua
  *nici măcar o oră?*, a treia *bine, mai apasă o dată și te cred*. Și te crede.
  Butonul verde crește cu fiecare rugăminte, cel de „nu” se subțiază. Trei
  atingeri, nu nouăsprezece: gluma nu ține pe nimeni ostatic.
- Optimizat pentru telefon: fonturi de sistem (zero cereri de rețea), ținte de tap de 44px+, vibrație scurtă la atingere, `navigator.share`, animații oprite când pagina nu e vizibilă.
- Respectă `prefers-reduced-motion`.

## Fișiere

| Fișier | Ce face |
|---|---|
| `index.html` | ecranele: cont / compunere / invitație primită / răspuns / invitațiile mele |
| `styles.css` | temele zi și noapte, chip-uri, carduri |
| `script.js` | date, generarea textelor, cerul cu licurici, confetti, rutarea |
| `cloud.js` | contul Google și invitațiile în Firestore |
| `firebase-config.js` | cheile proiectului `app-d-24f03`, cu pașii din consolă înăuntru |
| `firestore.rules` | cine ce poate citi și scrie; 51 de teste în `tools/rules-test/` |
| `graph/` | exploratorul de graf (vezi mai jos) |
| `flutter_graf/` | același explorator, scris în Dart peste Flutter |

## Exploratorul de graf (`/graph/`)

O a doua aplicație, independentă de prima: citește `graph.json` produs de
[Graphify](https://github.com/Graphify-Labs/graphify) și îl face umblabil.

**Live:** https://daniel9502.github.io/AppD/graph/

- **Hartă cu forțe** desenată pe canvas: respingere Barnes-Hut prin quadtree,
  arcuri pe muchii, gravitație spre centru (fără ea, componentele deconectate ar
  zbura din cadru). Zoom, pan, pinch, tras de noduri, fixare.
- **Culoare pe comunitate**: cele mai mari 8 primesc câte o culoare din paleta
  validată pentru daltonism; restul intră în *Altele*. Numele fiecărei comunități
  e scris pe hartă și listat în panou, ca identitatea să nu depindă doar de culoare.
- **Filtre** pe comunitate, tip de relație, tip de nod, plus „doar legături deduse”.
  Legăturile deduse se desenează întrerupt, ca să nu treacă drept fapt.
- **Detalii** la clic: fișier și linie, grad, vecini grupați pe relație, cu direcție.
- **Drum minim** între două noduri (A → B), evidențiat și încadrat. Dacă nodurile
  sunt în componente diferite, o spune.
- **Căutare** care ignoră diacriticele (`fisiere` găsește `Fișiere`).
- Temă zi/noapte, export PNG, scurtături (`/`, `F`, `R`, `T`, `Esc`).
- **Se instalează pe telefon**: are manifest, iconițe și service worker propriu.
  Deschizi linkul în Chrome pe Android → *Adaugă la ecranul principal*, și de
  atunci pornește ca aplicație, cu tot cu offline. Ocupă **62 KB** cu totul.
  Iconițele se regenerează cu `node tools/make-graph-icons.js`.

Îți construiești graful cu:

```bash
uv tool install graphifyy
graphify update .        # scrie graphify-out/graph.json
```

Pagina încarcă singură `../graphify-out/graph.json`. Poți trage peste ea orice alt
`graph.json`, sau îi dai unul prin `?graph=<url>`. Fișierul e citit local, în browser.

### Varianta Flutter (`flutter_graf/`)

Același explorator, portat în Dart peste Flutter. Detalii în
[`flutter_graf/README.md`](flutter_graf/README.md).

Diferența e de caracter, nu de funcții: cea din `graph/` e 47 KB de JS fără build;
asta are cod tipat, 74 de teste care rulează fără browser (inclusiv unul care
randează graful într-un PNG) și aceeași sursă pentru web, desktop și mobil. În
schimb cere SDK-ul Flutter și un bundle de câteva MB.

```bash
cd flutter_graf
flutter test          # 74 de teste
flutter run -d edge   # sau -d chrome
```

## Firebase

Aplicația nu pornește fără el. Pașii sunt scriși pe larg în
[`firebase-config.js`](firebase-config.js). Pe scurt: creezi un proiect,
activezi **Google** ca metodă de conectare, adaugi `daniel9502.github.io` la
domeniile autorizate, creezi baza Firestore, copiezi cheile în fișier și urci
regulile:

```bash
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes
```

Până completezi, aplicația îți spune ce lipsește, în loc să crape.

### Regulile de securitate

Cheile din `firebase-config.js` sunt publice prin design: apar oricum în orice
browser. Singurul lucru care apără baza de date e `firestore.rules`. De aia are
teste, rulate pe emulator, fără să atingă vreun proiect real:

```bash
cd tools/rules-test && npm install && npm test    # 51 de teste
```

Ce garantează, pe scurt:

- o invitație e **imutabilă** după trimitere, nici expeditorul n-o mai schimbă;
- **linkul e cheia**: poți deschide o invitație nerevendicată dacă îi știi id-ul,
  dar nimeni nu poate *răsfoi* invitațiile nerevendicate ale lumii;
- **primul care o deschide** devine destinatar; al doilea nu mai poate;
- doar destinatarul răspunde, cu unul din cele patru răspunsuri, iar textul
  răspunsului trebuie să spună același lucru ca statusul;
- ștergerea e doar a expeditorului.

## Dezvoltare

Nu are build. Deschizi `index.html` în browser și gata, dar pentru conectarea
cu Google îți trebuie context securizat, deci pornește un server local.

Pentru a testa share-ul și clipboard-ul (care cer context securizat), pornește un server local:

```bash
python -m http.server 8000
# apoi deschide http://localhost:8000
```

## Publicare

Orice `git push` pe `main` actualizează automat site-ul în ~1 minut:

```bash
git add -A
git commit -m "mesajul tău"
git push
```
