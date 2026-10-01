// One-shot: regenerate every brand PNG from the theme-matched SVG.
// MUST run from the project dir so bun resolves the project's sharp build
// (a /tmp copy resolves a pango-less build and silently drops <text>).
import sharp from 'sharp';
import { writeFileSync } from 'fs';

const ART = `
  <path d="M40 67 C106 22 185 33 256 89 C327 33 406 22 472 67 V333 C409 294 329 300 256 351 C183 300 111 294 40 333Z" fill="white"/>
  <path d="M256 89 V351" stroke="#017953" stroke-width="13" stroke-linecap="round"/>
  <rect x="92" y="215" width="40" height="85" rx="8" fill="#10B981"/>
  <rect x="147" y="178" width="40" height="122" rx="8" fill="#10B981"/>
  <rect x="202" y="136" width="40" height="164" rx="8" fill="#10B981"/>
  <rect x="257" y="100" width="40" height="200" rx="8" fill="#10B981"/>
  <rect x="312" y="57" width="40" height="243" rx="8" fill="#10B981"/>
  <path d="M78 205 L147 174 L213 144 L276 107 L390 46" fill="none" stroke="#E8A13A" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M354 46 L390 46 L386 83" fill="none" stroke="#E8A13A" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="256" y="466" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="122" font-weight="900" letter-spacing="-5" fill="white">GCSE</text>
`;

const TILE = '<rect width="512" height="512" rx="105" fill="#017953"/>';
// maskable: full-bleed tile, artwork shrunk into Android's circular safe zone
const MASKABLE = `<g transform="translate(71.7 71.7) scale(0.72)">${ART}</g>`;

const svg = (inner) =>
  `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">${TILE}${inner}</svg>`;

const full = svg(ART);
const maskable = svg(MASKABLE);
writeFileSync('/tmp/logo-full.svg', full);
writeFileSync('/tmp/logo-maskable.svg', maskable);

await sharp(Buffer.from(full)).resize(512, 512).png().toFile('public/icon-512.png');
await sharp(Buffer.from(full)).resize(192, 192).png().toFile('public/icon-192.png');
await sharp(Buffer.from(full)).resize(180, 180).png().toFile('public/apple-touch-icon.png');
await sharp(Buffer.from(maskable)).resize(512, 512).png().toFile('public/icon-maskable-512.png');

// verify the GCSE text actually rendered (pango check): count bright pixels
// in the wordmark band (y 380..470 of 512) of the 512 icon
const { data, info } = await sharp('public/icon-512.png').raw().toBuffer({ resolveWithObject: true });
let white = 0;
for (let y = Math.round(380 * info.height / 512); y < Math.round(470 * info.height / 512); y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * info.channels;
    if (data[i] > 230 && data[i + 1] > 230 && data[i + 2] > 230) white++;
  }
}
console.log('white px in GCSE band:', white, '(need > 5000)');
console.log('done');
