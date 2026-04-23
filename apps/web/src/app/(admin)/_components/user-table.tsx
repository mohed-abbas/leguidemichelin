"use client";

import { Pencil } from "lucide-react";
import type { AdminUserResponseType, UserRoleType } from "@repo/shared-schemas";
import { Button } from "@/components/ui/button";

const ROLE_LABEL: Record<UserRoleType, string> = {
  DINER: "Dîneur",
  RESTAURANT_STAFF: "Staff",
  ADMIN: "Admin",
};

interface Props {
  rows: AdminUserResponseType[];
  meId: string | null;
  onEdit: (user: AdminUserResponseType) => void;
}

export function UserTable({ rows, meId, onEdit }: Props) {
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
            <th style={{ padding: "var(--space-sm) var(--space-md)" }}>Email</th>
            <th style={{ padding: "var(--space-sm) var(--space-md)" }}>Rôle</th>
            <th style={{ padding: "var(--space-sm) var(--space-md)" }}>Points</th>
            <th style={{ padding: "var(--space-sm) var(--space-md)" }}>Souvenirs</th>
            <th style={{ padding: "var(--space-sm) var(--space-md)" }}>Statut</th>
            <th style={{ padding: "var(--space-sm) var(--space-md)", textAlign: "right" }}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                style={{
                  padding: "var(--space-xl)",
                  textAlign: "center",
                  color: "var(--color-ink-muted)",
                }}
              >
                Aucun utilisateur ne correspond aux filtres.
              </td>
            </tr>
          ) : (
            rows.map((u) => {
              const isSelf = u.id === meId;
              const disabled = u.disabledAt !== null;
              return (
                <tr
                  key={u.id}
                  style={{
                    borderTop: "1px solid var(--color-border)",
                    opacity: disabled ? 0.65 : 1,
                  }}
                >
                  <td style={{ padding: "var(--space-sm) var(--space-md)" }}>
                    {u.name}
                    {isSelf ? (
                      <span
                        style={{
                          marginLeft: "var(--space-xs)",
                          color: "var(--color-ink-muted)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        (vous)
                      </span>
                    ) : null}
                  </td>
                  <td style={{ padding: "var(--space-sm) var(--space-md)" }}>{u.email}</td>
                  <td style={{ padding: "var(--space-sm) var(--space-md)" }}>
                    {ROLE_LABEL[u.role]}
                  </td>
                  <td style={{ padding: "var(--space-sm) var(--space-md)" }}>
                    {u.totalPoints.toLocaleString("fr-FR")}
                  </td>
                  <td style={{ padding: "var(--space-sm) var(--space-md)" }}>{u.souvenirCount}</td>
                  <td style={{ padding: "var(--space-sm) var(--space-md)" }}>
                    {disabled ? (
                      <span style={{ color: "var(--color-ink-muted)" }}>Désactivé</span>
                    ) : (
                      <span style={{ color: "var(--color-success)" }}>Actif</span>
                    )}
                  </td>
                  <td
                    style={{
                      padding: "var(--space-sm) var(--space-md)",
                      textAlign: "right",
                    }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(u)}
                      disabled={isSelf}
                      title={
                        isSelf ? "Vous ne pouvez pas modifier votre propre compte." : undefined
                      }
                    >
                      <Pencil size={14} aria-hidden /> Modifier
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export { ROLE_LABEL };
