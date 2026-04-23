"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DishDialog } from "./dish-dialog";
import { DeleteConfirm } from "./delete-confirm";
import type { DishResponseType } from "@repo/shared-schemas";

function formatPriceEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

interface DishListProps {
  initialDishes: DishResponseType[];
}

export function DishList({ initialDishes }: DishListProps) {
  const [dishes, setDishes] = useState<DishResponseType[]>(initialDishes);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDish, setEditDish] = useState<DishResponseType | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<DishResponseType | undefined>();

  function openCreate() {
    setEditDish(undefined);
    setDialogOpen(true);
  }

  function openEdit(dish: DishResponseType) {
    setEditDish(dish);
    setDialogOpen(true);
  }

  function handleSaved(saved: DishResponseType) {
    setDishes((prev) => {
      const idx = prev.findIndex((d) => d.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  }

  function handleDeleted(id: string) {
    setDishes((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <header style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <h1
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            margin: 0,
          }}
        >
          Menu
        </h1>
        <Button type="button" onClick={openCreate}>
          Ajouter un plat
        </Button>
      </header>

      {dishes.length === 0 ? (
        <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>
          Aucun plat pour le moment. Ajoutez-en un pour démarrer.
        </p>
      ) : (
        <div style={{ display: "grid", gap: "var(--space-md)" }}>
          {dishes.map((dish) => (
            <Card key={dish.id}>
              <CardHeader>
                <CardTitle>{dish.name}</CardTitle>
                {dish.description && (
                  <p
                    style={{
                      margin: 0,
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    {dish.description}
                  </p>
                )}
              </CardHeader>
              <CardContent
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  {formatPriceEUR(dish.priceCents)}
                </span>
                <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                  <Button type="button" variant="outline" onClick={() => openEdit(dish)}>
                    Modifier
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setDeleteTarget(dish)}>
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DishDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
        dish={editDish}
      />

      {deleteTarget && (
        <DeleteConfirm
          open={!!deleteTarget}
          dishId={deleteTarget.id}
          dishName={deleteTarget.name}
          onClose={() => setDeleteTarget(undefined)}
          onDeleted={handleDeleted}
        />
      )}
    </section>
  );
}
