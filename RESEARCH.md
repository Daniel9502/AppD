# Ce fac ceilalți

Notițe din august 2026, strânse ca să știm ce merită copiat, ce merită ignorat
și unde suntem noi mai slabi decât ar trebui. Fiecare afirmație are sursa la
[Surse](#surse), jos.

Roadmapul care iese din notițele astea e la [Ce facem cu asta](#ce-facem-cu-asta),
iar ce s-a livrat deja e în [CHANGELOG.md](CHANGELOG.md).

## Cine e pe teren

Sunt trei categorii diferite, și doar una ne e concurență adevărată.

### 1. Invitații la petreceri (mulți invitați)

**Partiful** e câștigătorul de imagine al categoriei: gratuit, fără reclame, un
link care se dă mai departe, invitatul nu instalează nimic. Punctul lui forte
nu e funcția, e *cum arată linkul*: previzualizarea care se generează în
WhatsApp sau iMessage e făcută ca să te facă să dai clic. Are RSVP live
(*Going / Maybe / Can't Go*), reminder-e automate, co-gazde, lista de
participanți vizibilă (ca să crească hype-ul) și poze adăugate după eveniment.

Ce-l doare, după recenzii: **cere numărul de telefon** ca să vezi invitația,
ceea ce contrazice reclama „nu-ți trebuie aplicația”; cere acces la tot
calendarul, nu doar să adauge un eveniment; n-are evenimente recurente; iar în
octombrie 2025 s-a aflat că nu curăța coordonatele GPS din pozele urcate de
utilizatori.

**Evite** și **Punchbowl** sunt bătrânii categoriei. Evite are un nivel gratuit
serios (750 de invitați, urmărire RSVP, mesaje, reminder-e), plătit cu reclame.
Punchbowl are gratuit un lucru care ne interesează direct: **vot pe date**
(*date polling*), plus reminder-e automate și co-gazde. **Paperless Post** e
varianta elegantă, cu design de papetărie și un sistem de „monede” pe care
nimeni nu-l înțelege până la casă; de la el merită furat un singur lucru:
**arată dacă invitatul a deschis invitația**, nu doar dacă a răspuns.

### 2. Planificat cu gașca (calendar comun)

**Howbout** suprapune calendarele prietenilor peste al tău și îți arată cine e
liber, cine e ocupat și cine e „poate”; fiecare plan are chat propriu.
**Flaky** merge pe trei tap-uri (ce, când, unde) trimise către un grup fix, cu
RSVP într-un tap și discuția lângă plan, nu într-un thread separat.
**Hangs** pune accent pe vot între variante.

Categoria asta rezolvă altă problemă decât noi: *coordonare repetată într-un
grup stabil*. Noi rezolvăm *o singură întrebare, către un singur om*. Nu ne
apucăm de calendare comune.

### 3. Invitații la o întâlnire, unu-la-unu — aici suntem noi

Categoria asta a explodat în 2026 și e exact ce facem: **DateInvite**,
**DatingInvite**, **PlanYour.Date**, **askfordate.app**. Toate merg la fel:
completezi un formular, iese un link, îl trimiți, celălalt răspunde în pagină.

Ce au ele și contează:

- **PlanYour.Date** are butonul de DA care crește și butonul de NU care fuge.
  Gluma noastră cu butonul care se roagă e din aceeași familie — și e mai bună,
  fiindcă al nostru cedează după trei atingeri în loc să fugă la nesfârșit.
- **askfordate.app**: „trimiți un link unde *el alege ora*”. Asta e diferența
  între o invitație și o negociere, și e cea mai copiată idee din categorie.
- **DateInvite** adaugă poze și mesaj vocal.
- **PlanYour.Date**: *fără cont, deloc*. **DateInvite** și **DatingInvite** la
  fel, pentru cel invitat.

## Unde stăm noi

| | noi | Partiful | PlanYour.Date | askfordate | Punchbowl |
|---|---|---|---|---|---|
| gratuit, fără reclame | ✅ | ✅ | ✅ | prima gratis | ✅ |
| invitatul nu instalează nimic | ✅ | ✅ | ✅ | ✅ | ✅ |
| **invitatul intră fără cont** | ❌ | ❌ (telefon) | ✅ | ✅ | ✅ |
| textul e scris dinainte | ✅ | ❌ | parțial | ✅ (AI) | ❌ |
| umor în interfață | ✅ | parțial | ✅ | parțial | ❌ |
| răspunsul vine singur înapoi | ✅ | ✅ | ✅ | ✅ | ✅ |
| **contrapropunere structurată** | ❌ text | ❌ | ❌ | ✅ | ✅ vot |
| **link cu previzualizare frumoasă** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **reminder înainte de întâlnire** | ❌ | ✅ | ❌ | ❌ | ✅ |
| **„a deschis invitația”** | ❌ | ✅ | ❌ | ❌ | ✅ |
| salvare în calendar | ✅ | ✅ | ❌ | ✅ | ✅ |
| merge offline / se instalează | ✅ | ❌ | ❌ | ❌ | ❌ |
| în română | ✅ | ❌ | ❌ | ❌ | ❌ |

Trei lucruri ies din tabel.

**1. Suntem singurii cu textul deja scris.** Toate celelalte îți dau un formular
gol și te lasă să te chinui. Noi deschidem ecranul cu invitația gata de trimis.
Ăsta e avantajul de păstrat cu dinții — nu-l diluăm adăugând câmpuri.

**2. „Hai să negociem” minte.** Butonul există, ecranul de contrapropunere
există (loc, zi, oră), dar tot ce ajunge la expeditor e **proză**: „Eu zic în
parc, sâmbătă, pe la 20:00”. El trebuie să citească, să înțeleagă și apoi să
refacă invitația de la zero. Concurența unu-la-unu tocmai asta rezolvă.
E cea mai mare gaură funcțională pe care o avem.

**3. Linkul arată prost când îl trimiți.** Fără `og:` în `index.html`, în
WhatsApp apare un dreptunghi gol cu URL. Partiful a construit un produs întreg
pe fix opusul. Costă zece linii de HTML.

Și un lucru pe care îl pierdem intenționat: **contul obligatoriu**. Trei din
patru concurenți direcți lasă invitatul să răspundă fără cont; noi cerem
Google. E scris în [README](README.md#cum-funcționează) de ce — răspunsul se
întoarce singur, fără al doilea link — dar plătim cu fix frecarea de care e
acuzat Partiful. Nu îl schimbăm fără să vrea Daniel: e o decizie de produs, nu
un bug.

## Ce facem cu asta

Ordonat după cât aduce față de cât costă. Ce e bifat a plecat deja.

- [x] **0.1** — numere de versiune, ca fiecare pas să aibă un nume.
- [x] **0.2 — contrapropunerea devine reală.** Ce alege invitatul (loc, zi, oră)
      pleacă structurat, nu doar în text; expeditorul vede exact ce s-a schimbat
      și acceptă cu un buton. Închide gaura #2.
- [ ] **0.3 — linkul care arată bine + ce urmează.** Etichete `og:`, plus un
      capăt de listă cu întâlnirile confirmate și cât mai e până la ele.
      Închide gaura #3 și aduce reminder-ul de la Evite/Punchbowl.
- [ ] **0.4 — „a deschis-o”.** Știm deja când cineva revendică invitația
      (`toUid`); doar n-o arătăm. E funcția premium de la Paperless Post,
      gratis, din date pe care le avem deja.
- [ ] **0.5 — două-trei ore la alegere.** *Date polling*-ul de la Punchbowl,
      pe măsura noastră: propui două ore, el atinge una.

Ce **nu** facem, ca să rămână scris de ce:

- **Calendar comun** (Howbout, Flaky) — altă problemă, alt produs.
- **Mai mulți invitați** — ar rupe tot ce e bun: pontul personal, gluma
  stabilă, „primul care deschide linkul e destinatarul”.
- **Poze după întâlnire** (Partiful) — noi ne oprim la „ne-am văzut”. Și tot
  Partiful ne arată de ce e riscant: pozele vin cu GPS în ele.
- **Chat** — pentru asta există WhatsApp, unde oricum ajunge linkul.

## Surse

- [Best Party Invitation Apps in 2026: Partiful, Evite, Punchbowl & GuestlistOnline](https://www.guestlistonline.com/blog/best-party-invitation-apps-compared)
- [Why use Partiful? – Partiful Help](https://help.partiful.com/hc/en-us/articles/26526377667739-Why-use-Partiful)
- [Partiful Reviews (2026) – Product Hunt](https://www.producthunt.com/products/partiful/reviews)
- [Partiful Alternatives: 6 Top Competitors Compared](https://checkthat.ai/brands/partiful/alternatives)
- [Event startup Partiful wasn't stripping GPS locations from user-uploaded photos – TechCrunch](https://techcrunch.com/2025/10/04/event-startup-partiful-wasnt-stripping-gps-locations-from-user-uploaded-photos/)
- [The 6 Best Apps for Making Plans with Friends (2026) – Flaky](https://flaky-app.com/blog/best-apps-for-making-plans-with-friends)
- [Howbout – shared calendar](https://howbout.app/)
- [Evite vs Punchbowl: Free Plans and Real Costs (2026) – Mixily](https://blog.mixily.com/evite-vs-punchbowl/)
- [Evite vs Paperless Post: Free Tiers, Real Prices (2026) – Mixily](https://blog.mixily.com/evite-vs-paperless-post/)
- [Best Invitation Apps in 2026: Send Invites Without a Guest List – Invyt](https://invyt.io/blog/best-free-invitation-apps-2026)
- [PlanYour.Date](https://planyour.date/)
- [DateInvite](https://dateinvite.xyz/)
- [askfordate.app](https://www.askfordate.app/)
