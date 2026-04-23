/**
 * /souvenirs/[id] — Souvenir reveal page (server component).
 *
 * Fetches the souvenir server-side with the auth cookie forwarded to the
 * internal Express API, then delegates all client-side animation to
 * SouvenirRevealClient. On 404 (souvenir not found or belongs to another
 * user) the server calls notFound() for a clean 404 response.
 *
 * Canonical refs:
 *   - 04-04-PLAN.md task 1
 *   - BACKEND-CONTRACT.md §Diner — Souvenirs (GET /api/souvenirs/:id)
 *   - 04-CONTEXT.md D-09, D-10 (reveal routing)
 */

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { SouvenirResponseType } from "@repo/shared-schemas";
import { SouvenirRevealClient } from "../../_components/SouvenirRevealClient";

const API_INTERNAL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

export default async function SouvenirPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const h = await headers();
  const res = await fetch(`${API_INTERNAL}/api/souvenirs/${id}`, {
    headers: { cookie: h.get("cookie") ?? "" },
    cache: "no-store",
  });
  if (!res.ok) return notFound();
  const souvenir = (await res.json()) as SouvenirResponseType;
  return <SouvenirRevealClient souvenir={souvenir} />;
}
