"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type {
  AdminRestaurantResponseType,
  AdminRestaurantsListResponseType,
  MichelinRatingType,
} from "@repo/shared-schemas";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "../../_components/confirm-dialog";
import { surfaceApiError } from "../../_components/error-toast";
import { RATING_LABEL, RATING_ORDER } from "../../_components/rating";
import { RestaurantDialog } from "../../_components/restaurant-dialog";
import { RestaurantTable } from "../../_components/restaurant-table";

type DialogMode = { kind: "create" } | { kind: "edit"; row: AdminRestaurantResponseType };

export default function RestaurantsPage() {
  const [rows, setRows] = useState<AdminRestaurantResponseType[] | null>(null);
  const [filterCity, setFilterCity] = useState("");
  const [filterStars, setFilterStars] = useState<Set<MichelinRatingType>>(new Set());
  const [includeDisabled, setIncludeDisabled] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminRestaurantResponseType | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<AdminRestaurantsListResponseType>("/admin/restaurants")
      .then((res) => {
        if (!cancelled) setRows(res.items);
      })
      .catch((err) => {
        if (!cancelled) {
          surfaceApiError(err);
          setRows([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!rows) return [];
    return rows.filter((r) => {
      if (!includeDisabled && r.disabledAt !== null) return false;
      if (filterCity && !r.city.toLowerCase().includes(filterCity.toLowerCase())) return false;
      if (filterStars.size > 0 && !filterStars.has(r.michelinRating)) return false;
      return true;
    });
  }, [rows, filterCity, filterStars, includeDisabled]);

  function toggleStar(s: MichelinRatingType) {
    setFilterStars((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  function applyRow(updated: AdminRestaurantResponseType) {
    setRows((prev) => {
      if (!prev) return [updated];
      const idx = prev.findIndex((r) => r.id === updated.id);
      if (idx === -1) return [updated, ...prev];
      const copy = prev.slice();
      copy[idx] = updated;
      return copy;
    });
  }

  function openCreate() {
    setDialogMode({ kind: "create" });
    setDialogOpen(true);
  }

  function openEdit(row: AdminRestaurantResponseType) {
    setDialogMode({ kind: "edit", row });
    setDialogOpen(true);
  }

  async function handleEnable(row: AdminRestaurantResponseType) {
    try {
      const updated = await api.patch<AdminRestaurantResponseType>(`/admin/restaurants/${row.id}`, {
        disabledAt: null,
      });
      applyRow(updated);
      toast.success(`« ${updated.name} » réactivé`);
    } catch (err) {
      surfaceApiError(err);
    }
  }

  async function handleDisableConfirmed() {
    if (!confirmTarget) return;
    try {
      const updated = await api.delete<AdminRestaurantResponseType>(
        `/admin/restaurants/${confirmTarget.id}`,
      );
      applyRow(updated);
      toast.success(`« ${updated.name} » désactivé`);
      setConfirmTarget(null);
    } catch (err) {
      surfaceApiError(err);
    }
  }

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-md)",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-weight-semibold)",
              margin: 0,
            }}
          >
            Restaurants
          </h1>
          <p style={{ color: "var(--color-ink-muted)", margin: "var(--space-xs) 0 0" }}>
            {rows
              ? `${filtered.length} restaurant${filtered.length > 1 ? "s" : ""}${
                  filtered.length !== rows.length ? ` (sur ${rows.length})` : ""
                }`
              : "Chargement…"}
          </p>
        </div>
        <Button type="button" onClick={openCreate}>
          <Plus size={14} aria-hidden /> Ajouter un restaurant
        </Button>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(240px, 320px) 1fr auto",
          gap: "var(--space-md)",
          alignItems: "center",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-md)",
        }}
      >
        <Input
          placeholder="Filtrer par ville…"
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
          aria-label="Filtrer par ville"
        />
        <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap" }}>
          {RATING_ORDER.map((s) => {
            const active = filterStars.has(s);
            return (
              <Button
                key={s}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                onClick={() => toggleStar(s)}
                aria-pressed={active}
              >
                {RATING_LABEL[s]}
              </Button>
            );
          })}
        </div>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            color: "var(--color-ink-muted)",
            fontSize: "var(--font-size-sm)",
            whiteSpace: "nowrap",
          }}
        >
          <input
            type="checkbox"
            checked={includeDisabled}
            onChange={(e) => setIncludeDisabled(e.target.checked)}
          />
          Inclure les désactivés
        </label>
      </div>

      {rows === null ? (
        <Skeleton style={{ height: "320px" }} />
      ) : (
        <RestaurantTable
          rows={filtered}
          onEdit={openEdit}
          onDisable={(row) => setConfirmTarget(row)}
          onEnable={handleEnable}
        />
      )}

      <RestaurantDialog
        open={dialogOpen}
        mode={dialogMode}
        onOpenChange={(o) => {
          setDialogOpen(o);
          if (!o) setDialogMode(null);
        }}
        onSaved={applyRow}
      />

      <ConfirmDialog
        open={confirmTarget !== null}
        title="Désactiver ce restaurant ?"
        description={
          confirmTarget
            ? `« ${confirmTarget.name} » disparaîtra de l'app dîneur. Les souvenirs existants restent intacts. Vous pourrez le réactiver à tout moment.`
            : ""
        }
        confirmLabel="Désactiver"
        destructive
        onConfirm={handleDisableConfirmed}
        onOpenChange={(o) => {
          if (!o) setConfirmTarget(null);
        }}
      />
    </section>
  );
}
