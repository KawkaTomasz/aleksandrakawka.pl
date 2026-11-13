// Generuje warianty zdjęć 480 / 960 / 1600 px w AVIF, WebP i JPG.
//
//   1. Wrzuć oryginał do assets/img/src/ pod nazwą z listy IMAGES (np. o-mnie.jpg).
//      Obsługiwane: .jpg .jpeg .png .webp .avif .tif .tiff
//   2. Uruchom: npm run images
//
// Zdjęcie jest kadrowane do proporcji z listy (fit: cover, strategia „attention”,
// czyli kadr na najciekawszym fragmencie). Kadr możesz wymusić polem `position`
// (np. 'top', 'center', 'left top') albo dokładnie polem `focus`: środek kadru jako [x, y] w ułamkach
// szerokości/wysokości zdjęcia (np. [0.54, 0.5]); dla hero osobno dla każdego wariantu:
// focus: { '': [x, y], '-portrait': [x, y] }. Jeśli oryginału brak, powstaje neutralny
// placeholder w kolorze z palety – HTML nie wymaga żadnych zmian.
//
// Dodatkowo: assets/img/src/og.jpg (dowolny rozmiar) → assets/img/og.jpg 1200×630.
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const SRC = 'assets/img/src';
const OUT = 'assets/img';
const WIDTHS = [480, 960, 1600];
const EXTS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tif', 'tiff'];

const C = { hero: '#4a4440', hero2: '#5a524c', hero3: '#3d3835', ph1: '#eeeae5', ph2: '#e2ddd6', ph3: '#d5cec6', ph4: '#9a8f87' };
const LABEL = { dark: '#67625d', light: '#ffffff' };

const HERO_VARIANTS = [{ suffix: '', ratio: 16 / 10 }, { suffix: '-portrait', ratio: 4 / 5 }];

// name: nazwa pliku w src/ i prefiks wyjścia; ratio: szerokość / wysokość
const IMAGES = [
  // Hero (karuzela): z każdego oryginału powstają dwa kadry – poziomy (desktop) i pionowy (telefon)
  { name: 'hero', ratio: 16 / 10, color: C.hero, variants: HERO_VARIANTS, focus: { '': [0.5, 0.48] } },
  { name: 'hero-2', ratio: 16 / 10, color: C.hero2, variants: HERO_VARIANTS },
  { name: 'hero-3', ratio: 16 / 10, color: C.hero3, variants: HERO_VARIANTS, focus: { '-portrait': [0.5, 0.5] } },
  { name: 'o-mnie', ratio: 4 / 5, color: C.ph2, label: 'Portret · 4:5', position: 'top' },
  { name: 'studio', ratio: 4 / 5, color: C.ph3, label: 'Studio · 4:5' },
  // Podstrona /studio/: galeria wnętrza
  { name: 'studio-2', ratio: 4 / 5, color: C.ph2, label: 'Studio 2 · 4:5' },
  { name: 'studio-3', ratio: 4 / 5, color: C.ph3, label: 'Studio 3 · 4:5' },
  { name: 'studio-4', ratio: 4 / 5, color: C.ph1, label: 'Studio 4 · 4:5' },
  { name: 'studio-5', ratio: 4 / 5, color: C.ph2, label: 'Studio 5 · 4:5' },
  { name: 'usluga-slubny', ratio: 2 / 3, color: C.ph2, label: 'Makijaż ślubny · 2:3' },
  { name: 'usluga-okolicznosciowy', ratio: 2 / 3, color: C.ph3, label: 'Makijaż okolicznościowy · 2:3' },
  { name: 'usluga-fryzury', ratio: 2 / 3, color: C.ph3, label: 'Stylizacja fryzur · 2:3' },
  { name: 'usluga-makijaz-fryzura', ratio: 2 / 3, color: C.ph2, label: 'Makijaż i fryzura · 2:3' },
  { name: 'szkolenie-dla-siebie', ratio: 4 / 5, color: C.ph1, label: 'Makijaż dla siebie · 4:5' },
  { name: 'szkolenie-poczatkujace', ratio: 4 / 5, color: C.ph3, label: 'Dla początkujących · 4:5' },
  { name: 'szkolenie-indywidualne', ratio: 4 / 5, color: C.ph2, label: 'Szkolenie indywidualne · 4:5' },
  { name: 'portfolio-01', ratio: 3 / 4, color: C.ph2, label: 'Portfolio 01 · 3:4' },
  { name: 'portfolio-02', ratio: 4 / 5, color: C.ph3, label: 'Portfolio 02 · 4:5' },
  { name: 'portfolio-03', ratio: 1, color: C.ph3, label: 'Portfolio 03 · 1:1' },
  { name: 'portfolio-04', ratio: 4 / 5, color: C.ph4, label: 'Portfolio 04 · 4:5', labelColor: LABEL.light },
  { name: 'portfolio-05', ratio: 1, color: C.ph2, label: 'Portfolio 05 · 1:1' },
  { name: 'portfolio-06', ratio: 4 / 5, color: C.ph2, label: 'Portfolio 06 · 4:5' },
  { name: 'portfolio-07', ratio: 3 / 4, color: C.ph3, label: 'Portfolio 07 · 3:4' },
  { name: 'portfolio-08', ratio: 1, color: C.ph2, label: 'Portfolio 08 · 1:1' },
];

