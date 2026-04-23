"use client";

import Link from "next/link";
import { Pencil, Power, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AdminRestaurantResponseType } from "@repo/shared-schemas";
import { RATING_LABEL } from "./rating";

interface Props {
  rows: AdminRestaurantResponseType[];
  onEdit: (row: AdminRestaurantResponseType) => void;
  onDisable: (row: AdminRestaurantResponseType) => void;
  onEnable: (row: AdminRestaurantResponseType) => void;
}

export function RestaurantTable({ rows, onEdit, onDisable, onEnable }: Props) {
  if (rows.length === 0) {
    return (
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
        Aucun restaurant ne correspond aux filtres.
      </div>
    );
  }

  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "var(--font-size-sm)",
        }}
      >
        <thead>
          <tr style={{ background: "var(--color-surface-muted)", textAlign: "left" }}>
            <th style={{ padding: "var(--space-sm) var(--space-md)" }}>Nom</th>
            <th style={{ padding: "var(--space-sm) var(--space-md)" }}>Ville</th>
            <th style={{ padding: "var(--space-sm) var(--space-md)" }}>Distinction</th>
            <th style={{ padding: "var(--space-sm) var(--space-md)" }}>Cuisine</th>
            <th style={{ padding: "var(--space-sm) var(--space-md)" }}>Statut</th>
            <th
              style={{
                padding: "var(--space-sm) var(--space-md)",
                textAlign: "right",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const disabled = row.disabledAt !== null;
            return (
              <tr
                key={row.id}
                style={{
                  borderTop: "1px solid var(--color-border)",
                  opacity: disabled ? 0.65 : 1,
                }}
              >
                <td style={{ padding: "var(--space-sm) var(--space-md)" }}>
                  <Link
                    href={`/admin/restaurants/${row.id}`}
                    style={{
                      color: "var(--color-ink)",
                      fontWeight: "var(--font-weight-semibold)",
                      textDecoration: "none",
                    }}
                  >
                    {row.name}
                  </Link>
                </td>
                <td style={{ padding: "var(--space-sm) var(--space-md)" }}>{row.city}</td>
                <td style={{ padding: "var(--space-sm) var(--space-md)" }}>
                  {RATING_LABEL[row.michelinRating]}
                </td>
                <td
                  style={{
                    padding: "var(--space-sm) var(--space-md)",
                    color: "var(--color-ink-muted)",
                  }}
                >
                  {row.cuisine ?? "—"}
                </td>
                <td style={{ padding: "var(--space-sm) var(--space-md)" }}>
                  {disabled ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px var(--space-sm)",
                        borderRadius: "var(--radius-full)",
                        background: "var(--color-surface-muted)",
                        color: "var(--color-ink-muted)",
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      Désactivé{row.disabledAt ? ` le ${formatDate(row.disabledAt)}` : ""}
                    </span>
                  ) : (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px var(--space-sm)",
                        borderRadius: "var(--radius-full)",
                        background: "var(--color-surface-muted)",
                        color: "var(--color-success)",
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      Actif
                    </span>
                  )}
                </td>
                <td
                  style={{
                    padding: "var(--space-sm) var(--space-md)",
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      gap: "var(--space-xs)",
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
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR");
  } catch {
    return iso;
  }
}
