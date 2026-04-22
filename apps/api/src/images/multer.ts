import multer, { type FileFilterCallback } from "multer";
import type { Request, Response, NextFunction } from "express";
import { BusinessError } from "../errors.js";

/**
 * Accepted image MIME types (D-21).
 * iPhone Safari uploads HEIC; desktop Chrome/Firefox upload jpeg/png.
 * sharp handles all four via libheif (bundled in prebuilds).
 */
const ACCEPTED_MIMES = new Set<string>(["image/jpeg", "image/png", "image/heic", "image/heif"]);

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (ACCEPTED_MIMES.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  // Pass a tagged Error to distinguish from LIMIT_FILE_SIZE in the wrapper below.
  const err = new Error("unsupported_media_type") as Error & { code: string };
  err.code = "UNSUPPORTED_MEDIA_TYPE";
  cb(err);
};

/**
 * Shared multer instance. memoryStorage → buffer flows directly into sharp.
 * 10MB limit per D-21.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

/**
 * Middleware factory: single-file image upload under `fieldName`.
 *
 * Composes multer.single() with a follow-up error translator that maps
 * Multer errors to the canonical {error, message} body via BusinessError.
 * Downstream handler sees req.file: Express.Multer.File on success.
 *
 * Error mapping:
 *   LIMIT_FILE_SIZE        → 413 payload_too_large
 *   UNSUPPORTED_MEDIA_TYPE → 415 unsupported_media_type
 *   other                  → 400 validation (unknown upload error)
 */
export function imageUploadSingle(fieldName: string) {
  const mw = upload.single(fieldName);
  return (req: Request, res: Response, next: NextFunction): void => {
    mw(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      const e = err as Error & { code?: string };
      if (e.code === "LIMIT_FILE_SIZE") {
        next(new BusinessError("payload_too_large", 413, "image exceeds 10MB"));
        return;
      }
      if (e.code === "UNSUPPORTED_MEDIA_TYPE") {
        next(new BusinessError("unsupported_media_type", 415, "must be jpeg/png/heic/heif"));
        return;
      }
      // Unknown multer error — forward as generic 400.
      console.error("[images] multer unknown err:", err);
      next(new BusinessError("validation", 400, e.message ?? "upload failed"));
    });
  };
}
