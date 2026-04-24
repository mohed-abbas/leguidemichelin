/**
 * /review/[restaurantId] — Post-scan review questionnaire (Figma 59:475).
 *
 * Optional ?souvenirId= links the review to the just-minted souvenir so the
 * server can enforce one-review-per-souvenir.
 */

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ReviewForm } from "../../_components/ReviewForm";

const API_INTERNAL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantId: string }>;
  searchParams: Promise<{ souvenirId?: string }>;
}) {
  const { restaurantId } = await params;
  const { souvenirId } = await searchParams;

  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${API_INTERNAL}/api/restaurants/${restaurantId}`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!res.ok) return notFound();

  return <ReviewForm restaurantId={restaurantId} souvenirId={souvenirId} />;
}
