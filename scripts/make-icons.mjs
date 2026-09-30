// Generates the PWA icon set from the brand mark (sharp → PNG).
// Run: bun scripts/make-icons.mjs
import sharp from 'sharp';

const TILE = '#0d5c46';
const AMBER = '#f0a63c';

// Bars in the 512 viewBox (BrandMark proportions × 512/48).
const BARS = `
  <rect x="112" y="256" width="64" height="144" rx="21" fill="#ffffff" opacity="0.82"/>
  <rect x="224" y="181" width="64" height="219" rx="21" fill="#ffffff"/>
  <rect x="336" y="106" width="64" height="294" rx="21" fill="${AMBER}"/>
  <rect x="112" y="427" width="288" height="22" rx="11" fill="#ffffff" opacity="0.35"/>
`;

const svg = (inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">${inner}</svg>`;

const tileIcon = (rx) =>
  svg(`<rect width="512" height="512" rx="${rx}" fill="${TILE}"/>${BARS}`);

// maskable: full-bleed tile, content scaled into the ~72% safe zone
const maskableIcon = () =>
  svg(
    `<rect width="512" height="512" fill="${TILE}"/><g transform="translate(256 256) scale(0.72) translate(-256 -256)">${BARS}</g>`
  );

const jobs = [
  ['public/icon-192.png', tileIcon(118), 192],
  ['public/icon-512.png', tileIcon(118), 512],
  ['public/icon-maskable-512.png', maskableIcon(), 512],
  ['public/apple-touch-icon.png', tileIcon(0), 180],
];

for (const [out, body, size] of jobs) {
  await sharp(Buffer.from(svg(body))).resize(size, size).png().toFile(out);
  console.log('wrote', out, size);
}
