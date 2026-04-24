"use client";

import { Pencil } from "lucide-react";
import type { AdminUserResponseType, UserRoleType } from "@repo/shared-schemas";
import { Button } from "@/components/ui/button";
import { DataCard, EmptyState } from "./data-card";
import { StatusPill } from "./status-pill";

const ROLE_LABEL: Record<UserRoleType, string> = {
  DINER: "Dîneur",
  RESTAURANT_STAFF: "Staff",
  ADMIN: "Admin",
};

const ROLE_TONE: Record<UserRoleType, "info" | "warning" | "destructive"> = {
  DINER: "info",
  RESTAURANT_STAFF: "warning",
  ADMIN: "destructive",
};

interface Props {
  rows: AdminUserResponseType[];
  meId: string | null;
  onEdit: (user: AdminUserResponseType) => void;
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

function initials(name: string, email: string): string {
  const source = (name || email.split("@")[0] || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function UserTable({ rows, meId, onEdit }: Props) {
  if (rows.length === 0) {
    return (
      <DataCard>
        <EmptyState
          title="Aucun utilisateur"
          hint="Aucun utilisateur ne correspond aux filtres actifs."
        />
      </DataCard>
    );
  }

  return (
    <DataCard>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead style={{ background: "var(--color-surface-muted)" }}>
          <tr>
            <th style={HEAD_CELL}>Utilisateur</th>
            <th style={HEAD_CELL}>Rôle</th>
            <th style={HEAD_CELL}>Points</th>
            <th style={HEAD_CELL}>Souvenirs</th>
            <th style={HEAD_CELL}>Statut</th>
            <th style={{ ...HEAD_CELL, textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u, idx) => {
            const isSelf = u.id === meId;
            const disabled = u.disabledAt !== null;
            const rowBorder = idx === 0 ? "none" : "1px solid var(--color-border)";
            return (
              <tr
                key={u.id}
                style={{
                  opacity: disabled ? 0.7 : 1,
                }}
              >
                <td style={{ ...CELL, borderTop: rowBorder }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                    <span
                      aria-hidden
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "var(--radius-full)",
                        background: "var(--color-surface-muted)",
                        color: "var(--color-ink-muted)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "var(--font-size-xs)",
                        fontWeight: "var(--font-weight-bold)",
                        flex: "0 0 auto",
                      }}
                    >
                      {initials(u.name, u.email)}
                    </span>
                    <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                      <span
                        style={{
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--color-ink)",
                        }}
                      >
                        {u.name || u.email.split("@")[0]}
                        {isSelf ? (
                          <span
                            style={{
                              marginLeft: "var(--space-xs)",
                              color: "var(--color-ink-muted)",
                              fontSize: "var(--font-size-xs)",
                              fontWeight: "var(--font-weight-regular)",
                            }}
                          >
                            (vous)
                          </span>
                        ) : null}
                      </span>
                      <span
                        style={{
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-ink-muted)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {u.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={{ ...CELL, borderTop: rowBorder }}>
                  <StatusPill tone={ROLE_TONE[u.role]} showDot={false}>
                    {ROLE_LABEL[u.role]}
                  </StatusPill>
                </td>
                <td
                  style={{
                    ...CELL,
                    borderTop: rowBorder,
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  {u.totalPoints.toLocaleString("fr-FR")}
                </td>
                <td
                  style={{
                    ...CELL,
                    borderTop: rowBorder,
                    fontVariantNumeric: "tabular-nums",
                    color: u.souvenirCount > 0 ? "var(--color-ink)" : "var(--color-ink-subtle)",
                  }}
                >
                  {u.souvenirCount}
                </td>
                <td style={{ ...CELL, borderTop: rowBorder }}>
                  {disabled ? (
                    <StatusPill tone="muted">Désactivé</StatusPill>
                  ) : (
                    <StatusPill tone="success">Actif</StatusPill>
                  )}
                </td>
                <td style={{ ...CELL, borderTop: rowBorder, textAlign: "right" }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(u)}
                    disabled={isSelf}
                    title={isSelf ? "Vous ne pouvez pas modifier votre propre compte." : undefined}
                  >
                    <Pencil size={14} aria-hidden /> Modifier
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </DataCard>
  );
}

export { ROLE_LABEL };
