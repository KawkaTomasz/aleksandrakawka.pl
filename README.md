# aleksandrakawka.pl

Strona-wizytówka **Aleksandra Kawka – Wizaż i Stylizacja Fryzur**.
Czysty HTML + CSS + odrobina vanilla JS, hosting na GitHub Pages (deploy przy każdym pushu na `main`).

## Struktura

```
index.html                  strona główna (sekcje: o mnie, usługi, szkolenia, portfolio, opinie, kontakt)
polityka-prywatnosci.html   polityka prywatności
404.html                    strona błędu
css/style.css               wszystkie style; zmienne (kolory, fonty, odstępy) w :root na górze pliku
js/main.js                  menu mobilne, karty, filtry portfolio, opinie
assets/fonts/               Cormorant Garamond + Jost (woff2, lokalnie – bez Google Fonts)
assets/img/                 wygenerowane warianty zdjęć (480/960/1600 px × AVIF/WebP/JPG) + og.jpg
assets/img/src/             ORYGINAŁY zdjęć (nie trafiają do repozytorium ani na serwer)
scripts/                    narzędzia: obrazy, krytyczny CSS, favicony/OG, serwer podglądu
```

## Podmiana zdjęć

1. Wrzuć oryginały (najlepiej ≥ 1600 px szerokości) do `assets/img/src/` pod tymi nazwami:

   | Plik | Gdzie na stronie | Kadr |
   |---|---|---|
   | `hero.jpg` | duże zdjęcie na górze (kadr poziomy na komputer + pionowy na telefon) | 16:10 i 4:5 |
   | `o-mnie.jpg` | portret w sekcji „O mnie” | 4:5 |
   | `usluga-slubny.jpg`, `usluga-okolicznosciowy.jpg`, `usluga-fryzury.jpg`, `usluga-makijaz-fryzura.jpg` | karty usług | 2:3 |
   | `szkolenie-dla-siebie.jpg`, `szkolenie-poczatkujace.jpg`, `szkolenie-indywidualne.jpg` | karty szkoleń | 4:5 |
   | `portfolio-01.jpg` … `portfolio-08.jpg` | galeria | 3:4, 4:5, 1:1, 4:5, 1:1, 4:5, 3:4, 1:1 |
   | `og.jpg` (opcjonalnie) | podgląd linku na Facebooku/Messengerze | 1200×630 |

   Dozwolone też `.jpeg .png .webp .avif .tif`. Zdjęcie jest automatycznie kadrowane do proporcji
   (na „najciekawszy” fragment). Kadr można wymusić polem `position` w `scripts/images.mjs`.

2. Uruchom:

   ```bash
   npm install
   npm run images
   ```

3. Zaktualizuj teksty `alt` w `index.html` (obecnie „Miejsce na zdjęcie: …”) i podpisy w portfolio.
4. `git add -A && git commit -m "Zdjęcia" && git push` – strona zaktualizuje się sama po ok. minucie.

Chcesz więcej/mniej zdjęć w portfolio? Dodaj/usuń wpis w `IMAGES` w `scripts/images.mjs`
i odpowiedni `<li class="gallery__item">` w `index.html`.

## Placeholdery do uzupełnienia

Wszystkie miejsca są oznaczone `[[DO UZUPEŁNIENIA: …]]` (na stronie podświetlone na żółto). Znajdziesz je:

```bash
git grep -n "DO UZUPEŁNIENIA"
```

## Praca lokalna

```bash
npm run serve      # podgląd: http://localhost:8080
npm run critical   # po zmianie CSS między znacznikami critical:start / critical:end
npm run build      # images + critical
node scripts/brand.mjs   # favicony + domyślny obraz OG (wymaga działającego `npm run serve`)
```

Paletę i fonty zmieniasz w `:root` na górze `css/style.css`, potem `npm run critical`.

## Prywatność

Brak cookies, analityki, trackerów, zewnętrznych CDN i osadzonych widgetów (IG/FB to zwykłe linki),
więc baner cookies nie jest potrzebny.
