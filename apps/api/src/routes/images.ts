import { Router, type Request, type Response, type NextFunction } from "express";
import { storage } from "../storage.js";
import { BusinessError } from "../errors.js";

const EXT_CONTENT_TYPE: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".webp": "image/webp",
};

function contentTypeFor(key: string): string {
  const dot = key.lastIndexOf(".");
  if (dot < 0) return "application/octet-stream";
  return EXT_CONTENT_TYPE[key.slice(dot).toLowerCase()] ?? "application/octet-stream";
}

export const imagesRouter = Router();

/**
 * GET /api/images/:key — PUBLIC (no requireAuth per D-23).
 *
 * Uses a named wildcard `/*splat` to allow slashes in the key
 * (e.g. /api/images/souvenirs/2026/thumb/abc.jpg).
 * Express 5 stores named wildcards in req.params.splat.
 *
 * Cache-Control: public, max-age=31536000, immutable (D-22).
 * Keys are content-immutable (new upload = new cuid = new key).
 *
 * safeResolve in storage.ts rejects path-traversal attempts; any
 * thrown Error → 404 not_found (don't leak "invalid key" vs "missing file").
 */
imagesRouter.get("/*splat", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Express 5 named wildcards are an ARRAY of path segments when multiple slashes
    // match — stringifying it directly joins with commas, producing bogus keys like
    // `souvenirs,2026,thumb,abc.jpg`. Join on `/` to restore the original key shape.
    const splat = (req.params as Record<string, string | string[]>).splat;
    const raw = Array.isArray(splat)
      ? splat.join("/")
      : (splat ?? (req.params as Record<string, string>)["0"]);
    if (!raw) {
      throw new BusinessError("not_found", 404, "image not found");
    }
    // Decode percent-encoding (safeResolve validates after decode).
    const key = decodeURIComponent(raw);
    try {
      const { body } = await storage.get(key);
      res.setHeader("Content-Type", contentTypeFor(key));
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      body.on("error", (streamErr) => {
        console.error("[images] stream error:", streamErr);
        if (!res.headersSent) res.status(500).json({ error: "internal" });
      });
      body.pipe(res);
    } catch (storageErr) {
      // storage.get throws on safeResolve rejection OR ENOENT — both → 404.
      console.warn("[images] fetch failed for key:", key, String(storageErr));
      throw new BusinessError("not_found", 404, "image not found");
    }
  } catch (err) {
    next(err);
  }
});
