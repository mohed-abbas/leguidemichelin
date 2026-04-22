import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { BusinessError } from "../errors.js";

/**
 * Convert a full-size souvenir key to its thumbnail key by inserting `/thumb/`
 * before the filename. Idempotent: already-thumb keys are returned unchanged.
 *
 * souvenirs/2026/abc.jpg        → souvenirs/2026/thumb/abc.jpg
 * souvenirs/2026/thumb/abc.jpg  → souvenirs/2026/thumb/abc.jpg
 *
 * D-19: parallel subpath layout (not filename-suffix).
 */
export function thumbKeyFor(fullKey: string): string {
  // Already a thumb key? return as-is.
  if (/\/thumb\//.test(fullKey)) return fullKey;
  const match = fullKey.match(/^(souvenirs\/\d{4}\/)(.+)$/);
  if (!match) {
    // Non-standard key (e.g., hero/abc.jpg) — fall back to generic /thumb/ sibling.
    const lastSlash = fullKey.lastIndexOf("/");
    if (lastSlash < 0) return `thumb/${fullKey}`;
    return `${fullKey.slice(0, lastSlash)}/thumb/${fullKey.slice(lastSlash + 1)}`;
  }
  return `${match[1]}thumb/${match[2]}`;
}

export interface ProcessedImage {
  fullKey: string;
  thumbKey: string;
  fullBuffer: Buffer;
  thumbBuffer: Buffer;
}

/**
 * Normalize an uploaded image buffer to two JPEG outputs.
 *
 * Full (D-18):
 *   - max 2048px long side, fit: inside, no upscale
 *   - JPEG quality 82
 *   - EXIF + all metadata stripped
 *   - key: souvenirs/<YYYY>/<cuid>.jpg
 *
 * Thumb (D-19):
 *   - 256×256 cover crop
 *   - JPEG quality 80
 *   - metadata stripped
 *   - key: souvenirs/<YYYY>/thumb/<cuid>.jpg
 *
 * Throws BusinessError('invalid_image', 400) on sharp decode failure.
 */
export async function processToFullAndThumb(buffer: Buffer): Promise<ProcessedImage> {
  const year = new Date().getUTCFullYear();
  // Use UUID with dashes stripped for a compact, URL-safe identifier.
  const id = randomUUID().replace(/-/g, "");
  const fullKey = `souvenirs/${year}/${id}.jpg`;
  const thumbKey = thumbKeyFor(fullKey);

  try {
    // Full — EXIF rotate BEFORE strip, resize, JPEG, no metadata.
    const fullBuffer = await sharp(buffer)
      .rotate() // apply EXIF orientation first
      .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: false })
      // Do NOT call .withMetadata() — omitting it is the sharp idiom for
      // stripping all metadata (EXIF, IPTC, XMP, GPS). Calling .withMetadata({})
      // is the retain-metadata API with an empty partial, which is incorrect.
      .toBuffer();

    // Thumb — independent pipeline from the same source buffer
    // (avoids double-decode rounding artefacts on the full output).
    const thumbBuffer = await sharp(buffer)
      .rotate()
      .resize(256, 256, { fit: "cover" })
      .jpeg({ quality: 80, mozjpeg: false })
      // Omitting .withMetadata() strips all metadata by default (see full pipeline note above).
      .toBuffer();

    return { fullKey, thumbKey, fullBuffer, thumbBuffer };
  } catch (err) {
    // sharp throws on corrupt input / unsupported container.
    console.error("[images] sharp decode failed:", err);
    throw new BusinessError("invalid_image", 400, "image could not be decoded");
  }
}
