// Wkleja wspólne fragmenty z katalogu partials/ (nagłówek, stopka, kontakt) do każdej strony
// z listy w scripts/pages.mjs – między komentarze <!-- partial:nazwa --> i <!-- /partial:nazwa -->.
// Menu, stopkę i sekcję kontaktu zmieniasz więc w jednym miejscu: partials/*.html,
// potem `npm run layout` (albo `npm run pages` = layout + critical).
//
// Dodatkowo do adresów zdjęć, CSS i JS dopisuje ?v=<skrót zawartości pliku>. Po podmianie zdjęcia
// adres się zmienia, więc przeglądarki i telefony pobierają nową wersję zamiast starej z pamięci.
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { PAGES } from './pages.mjs';

const partials = new Map();
const load = async (name) => {
  if (!partials.has(name)) partials.set(name, (await readFile(`partials/${name}.html`, 'utf8')).trimEnd());
  return partials.get(name);
};

const hashes = new Map();
const version = (path) => {
  if (!hashes.has(path)) {
    const local = path.slice(1);
    hashes.set(path, existsSync(local) ? createHash('md5').update(readFileSync(local)).digest('hex').slice(0, 8) : null);
    if (!hashes.get(path)) console.warn(`! brak pliku ${local}`);
  }
  return hashes.get(path);
};
const ASSET = /(?<=["\s,])(\/(?:assets\/img|css|js)\/[\w./-]+\.(?:avif|webp|jpe?g|png|svg|ico|css|js))(?:\?v=[0-9a-f]+)?/g;

for (const { file, url } of PAGES) {
  let html = await readFile(file, 'utf8');
  const names = [...new Set([...html.matchAll(/<!-- partial:([\w-]+) -->/g)].map((m) => m[1]))];

  for (const name of names) {
    let body = await load(name);
    // Bieżąca podstrona w menu i stopce
    if (url && url !== '/') body = body.replaceAll(`href="${url}"`, `href="${url}" aria-current="page"`);
    const re = new RegExp(`<!-- partial:${name} -->[\\s\\S]*?<!-- /partial:${name} -->`, 'g');
    const before = html;
    html = html.replace(re, () => `<!-- partial:${name} -->\n${body}\n<!-- /partial:${name} -->`);
    if (html === before && !before.includes(body)) throw new Error(`Brak <!-- /partial:${name} --> w ${file}`);
  }

  html = html.replace(ASSET, (m, path) => (version(path) ? `${path}?v=${version(path)}` : m));

  await writeFile(file, html);
  console.log(`✓ ${file}${names.length ? ` (${names.join(', ')})` : ''}`);
}
