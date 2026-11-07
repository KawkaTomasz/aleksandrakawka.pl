# Domena aleksandrakawka.pl → GitHub Pages (strefa DNS w OVH)

Konto GitHub: **KawkaTomasz** · repozytorium: **KawkaTomasz/aleksandrakawka.pl**
Adresy IP sprawdzone w dokumentacji GitHub Pages (7.11.2026):
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

> Poczta Zimbra w OVH działa dalej, bo **nie zmieniamy** rekordów MX, SPF (TXT `v=spf1 …`), DKIM,
> DMARC ani rekordów `autoconfig` / `autodiscover` / SRV. Zmieniamy tylko adres strony WWW.

## 0. Najpierw: weryfikacja domeny na koncie GitHub (ochrona przed przejęciem)

1. GitHub → avatar → **Settings** → **Pages** (w lewym menu, sekcja „Code, planning, and automation”).
2. **Add a domain** → wpisz `aleksandrakawka.pl` → **Add domain**.
3. GitHub pokaże rekord TXT do dodania, np.
   - nazwa: `_github-pages-challenge-KawkaTomasz`
   - wartość: `<losowy ciąg od GitHuba>`
4. Dodaj go w OVH (krok 2 niżej, typ **TXT**; w polu „Subdomena” wpisz samą część przed domeną:
   `_github-pages-challenge-KawkaTomasz`).
5. Po kilku–kilkunastu minutach wróć i kliknij **Verify**. Rekordu TXT nie usuwaj – musi zostać.

## 1. Otwórz strefę DNS

OVHcloud Control Panel → **Web Cloud** → **Nazwy domen** → `aleksandrakawka.pl` → zakładka **Strefa DNS**.

(Opcjonalnie) Na górze listy rekordów: **Zmień TTL domyślny** na `3600` lub mniej – szybsza propagacja.

## 2. Usuń domyślne rekordy OVH dla strony WWW

Kliknij `…` przy rekordzie → **Usuń wpis**. Usuń tylko te:

| Domena | Typ | Wartość (przykład) |
|---|---|---|
| `aleksandrakawka.pl.` | **A** | adres OVH, np. `213.186.33.5` |
| `aleksandrakawka.pl.` | **AAAA** | adres IPv6 OVH (jeśli jest) |
| `www.aleksandrakawka.pl.` | **CNAME** | `aleksandrakawka.pl.` |
| `www.aleksandrakawka.pl.` | **A** / **AAAA** | (jeśli istnieją zamiast CNAME) |

Jeśli w zakładce **Przekierowanie** (Redirection) jest aktywne przekierowanie dla domeny lub `www` – usuń je
(OVH tworzy wtedy własne rekordy A).

**NIE usuwaj:** `MX`, `TXT` z `v=spf1`, `TXT` DKIM/DMARC (`…._domainkey`, `_dmarc`),
`CNAME` / `SRV` dla `autoconfig`, `autodiscover`, `_autodiscover._tcp`, `mail`, `ftp`, rekordów `NS`.

## 3. Dodaj rekordy GitHub Pages

**Dodaj wpis** → wybierz typ → pole „Subdomena” zostaw **puste** dla domeny głównej.

| Typ | Subdomena | Cel |
|---|---|---|
| A | *(puste)* | `185.199.108.153` |
| A | *(puste)* | `185.199.109.153` |
| A | *(puste)* | `185.199.110.153` |
| A | *(puste)* | `185.199.111.153` |
| AAAA *(opcjonalnie)* | *(puste)* | `2606:50c0:8000::153` |
| AAAA *(opcjonalnie)* | *(puste)* | `2606:50c0:8001::153` |
| AAAA *(opcjonalnie)* | *(puste)* | `2606:50c0:8002::153` |
| AAAA *(opcjonalnie)* | *(puste)* | `2606:50c0:8003::153` |
| CNAME | `www` | `kawkatomasz.github.io.` *(z kropką na końcu)* |
| TXT | `_github-pages-challenge-KawkaTomasz` | wartość z kroku 0 |

## 4. Sprawdź propagację (zwykle 15 min – kilka godzin, max ok. 24–48 h)

```bash
nslookup aleksandrakawka.pl 8.8.8.8
nslookup www.aleksandrakawka.pl 8.8.8.8
nslookup -type=MX aleksandrakawka.pl 8.8.8.8
```

Oczekiwane: cztery adresy `185.199.10x.153`; `www` → `kawkatomasz.github.io`; MX bez zmian (OVH).

## 5. Włącz HTTPS

Repozytorium → **Settings** → **Pages**:

1. Pole **Custom domain** pokazuje `aleksandrakawka.pl` (ustawione podczas konfiguracji).
   Poczekaj, aż „DNS check” zmieni się na **DNS check successful**.
2. GitHub sam wystawi certyfikat Let's Encrypt (może to potrwać do 24 h).
3. Zaznacz **Enforce HTTPS**.

Sprawdź: https://aleksandrakawka.pl oraz https://www.aleksandrakawka.pl (powinno przekierować na wersję bez `www`).
Wyślij też testowy e-mail na `kontakt@aleksandrakawka.pl`, żeby potwierdzić, że poczta działa.
