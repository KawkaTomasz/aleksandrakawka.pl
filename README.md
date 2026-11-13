# aleksandrakawka.pl

Strona-wizytówka **Aleksandra Kawka – Wizaż i Stylizacja Fryzur**.
Czysty HTML + CSS + odrobina vanilla JS, hosting na GitHub Pages (deploy przy każdym pushu na `main`).

## Struktura

```
index.html                  strona główna (o mnie, skrót oferty i szkoleń, portfolio, studio, opinie, kontakt)
oferta/index.html           podstrona /oferta/ (pełny opis usług + pytania)
szkolenia/index.html        podstrona /szkolenia/
studio/index.html           podstrona /studio/ (opis, adres, galeria wnętrza)
polityka-prywatnosci.html   polityka prywatności
404.html                    strona błędu
css/style.css               wszystkie style; zmienne (kolory, fonty, odstępy) w :root na górze pliku
partials/                   wspólne fragmenty: header.html, footer.html, kontakt.html
js/main.js                  menu mobilne, karuzela w hero, filtry portfolio, opinie
assets/fonts/               Cormorant Garamond + Jost (woff2, lokalnie – bez Google Fonts)
assets/img/                 wygenerowane warianty zdjęć (480/960/1600 px × AVIF/WebP/JPG) + og.jpg
assets/img/src/             ORYGINAŁY zdjęć (nie trafiają do repozytorium ani na serwer)
scripts/                    narzędzia: obrazy, wspólne fragmenty, krytyczny CSS, favicony/OG, serwer podglądu
```

## Podmiana zdjęć

1. Wrzuć oryginały (najlepiej ≥ 1600 px szerokości) do `assets/img/src/` pod tymi nazwami:

   | Plik | Gdzie na stronie | Kadr |
   |---|---|---|
   | `hero.jpg`, `hero-2.jpg`, `hero-3.jpg` | karuzela na górze strony, przełącza się co 6 s (kadr poziomy na komputer + pionowy na telefon) | 16:10 i 4:5 |
   | `o-mnie.jpg` | portret w sekcji „O mnie” | 4:5 |
   | `studio.jpg` | sekcja „Studio” na głównej i góra podstrony /studio/ | 4:5 |
   | `studio-2.jpg` … `studio-5.jpg` | galeria „Zajrzyj do środka” na /studio/ | 4:5 |
   | `usluga-slubny.jpg`, `usluga-okolicznosciowy.jpg`, `usluga-fryzury.jpg`, `usluga-makijaz-fryzura.jpg` | karty oferty na głównej + /oferta/ | 2:3 |
   | `szkolenie-dla-siebie.jpg`, `szkolenie-poczatkujace.jpg`, `szkolenie-indywidualne.jpg` | karty szkoleń na głównej + /szkolenia/ | 4:5 |
   | `portfolio-01.jpg` … `portfolio-08.jpg` | galeria | 3:4, 4:5, 1:1, 4:5, 1:1, 4:5, 3:4, 1:1 |
   | `og.jpg` (opcjonalnie) | podgląd linku na Facebooku/Messengerze | 1200×630 |

   Dozwolone też `.jpeg .png .webp .avif .tif`. Zdjęcie jest automatycznie kadrowane do proporcji
   (na „najciekawszy” fragment). Kadr można wymusić polem `position` w `scripts/images.mjs`.

2. Uruchom:

   ```bash
   npm install
   npm run images
   ```

3. Zaktualizuj teksty `alt` w `index.html` i na podstronach (obecnie „Miejsce na zdjęcie: …”) i podpisy w portfolio.
4. `git add -A && git commit -m "Zdjęcia" && git push` – strona zaktualizuje się sama po ok. minucie.

Chcesz więcej/mniej zdjęć w portfolio? Dodaj/usuń wpis w `IMAGES` w `scripts/images.mjs`
i odpowiedni `<li class="gallery__item">` w `index.html`.

## Wspólne fragmenty (menu, stopka, kontakt)

Menu, stopka i sekcja kontaktu są w `partials/`. W stronach HTML stoją między znacznikami
`<!-- partial:header -->` … `<!-- /partial:header -->` – **nie edytuj ich tam**, tylko w `partials/`, potem:

```bash
npm run pages      # wkleja fragmenty do wszystkich stron + krytyczny CSS
```

Skrypt sam oznacza bieżącą podstronę w menu (`aria-current="page"`).

### Nowa podstrona

1. Skopiuj np. `studio/index.html` do `nowa/index.html`, zmień `<title>`, opis, `canonical`, `og:url` i treść.
2. Dopisz ją w `scripts/pages.mjs` i uruchom `npm run pages`.
3. Dodaj link w `partials/header.html` / `partials/footer.html` (jeśli ma być w menu).
4. Dodaj katalog do kroku `cp` w `.github/workflows/pages.yml` i adres do `sitemap.xml`.

## Placeholdery do uzupełnienia

Wszystkie miejsca są oznaczone `[[DO UZUPEŁNIENIA: …]]` (na stronie podświetlone na żółto). Znajdziesz je:

```bash
git grep -n "DO UZUPEŁNIENIA"
```

## Praca lokalna

```bash
npm run serve      # podgląd: http://localhost:8080
npm run pages      # po zmianie w partials/ lub w CSS między znacznikami critical:start / critical:end
npm run build      # images + pages
node scripts/brand.mjs   # favicony + domyślny obraz OG (wymaga działającego `npm run serve`)
```

Paletę i fonty zmieniasz w `:root` na górze `css/style.css`, potem `npm run pages`.

## Prywatność

Brak cookies, analityki, trackerów, zewnętrznych CDN i osadzonych widgetów (IG/FB to zwykłe linki),
więc baner cookies nie jest potrzebny.
