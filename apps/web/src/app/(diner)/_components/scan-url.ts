/**
 * scan-url — shared helpers for the /scan entry tiers (camera, upload, paste).
 *
 * The QR payload is a plain URL `https://<host>/scan/:restaurantId` (PROJECT.md
 * — signed HMAC tokens are a v1.x idea, not v1). All three tiers converge on
 * the same router.push(`/scan/${id}`) once the id is extracted.
 *
 * - `extractRestaurantId` accepts either the full URL form or the relative
 *   path form `/scan/:id`, matching the id loosely on the URL segment. The id
 *   shape itself (`[a-zA-Z0-9_-]{8,}`) is deliberately lenient: Prisma's cuid
 *   default is 25 chars but a ≥8 minimum rejects accidental `/scan/a` typos.
 *   Backend still authoritatively validates the id on mint, so a
 *   false-positive here lands on a 404 page — not a security risk.
 * - `isLikelyScanUrl` is a cheap pre-check used by QrPasteUrl for
 *   client-side feedback before toast.error — keeps validation aligned
 *   with `extractRestaurantId` (same regex).
 */

const SCAN_URL_PATTERN = /\/scan\/([a-zA-Z0-9_-]{8,})/;

/**
 * Extract a restaurant id from a raw string that may be:
 *  - a full URL: `https://guide.example/scan/cldxyz12345`
 *  - a relative path: `/scan/cldxyz12345`
 *  - a pasted QR payload containing either of the above
 * Returns `null` when no `/scan/:id` segment with id ≥8 chars is present.
 */
export function extractRestaurantId(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const match = trimmed.match(SCAN_URL_PATTERN);
  // match[1] is guaranteed non-undefined by the capture group when match is
  // truthy, but `noUncheckedIndexedAccess` widens it — narrow explicitly.
  return match?.[1] ?? null;
}

/**
 * True when `raw` contains a `/scan/:id` segment. Used for fast-path feedback
 * in the paste-URL disclosure — do NOT rely on this for routing decisions;
 * call `extractRestaurantId` and check for null instead.
 */
export function isLikelyScanUrl(raw: string): boolean {
  return extractRestaurantId(raw) !== null;
}
