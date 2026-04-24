"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { AdminRewardResponseType, AdminRewardsListResponseType } from "@repo/shared-schemas";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "../../_components/confirm-dialog";
import { surfaceApiError } from "../../_components/error-toast";
import { FilterBar, SearchInput } from "../../_components/filter-bar";
import { PageHeader } from "../../_components/page-header";
import { RewardDialog } from "../../_components/reward-dialog";
import { RewardTable } from "../../_components/reward-table";

type DialogMode = { kind: "create" } | { kind: "edit"; row: AdminRewardResponseType };
type StatusFilter = "all" | "active" | "disabled";

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: "Toutes",
  active: "Actives",
  disabled: "Désactivées",
};

export default function RewardsPage() {
  const [rows, setRows] = useState<AdminRewardResponseType[] | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<AdminRewardResponseType | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<AdminRewardsListResponseType>("/admin/rewards")
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
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter === "active" && !r.active) return false;
      if (statusFilter === "disabled" && r.active) return false;
      if (q && !r.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, statusFilter]);

  function applyRow(updated: AdminRewardResponseType) {
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

  function openEdit(row: AdminRewardResponseType) {
    setDialogMode({ kind: "edit", row });
    setDialogOpen(true);
  }

  async function handleToggle(row: AdminRewardResponseType) {
    if (row.active) {
      setConfirmTarget(row);
      return;
    }
    try {
      const updated = await api.patch<AdminRewardResponseType>(`/admin/rewards/${row.id}`, {
        active: true,
      });
      applyRow(updated);
      toast.success(`« ${updated.title} » réactivée`);
    } catch (err) {
      surfaceApiError(err);
    }
  }

  async function handleDisableConfirmed() {
    if (!confirmTarget) return;
    try {
      const updated = await api.delete<AdminRewardResponseType>(
        `/admin/rewards/${confirmTarget.id}`,
      );
      applyRow(updated);
      toast.success(`« ${updated.title} » désactivée`);
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
        title="Récompenses"
        description={
          rows
            ? `${filteredCount} récompense${filteredCount > 1 ? "s" : ""}${
                filteredCount !== totalCount ? ` (sur ${totalCount})` : ""
              }`
            : "Chargement…"
        }
        actions={
          <Button type="button" onClick={openCreate}>
            <Plus size={14} aria-hidden /> Ajouter une récompense
          </Button>
        }
      />

      <FilterBar
        search={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher une récompense…"
            ariaLabel="Rechercher une récompense"
          />
        }
        chips={(["all", "active", "disabled"] as const).map((s) => {
          const active = statusFilter === s;
          return (
            <Button
              key={s}
              type="button"
              size="sm"
              variant={active ? "default" : "outline"}
              onClick={() => setStatusFilter(s)}
              aria-pressed={active}
            >
              {STATUS_LABEL[s]}
            </Button>
          );
        })}
      />

      {rows === null ? (
        <Skeleton style={{ height: 360, borderRadius: "var(--radius-lg)" }} />
      ) : (
        <RewardTable rows={filtered} onEdit={openEdit} onToggleActive={handleToggle} />
      )}

      <RewardDialog
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
        title="Désactiver cette récompense ?"
        description={
          confirmTarget
            ? `« ${confirmTarget.title} » disparaîtra de la page récompenses dîneur. Les échanges existants restent intacts. Vous pourrez la réactiver à tout moment.`
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
