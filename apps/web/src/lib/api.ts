/**
 * Thin typed fetch wrapper (CONTEXT.md D-17).
 *
 * - `credentials: 'include'` so Better Auth cookies flow on every request.
 * - `baseURL = '/api'` — same-origin via Next.js rewrite to Express.
 * - Throws ApiError on non-2xx; caller decides how to surface (toast, form.setError, ...).
 * - No React Query — Phase 4 revisits caching strategy.
 *
 * Path convention: callers pass paths WITHOUT the leading /api.
 *   api.get<MeResponse>("/auth/me")   ✓
 *   api.get<MeResponse>("/api/auth/me") ✗
 */

export interface ApiErrorPayload {
  /** Flat string-code error — matches Express index.ts 404 + middleware shape. */
  error: string;
  /** Optional human-readable message returned alongside the error code. */
  message?: string;
  /** Optional per-field errors keyed by Zod field-path (joined by `.`), from the backend `{ fields }` body per BACKEND-CONTRACT.md Error Contract. */
  fields?: Record<string, string>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(status: number, payload: ApiErrorPayload) {
    super(`${status} ${payload.error}`);
    this.name = "ApiError";
    this.status = status;
    this.code = payload.error;
    this.fields = payload.fields;
  }
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const init: RequestInit = {
    method,
    credentials: "include",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
  const res = await fetch(`/api${path}`, init);
  // 204 No Content → return undefined cast (caller must type T = void)
  if (res.status === 204) return undefined as T;
  const payload = await res.json().catch(() => ({ error: "parse_failed" }));
  if (!res.ok) {
    throw new ApiError(res.status, payload as ApiErrorPayload);
  }
  return payload as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
  patch: <T>(path: string, body?: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
};
