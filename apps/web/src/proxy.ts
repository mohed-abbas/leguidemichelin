import { NextResponse, type NextRequest } from "next/server";

/**
 * Public allowlist (D-09). Paths here bypass the auth gate.
 * Anything NOT listed here is protected (deny-by-default).
 *
 * NOTE: the block-scoped awk grep in the verify step relies on the literal
 * `PUBLIC_EXACT = new Set<string>([` + `])` shape. If you refactor to an
 * Array or rename the const, update the awk ranges in the verify block too.
 */
const PUBLIC_EXACT = new Set<string>([
  "/login",
  "/signup",
  "/portal/login",
  "/manifest.webmanifest",
  "/sw.js",
  "/favicon.ico",
  "/robots.txt",
]);

const PUBLIC_PREFIXES = [
  "/api/auth/", // Better Auth routes (session + sign-in + sign-up + sign-out)
  "/_next/", // Next build assets + HMR
  "/icons/", // PWA icons
  "/serwist/", // Serwist assets (sw precache entries)
];

/**
 * File-extension assets at any depth (e.g. /foo/bar.png) are always public.
 * This catches hashed static assets Next emits outside /_next/.
 */
const ASSET_EXT_RE = /\.(png|jpe?g|webp|gif|svg|ico|woff2?|ttf|otf|css|js|map|json|txt|xml|wasm)$/i;

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return true;
  if (ASSET_EXT_RE.test(pathname)) return true;
  return false;
}

interface SessionResponse {
  user?: { id: string; email: string; role: string } | null;
  session?: { id: string; expiresAt: string } | null;
}

/**
 * Result of the server-side session probe.
 *   - `user`      : the session subject, or null if unauthenticated/disabled
 *   - `disabled`  : true iff the server explicitly returned 401 account_disabled
 *                   (so the /login redirect can surface a toast hint)
 */
type SessionProbe = { user: NonNullable<SessionResponse["user"]> | null; disabled: boolean };

async function fetchSession(cookie: string): Promise<SessionProbe> {
  const base = process.env.API_INTERNAL_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${base}/api/auth/get-session`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });
    if (res.status === 401) {
      // Distinguish account_disabled vs unauthenticated by response body shape.
      // Better Auth's get-session returns 200 with user:null for unauth users,
      // but our custom endpoints return 401 { error: 'account_disabled' } from
      // requireAuth. The get-session endpoint itself is Better-Auth-owned, so
      // a 401 from it is ONLY cookie-expiry-style; disabled users are detected
      // on the first protected request. For proxy.ts, treat any 401 as unauth
      // without the reason hint. The reason-hint flow is triggered when a
      // protected route 401s with account_disabled later in the lifecycle.
      return { user: null, disabled: false };
    }
    if (!res.ok) return { user: null, disabled: false };
    const data = (await res.json()) as SessionResponse | null;
    return { user: data?.user ?? null, disabled: false };
  } catch {
    return { user: null, disabled: false };
  }
}

/**
 * Next 16 proxy (renamed from middleware.ts — D-08).
 *
 * UX authority only. Express requireRole remains the security boundary.
 *
 * Role-gate order (D-02 Phase 3):
 *   1. Public allowlist bypass
 *   2. Unauthenticated → /login or /portal/login redirect
 *   3. ADMIN hitting anything not under /admin/* → /admin/dashboard (D-02 silo)
 *   4. RESTAURANT_STAFF hitting /portal/* → passthrough; hitting diner → /portal/menu
 *   5. DINER hitting /portal/* → /
 *   6. Otherwise passthrough
 */
export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname, search } = req.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const cookie = req.headers.get("cookie") ?? "";
  const probe = await fetchSession(cookie);
  const user = probe.user;

  // Unauthenticated → redirect to appropriate login with ?next=
  if (!user) {
    const loginPath = pathname.startsWith("/portal") ? "/portal/login" : "/login";
    const nextParam = encodeURIComponent(`${pathname}${search}`);
    const url = req.nextUrl.clone();
    url.pathname = loginPath;
    url.search = probe.disabled
      ? `?next=${nextParam}&reason=account_disabled`
      : `?next=${nextParam}`;
    return NextResponse.redirect(url, 307);
  }

  // ADMIN silo (D-02 Phase 3) — fires BEFORE portal/staff branches.
  // Admin-scope paths cover BOTH UI (`/admin/*`) AND API (`/api/admin/*`) — otherwise
  // authenticated admin client-fetches to `/api/admin/*` get 307-redirected to
  // `/admin/dashboard` and return HTML instead of JSON.
  const isAdminPath =
    pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  if (user.role === "ADMIN" && !isAdminPath) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }
  // Non-ADMIN on admin-scope → send to their home
  if (isAdminPath && user.role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = user.role === "RESTAURANT_STAFF" ? "/portal/menu" : "/";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  // Role gate (D-11, Phase 2 preserved) — portal scope covers UI + API symmetrically.
  const isPortalPath =
    pathname.startsWith("/portal") || pathname.startsWith("/api/portal");
  if (isPortalPath && user.role !== "RESTAURANT_STAFF") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }
  if (!isPortalPath && !isAdminPath && user.role === "RESTAURANT_STAFF") {
    // Diner-only protected route, staff user → send to portal home
    const url = req.nextUrl.clone();
    url.pathname = "/portal/menu";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

/**
 * Matcher — run proxy on everything EXCEPT what's clearly static. The function
 * itself re-checks via isPublic(), but trimming matcher cuts overhead.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js).*)"],
};
