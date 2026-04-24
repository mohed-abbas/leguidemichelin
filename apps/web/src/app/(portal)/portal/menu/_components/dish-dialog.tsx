"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, api } from "@/lib/api";
import { surfaceApiError } from "@/app/(diner)/_components/error-toast";
import type { DishResponseType } from "@repo/shared-schemas";

const PRICE_REGEX = /^\d+([.,]\d{1,2})?$/;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const DishFormSchema = z.object({
  name: z.string().min(1, "Nom requis").max(160, "Nom trop long (max. 160 caractères)"),
  description: z.string().max(400, "Description trop longue (max. 400 caractères)").optional(),
  priceEuros: z.string().min(1, "Prix requis").regex(PRICE_REGEX, "Prix invalide (ex. 24,50)"),
});
type DishFormValues = z.infer<typeof DishFormSchema>;

type PhotoState =
  | { kind: "none" }
  | { kind: "existing"; imageKey: string }
  | { kind: "new"; file: File; previewUrl: string }
  | { kind: "remove" };

interface DishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (dish: DishResponseType) => void;
  dish?: DishResponseType;
}

export function DishDialog({ open, onOpenChange, onSaved, dish }: DishDialogProps) {
  const isEdit = !!dish;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<PhotoState>({ kind: "none" });
  const [photoError, setPhotoError] = useState<string | null>(null);

  const form = useForm<DishFormValues>({
    // @hookform/resolvers ZodType generic is incompatible with the Zod v4 inferred
    // shape; runtime behavior is correct.
    resolver: zodResolver(DishFormSchema as unknown as Parameters<typeof zodResolver>[0]),
    defaultValues: { name: "", description: "", priceEuros: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: dish?.name ?? "",
      description: dish?.description ?? "",
      priceEuros: dish ? (dish.priceCents / 100).toFixed(2).replace(".", ",") : "",
    });
    setPhoto(
      dish?.defaultImageKey
        ? { kind: "existing", imageKey: dish.defaultImageKey }
        : { kind: "none" },
    );
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, dish, form]);

  // Revoke object URLs on unmount / state transition to avoid leaks.
  useEffect(() => {
    return () => {
      if (photo.kind === "new") URL.revokeObjectURL(photo.previewUrl);
    };
  }, [photo]);

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setPhotoError("Format non supporté. Utilisez JPEG, PNG ou WebP.");
      event.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setPhotoError("Photo trop lourde (max. 10 Mo).");
      event.target.value = "";
      return;
    }
    setPhotoError(null);
    // Revoke previous object URL if any.
    if (photo.kind === "new") URL.revokeObjectURL(photo.previewUrl);
    setPhoto({ kind: "new", file, previewUrl: URL.createObjectURL(file) });
  }

  function handleRemovePhoto() {
    setPhotoError(null);
    if (photo.kind === "new") {
      URL.revokeObjectURL(photo.previewUrl);
      setPhoto(
        dish?.defaultImageKey
          ? { kind: "existing", imageKey: dish.defaultImageKey }
          : { kind: "none" },
      );
    } else if (photo.kind === "existing") {
      setPhoto({ kind: "remove" });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function previewSrc(): string | null {
    if (photo.kind === "new") return photo.previewUrl;
    if (photo.kind === "existing") return `/api/images/${photo.imageKey}`;
    return null;
  }

  async function onSubmit(values: DishFormValues) {
    const priceCents = Math.round(parseFloat(values.priceEuros.replace(",", ".")) * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      form.setError("priceEuros", { message: "Prix invalide" });
      return;
    }

    try {
      let saved: DishResponseType;

      if (isEdit && dish) {
        // 1) PATCH the text fields (plus optional defaultImageKey: null for removal).
        const body: Record<string, unknown> = {
          name: values.name,
          description: values.description || null,
          priceCents,
        };
        if (photo.kind === "remove") body.defaultImageKey = null;
        saved = await api.patch<DishResponseType>(`/portal/dishes/${dish.id}`, body);

        // 2) If a new photo was picked, upload it via the dedicated image endpoint.
        if (photo.kind === "new") {
          const fd = new FormData();
          fd.append("defaultImage", photo.file);
          const res = await fetch(`/api/portal/dishes/${dish.id}/image`, {
            method: "POST",
            credentials: "include",
            body: fd,
          });
          if (!res.ok) {
            const payload = await res.json().catch(() => ({ error: "parse_failed" }));
            throw new ApiError(
              res.status,
              payload as { error: string; fields?: Record<string, string> },
            );
          }
          saved = (await res.json()) as DishResponseType;
        }
      } else if (photo.kind === "new") {
        // Multipart create — POST /api/portal/dishes with `defaultImage` file.
        const fd = new FormData();
        fd.append("name", values.name);
        if (values.description) fd.append("description", values.description);
        fd.append("priceCents", String(priceCents));
        fd.append("defaultImage", photo.file);
        // Do NOT set Content-Type — browser adds multipart boundary.
        const res = await fetch("/api/portal/dishes", {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        if (!res.ok) {
          const payload = await res.json().catch(() => ({ error: "parse_failed" }));
          throw new ApiError(
            res.status,
            payload as { error: string; fields?: Record<string, string> },
          );
        }
        saved = (await res.json()) as DishResponseType;
      } else {
        // JSON create without photo.
        saved = await api.post<DishResponseType>("/portal/dishes", {
          name: values.name,
          description: values.description || null,
          priceCents,
        });
      }

      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      surfaceApiError(err, form);
    }
  }

  const currentPreview = previewSrc();
  const submitLabel = form.formState.isSubmitting
    ? "Enregistrement…"
    : isEdit
      ? "Modifier"
      : "Ajouter";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le plat" : "Ajouter un plat"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}
        >
          <PhotoField
            preview={currentPreview}
            onPick={() => fileInputRef.current?.click()}
            onRemove={photo.kind === "none" || photo.kind === "remove" ? null : handleRemovePhoto}
            label={
              photo.kind === "new"
                ? "Nouvelle photo"
                : photo.kind === "existing"
                  ? "Photo actuelle"
                  : photo.kind === "remove"
                    ? "Photo retirée"
                    : "Aucune photo"
            }
            disabled={form.formState.isSubmitting}
            isEdit={isEdit}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={handleFileSelect}
            aria-hidden
          />
          {photoError && (
            <p
              role="alert"
              style={{
                margin: 0,
                color: "var(--color-destructive)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {photoError}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            <Label htmlFor="dish-name">Nom</Label>
            <Input id="dish-name" placeholder="Ex. Foie gras poêlé" {...form.register("name")} />
            {form.formState.errors.name?.message && (
              <p
                role="alert"
                style={{
                  margin: 0,
                  color: "var(--color-destructive)",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            <Label htmlFor="dish-desc">Description (optionnelle)</Label>
            <Input
              id="dish-desc"
              placeholder="Ex. Avec chutney de figues"
              {...form.register("description")}
            />
            {form.formState.errors.description?.message && (
              <p
                role="alert"
                style={{
                  margin: 0,
                  color: "var(--color-destructive)",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            <Label htmlFor="dish-price">Prix (€)</Label>
            <Input
              id="dish-price"
              placeholder="Ex. 24,50"
              inputMode="decimal"
              {...form.register("priceEuros")}
            />
            {form.formState.errors.priceEuros?.message && (
              <p
                role="alert"
                style={{
                  margin: 0,
                  color: "var(--color-destructive)",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                {form.formState.errors.priceEuros.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={form.formState.isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PhotoField({
  preview,
  onPick,
  onRemove,
  label,
  disabled,
  isEdit,
}: {
  preview: string | null;
  onPick: () => void;
  onRemove: (() => void) | null;
  label: string;
  disabled: boolean;
  isEdit: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
      <Label>Photo{isEdit ? "" : " (recommandée)"}</Label>
      <div
        style={{
          position: "relative",
          height: "180px",
          borderRadius: "var(--radius-lg)",
          background: "var(--color-surface-muted)",
          border: preview ? "1px solid var(--color-border)" : "1px dashed var(--color-border)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                disabled={disabled}
                aria-label="Retirer la photo"
                style={{
                  position: "absolute",
                  top: "var(--space-sm)",
                  right: "var(--space-sm)",
                  width: "32px",
                  height: "32px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: disabled ? "not-allowed" : "pointer",
                  boxShadow: "var(--shadow-sm)",
                  color: "var(--color-destructive)",
                }}
              >
                <X size={16} aria-hidden />
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={onPick}
            disabled={disabled}
            style={{
              all: "unset",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "var(--space-xs)",
              cursor: disabled ? "not-allowed" : "pointer",
              color: "var(--color-ink-muted)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <ImagePlus size={28} aria-hidden />
            <span>Ajouter une photo</span>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-ink-subtle)" }}>
              JPEG, PNG ou WebP · max. 10 Mo
            </span>
          </button>
        )}
      </div>
      {preview && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-ink-muted)" }}>
            {label}
          </span>
          <Button type="button" variant="outline" size="sm" onClick={onPick} disabled={disabled}>
            <ImagePlus size={14} aria-hidden style={{ marginRight: "var(--space-xs)" }} />
            Remplacer
          </Button>
        </div>
      )}
      {!preview && (
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-xs)",
            color: "var(--color-ink-muted)",
          }}
        >
          La photo s&apos;affichera aux diners qui scannent votre QR code.
        </p>
      )}
      {onRemove && preview && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          style={{
            all: "unset",
            cursor: disabled ? "not-allowed" : "pointer",
            color: "var(--color-destructive)",
            fontSize: "var(--font-size-xs)",
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            alignSelf: "flex-start",
          }}
        >
          <Trash2 size={12} aria-hidden />
          Retirer la photo
        </button>
      )}
    </div>
  );
}
