"use client";

import { useEffect, type ReactNode } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  AdminRestaurantCreate,
  z,
  type AdminRestaurantCreateType,
  type AdminRestaurantResponseType,
  type MichelinRatingType,
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
import { RATING_LABEL, RATING_ORDER, slugify } from "./rating";

type Mode = { kind: "create" } | { kind: "edit"; row: AdminRestaurantResponseType };

interface Props {
  open: boolean;
  mode: Mode | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (row: AdminRestaurantResponseType) => void;
}

const FormSchema = AdminRestaurantCreate.omit({ michelinSlug: true }).extend({
  cuisine: z.string().max(80).optional(),
});
type FormValues = z.infer<typeof FormSchema>;

const EMPTY: FormValues = {
  slug: "",
  name: "",
  city: "",
  address: "",
  lat: 0,
  lng: 0,
  michelinRating: "ONE",
  cuisine: "",
};

export function RestaurantDialog({ open, mode, onOpenChange, onSaved }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open || !mode) return;
    if (mode.kind === "edit") {
      const r = mode.row;
      form.reset({
        slug: r.slug,
        name: r.name,
        city: r.city,
        address: r.address,
        lat: r.lat,
        lng: r.lng,
        michelinRating: r.michelinRating,
        cuisine: r.cuisine ?? "",
      });
    } else {
      form.reset(EMPTY);
    }
  }, [open, mode, form]);

  async function onSubmit(values: FormValues) {
    try {
      if (!mode) return;
      const body = {
        ...values,
        cuisine: values.cuisine && values.cuisine.length > 0 ? values.cuisine : null,
      };
      let saved: AdminRestaurantResponseType;
      if (mode.kind === "create") {
        const michelinSlug = `admin-${crypto.randomUUID()}`;
        saved = await api.post<AdminRestaurantResponseType>("/admin/restaurants", {
          ...body,
          michelinSlug,
        } satisfies AdminRestaurantCreateType);
        toast.success(`Restaurant « ${saved.name} » créé`);
      } else {
        saved = await api.patch<AdminRestaurantResponseType>(
          `/admin/restaurants/${mode.row.id}`,
          body,
        );
        toast.success(`Restaurant « ${saved.name} » mis à jour`);
      }
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      surfaceApiError(err, form);
    }
  }

  const title = mode?.kind === "edit" ? "Modifier le restaurant" : "Nouveau restaurant";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
        >
          <Field
            label="Nom"
            error={form.formState.errors.name?.message}
            input={
              <Input
                {...form.register("name", {
                  onChange: (e) => {
                    // Auto-slugify only in create mode AND only if the user hasn't
                    // manually edited the slug yet — otherwise typing more in the
                    // name field would overwrite their custom slug (L-04).
                    if (
                      mode?.kind === "create" &&
                      !form.formState.dirtyFields.slug
                    ) {
                      form.setValue("slug", slugify(e.target.value), { shouldDirty: false });
                    }
                  },
                })}
                placeholder="Le Bernardin"
              />
            }
          />
          <Field
            label="Slug"
            hint="URL friendly — généré automatiquement à partir du nom"
            error={form.formState.errors.slug?.message}
            input={
              <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                <Input {...form.register("slug")} placeholder="le-bernardin" style={{ flex: 1 }} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    form.setValue("slug", slugify(form.getValues("name")), {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                >
                  Auto
                </Button>
              </div>
            }
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-md)",
            }}
          >
            <Field
              label="Ville"
              error={form.formState.errors.city?.message}
              input={<Input {...form.register("city")} placeholder="Paris" />}
            />
            <Field
              label="Cuisine"
              error={form.formState.errors.cuisine?.message}
              input={<Input {...form.register("cuisine")} placeholder="Française moderne" />}
            />
          </div>
          <Field
            label="Adresse"
            error={form.formState.errors.address?.message}
            input={<Input {...form.register("address")} placeholder="155 W 51st St, New York" />}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-md)",
            }}
          >
            <Field
              label="Latitude"
              error={form.formState.errors.lat?.message}
              input={
                <Input
                  type="number"
                  step="any"
                  {...form.register("lat", { valueAsNumber: true })}
                  placeholder="48.8566"
                />
              }
            />
            <Field
              label="Longitude"
              error={form.formState.errors.lng?.message}
              input={
                <Input
                  type="number"
                  step="any"
                  {...form.register("lng", { valueAsNumber: true })}
                  placeholder="2.3522"
                />
              }
            />
          </div>
          <Field
            label="Distinction Michelin"
            error={form.formState.errors.michelinRating?.message}
            input={
              <Controller
                control={form.control}
                name="michelinRating"
                render={({ field }) => (
                  <RatingSelect value={field.value} onChange={field.onChange} />
                )}
              />
            }
          />
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xs)",
      }}
    >
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

function RatingSelect({
  value,
  onChange,
}: {
  value: MichelinRatingType;
  onChange: (next: MichelinRatingType) => void;
}) {
  return (
    <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap" }}>
      {RATING_ORDER.map((r) => {
        const active = value === r;
        return (
          <Button
            key={r}
            type="button"
            variant={active ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(r)}
            aria-pressed={active}
          >
            {RATING_LABEL[r]}
          </Button>
        );
      })}
    </div>
  );
}
