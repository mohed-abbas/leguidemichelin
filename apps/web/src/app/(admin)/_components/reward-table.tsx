"use client";

import { Pencil, Power, RotateCcw } from "lucide-react";
import type { AdminRewardResponseType } from "@repo/shared-schemas";
import { Button } from "@/components/ui/button";
import { DataCard, EmptyState } from "./data-card";
import { StatusPill } from "./status-pill";

interface Props {
  rows: AdminRewardResponseType[];
  onEdit: (row: AdminRewardResponseType) => void;
  onToggleActive: (row: AdminRewardResponseType) => void;
}

const HEAD_CELL: React.CSSProperties = {
  padding: "var(--space-sm) var(--space-md)",
  textAlign: "left",
  fontSize: "var(--font-size-xs)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-ink-muted)",
  borderBottom: "1px solid var(--color-border)",
};

const CELL: React.CSSProperties = {
  padding: "var(--space-md)",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-ink)",
  verticalAlign: "middle",
};

export function RewardTable({ rows, onEdit, onToggleActive }: Props) {
  if (rows.length === 0) {
    return (
      <DataCard>
        <EmptyState
          title="Aucune récompense"
          hint="Créez une première récompense pour permettre aux dîneurs d'utiliser leurs points."
        />
      </DataCard>
    );
  }

  return (
    <DataCard>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead style={{ background: "var(--color-surface-muted)" }}>
          <tr>
            <th style={HEAD_CELL}>Récompense</th>
            <th style={HEAD_CELL}>Coût</th>
            <th style={HEAD_CELL}>Échanges</th>
            <th style={HEAD_CELL}>Statut</th>
            <th style={{ ...HEAD_CELL, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => {
            const rowBorder = idx === 0 ? "none" : "1px solid var(--color-border)";
            return (
              <tr key={r.id} style={{ opacity: r.active ? 1 : 0.7 }}>
                <td style={{ ...CELL, borderTop: rowBorder }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span
                      style={{
                        fontWeight: "var(--font-weight-semibold)",
                        color: "var(--color-ink)",
                      }}
                    >
                      {r.title}
                    </span>
                    {r.description ? (
                      <span
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-ink-muted)",
                          maxWidth: "60ch",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {r.description}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-ink-subtle)",
                        }}
                      >
                        Aucune description
                      </span>
                    )}
                  </div>
                </td>
                <td
                  style={{
                    ...CELL,
                    borderTop: rowBorder,
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-accent-gold)",
                  }}
                >
                  {r.pointsCost.toLocaleString("fr-FR")} pts
                </td>
                <td
                  style={{
                    ...CELL,
                    borderTop: rowBorder,
                    fontVariantNumeric: "tabular-nums",
                    color: r.redemptionCount > 0 ? "var(--color-ink)" : "var(--color-ink-subtle)",
                  }}
                >
                  {r.redemptionCount}
                </td>
                <td style={{ ...CELL, borderTop: rowBorder }}>
                  {r.active ? (
                    <StatusPill tone="success">Actif</StatusPill>
                  ) : (
                    <StatusPill tone="muted">Désactivé</StatusPill>
                  )}
                </td>
                <td style={{ ...CELL, borderTop: rowBorder, textAlign: "right" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      gap: "var(--space-xs)",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button type="button" variant="outline" size="sm" onClick={() => onEdit(r)}>
                      <Pencil size={14} aria-hidden /> Modifier
                    </Button>
                    {r.active ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onToggleActive(r)}
                      >
                        <Power size={14} aria-hidden /> Désactiver
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleActive(r)}
                      >
                        <RotateCcw size={14} aria-hidden /> Réactiver
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </DataCard>
  );
}
