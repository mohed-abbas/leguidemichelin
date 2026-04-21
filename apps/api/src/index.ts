import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";

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

// ─── Better Auth handler (BEFORE express.json — THREAT T-01-AUTH-BYPASS) ───
//
//   Better Auth reads the raw request body stream. If express.json() runs
//   FIRST, the body is already consumed → Better Auth cannot parse it.
//   DO NOT REORDER THIS — see .planning/phases/01-foundation/01-06-api-better-auth-PLAN.md §threat_model.
//
app.all("/api/auth/*splat", toNodeHandler(auth));

// ─── Body parser (for every OTHER route — after Better Auth mount) ──
app.use(express.json({ limit: "1mb" }));

// ─── Health check (used by docker compose healthcheck + smoke tests) ───
app.get("/healthz", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString() });
});

// ─── 404 (catch-all for unrouted paths) ─────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "not_found" }));

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
