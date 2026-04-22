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

async function fetchSession(cookie: string): Promise<NonNullable<SessionResponse["user"]> | null> {
  const base = process.env.API_INTERNAL_URL ?? "http://localhost:3001";
  try {
    const res = await fetch(`${base}/api/auth/get-session`, {
      method: "GET",
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as SessionResponse | null;
    return data?.user ?? null;
  } catch {
    return null;
  }
}

/**
 * Next 16 proxy (renamed from middleware.ts — D-08).
 *
 * UX authority only. Express requireRole remains the security boundary.
 */
export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname, search } = req.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const cookie = req.headers.get("cookie") ?? "";
  const user = await fetchSession(cookie);

  // Unauthenticated → redirect to appropriate login with ?next=
  if (!user) {
    const loginPath = pathname.startsWith("/portal") ? "/portal/login" : "/login";
    const nextParam = encodeURIComponent(`${pathname}${search}`);
    const url = req.nextUrl.clone();
    url.pathname = loginPath;
    url.search = `?next=${nextParam}`;
    return NextResponse.redirect(url, 307);
  }

  // Role gate (D-11)
  const isPortalPath = pathname.startsWith("/portal");
  if (isPortalPath && user.role !== "RESTAURANT_STAFF") {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }
  if (!isPortalPath && user.role === "RESTAURANT_STAFF") {
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
  matcher: [
    // Run on all paths except obvious Next internals + public folder assets.
    "/((?!_next/static|_next/image|favicon.ico|icons/|manifest.webmanifest|sw.js).*)",
  ],
};
