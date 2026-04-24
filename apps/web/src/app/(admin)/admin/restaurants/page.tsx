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
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "../../_components/confirm-dialog";
import { surfaceApiError } from "../../_components/error-toast";
import { FilterBar, SearchInput } from "../../_components/filter-bar";
import { PageHeader } from "../../_components/page-header";
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

  const totalCount = rows?.length ?? 0;
  const filteredCount = filtered.length;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <PageHeader
        eyebrow="Catalogue"
        title="Restaurants"
        description={
          rows
            ? `${filteredCount} restaurant${filteredCount > 1 ? "s" : ""}${
                filteredCount !== totalCount ? ` (sur ${totalCount})` : ""
              }`
            : "Chargement…"
        }
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus size={14} aria-hidden /> Ajouter un restaurant
          </Button>
        }
      />

      <FilterBar
        search={
          <SearchInput
            value={filterCity}
            onChange={setFilterCity}
            placeholder="Filtrer par ville…"
            ariaLabel="Filtrer par ville"
          />
        }
        chips={RATING_ORDER.map((s) => {
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
        trailing={
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              color: "var(--color-ink-muted)",
              fontSize: "var(--font-size-sm)",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={includeDisabled}
              onChange={(e) => setIncludeDisabled(e.target.checked)}
            />
            Inclure les désactivés
          </label>
        }
      />

      {rows === null ? (
        <Skeleton style={{ height: 360, borderRadius: "var(--radius-lg)" }} />
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
