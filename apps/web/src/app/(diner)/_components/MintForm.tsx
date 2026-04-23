"use client";

/**
 * MintForm — client component for minting a souvenir at /scan/[restaurantId].
 *
 * Responsibilities:
 *  - Renders restaurant header (name, Michelin rating stars, city)
 *  - Renders DishPicker grid controlled by react-hook-form
 *  - Custom-photo-first dual path: file input (primary) + dish default (secondary)
 *  - Optional note textarea (max 280 chars)
 *  - Sticky bottom submit button
 *  - POST /api/souvenirs as multipart FormData (NOT api.post — browser must set boundary)
 *  - On 201: markVisitedDirty, stash lastBalance/newBalance, router.push /souvenirs/:id
 *  - Per-field backend validation errors via form.setError
 *
 * Canonical refs:
 *   - 04-03-PLAN.md task 3
 *   - 04-CONTEXT.md D-06 (single scrollable form), D-07 (custom-photo-first),
 *     D-08 (dual path from commit 1), D-09 (success routing)
 *   - CLAUDE.md PITFALL #1 (iOS PWA photo), PITFALL #4 (HEIC), PITFALL #7 (server-auth)
 *   - BACKEND-CONTRACT.md §Diner — Souvenirs (POST /api/souvenirs)
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star } from "lucide-react";
import { toast } from "sonner";
import {
  SouvenirMintInput,
  type SouvenirMintInputType,
  type SouvenirResponseType,
  type RestaurantResponseType,
  type RestaurantMenuResponseType,
  ErrorCode,
} from "@repo/shared-schemas";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { DishPicker } from "./DishPicker";
import { useMapStore } from "../_stores/useMapStore";

interface MintFormProps {
  restaurant: RestaurantResponseType;
  menu: RestaurantMenuResponseType;
}

/** Render filled star icons for a Michelin rating. */
function MichelinStars({ rating }: { rating: RestaurantResponseType["michelinRating"] }) {
  if (rating === "BIB") {
    return (
      <span
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-accent-gold)",
          fontWeight: "var(--font-weight-semibold)",
        }}
      >
        Bib Gourmand
      </span>
    );
  }

  const count = rating === "ONE" ? 1 : rating === "TWO" ? 2 : 3;
  return (
    <span style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          size={16}
          fill="var(--color-accent-gold)"
          color="var(--color-accent-gold)"
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export function MintForm({ restaurant, menu }: MintFormProps) {
  const router = useRouter();
  const form = useForm<SouvenirMintInputType>({
    resolver: zodResolver(SouvenirMintInput),
    defaultValues: { dishId: "", note: "" },
    mode: "onBlur",
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [useDefault, setUseDefault] = useState(false);
  const [selectedHasDefault, setSelectedHasDefault] = useState(false);

  const dishId = form.watch("dishId");
  const isSubmitting = form.formState.isSubmitting;
  const hasDishes = menu.dishes.length > 0;

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    if (f) {
      setPhoto(f);
      setPhotoPreviewUrl(URL.createObjectURL(f));
    } else {
      setPhoto(null);
      setPhotoPreviewUrl(null);
    }
    setUseDefault(false);
  }

  function handleUseDishDefault() {
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setUseDefault(true);
    setPhoto(null);
    setPhotoPreviewUrl(null);
  }

  async function onSubmit(values: SouvenirMintInputType) {
    const fd = new FormData();
    fd.append("dishId", values.dishId);
    if (values.note) fd.append("note", values.note);
    // Only append image if the user took/selected a custom photo.
    // When useDefault=true, the server uses Dish.defaultImageKey automatically.
    if (photo && !useDefault) fd.append("image", photo);

    try {
      const res = await fetch("/api/souvenirs", {
        method: "POST",
        credentials: "include",
        body: fd,
        // Do NOT set Content-Type — browser must set multipart/form-data; boundary=... automatically.
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({ error: "internal" }));
        throw new ApiError(
          res.status,
          payload as { error: string; message?: string; fields?: Record<string, string> },
        );
      }

      const souvenir = (await res.json()) as SouvenirResponseType;

      // Mark map dirty so next /map or MapPreview mount refetches visited pins.
      useMapStore.getState().markVisitedDirty();

      // Stash pre-mint balance so the reveal page can animate old → new.
      try {
        const pointsRes = await fetch("/api/me/points", { credentials: "include" });
        if (pointsRes.ok) {
          const body = (await pointsRes.json()) as { balance?: number };
          const newBalance = Number(body.balance ?? 0);
          const oldBalance = Math.max(0, newBalance - souvenir.pointsAwarded);
          sessionStorage.setItem("lastBalance", String(oldBalance));
          sessionStorage.setItem("newBalance", String(newBalance));
        }
      } catch {
        // Reveal page falls back to 0 if this stash fails — non-critical.
      }

      router.push(`/souvenirs/${souvenir.id}`);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.fields) {
          Object.entries(e.fields).forEach(([k, msg]) =>
            form.setError(k as keyof SouvenirMintInputType, { message: msg }),
          );
          return;
        }
        switch (e.code) {
          case ErrorCode.enum.payload_too_large:
            toast.error("Photo trop lourde (max 10 Mo).");
            break;
          case ErrorCode.enum.unsupported_media_type:
            toast.error("Format d'image non pris en charge.");
            break;
          case ErrorCode.enum.invalid_image:
            toast.error("Image illisible — réessayez.");
            break;
          case ErrorCode.enum.not_found:
            toast.error("Restaurant introuvable.");
            break;
          case ErrorCode.enum.forbidden:
            toast.error("Accès refusé.");
            break;
          default:
            toast.error(e.message || "Erreur inattendue.");
        }
      } else {
        toast.error("Réseau indisponible.");
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-lg)",
          paddingBottom: "80px", // space for sticky submit
        }}
      >
        {/* ── Restaurant header ───────────────────────────────────────── */}
        <div
          style={{
            background: "var(--color-surface)",
            borderRadius: "12px",
            padding: "var(--space-md)",
            boxShadow: "0 0 0 1px var(--color-border)",
          }}
        >
          <h1
            style={{
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-ink)",
              margin: 0,
              lineHeight: 1.2,
            }}
          >
            {restaurant.name}
          </h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-sm)",
              marginTop: "var(--space-xs)",
            }}
          >
            <MichelinStars rating={restaurant.michelinRating} />
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-ink-muted)",
              }}
            >
              {restaurant.city}
            </span>
          </div>
        </div>

        {/* ── Dish picker ─────────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="dishId"
          render={() => (
            <FormItem>
              <FormLabel
                style={{
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-ink)",
                }}
              >
                Quel plat avez-vous savouré ?
              </FormLabel>
              <FormControl>
                <DishPicker
                  dishes={menu.dishes}
                  value={dishId}
                  onChange={(id) => form.setValue("dishId", id, { shouldValidate: true })}
                  onDefaultImageAvailable={setSelectedHasDefault}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Photo area ──────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          <span
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-ink)",
            }}
          >
            Immortalisez votre plat
          </span>

          {/* Primary CTA — custom photo (D-07: custom-photo-first) */}
          <div>
            {/* Hidden file input: capture=environment for mobile camera + fallback for iOS PWA */}
            <input
              id="mint-photo-input"
              type="file"
              accept="image/jpeg,image/png"
              capture="environment"
              hidden
              onChange={handlePhotoChange}
            />
            <Button
              type="button"
              onClick={() => document.getElementById("mint-photo-input")?.click()}
              style={{ width: "100%" }}
            >
              {photo ? "Remplacer la photo" : "Prendre une photo"}
            </Button>
          </div>

          {/* Photo preview */}
          {photo && photoPreviewUrl && (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={photoPreviewUrl}
                alt="Aperçu de votre photo"
                style={{
                  width: "100%",
                  maxHeight: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  display: "block",
                }}
              />
              <p
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-ink-muted)",
                  marginTop: "var(--space-xs)",
                }}
              >
                {photo.name}
              </p>
            </div>
          )}

          {/* Indicator when dish default is selected */}
          {useDefault && (
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-success)",
                margin: 0,
              }}
            >
              Photo du plat sélectionnée.
            </p>
          )}

          {/* Secondary CTA — use dish default photo (D-08) */}
          <Button
            type="button"
            variant="outline"
            disabled={!selectedHasDefault}
            onClick={handleUseDishDefault}
            style={{ width: "100%" }}
          >
            Utiliser la photo du plat
          </Button>
          {!selectedHasDefault && (
            <p
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-ink-muted)",
                margin: 0,
              }}
            >
              Sélectionnez un plat avec une photo pour activer cette option.
            </p>
          )}
        </div>

        {/* ── Note textarea ───────────────────────────────────────────── */}
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel
                style={{
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-ink)",
                }}
              >
                Note personnelle{" "}
                <span
                  style={{
                    fontWeight: "var(--font-weight-regular)",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  (optionnelle)
                </span>
              </FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  maxLength={280}
                  rows={3}
                  placeholder="Vos impressions sur ce plat…"
                  style={{
                    width: "100%",
                    padding: "var(--space-sm) var(--space-md)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "var(--font-size-base)",
                    color: "var(--color-ink)",
                    background: "var(--color-surface)",
                    resize: "vertical",
                    fontFamily: "var(--font-sans)",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Sticky submit ───────────────────────────────────────────── */}
        <div
          style={{
            position: "sticky",
            bottom: 0,
            background: "var(--color-bg)",
            padding: "var(--space-md)",
            borderTop: "1px solid var(--color-border)",
            marginInline: "calc(-1 * var(--space-md))",
          }}
        >
          <Button
            type="submit"
            disabled={isSubmitting || !dishId || !hasDishes}
            style={{ width: "100%" }}
          >
            {isSubmitting ? "Création…" : "Créer le souvenir"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
