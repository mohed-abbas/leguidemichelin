"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { z, type DishResponseType } from "@repo/shared-schemas";
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

const FormSchema = z.object({
  name: z.string().min(1, "Nom requis").max(160),
  description: z.string().max(400).optional(),
  priceEuros: z.number().min(0).max(10000),
  sortOrder: z.number().int().min(0).max(99999),
});
type FormValues = z.infer<typeof FormSchema>;

const EMPTY: FormValues = {
  name: "",
  description: "",
  priceEuros: 0,
  sortOrder: 0,
};

type Mode = { kind: "create" } | { kind: "edit"; dish: DishResponseType };

interface Props {
  open: boolean;
  mode: Mode | null;
  restaurantId: string;
  onOpenChange: (open: boolean) => void;
  onSaved: (dish: DishResponseType) => void;
}

export function DishDialog({ open, mode, restaurantId, onOpenChange, onSaved }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open || !mode) return;
    if (mode.kind === "edit") {
      form.reset({
        name: mode.dish.name,
        description: mode.dish.description ?? "",
        priceEuros: mode.dish.priceCents / 100,
        sortOrder: mode.dish.sortOrder,
      });
    } else {
      form.reset(EMPTY);
    }
  }, [open, mode, form]);

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        name: values.name,
        description:
          values.description && values.description.length > 0 ? values.description : null,
        priceCents: Math.round(values.priceEuros * 100),
        sortOrder: values.sortOrder,
      };
      let saved: DishResponseType;
      if (mode?.kind === "create") {
        saved = await api.post<DishResponseType>(
          `/admin/restaurants/${restaurantId}/dishes`,
          payload,
        );
        toast.success(`Plat « ${saved.name} » ajouté`);
      } else if (mode?.kind === "edit") {
        saved = await api.patch<DishResponseType>(
          `/admin/restaurants/${restaurantId}/dishes/${mode.dish.id}`,
          payload,
        );
        toast.success(`Plat « ${saved.name} » mis à jour`);
      } else {
        return;
      }
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      surfaceApiError(err, form);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode?.kind === "edit" ? "Modifier le plat" : "Ajouter un plat"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            <Label>Nom</Label>
            <Input {...form.register("name")} placeholder="Bouillabaisse" />
            {form.formState.errors.name?.message ? (
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
            ) : null}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            <Label>Description</Label>
            <Input {...form.register("description")} placeholder="Spécialité du chef…" />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-md)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
              <Label>Prix (€)</Label>
              <Input
                type="number"
                step="0.01"
                {...form.register("priceEuros", { valueAsNumber: true })}
                placeholder="48"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
              <Label>Ordre</Label>
              <Input
                type="number"
                step="1"
                {...form.register("sortOrder", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
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
              {form.formState.isSubmitting ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
