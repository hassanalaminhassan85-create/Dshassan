import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const publicDir = path.resolve(process.cwd(), 'public');
const svgPath = path.join(publicDir, 'icon.svg');

async function generateIcons() {
  console.log('Generating official DS TECH PWA high-res PNG icons from icon.svg...');

  if (!fs.existsSync(svgPath)) {
    console.error('icon.svg not found!');
    return;
  }

  // 1. Standard 192x192 PNG
  await sharp(svgPath)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 2. Standard 512x512 PNG with solid dark background for OpenGraph / WhatsApp preview
  const iconRasterized = await sharp(svgPath)
    .resize(432, 432)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 } // #0f172a (Slate 900)
    }
  })
    .composite([{ input: iconRasterized, top: 40, left: 40 }])
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));
  console.log('Generated og-image.png');

  // Generate og-image.jpg for WhatsApp scrapers that prefer JPEG format
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 3,
      background: { r: 15, g: 23, b: 42 }
    }
  })
    .composite([{ input: iconRasterized, top: 40, left: 40 }])
    .jpeg({ quality: 95 })
    .toFile(path.join(publicDir, 'og-image.jpg'));
  console.log('Generated og-image.jpg');

  await sharp(svgPath)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 3. Apple Touch Icon 180x180 PNG (with dark background fill for iOS home screens)
  const iosIconSvg = `<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
    <rect width="180" height="180" fill="#090d16" />
    <image href="data:image/svg+xml;base64,${fs.readFileSync(svgPath).toString('base64')}" x="10" y="10" width="160" height="160"/>
  </svg>`;
  await sharp(Buffer.from(iosIconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 4. Maskable 512x512 PNG with 15% safe-zone padding and solid background for Android
  const maskableSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#090d16"/>
    <circle cx="256" cy="256" r="240" fill="#000E32" opacity="0.5"/>
    <image href="data:image/svg+xml;base64,${fs.readFileSync(svgPath).toString('base64')}" x="64" y="64" width="384" height="384"/>
  </svg>`;
  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // 5. Favicons 32x32 & 16x16
  await sharp(svgPath)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));
  await sharp(svgPath)
    .resize(16, 16)
    .png()
    .toFile(path.join(publicDir, 'favicon-16x16.png'));
  console.log('Generated favicons 32x32 and 16x16');

  console.log('All official DS TECH PWA icons successfully generated!');
}

generateIcons().catch(err => console.error('Icon generation failed:', err));
