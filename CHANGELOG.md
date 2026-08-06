# Ce s-a schimbat

Numărul de versiune stă în [`version.js`](version.js), într-un singur loc: de
acolo îl ia și interfața (scris mic, jos în meniul contului), și service
workerul, ca numele cache-ului. Crești numărul acolo, versiunea nouă ajunge
singură la toată lumea.

De ce s-a ales fiecare pas scrie în [RESEARCH.md](RESEARCH.md).

## 0.2 — „hai să negociem” chiar negociază

Până acum butonul exista, ecranul de contrapropunere exista, dar tot ce ajungea
la expeditor era proză: *„Eu zic în parc, sâmbătă, pe la 20:00”*. El trebuia să
citească, să înțeleagă și să refacă invitația de la zero.

- Ce alege invitatul (**loc, zi, oră**) pleacă acum și structurat, nu doar în
  text. Textul rămâne exact cum era, cu tot cu glumă.
- Expeditorul vede un tabel cu **ce s-a mutat**: valoarea veche tăiată, cea nouă
  scrisă alături; ce n-a mișcat rămâne acolo, palid, ca să se vadă întreaga
  înțelegere, nu doar diferența.
- Un buton, **🤝 Bate palma**, și gata. Confetti inclus.
- Ce s-a convenit intră în **ceas și în calendar** (`.ics`), fără să atingă
  invitația originală: ea rămâne exact cum a plecat, cu data ei.
- În **📬 Invitațiile mele**, invitațiile cu palma bătută arată înțelegerea,
  nu ce scria la plecare.

Sub capotă, în `firestore.rules`, acceptul e cel mai păzit lucru din aplicație —
**23 de teste noi**, 74 în total:

- doar expeditorul poate accepta, o singură dată;
- doar pe un răspuns care chiar a propus altceva (`negociem` sau `alta-data`);
- **exact ce s-a propus**: dacă schimbă o oră pe drum, regula respinge. Fără
  egalitatea asta, „acceptă” ar fi o portiță prin care expeditorul rescrie
  întâlnirea pe la spate;
- acceptul nu atinge nici invitația, nici răspunsul, nici statusul;
- nicio actualizare nu mai poate strecura chei noi în document.

De unde a venit ideea: [RESEARCH.md](RESEARCH.md) — e singurul lucru pe care îl
au toți concurenții unu-la-unu (askfordate.app: *„trimiți un link unde el alege
ora”*) și noi nu-l aveam.

## 0.1 — de unde plecăm

Primul număr pus pe ce exista deja. Nimic din aplicație nu se schimbă:

- invitații scrise dinainte, trimise printr-un link, cu cont Google de ambele părți;
- cer înstelat cu licurici, temă zi/noapte după oră, ponturi, butonul de „nu” care se roagă;
- Firestore cu reguli testate (51 de teste pe emulator);
- funcționează offline, se instalează pe telefon;
- exploratorul de graf din [`graph/`](graph/) și portul lui Flutter, numerotate separat.

Adăugat acum, ca să existe versiuni de-aici înainte:

- `version.js` — un singur număr, citit și de pagină, și de service worker;
- versiunea scrisă discret în meniul contului;
- `CHANGELOG.md` (fișierul ăsta) și `RESEARCH.md` — ce fac aplicațiile
  concurente și ce luăm de la ele.
