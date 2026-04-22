import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

/**
 * Storage abstraction (D-08).
 *
 * v1 backing: local filesystem at `/var/data/images` inside the api container.
 *   - compose.dev.yaml mounts this to named volume `images-dev-data` (D-09).
 *   - compose.prod.yaml mounts this to host bind `/srv/foodie/images` (D-10).
 *
 * Phase 4 wires `multer` + `sharp` on top of `.put()` (HEIC → JPEG + thumbnail).
 * Phase 6+ can swap to Cloudinary / S3 by writing a new impl of this interface;
 * `imageKey` stays the same (DB column never stores URLs — only opaque keys).
 *
 * T-01-IMAGE-PATH-TRAVERSAL mitigation:
 *   - Keys are validated to contain no `..`, no absolute paths, no null byte.
 *   - Resolved path is enforced to remain within BASE_DIR.
 */

export interface Storage {
  /**
   * Persist `body` at `key` (server-generated if omitted). Returns the canonical key.
   * Idempotent: re-putting the same key overwrites.
   */
  put(
    key: string | null,
    body: Buffer | Readable,
    opts?: { contentType?: string },
  ): Promise<{ key: string }>;

  /**
   * Read a stored object. Throws if the key doesn't exist or resolves outside BASE_DIR.
   */
  get(key: string): Promise<{ body: Readable; contentType: string | null }>;

  /**
   * Short-lived URL for client fetching. v1 returns a same-origin
   * `/api/images/<key>` path that api's image handler (Phase 4) serves.
   */
  signedUrl(key: string, ttlSeconds: number): Promise<string>;

  /**
   * Delete a stored object. No-ops silently if the key does not exist
   * (idempotent — safe to call in error cleanup handlers).
   */
  delete(key: string): Promise<void>;
}

const BASE_DIR = resolve(process.env.STORAGE_DIR ?? "/var/data/images");

/** Validate a user-supplied key cannot escape BASE_DIR. */
function safeResolve(key: string): string {
  if (!key || key.startsWith("/") || key.includes("..") || key.includes("\0")) {
    throw new Error(`[storage] invalid key: ${key}`);
  }
  const full = resolve(BASE_DIR, key);
  if (!full.startsWith(BASE_DIR + "/") && full !== BASE_DIR) {
    throw new Error(`[storage] key resolves outside BASE_DIR: ${key}`);
  }
  return full;
}

class LocalFsStorage implements Storage {
  async put(
    key: string | null,
    body: Buffer | Readable,
    _opts?: { contentType?: string },
  ): Promise<{ key: string }> {
    const k = key ?? `auto/${randomUUID()}`;
    const target = safeResolve(k);
    await mkdir(dirname(target), { recursive: true });

    if (Buffer.isBuffer(body)) {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(target, body);
    } else {
      await pipeline(body, createWriteStream(target));
    }
    return { key: k };
  }

  async get(key: string): Promise<{ body: Readable; contentType: string | null }> {
    const full = safeResolve(key);
    // Confirm file exists; throws ENOENT if missing.
    await stat(full);
    return { body: createReadStream(full), contentType: null };
  }

  async signedUrl(key: string, _ttlSeconds: number): Promise<string> {
    // v1: return the api image-serve path (Phase 4 implements the handler).
    safeResolve(key); // throws on invalid keys
    return `/api/images/${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<void> {
    const { unlink } = await import("node:fs/promises");
    try {
      await unlink(safeResolve(key));
    } catch (err: unknown) {
      // ENOENT = file already gone; silently swallow.
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    }
  }
}

/** Single process-wide storage instance. */
export const storage: Storage = new LocalFsStorage();
