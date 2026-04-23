/**
 * Server-side twin of `api.ts` for React Server Components.
 *
 * Why this exists: `api.ts` calls `fetch('/api' + path)` — a relative URL that
 * only resolves in the browser (where Next.js rewrites /api/* → Express). In a
 * Server Component, Node's fetch throws `TypeError: Failed to parse URL`.
 *
 * `serverApi.get` uses the absolute `API_INTERNAL_URL` and forwards the request
 * cookie explicitly so Better Auth sees the session. Throws the same `ApiError`
 * as the client helper, so 404-check branches (`err instanceof ApiError && err.status === 404`)
 * keep working unchanged.
 */

import { headers } from "next/headers";
import { ApiError, type ApiErrorPayload } from "./api";

const API_INTERNAL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

export async function serverApiGet<T>(path: string): Promise<T> {
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await fetch(`${API_INTERNAL}/api${path}`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (res.status === 204) return undefined as T;
  const payload = await res.json().catch(() => ({ error: "parse_failed" }));
  if (!res.ok) {
    throw new ApiError(res.status, payload as ApiErrorPayload);
  }
  return payload as T;
}

export const serverApi = {
  get: serverApiGet,
};
