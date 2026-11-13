// Wkleja krytyczny CSS (fragment css/style.css między /* critical:start */ i /* critical:end */)
// do <head> każdej strony HTML, między komentarzami <!-- critical:start --> i <!-- critical:end -->.
// Uruchom po każdej zmianie w tej części arkusza: `npm run critical`.
import { readFile, writeFile } from 'node:fs/promises';
import { PAGES } from './pages.mjs';

const pages = PAGES.map((p) => p.file);
const css = await readFile('css/style.css', 'utf8');
const match = css.match(/\/\* critical:start \*\/([\s\S]*?)\/\* critical:end \*\//);
if (!match) throw new Error('Brak znaczników critical:start / critical:end w css/style.css');

const minified = match[1]
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([{};,>])\s*/g, '$1')
  .replace(/:\s+/g, ':')
  .replace(/;}/g, '}')
  .trim();

for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const next = html.replace(
    /<!-- critical:start -->[\s\S]*?<!-- critical:end -->/,
    `<!-- critical:start -->\n<style id="critical-css">${minified}</style>\n<!-- critical:end -->`,
  );
  if (next === html && !html.includes(minified)) throw new Error(`Brak znaczników critical w ${page}`);
  await writeFile(page, next);
  console.log(`✓ ${page} (${(minified.length / 1024).toFixed(1)} kB krytycznego CSS)`);
}
