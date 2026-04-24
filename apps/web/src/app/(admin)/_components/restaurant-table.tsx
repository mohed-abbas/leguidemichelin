"use client";

import Link from "next/link";
import { ExternalLink, Pencil, Power, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminRestaurantResponseType } from "@repo/shared-schemas";
import { RATING_LABEL } from "./rating";
import { DataCard, EmptyState } from "./data-card";
import { StatusPill } from "./status-pill";

interface Props {
  rows: AdminRestaurantResponseType[];
  onEdit: (row: AdminRestaurantResponseType) => void;
  onDisable: (row: AdminRestaurantResponseType) => void;
  onEnable: (row: AdminRestaurantResponseType) => void;
}

const HEAD_CELL: React.CSSProperties = {
  padding: "var(--space-sm) var(--space-md)",
  textAlign: "left",
  fontSize: "var(--font-size-xs)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-ink-muted)",
};

const CELL: React.CSSProperties = {
  padding: "var(--space-md)",
  fontSize: "var(--font-size-sm)",
  color: "var(--color-ink)",
  verticalAlign: "middle",
};

export function RestaurantTable({ rows, onEdit, onDisable, onEnable }: Props) {
  if (rows.length === 0) {
    return (
      <DataCard>
        <EmptyState
          title="Aucun restaurant"
          hint="Aucun restaurant ne correspond aux filtres actifs. Élargissez la sélection ou créez un nouveau restaurant."
        />
      </DataCard>
    );
  }

  return (
    <DataCard>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
        }}
      >
        <thead style={{ background: "var(--color-surface-muted)" }}>
          <tr>
            <th style={{ ...HEAD_CELL, borderBottom: "1px solid var(--color-border)" }}>Nom</th>
            <th style={{ ...HEAD_CELL, borderBottom: "1px solid var(--color-border)" }}>Ville</th>
            <th style={{ ...HEAD_CELL, borderBottom: "1px solid var(--color-border)" }}>
              Distinction
            </th>
            <th style={{ ...HEAD_CELL, borderBottom: "1px solid var(--color-border)" }}>Cuisine</th>
            <th style={{ ...HEAD_CELL, borderBottom: "1px solid var(--color-border)" }}>Statut</th>
            <th
              style={{
                ...HEAD_CELL,
                borderBottom: "1px solid var(--color-border)",
                textAlign: "right",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const disabled = row.disabledAt !== null;
            return (
              <tr
                key={row.id}
                style={{
                  borderTop: idx === 0 ? "none" : "1px solid var(--color-border)",
                  opacity: disabled ? 0.7 : 1,
                  transition: "background var(--duration-fast) var(--ease-standard)",
                }}
              >
                <td
                  style={{
                    ...CELL,
                    borderTop: idx === 0 ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  <Link
                    href={`/admin/restaurants/${row.id}`}
                    style={{
                      color: "var(--color-ink)",
                      fontWeight: "var(--font-weight-semibold)",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {row.name}
                    <ExternalLink
                      size={12}
                      aria-hidden
                      style={{ color: "var(--color-ink-subtle)" }}
                    />
                  </Link>
                </td>
                <td
                  style={{
                    ...CELL,
                    borderTop: idx === 0 ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  {row.city}
                </td>
                <td
                  style={{
                    ...CELL,
                    borderTop: idx === 0 ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      color:
                        row.michelinRating === "BIB"
                          ? "var(--color-ink)"
                          : "var(--color-accent-gold)",
                      fontWeight: "var(--font-weight-semibold)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {RATING_LABEL[row.michelinRating]}
                  </span>
                </td>
                <td
                  style={{
                    ...CELL,
                    color: row.cuisine ? "var(--color-ink)" : "var(--color-ink-subtle)",
                    borderTop: idx === 0 ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  {row.cuisine ?? "—"}
                </td>
                <td
                  style={{
                    ...CELL,
                    borderTop: idx === 0 ? "none" : "1px solid var(--color-border)",
                  }}
                >
                  {disabled ? (
                    <StatusPill tone="muted">
                      Désactivé{row.disabledAt ? ` · ${formatDate(row.disabledAt)}` : ""}
                    </StatusPill>
                  ) : (
                    <StatusPill tone="success">Actif</StatusPill>
                  )}
                </td>
                <td
                  style={{
                    ...CELL,
                    borderTop: idx === 0 ? "none" : "1px solid var(--color-border)",
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      gap: "var(--space-xs)",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button type="button" variant="outline" size="sm" onClick={() => onEdit(row)}>
                      <Pencil size={14} aria-hidden /> Modifier
                    </Button>
                    {disabled ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onEnable(row)}
                      >
                        <RotateCcw size={14} aria-hidden /> Réactiver
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => onDisable(row)}
                      >
                        <Power size={14} aria-hidden /> Désactiver
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

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR");
  } catch {
    return iso;
  }
}
