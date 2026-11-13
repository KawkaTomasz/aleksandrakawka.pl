// Lista stron HTML – wspólna dla `npm run layout` i `npm run critical`.
// Nowa podstrona = nowy wpis tutaj + katalog z index.html + wpis w sitemap.xml
// i w kroku „Przygotuj katalog _site” w .github/workflows/deploy.yml.
// url: adres strony – link z takim href w menu dostaje aria-current="page".
export const PAGES = [
  { file: 'index.html', url: '/' },
  { file: 'oferta/index.html', url: '/oferta/' },
  { file: 'szkolenia/index.html', url: '/szkolenia/' },
  { file: 'studio/index.html', url: '/studio/' },
  { file: 'polityka-prywatnosci.html', url: '/polityka-prywatnosci.html' },
  { file: '404.html', url: null },
];
