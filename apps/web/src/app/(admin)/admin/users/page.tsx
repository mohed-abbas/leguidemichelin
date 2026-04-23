"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AdminUserResponseType,
  AdminUsersListResponseType,
  UserRoleType,
} from "@repo/shared-schemas";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { surfaceApiError } from "../../_components/error-toast";
import { ROLE_LABEL, UserTable } from "../../_components/user-table";
import { UserRoleDialog } from "../../_components/user-role-dialog";

const ROLES: UserRoleType[] = ["DINER", "RESTAURANT_STAFF", "ADMIN"];

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUserResponseType[] | null>(null);
  const [meId, setMeId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Set<UserRoleType>>(new Set());
  const [editing, setEditing] = useState<AdminUserResponseType | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get<AdminUsersListResponseType>("/admin/users"),
      api.get<{ id: string }>("/auth/me"),
    ])
      .then(([list, me]) => {
        if (cancelled) return;
        setUsers(list.items);
        setMeId(me.id);
      })
      .catch((err) => {
        if (!cancelled) {
          surfaceApiError(err);
          setUsers([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter.size > 0 && !roleFilter.has(u.role)) return false;
      if (q && !u.email.toLowerCase().includes(q) && !u.name.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [users, search, roleFilter]);

  function toggleRole(r: UserRoleType) {
    setRoleFilter((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  }

  function applyUser(updated: AdminUserResponseType) {
    setUsers((prev) => (prev ? prev.map((u) => (u.id === updated.id ? updated : u)) : [updated]));
  }

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
      }}
    >
      <header>
        <h1
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            margin: 0,
          }}
        >
          Utilisateurs
        </h1>
        <p style={{ color: "var(--color-ink-muted)", margin: "var(--space-xs) 0 0" }}>
          {users
            ? `${filtered.length} utilisateur${filtered.length > 1 ? "s" : ""}${
                filtered.length !== users.length ? ` (sur ${users.length})` : ""
              }`
            : "Chargement…"}
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(240px, 320px) 1fr",
          gap: "var(--space-md)",
          alignItems: "center",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-md)",
        }}
      >
        <Input
          placeholder="Rechercher (nom ou email)…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Rechercher un utilisateur"
        />
        <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap" }}>
          {ROLES.map((r) => {
            const active = roleFilter.has(r);
            return (
              <Button
                key={r}
                type="button"
                size="sm"
                variant={active ? "default" : "outline"}
                onClick={() => toggleRole(r)}
                aria-pressed={active}
              >
                {ROLE_LABEL[r]}
              </Button>
            );
          })}
        </div>
      </div>

      {users === null ? (
        <Skeleton style={{ height: "320px" }} />
      ) : (
        <UserTable rows={filtered} meId={meId} onEdit={setEditing} />
      )}

      <UserRoleDialog
        open={editing !== null}
        user={editing}
        onOpenChange={(o) => {
          if (!o) setEditing(null);
        }}
        onSaved={applyUser}
      />
    </section>
  );
}
