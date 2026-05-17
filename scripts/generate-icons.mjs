import { execFile } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const source = "public/jetquote-icon.png";
const pngTargets = [
  ["public/favicon-16x16.png", 16],
  ["public/favicon-32x32.png", 32],
  ["public/apple-touch-icon.png", 180],
  ["public/android-chrome-192x192.png", 192],
  ["public/android-chrome-512x512.png", 512],
];

if (!existsSync(source)) {
  throw new Error(`Missing source icon: ${source}`);
}

async function resizeWithSharp() {
  const sharp = (await import("sharp")).default;
  for (const [output, size] of pngTargets) {
    await sharp(source)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(output);
  }
}

async function resizeWithSips() {
  for (const [output, size] of pngTargets) {
    await execFileAsync("sips", ["-z", String(size), String(size), source, "--out", output]);
  }
}

function writeIco(output, pngPaths) {
  const images = pngPaths.map((pngPath) => readFileSync(pngPath));
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * images.length;

  const header = Buffer.alloc(offset);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  images.forEach((image, index) => {
    const size = Number(pngPaths[index].match(/favicon-(\d+)x\d+\.png/)?.[1] || 0);
    const entryOffset = headerSize + entrySize * index;
    header.writeUInt8(size === 256 ? 0 : size, entryOffset);
    header.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(image.length, entryOffset + 8);
    header.writeUInt32LE(offset, entryOffset + 12);
    offset += image.length;
  });

  writeFileSync(output, Buffer.concat([header, ...images]));
}

try {
  await resizeWithSharp();
  console.log("Generated PNG icons with sharp.");
} catch (error) {
  console.warn("sharp is unavailable; falling back to sips.");
  await resizeWithSips();
}

writeIco("public/favicon.ico", [
  "public/favicon-16x16.png",
  "public/favicon-32x32.png",
]);

console.log("Generated JetQuote app icons.");
