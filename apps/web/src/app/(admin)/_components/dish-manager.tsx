"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { DishResponseType } from "@repo/shared-schemas";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "./confirm-dialog";
import { DishDialog } from "./dish-dialog";
import { surfaceApiError } from "./error-toast";
import { formatPriceEUR } from "./rating";

type DialogMode = { kind: "create" } | { kind: "edit"; dish: DishResponseType };

interface Props {
  restaurantId: string;
  initialDishes: DishResponseType[];
}

export function DishManager({ restaurantId, initialDishes }: Props) {
  const [dishes, setDishes] = useState<DishResponseType[]>(
    [...initialDishes].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DishResponseType | null>(null);

  function applyDish(updated: DishResponseType) {
    setDishes((prev) => {
      const idx = prev.findIndex((d) => d.id === updated.id);
      const next = idx === -1 ? [...prev, updated] : prev.slice();
      if (idx !== -1) next[idx] = updated;
      return next.sort((a, b) => a.sortOrder - b.sortOrder);
    });
  }

  async function move(dish: DishResponseType, delta: -1 | 1) {
    const ordered = [...dishes].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = ordered.findIndex((d) => d.id === dish.id);
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= ordered.length) return;
    const next = ordered.slice();
    [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
    try {
      const res = await api.patch<{ dishes: DishResponseType[] }>(
        `/admin/restaurants/${restaurantId}/dishes/reorder`,
        { orderedIds: next.map((d) => d.id) },
      );
      setDishes([...res.dishes].sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (err) {
      surfaceApiError(err);
    }
  }

  async function handleDeleteConfirmed() {
    if (!confirmDelete) return;
    try {
      await api.delete<{ success: true }>(
        `/admin/restaurants/${restaurantId}/dishes/${confirmDelete.id}`,
      );
      setDishes((prev) => prev.filter((d) => d.id !== confirmDelete.id));
      toast.success(`Plat « ${confirmDelete.name} » supprimé`);
      setConfirmDelete(null);
    } catch (err) {
      surfaceApiError(err);
    }
  }

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
            margin: 0,
          }}
        >
          Carte ({dishes.length})
        </h2>
        <Button
          type="button"
          onClick={() => {
            setDialogMode({ kind: "create" });
            setDialogOpen(true);
          }}
        >
          <Plus size={14} aria-hidden /> Ajouter un plat
        </Button>
      </header>

      {dishes.length === 0 ? (
        <div
          style={{
            padding: "var(--space-xl)",
            textAlign: "center",
            color: "var(--color-ink-muted)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          Aucun plat. Cliquez sur « Ajouter un plat » pour commencer.
        </div>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-sm)",
          }}
        >
          {dishes.map((dish, i) => (
            <li
              key={dish.id}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-md)",
                display: "grid",
                gridTemplateColumns: "auto 1fr auto auto",
                alignItems: "center",
                gap: "var(--space-md)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-xs)",
                }}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={i === 0}
                  onClick={() => move(dish, -1)}
                  aria-label={`Déplacer ${dish.name} vers le haut`}
                >
                  <ArrowUp size={14} aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={i === dishes.length - 1}
                  onClick={() => move(dish, 1)}
                  aria-label={`Déplacer ${dish.name} vers le bas`}
                >
                  <ArrowDown size={14} aria-hidden />
                </Button>
              </div>
              <div>
                <div style={{ fontWeight: "var(--font-weight-semibold)" }}>{dish.name}</div>
                {dish.description ? (
                  <div
                    style={{
                      color: "var(--color-ink-muted)",
                      fontSize: "var(--font-size-sm)",
                      marginTop: "var(--space-xs)",
                    }}
                  >
                    {dish.description}
                  </div>
                ) : null}
              </div>
              <div style={{ color: "var(--color-ink-muted)", whiteSpace: "nowrap" }}>
                {formatPriceEUR(dish.priceCents)}
              </div>
              <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDialogMode({ kind: "edit", dish });
                    setDialogOpen(true);
                  }}
                >
                  <Pencil size={14} aria-hidden /> Modifier
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => setConfirmDelete(dish)}
                >
                  <Trash2 size={14} aria-hidden /> Supprimer
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <DishDialog
        open={dialogOpen}
        mode={dialogMode}
        restaurantId={restaurantId}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setDialogMode(null);
        }}
        onSaved={applyDish}
      />

      <ConfirmDialog
        open={confirmDelete !== null}
        title="Supprimer ce plat ?"
        description={
          confirmDelete ? `« ${confirmDelete.name} » sera supprimé définitivement de la carte.` : ""
        }
        confirmLabel="Supprimer"
        destructive
        onConfirm={handleDeleteConfirmed}
        onOpenChange={(o) => {
          if (!o) setConfirmDelete(null);
        }}
      />
    </section>
  );
}
