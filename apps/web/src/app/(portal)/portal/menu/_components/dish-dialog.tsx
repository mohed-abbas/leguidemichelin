"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { api } from "@/lib/api";
import { surfaceApiError } from "@/app/(diner)/_components/error-toast";
import type { DishResponseType } from "@repo/shared-schemas";

const DishFormSchema = z.object({
  name: z.string().min(1, "Nom requis").max(160),
  description: z.string().max(400).optional(),
  priceEuros: z.string().min(1, "Prix requis"),
});
type DishFormValues = z.infer<typeof DishFormSchema>;

interface DishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (dish: DishResponseType) => void;
  dish?: DishResponseType;
}

export function DishDialog({ open, onOpenChange, onSaved, dish }: DishDialogProps) {
  const isEdit = !!dish;

  const form = useForm<DishFormValues>({
    resolver: zodResolver(DishFormSchema as any),
    defaultValues: { name: "", description: "", priceEuros: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: dish?.name ?? "",
      description: dish?.description ?? "",
      priceEuros: dish ? (dish.priceCents / 100).toFixed(2).replace(".", ",") : "",
    });
  }, [open, dish, form]);

  async function onSubmit(values: DishFormValues) {
    const priceCents = Math.round(parseFloat(values.priceEuros.replace(",", ".")) * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      form.setError("priceEuros", { message: "Prix invalide" });
      return;
    }
    try {
      let saved: DishResponseType;
      if (isEdit && dish) {
        saved = await api.patch<DishResponseType>(`/portal/dishes/${dish.id}`, {
          name: values.name,
          description: values.description || null,
          priceCents,
        });
      } else {
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
              {form.formState.isSubmitting ? "Enregistrement…" : isEdit ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
