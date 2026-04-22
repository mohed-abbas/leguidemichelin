import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { requireAuth, type AuthedRequest } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error.js";
import { imagesRouter } from "./routes/images.js";
import { restaurantsRouter } from "./routes/restaurants.js";
import { souvenirsRouter } from "./routes/souvenirs.js";
import { meRouter } from "./routes/me.js";

const app = express();
const PORT = Number(process.env.API_PORT ?? 3001);

// ─── Security middleware (first, before any route handler) ─────────
app.use(helmet({ contentSecurityPolicy: false })); // Next.js handles CSP at its layer
app.use(
  cors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true, // Better Auth session cookies require credentialed CORS
  }),
);

// ─── GET /api/auth/me — Phase 2 D-12 ────────────────────────────────
// MUST be registered BEFORE the Better Auth splat below.
// The splat `app.all("/api/auth/*splat")` would otherwise intercept this
// path and return a Better Auth 404 (BA has no /me handler).
// This route only reads the session cookie (no body), so it is safe to
// mount before express.json(); the body-stream threat only affects routes
// that must parse request bodies (i.e. the Better Auth sign-in/sign-up routes).
// Used by proxy.ts (via same-origin rewrite) + client auth-client.
// Response shape: { id, email, role, name, restaurantId }.
app.get("/api/auth/me", requireAuth, (req: Request, res: Response) => {
  const { id, email, role, name, restaurantId } = (req as AuthedRequest).user;
  res.json({ id, email, role, name, restaurantId });
});

// ─── Better Auth handler (BEFORE express.json — THREAT T-01-AUTH-BYPASS) ───
//
//   Better Auth reads the raw request body stream. If express.json() runs
//   FIRST, the body is already consumed → Better Auth cannot parse it.
//   DO NOT REORDER THIS vs express.json below — see
//   .planning/phases/01-foundation/01-06-api-better-auth-PLAN.md §threat_model.
//
app.all("/api/auth/*splat", toNodeHandler(auth));

// ─── Body parser (for every OTHER route — after Better Auth mount) ──
app.use(express.json({ limit: "1mb" }));

// ─── Health check (used by docker compose healthcheck + smoke tests) ───
app.get("/healthz", (_req: Request, res: Response) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// ─── Domain routers ─────────────────────────────────────────────────
// Order matters only within auth-protected surfaces. /api/images is public.
app.use("/api/images", imagesRouter);
app.use("/api/restaurants", restaurantsRouter);
app.use("/api/souvenirs", souvenirsRouter);
app.use("/api/me", meRouter);

// Future routers (Phase 3 plans 07–11) mount below, before the 404.
// app.use("/api/rewards", rewardsRouter);
// app.use("/api/redeem", redeemRouter);
// app.use("/api/portal", portalRouter);
// app.use("/api/admin", adminRouter);

// ─── 404 (catch-all for unrouted paths) ─────────────────────────────
app.use((_req: Request, res: Response) => res.status(404).json({ error: "not_found" }));

// ─── Error handler (MUST be last — Express 4-arg signature) ────────
app.use(errorHandler);

// ─── Listen ─────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`[api] listening on :${PORT}`);
});

// ─── Graceful shutdown ──────────────────────────────────────────────
for (const sig of ["SIGTERM", "SIGINT"] as const) {
  process.on(sig, () => {
    console.log(`[api] ${sig} received; shutting down`);
    server.close(() => process.exit(0));
  });
}
