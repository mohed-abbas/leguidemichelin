"use client";

import { useMemo, useState } from "react";
import { ImageOff, Pencil, Plus, Search, Trash2, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [dishes, setDishes] = useState<DishResponseType[]>(
    [...initialDishes].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDish, setEditDish] = useState<DishResponseType | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<DishResponseType | undefined>();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dishes;
    return dishes.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || (d.description?.toLowerCase().includes(q) ?? false),
    );
  }, [dishes, query]);

  const withPhoto = dishes.filter((d) => d.defaultImageKey).length;

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
        return next.sort((a, b) => a.sortOrder - b.sortOrder);
      }
      return [...prev, saved].sort((a, b) => a.sortOrder - b.sortOrder);
    });
  }

  function handleDeleted(id: string) {
    setDishes((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        maxWidth: "1040px",
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-sm)",
            color: "var(--color-ink-muted)",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          Portail restaurateur
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "var(--space-md)",
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "var(--font-size-h1)",
              fontWeight: "var(--font-weight-semibold)",
              lineHeight: "var(--line-height-xl)",
            }}
          >
            Menu
          </h1>
          <Button type="button" onClick={openCreate}>
            <Plus size={16} aria-hidden style={{ marginRight: "var(--space-xs)" }} />
            Ajouter un plat
          </Button>
        </div>
        {dishes.length > 0 && (
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              color: "var(--color-ink-muted)",
            }}
          >
            {dishes.length} plat{dishes.length > 1 ? "s" : ""} · {withPhoto} avec photo
          </p>
        )}
      </header>

      {dishes.length > 0 && (
        <div style={{ position: "relative", maxWidth: "420px" }}>
          <Search
            size={16}
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: "var(--space-md)",
              transform: "translateY(-50%)",
              color: "var(--color-ink-muted)",
              pointerEvents: "none",
            }}
          />
          <Input
            type="search"
            placeholder="Rechercher un plat…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Rechercher un plat"
            style={{ paddingLeft: "var(--space-2xl)" }}
          />
        </div>
      )}

      {dishes.length === 0 ? (
        <EmptyState onCreate={openCreate} />
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-lg)",
            color: "var(--color-ink-muted)",
          }}
        >
          Aucun plat ne correspond à « {query} ».
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "var(--space-md)",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {filtered.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              onEdit={() => openEdit(dish)}
              onDelete={() => setDeleteTarget(dish)}
            />
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

function DishCard({
  dish,
  onEdit,
  onDelete,
}: {
  dish: DishResponseType;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: "160px",
          background: "var(--color-surface-muted)",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {dish.defaultImageKey ? (
          <img
            src={`/api/images/${dish.defaultImageKey}`}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--space-xs)",
              color: "var(--color-ink-subtle)",
              fontSize: "var(--font-size-xs)",
            }}
          >
            <ImageOff size={22} aria-hidden />
            <span>Sans photo</span>
          </div>
        )}
      </div>
      <div
        style={{
          padding: "var(--space-md)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: "var(--space-sm)",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--font-weight-semibold)",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {dish.name}
          </h3>
          <span
            style={{
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-ink)",
              whiteSpace: "nowrap",
            }}
          >
            {formatPriceEUR(dish.priceCents)}
          </span>
        </div>
        {dish.description ? (
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              color: "var(--color-ink-muted)",
              lineHeight: "var(--line-height-sm)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {dish.description}
          </p>
        ) : (
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              color: "var(--color-ink-subtle)",
              fontStyle: "italic",
            }}
          >
            Aucune description
          </p>
        )}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "var(--space-sm)",
            display: "flex",
            gap: "var(--space-xs)",
          }}
        >
          <Button type="button" variant="outline" size="sm" onClick={onEdit} style={{ flex: 1 }}>
            <Pencil size={14} aria-hidden style={{ marginRight: "var(--space-xs)" }} />
            Modifier
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDelete}
            aria-label={`Supprimer ${dish.name}`}
          >
            <Trash2 size={14} aria-hidden />
          </Button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <section
      style={{
        background: "var(--color-surface)",
        border: "1px dashed var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-2xl)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-md)",
        textAlign: "center",
      }}
    >
      <UtensilsCrossed size={32} aria-hidden style={{ color: "var(--color-ink-subtle)" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
          }}
        >
          Aucun plat pour le moment
        </h2>
        <p
          style={{
            margin: 0,
            color: "var(--color-ink-muted)",
            maxWidth: "380px",
          }}
        >
          Ajoutez votre premier plat avec une photo pour que les diners puissent le scanner et en
          garder un souvenir.
        </p>
      </div>
      <Button type="button" onClick={onCreate}>
        <Plus size={16} aria-hidden style={{ marginRight: "var(--space-xs)" }} />
        Ajouter un plat
      </Button>
    </section>
  );
}
