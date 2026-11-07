// Generuje favicon.ico, apple-touch-icon.png (z favicon.svg) oraz domyślny obraz OG 1200×630.
// OG jest renderowany z scripts/og.html przez Edge/Chrome w trybie headless (prawdziwe fonty strony),
// więc przed uruchomieniem włącz podgląd: `npm run serve` (port 8080), potem: `node scripts/brand.mjs`.
// Własne zdjęcie OG: wrzuć assets/img/src/og.jpg i uruchom `npm run images` – ma pierwszeństwo.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const svg = await readFile('favicon.svg');

// apple-touch-icon: pełne tło (iOS nie lubi przezroczystości)
await sharp(svg, { density: 600 }).resize(180, 180).flatten({ background: '#f3f0ec' }).png().toFile('apple-touch-icon.png');

// favicon.ico z osadzonymi PNG 16/32/48
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map((s) => sharp(svg, { density: 600 }).resize(s, s).png().toBuffer()));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return e;
});
await writeFile('favicon.ico', Buffer.concat([header, ...entries, ...pngs]));
console.log('✓ favicon.ico, apple-touch-icon.png');

// OG przez przeglądarkę headless
const browsers = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
const browser = process.env.CHROME_PATH || browsers.find((p) => existsSync(p));
if (!browser) {
  console.warn('! Nie znaleziono Edge/Chrome – pomijam OG.');
} else {
  const tmp = resolve('og-tmp.png');
  execFileSync(browser, [
    '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1200,630', '--virtual-time-budget=3000', `--screenshot=${tmp}`,
    'http://localhost:8080/scripts/og.html',
  ], { stdio: 'ignore' });
  await sharp(tmp).resize(1200, 630).jpeg({ quality: 86, mozjpeg: true }).toFile('assets/img/og.jpg');
  await rm(tmp);
  console.log('✓ assets/img/og.jpg');
}
