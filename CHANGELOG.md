# Ce s-a schimbat

Numărul de versiune stă în [`version.js`](version.js), într-un singur loc: de
acolo îl ia și interfața (scris mic, jos în meniul contului), și service
workerul, ca numele cache-ului. Crești numărul acolo, versiunea nouă ajunge
singură la toată lumea.

De ce s-a ales fiecare pas scrie în [RESEARCH.md](RESEARCH.md).

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