const findSource = (name) => EXTS.map((e) => join(SRC, `${name}.${e}`)).find((p) => existsSync(p));

// Wycinek oryginału o proporcjach `ratio` ze środkiem w punkcie `focus` (ułamki), dosunięty do krawędzi.
function focusBox(meta, ratio, [fx, fy]) {
  const W = meta.width, H = meta.height;
  const w = Math.min(W, Math.round(H * ratio)), h = Math.min(H, Math.round(W / ratio));
  const clamp = (v, max) => Math.max(0, Math.min(max, Math.round(v)));
  return { left: clamp(fx * W - w / 2, W - w), top: clamp(fy * H - h / 2, H - h), width: w, height: h };
}

const escapeXml = (s) => s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);

function placeholderSvg(w, h, color, label, labelColor = LABEL.dark) {
  const size = Math.max(11, Math.round(w * 0.024));
  const pad = Math.round(w * 0.06);
  const text = label
    ? `<text x="${pad}" y="${h - pad}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" letter-spacing="${(size * 0.22).toFixed(1)}" fill="${labelColor}">${escapeXml(label.toUpperCase())}</text>`
    : '';
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="${color}"/>${text}</svg>`);
}

async function writeFormats(pipeline, base) {
  await Promise.all([
    pipeline.clone().avif({ quality: 52, effort: 5 }).toFile(`${base}.avif`),
    pipeline.clone().webp({ quality: 74, effort: 5 }).toFile(`${base}.webp`),
    pipeline.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(`${base}.jpg`),
  ]);
}

await mkdir(SRC, { recursive: true });
let fromPhotos = 0;

for (const img of IMAGES) {
  const src = findSource(img.name);
  const variants = img.variants ?? [{ suffix: '', ratio: img.ratio }];
  let meta;
  if (src) {
    meta = await sharp(src).rotate().toBuffer({ resolveWithObject: true }).then((r) => r.info);
    if ((meta.width ?? 0) < WIDTHS.at(-1)) console.warn(`! ${src}: szerokość ${meta.width}px < ${WIDTHS.at(-1)}px – największy wariant zostanie powiększony`);
    fromPhotos += 1;
  }

  for (const v of variants) {
    for (const w of WIDTHS) {
      const h = Math.round(w / v.ratio);
      const focus = Array.isArray(img.focus) ? img.focus : img.focus?.[v.suffix];
      let pipeline = src && focus
        ? sharp(src).rotate().extract(focusBox(meta, v.ratio, focus)).resize(w, h, { kernel: 'lanczos3' })
        : src
        ? sharp(src).rotate().resize(w, h, { fit: 'cover', position: img.position ?? sharp.strategy.attention, kernel: 'lanczos3' })
        : sharp(placeholderSvg(w, h, img.color, img.label, img.labelColor));
      // Powiększanie małego oryginału rozmywa – delikatne wyostrzenie maskuje to (szczegółów nie doda)
      if (src && w > Math.min(meta.width, meta.height * v.ratio) * 1.1) pipeline = pipeline.sharpen({ sigma: 0.8, m1: 0.6, m2: 2 });
      await writeFormats(pipeline, join(OUT, `${img.name}${v.suffix}-${w}`));
    }
  }
  console.log(`${src ? '✓ zdjęcie   ' : '· placeholder'}  ${img.name}`);
}

const og = findSource('og');
if (og) {
  await sharp(og).rotate().resize(1200, 630, { fit: 'cover', position: sharp.strategy.attention })
    .jpeg({ quality: 82, mozjpeg: true }).toFile(join(OUT, 'og.jpg'));
  console.log('✓ zdjęcie     og (1200×630)');
}

console.log(`\nGotowe: ${fromPhotos}/${IMAGES.length} ze zdjęć, reszta to placeholdery.`);
