import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve(process.cwd(), 'public');
const svgPath = path.join(publicDir, 'icon.svg');
const logoJpgPath = path.resolve(process.cwd(), 'src/assets/images/logo_og_image_1788790588032.jpg');

async function generateIcons() {
  console.log('Generating official DS TECH PWA high-res PNG icons...');

  const sourceImg = fs.existsSync(logoJpgPath) ? logoJpgPath : svgPath;

  // 1. Standard 192x192 PNG
  await sharp(sourceImg)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 2. OpenGraph PNG & JPEG 512x512 (Light background 3D emblem logo)
  await sharp(sourceImg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('Generated og-image.png');

  await sharp(sourceImg)
    .resize(512, 512)
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'og-image.jpg'));
  console.log('Generated og-image.jpg');

  // 3. PWA 512x512 PNG
  await sharp(sourceImg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 4. Apple Touch Icon 180x180 PNG
  await sharp(sourceImg)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 5. Maskable 512x512 PNG
  await sharp(sourceImg)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // 6. Favicons 32x32 & 16x16
  await sharp(sourceImg)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(sourceImg)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('Generated favicons 32x32 and 16x16');

  console.log('All official DS TECH PWA icons successfully generated!');
}

generateIcons().catch(err => console.error('Icon generation failed:', err));

