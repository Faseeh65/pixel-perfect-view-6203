import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const sourceDirectory = path.join(root, "src", "assets");
const outputDirectory = path.join(root, "public", "images");
const responsiveImages = ["bags", "boxes", "cups", "food", "napkins", "press"];

await mkdir(outputDirectory, { recursive: true });

for (const name of responsiveImages) {
  const source = path.join(sourceDirectory, `${name}.jpg`);
  const metadata = await sharp(source).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions for ${source}`);
  }

  for (const width of [480, 800, 1024, 1200]) {
    if (width > metadata.width) continue;

    await sharp(source)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(path.join(outputDirectory, `${name}-${width}.webp`));
  }
}

import fs from "node:fs";

const jpegLogo = path.join(sourceDirectory, "logo.jpeg");
const pngLogo = path.join(sourceDirectory, "logo.png");
const logoSource = fs.existsSync(jpegLogo) ? jpegLogo : pngLogo;

if (fs.existsSync(logoSource)) {
  await sharp(logoSource)
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 85, effort: 5 })
    .toFile(path.join(outputDirectory, "logo.webp"));
}

const files = await readdir(outputDirectory);
const totalBytes = (
  await Promise.all(files.map((file) => stat(path.join(outputDirectory, file))))
).reduce((sum, file) => sum + file.size, 0);

console.log(`Generated ${files.length} WebP images (${(totalBytes / 1024).toFixed(1)} KiB).`);
