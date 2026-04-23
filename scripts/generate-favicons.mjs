#!/usr/bin/env node
import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#0f172a"/>
  <rect x="136" y="106" width="240" height="52" rx="6" fill="#0d9488"/>
  <rect x="216" y="106" width="80" height="300" fill="#0d9488"/>
  <rect x="136" y="354" width="240" height="52" rx="6" fill="#0d9488"/>
</svg>
`.trim();

function pngToIco(pngBuffer, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngBuffer.length, 8);
  entry.writeUInt32LE(22, 12);

  return Buffer.concat([header, entry, pngBuffer]);
}

async function render(size) {
  return await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(publicDir, { recursive: true });

  const png16 = await render(16);
  const png32 = await render(32);
  const png180 = await render(180);

  await writeFile(join(publicDir, "favicon-16x16.png"), png16);
  await writeFile(join(publicDir, "favicon-32x32.png"), png32);
  await writeFile(join(publicDir, "apple-touch-icon.png"), png180);
  await writeFile(join(publicDir, "favicon.ico"), pngToIco(png32, 32));

  console.log("Favicons generated in", publicDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
