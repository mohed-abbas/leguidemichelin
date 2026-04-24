"use client";

/**
 * ReviewForm — 6-question post-scan questionnaire (Figma node 59:475).
 *
 *   Each question uses 3 ReviewStarNote buttons bound to a 1-3 rating. Submit
 *   posts to POST /api/reviews, then router.push to /review/merci with the
 *   bonus stashed in sessionStorage for the thank-you screen.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import type { ReviewResponseType } from "@repo/shared-schemas";
import { ReviewStarNote } from "./ReviewStarNote";

type QuestionKey =
  | "productsQuality"
  | "cookingAccuracy"
  | "worthTheVisit"
  | "experienceSmooth"
  | "valueForMoney"
  | "consistency";

interface Question {
  key: QuestionKey;
  label: string;
}

// Exact copy + order from Figma node 59:475
const QUESTIONS: Question[] = [
  { key: "productsQuality", label: "Les produits étaient-ils de qualité ?" },
  { key: "cookingAccuracy", label: "Les cuissons étaient-elles justes ?" },
  { key: "worthTheVisit", label: "L’expérience valait-elle le détour ?" },
  { key: "experienceSmooth", label: "L’expérience était-elle fluide ?" },
  { key: "valueForMoney", label: "Le rapport qualité-prix te semble-t-il correct ?" },
  { key: "consistency", label: "L’expérience était-elle cohérente du début à la fin ?" },
];

interface ReviewFormProps {
  restaurantId: string;
  souvenirId?: string;
}

type Ratings = Record<QuestionKey, number | null>;

const initialRatings: Ratings = {
  productsQuality: null,
  cookingAccuracy: null,
  worthTheVisit: null,
  experienceSmooth: null,
  valueForMoney: null,
  consistency: null,
};

export function ReviewForm({ restaurantId, souvenirId }: ReviewFormProps) {
  const router = useRouter();
  const [ratings, setRatings] = useState<Ratings>(initialRatings);
  const [submitting, setSubmitting] = useState(false);

  const allAnswered = QUESTIONS.every((q) => ratings[q.key] !== null);

  function setRating(key: QuestionKey, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { restaurantId };
      if (souvenirId) body.souvenirId = souvenirId;
      for (const q of QUESTIONS) body[q.key] = ratings[q.key];

      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const payload = await res
          .json()
          .catch(() => ({ error: "internal", message: "Erreur serveur" }));
        throw new ApiError(res.status, payload);
      }

      const review = (await res.json()) as ReviewResponseType;

      try {
        sessionStorage.setItem("reviewBonus", String(review.bonusPointsAwarded));
        sessionStorage.setItem("reviewNewBalance", String(review.newBalance));
      } catch {
        // sessionStorage unavailable — thank-you page falls back to defaults
      }

      router.push("/review/merci");
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.code === "already_redeemed") {
          toast.error("Tu as déjà donné ton avis pour ce souvenir.");
        } else {
          toast.error(e.message || "Erreur lors de l’envoi de l’avis.");
        }
      } else {
        toast.error("Réseau indisponible.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100dvh",
        background: "var(--color-bg)",
        paddingBottom: "120px",
      }}
    >
      {/* Back button (Figma Group 12) */}
      <Link
        href="/"
        aria-label="Retour"
        style={{
          position: "absolute",
          left: 16,
          top: 49,
          width: 29,
          height: 29,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          background: "var(--color-bg)",
          color: "var(--color-ink)",
        }}
      >
        <svg width="29" height="29" viewBox="0 0 29 29" fill="none" aria-hidden="true">
          <circle cx="14.5" cy="14.5" r="14.5" fill="currentColor" opacity="0" />
          <path
            d="M7.43431 13.4343C7.12189 13.7467 7.12189 14.2533 7.43431 14.5657L12.5255 19.6569C12.8379 19.9693 13.3444 19.9693 13.6569 19.6569C13.9693 19.3444 13.9693 18.8379 13.6569 18.5255L9.13137 14L13.6569 9.47452C13.9693 9.1621 13.9693 8.65556 13.6569 8.34315C13.3444 8.03073 12.8379 8.03073 12.5255 8.34315L7.43431 13.4343ZM22 14L22 13.2L8 13.2L8 14L8 14.8L22 14.8L22 14Z"
            fill="currentColor"
          />
        </svg>
      </Link>

      {/* Heading */}
      <h1
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: 100,
          fontFamily: "Roboto, sans-serif",
          fontWeight: 400,
          fontSize: 34,
          lineHeight: "normal",
          color: "var(--color-ink)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Qu’as-tu pensé
        <br />
        de ton expérience ?
      </h1>

      {/* Questions — stacked, matching Figma vertical rhythm (~117px per question) */}
      <div
        style={{
          position: "relative",
          paddingTop: 199,
          display: "flex",
          flexDirection: "column",
          gap: 80,
        }}
      >
        {QUESTIONS.map((q) => (
          <div key={q.key}>
            <p
              style={{
                margin: 0,
                padding: "0 16px",
                fontFamily: "Roboto, sans-serif",
                fontWeight: 400,
                fontSize: 17,
                color: "var(--color-ink)",
                textAlign: "center",
                lineHeight: "normal",
              }}
            >
              {q.label.split("\n").map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
            <div
              style={{
                marginTop: 19,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 26,
              }}
              role="radiogroup"
              aria-label={q.label}
            >
              {[1, 2, 3].map((n) => (
                <ReviewStarNote
                  key={n}
                  active={(ratings[q.key] ?? 0) >= n}
                  onClick={() => setRating(q.key, n)}
                  ariaLabel={`${q.label} — ${n} sur 3`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Submit — pinned bottom, matches primary CTA shape from screen 2 */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "16px 48px calc(16px + env(safe-area-inset-bottom))",
          background: "linear-gradient(to bottom, rgba(245,242,238,0) 0%, rgba(245,242,238,1) 40%)",
          pointerEvents: "none",
        }}
      >
        <button
          type="button"
          disabled={!allAnswered || submitting}
          onClick={handleSubmit}
          style={{
            pointerEvents: "auto",
            width: "100%",
            maxWidth: 296,
            margin: "0 auto",
            display: "block",
            height: 44,
            borderRadius: 35,
            border: "none",
            background: "var(--color-primary)",
            opacity: allAnswered && !submitting ? 1 : 0.53,
            color: "white",
            fontFamily: "Roboto, sans-serif",
            fontSize: 14,
            lineHeight: "16.2px",
            boxShadow: "0px 4px 16px 0px rgba(0,0,0,0.25)",
            cursor: allAnswered && !submitting ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? "Envoi…" : "Envoyer mon avis"}
        </button>
      </div>
    </div>
  );
}
