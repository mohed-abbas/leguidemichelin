"use client";

/**
 * MintForm — client component for minting a souvenir at /scan/[restaurantId].
 *
 * Visual language: polaroid / "carnet de voyage" — same family as
 * ExperienceCard + SouvenirDetailView (white paper card, masking tape,
 * handwriting font, fork-knife emblem, gold Michelin stars).
 *
 * Behaviour preserved verbatim from the prior version:
 *  - Custom-photo-first dual path (camera + use dish default)
 *  - Optional note (max 280)
 *  - POST /api/souvenirs multipart (browser sets boundary)
 *  - router.push(`/souvenirs/:id`) on 201
 *  - sessionStorage lastBalance / newBalance stash
 *  - Per-field backend validation errors + toast for coded errors
 */

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, RotateCcw, Star } from "lucide-react";
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
    <span
      style={{ display: "inline-flex", gap: 2, alignItems: "center" }}
      aria-label={`${count} étoile${count > 1 ? "s" : ""} Michelin`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill="var(--color-accent-gold)"
          color="var(--color-accent-gold)"
          aria-hidden
        />
      ))}
    </span>
  );
}

function MintHeader() {
  const router = useRouter();
  return (
    <header style={{ position: "relative", height: 78 }}>
      <button
        type="button"
        aria-label="Retour"
        onClick={() => router.back()}
        style={{
          position: "absolute",
          top: 49,
          left: 16,
          width: 29,
          height: 29,
          padding: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image src="/icons/map/arrow-back.svg" alt="" width={29} height={29} priority />
      </button>
      <h1
        style={{
          position: "absolute",
          top: 51,
          left: "50%",
          transform: "translateX(-50%)",
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-ink)",
          lineHeight: "26px",
          whiteSpace: "nowrap",
        }}
      >
        Nouveau souvenir
      </h1>
    </header>
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
  const [selectedDefaultKey, setSelectedDefaultKey] = useState<string | null>(null);

  const dishId = form.watch("dishId");
  const note = form.watch("note") ?? "";
  const isSubmitting = form.formState.isSubmitting;
  const hasDishes = menu.dishes.length > 0;
  const selectedDish = menu.dishes.find((d) => d.id === dishId);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  // Keep the dish's default image key in sync with the current selection so the
  // polaroid preview can show it when the user chooses "Utiliser la photo du plat".
  useEffect(() => {
    const d = menu.dishes.find((x) => x.id === dishId);
    setSelectedDefaultKey(d?.defaultImageKey ?? null);
  }, [dishId, menu.dishes]);

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
    if (photo && !useDefault) fd.append("image", photo);

    try {
      const res = await fetch("/api/souvenirs", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) {
        const payload = await res
          .json()
          .catch(() => ({ error: "internal_error", message: "Erreur serveur" }));
        throw new ApiError(
          res.status,
          payload as { error: string; message?: string; fields?: Record<string, string> },
        );
      }

      const souvenir = (await res.json()) as SouvenirResponseType;

      useMapStore.getState().markVisitedDirty();

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
        // Non-critical — reveal page falls back to 0.
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

  const previewSrc = photoPreviewUrl
    ? photoPreviewUrl
    : useDefault && selectedDefaultKey
      ? `/api/images/${selectedDefaultKey}`
      : null;

  const hasPreview = Boolean(previewSrc);
  const photoButtonLabel = photo
    ? "Reprendre la photo"
    : useDefault
      ? "Prendre ma propre photo"
      : "Prendre une photo";

  return (
    <div style={{ display: "flex", flexDirection: "column", paddingBottom: 32 }}>
      <MintHeader />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
            paddingInline: 15,
            paddingTop: 16,
            paddingBottom: 120, // space for sticky submit
          }}
        >
          {/* ── Restaurant hero (same typographic rhythm as ExperienceCard) ── */}
          <section style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "var(--font-sans)",
                  fontSize: 24,
                  fontWeight: "var(--font-weight-regular)",
                  lineHeight: "normal",
                  color: "var(--color-ink)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {restaurant.name}
              </h2>
              <Image
                src="/images/chasseur/icon-fork-knife-emblem.svg"
                alt=""
                width={14}
                height={22}
                style={{ flexShrink: 0 }}
              />
            </div>
            <div
              style={{
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--font-sans)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-ink)",
              }}
            >
              <MichelinStars rating={restaurant.michelinRating} />
              <span aria-hidden>·</span>
              <span style={{ color: "var(--color-ink-muted)" }}>{restaurant.city}</span>
            </div>
            <p
              style={{
                margin: 0,
                marginTop: 10,
                fontFamily: "var(--font-handwriting), cursive",
                fontSize: 20,
                lineHeight: "22px",
                color: "var(--color-ink)",
              }}
            >
              Un nouveau souvenir à épingler&nbsp;…
            </p>
          </section>

          {/* ── Dish picker ─────────────────────────────────────────────── */}
          <FormField
            control={form.control}
            name="dishId"
            render={() => (
              <FormItem>
                <FormLabel
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--color-ink-muted)",
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

          {/* ── Polaroid photo frame ────────────────────────────────────── */}
          <section style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-bold)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--color-ink-muted)",
              }}
            >
              Immortalisez votre plat
            </span>

            {/* Hidden file input */}
            <input
              id="mint-photo-input"
              type="file"
              accept="image/jpeg,image/png"
              capture="environment"
              hidden
              onChange={handlePhotoChange}
            />

            {/* Polaroid frame — mirrors ExperienceCard proportions (photo 219 + caption strip) */}
            <button
              type="button"
              onClick={() => document.getElementById("mint-photo-input")?.click()}
              aria-label={hasPreview ? "Remplacer la photo" : "Prendre une photo"}
              style={{
                all: "unset",
                position: "relative",
                display: "block",
                width: "100%",
                height: 300,
                background: "var(--color-surface)",
                borderRadius: 2,
                boxShadow: "var(--shadow-card)",
                cursor: "pointer",
                marginTop: 6,
              }}
            >
              {/* Masking tape */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translate(-50%, -11px)",
                  width: 171,
                  height: 33,
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              >
                <img
                  src="/images/chasseur/polaroid-tape.png"
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              {/* Photo / placeholder well */}
              <div
                style={{
                  position: "absolute",
                  top: 13,
                  left: 16,
                  right: 15,
                  height: 219,
                  overflow: "hidden",
                  borderRadius: 2,
                  background: "var(--color-surface-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {hasPreview ? (
                  <img
                    src={previewSrc!}
                    alt={selectedDish?.name ?? "Aperçu"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 10,
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    <Camera size={36} strokeWidth={1.4} aria-hidden />
                    <span
                      style={{
                        fontFamily: "var(--font-handwriting), cursive",
                        fontSize: 20,
                        lineHeight: "22px",
                        color: "var(--color-ink)",
                      }}
                    >
                      épinglez votre photo ici
                    </span>
                  </div>
                )}
              </div>

              {/* Handwritten caption strip — mirrors ExperienceCard */}
              <div
                style={{
                  position: "absolute",
                  top: 238,
                  left: 25,
                  right: 18,
                  maxHeight: 44,
                  overflow: "hidden",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-handwriting), cursive",
                    fontSize: 20,
                    fontWeight: 400,
                    lineHeight: "22px",
                    color: "var(--color-ink)",
                    whiteSpace: "pre-wrap",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {note.trim() || selectedDish?.name || "choisissez un plat …"}
                </p>
              </div>

              {/* Bottom-right emblem anchor (mirrors flower-stamp anchor) */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  right: 14,
                  bottom: 14,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Image src="/images/chasseur/icon-flower-stamp.svg" alt="" width={18} height={20} />
              </div>
            </button>

            {/* Photo controls row */}
            <div style={{ display: "flex", gap: "var(--space-sm)" }}>
              <Button
                type="button"
                onClick={() => document.getElementById("mint-photo-input")?.click()}
                style={{ flex: 1 }}
              >
                <Camera size={14} aria-hidden />
                {photoButtonLabel}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!selectedHasDefault}
                onClick={handleUseDishDefault}
                style={{ flex: 1 }}
              >
                <RotateCcw size={14} aria-hidden />
                Photo du plat
              </Button>
            </div>
            {!selectedHasDefault && (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-ink-muted)",
                  margin: 0,
                }}
              >
                Sélectionnez un plat avec une photo pour activer cette option.
              </p>
            )}
            {photo && (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-ink-muted)",
                  margin: 0,
                }}
              >
                {photo.name}
              </p>
            )}
            {useDefault && (
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--font-size-sm)",
                  color: "var(--color-success)",
                  margin: 0,
                }}
              >
                Photo du plat sélectionnée.
              </p>
            )}
          </section>

          {/* ── Note — handwriting on lined paper ───────────────────────── */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  Votre note personnelle
                </FormLabel>
                <FormControl>
                  <div
                    style={{
                      position: "relative",
                      background: "var(--color-surface)",
                      borderRadius: 2,
                      boxShadow: "var(--shadow-card)",
                      padding: "18px 20px 20px",
                      // Faint horizontal rules drawn with a repeating background —
                      // evokes carnet de voyage without raw hex (uses border token).
                      backgroundImage:
                        "repeating-linear-gradient(to bottom, transparent 0, transparent 27px, var(--color-border) 27px, var(--color-border) 28px)",
                      backgroundPosition: "0 14px",
                    }}
                  >
                    <textarea
                      {...field}
                      maxLength={280}
                      rows={4}
                      placeholder="Ce qui vous a marqué …"
                      style={{
                        width: "100%",
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        resize: "none",
                        fontFamily: "var(--font-handwriting), cursive",
                        fontSize: 20,
                        lineHeight: "28px",
                        color: "var(--color-ink)",
                        padding: 0,
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        right: 14,
                        bottom: 10,
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--font-size-xs)",
                        color: "var(--color-ink-muted)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {note.length}/280
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {/* ── Sticky submit — overlays the form, driven by the same submit handler ── */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: "calc(85px + env(safe-area-inset-bottom))",
          zIndex: "var(--z-sticky)",
          display: "flex",
          justifyContent: "center",
          paddingInline: 15,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 768 - 30,
            pointerEvents: "auto",
          }}
        >
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting || !dishId || !hasDishes}
            style={{
              width: "100%",
              height: 52,
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--font-weight-semibold)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {isSubmitting ? "Création…" : "Créer le souvenir"}
          </Button>
        </div>
      </div>
    </div>
  );
}
