#!/usr/bin/env node
import { writeFile, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

function buildSvg({ rounded }) {
  const size = 512;
  const rx = rounded ? Math.round(size * 0.2) : 0;
  return `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d9488"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${rx}" fill="url(#g)"/>
  <rect x="136" y="106" width="240" height="52" rx="6" fill="#ffffff"/>
  <rect x="216" y="106" width="80" height="300" fill="#ffffff"/>
  <rect x="136" y="354" width="240" height="52" rx="6" fill="#ffffff"/>
</svg>
`.trim();
}

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

async function renderRounded(size) {
  return await sharp(Buffer.from(buildSvg({ rounded: true })))
    .resize(size, size)
    .png()
    .toBuffer();
}

async function renderSquareOpaque(size) {
  return await sharp(Buffer.from(buildSvg({ rounded: false })))
    .resize(size, size)
    .flatten({ background: "#0d9488" })
    .png()
    .toBuffer();
}

async function safeUnlink(path) {
  try {
    await rm(path);
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

async function main() {
  await mkdir(publicDir, { recursive: true });

  for (const name of [
    "favicon.ico",
    "favicon-16x16.png",
    "favicon-32x32.png",
    "apple-touch-icon.png",
  ]) {
    await safeUnlink(join(publicDir, name));
  }

  const png16 = await renderRounded(16);
  const png32 = await renderRounded(32);
  const apple180 = await renderSquareOpaque(180);

  await writeFile(join(publicDir, "favicon-16x16.png"), png16);
  await writeFile(join(publicDir, "favicon-32x32.png"), png32);
  await writeFile(join(publicDir, "apple-touch-icon.png"), apple180);
  await writeFile(join(publicDir, "favicon.ico"), pngToIco(png32, 32));

  console.log("Favicons regenerated in", publicDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
