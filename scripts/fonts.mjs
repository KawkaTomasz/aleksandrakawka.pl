// Kopiuje używane pliki fontów (woff2, zmienna grubość) z pakietów @fontsource-variable
// do assets/fonts. Uruchamiane jednorazowo: `npm run fonts`.
import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const out = 'assets/fonts';
const files = [
  ['cormorant-garamond', 'cormorant-garamond-latin-wght-normal.woff2'],
  ['cormorant-garamond', 'cormorant-garamond-latin-ext-wght-normal.woff2'],
  ['cormorant-garamond', 'cormorant-garamond-latin-wght-italic.woff2'],
  ['cormorant-garamond', 'cormorant-garamond-latin-ext-wght-italic.woff2'],
  ['jost', 'jost-latin-wght-normal.woff2'],
  ['jost', 'jost-latin-ext-wght-normal.woff2'],
];

await mkdir(out, { recursive: true });
for (const [pkg, file] of files) {
  await copyFile(join('node_modules/@fontsource-variable', pkg, 'files', file), join(out, file));
  console.log('✓', file);
}
await copyFile('node_modules/@fontsource-variable/cormorant-garamond/LICENSE', join(out, 'LICENSE-cormorant-garamond.txt'));
await copyFile('node_modules/@fontsource-variable/jost/LICENSE', join(out, 'LICENSE-jost.txt'));
