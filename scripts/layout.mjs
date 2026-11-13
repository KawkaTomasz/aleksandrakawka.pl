// Wkleja wspólne fragmenty z katalogu partials/ (nagłówek, stopka, kontakt) do każdej strony
// z listy w scripts/pages.mjs – między komentarze <!-- partial:nazwa --> i <!-- /partial:nazwa -->.
// Menu, stopkę i sekcję kontaktu zmieniasz więc w jednym miejscu: partials/*.html,
// potem `npm run layout` (albo `npm run pages` = layout + critical).
import { readFile, writeFile } from 'node:fs/promises';
import { PAGES } from './pages.mjs';

const partials = new Map();
const load = async (name) => {
  if (!partials.has(name)) partials.set(name, (await readFile(`partials/${name}.html`, 'utf8')).trimEnd());
  return partials.get(name);
};

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

  await writeFile(file, html);
  console.log(`✓ ${file}${names.length ? ` (${names.join(', ')})` : ''}`);
}
