import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { SouvenirResponseType } from "@repo/shared-schemas";
import { SouvenirDetailView } from "../../_components/SouvenirDetailView";

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
  return <SouvenirDetailView souvenir={souvenir} />;
}
