"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { AdminUserResponseType, UserRoleType } from "@repo/shared-schemas";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { surfaceApiError } from "./error-toast";

const ROLE_OPTIONS: { value: UserRoleType; label: string }[] = [
  { value: "DINER", label: "Dîneur" },
  { value: "RESTAURANT_STAFF", label: "Staff restaurant" },
  { value: "ADMIN", label: "Administrateur" },
];

interface Props {
  open: boolean;
  user: AdminUserResponseType | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (user: AdminUserResponseType) => void;
}

export function UserRoleDialog({ open, user, onOpenChange, onSaved }: Props) {
  const [role, setRole] = useState<UserRoleType>("DINER");
  const [disabled, setDisabled] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setRole(user.role);
    setDisabled(user.disabledAt !== null);
  }, [open, user]);

  if (!user) return null;

  async function handleSubmit() {
    if (!user) return;
    setPending(true);
    try {
      const body: { role?: UserRoleType; disabledAt?: string | null } = {};
      if (role !== user.role) body.role = role;
      const wasDisabled = user.disabledAt !== null;
      if (disabled !== wasDisabled) {
        body.disabledAt = disabled ? new Date().toISOString() : null;
      }
      if (Object.keys(body).length === 0) {
        onOpenChange(false);
        return;
      }
      const updated = await api.patch<AdminUserResponseType>(`/admin/users/${user.id}`, body);
      onSaved(updated);
      toast.success(`Utilisateur « ${updated.name} » mis à jour`);
      onOpenChange(false);
    } catch (err) {
      surfaceApiError(err);
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier {user.name}</DialogTitle>
        </DialogHeader>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
          }}
        >
          <div style={{ color: "var(--color-ink-muted)", fontSize: "var(--font-size-sm)" }}>
            {user.email}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            <Label htmlFor="user-role-select">Rôle</Label>
            <select
              id="user-role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRoleType)}
              disabled={pending}
              style={{
                height: "32px",
                padding: "0 var(--space-sm)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-ink)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-xs)",
            }}
          >
            <input
              type="checkbox"
              checked={disabled}
              onChange={(e) => setDisabled(e.target.checked)}
              disabled={pending}
            />
            <span>Compte désactivé</span>
          </label>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Annuler
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={pending}>
            {pending ? "…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
