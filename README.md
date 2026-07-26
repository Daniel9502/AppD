# Hai să ne vedem 🌙

Invitații rapide, haioase, trimise printr-un link. Fără cont, fără instalare, fără server.

**Live:** https://daniel9502.github.io/AppD/

## Cum funcționează

1. Alegi ce faceți, unde, când și cum — totul din chip-uri, dintr-un tap.
2. Apeși **Trimite invitația** → se deschide meniul de share al telefonului (WhatsApp, Messenger, SMS...).
3. Persoana primește un link. Îl deschide și vede invitația, plus un **pont** despre ce să ia cu ea.
4. Răspunde cu un buton: *DA!*, *hai să negociem*, *altă dată* sau *nu pot acum*.
5. Îți trimite răspunsul înapoi tot printr-un link. Tu îl deschizi și vezi verdictul (cu confetti, dacă a zis da).

Toate datele stau în link (query string). Nu există bază de date, nu se salvează nimic nicăieri.

## Ce e înăuntru

- **Cer înstelat cu licurici** noaptea — canvas, licurici care pâlpâie, stele care clipesc și câte o stea căzătoare din când în când. Ziua: fundal cald, fără animații.
- **Temă automată** după oră (noapte între 19:00 și 07:00), cu buton de comutare care se ține minte.
- **Ponturi** diferite pentru băieți și fete — atinge cardul pentru altul.
- **Butonul 🎲 Surpriză** — completează tot random, când n-ai chef să alegi.
- Optimizat pentru telefon: fonturi de sistem (zero cereri de rețea), ținte de tap de 44px+, vibrație scurtă la atingere, `navigator.share`, animații oprite când pagina nu e vizibilă.
- Respectă `prefers-reduced-motion`.

## Fișiere

| Fișier | Ce face |
|---|---|
| `index.html` | cele trei ecrane: compunere / invitație primită / răspuns primit |
| `styles.css` | temele zi–noapte, chip-uri, carduri |
| `script.js` | date, generarea textelor, cerul cu licurici, confetti |

## Dezvoltare

Nu are build. Deschizi `index.html` în browser și gata.

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
