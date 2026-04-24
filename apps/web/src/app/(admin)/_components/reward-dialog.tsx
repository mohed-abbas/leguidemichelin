"use client";

import { useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AdminRewardCreate,
  z,
  type AdminRewardCreateType,
  type AdminRewardResponseType,
} from "@repo/shared-schemas";
import { api } from "@/lib/api";
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
import { surfaceApiError } from "./error-toast";

type Mode = { kind: "create" } | { kind: "edit"; row: AdminRewardResponseType };

interface Props {
  open: boolean;
  mode: Mode | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (row: AdminRewardResponseType) => void;
}

const FormSchema = AdminRewardCreate.extend({
  description: z.string().max(800).optional(),
});
type FormValues = z.infer<typeof FormSchema>;

const EMPTY: FormValues = {
  title: "",
  description: "",
  pointsCost: 100,
  imageKey: undefined,
  active: true,
};

export function RewardDialog({ open, mode, onOpenChange, onSaved }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open || !mode) return;
    if (mode.kind === "edit") {
      const r = mode.row;
      form.reset({
        title: r.title,
        description: r.description ?? "",
        pointsCost: r.pointsCost,
        imageKey: r.imageKey ?? undefined,
        active: r.active,
      });
    } else {
      form.reset(EMPTY);
    }
  }, [open, mode, form]);

  async function onSubmit(values: FormValues) {
    try {
      if (!mode) return;
      const body: AdminRewardCreateType = {
        title: values.title,
        pointsCost: values.pointsCost,
        description:
          values.description && values.description.length > 0 ? values.description : null,
        active: values.active,
      };
      let saved: AdminRewardResponseType;
      if (mode.kind === "create") {
        saved = await api.post<AdminRewardResponseType>("/admin/rewards", body);
        toast.success(`Récompense « ${saved.title} » créée`);
      } else {
        saved = await api.patch<AdminRewardResponseType>(`/admin/rewards/${mode.row.id}`, body);
        toast.success(`Récompense « ${saved.title} » mise à jour`);
      }
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      surfaceApiError(err, form);
    }
  }

  const title = mode?.kind === "edit" ? "Modifier la récompense" : "Nouvelle récompense";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}
        >
          <Field
            label="Titre"
            error={form.formState.errors.title?.message}
            input={<Input {...form.register("title")} placeholder="Bouteille de champagne" />}
          />
          <Field
            label="Description"
            hint="Optionnelle — visible par les dîneurs sur la page récompenses."
            error={form.formState.errors.description?.message}
            input={
              <textarea
                {...form.register("description")}
                rows={3}
                placeholder="Détails, conditions d'utilisation…"
                style={{
                  width: "100%",
                  padding: "var(--space-sm)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-surface)",
                  color: "var(--color-ink)",
                  fontSize: "var(--font-size-sm)",
                  fontFamily: "inherit",
                  resize: "vertical",
                  minHeight: 80,
                  outline: "none",
                }}
              />
            }
          />
          <Field
            label="Coût en points"
            error={form.formState.errors.pointsCost?.message}
            input={
              <Input
                type="number"
                min={0}
                step={1}
                {...form.register("pointsCost", { valueAsNumber: true })}
              />
            }
          />
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              color: "var(--color-ink)",
              fontSize: "var(--font-size-sm)",
              cursor: "pointer",
            }}
          >
            <input type="checkbox" {...form.register("active")} />
            Actif (visible par les dîneurs)
          </label>
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
              {form.formState.isSubmitting
                ? "Enregistrement…"
                : mode?.kind === "edit"
                  ? "Enregistrer"
                  : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  hint,
  error,
  input,
}: {
  label: string;
  hint?: string;
  error?: string;
  input: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
      <Label>{label}</Label>
      {input}
      {hint && !error ? (
        <p
          style={{
            margin: 0,
            color: "var(--color-ink-muted)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          style={{
            margin: 0,
            color: "var(--color-destructive)",
            fontSize: "var(--font-size-sm)",
          }}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
