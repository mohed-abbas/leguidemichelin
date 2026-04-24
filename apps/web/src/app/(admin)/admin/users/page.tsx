"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AdminUserResponseType,
  AdminUsersListResponseType,
  UserRoleType,
} from "@repo/shared-schemas";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { surfaceApiError } from "../../_components/error-toast";
import { FilterBar, SearchInput } from "../../_components/filter-bar";
import { PageHeader } from "../../_components/page-header";
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
    setUsers((prev) =>
      prev
        ? prev.map((u) =>
            u.id === updated.id
              ? // Preserve souvenirCount — backend PATCH returns 0 (L-05).
                { ...updated, souvenirCount: u.souvenirCount }
              : u,
          )
        : [updated],
    );
  }

  const totalCount = users?.length ?? 0;
  const filteredCount = filtered.length;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <PageHeader
        eyebrow="Communauté"
        title="Utilisateurs"
        description={
          users
            ? `${filteredCount} utilisateur${filteredCount > 1 ? "s" : ""}${
                filteredCount !== totalCount ? ` (sur ${totalCount})` : ""
              }`
            : "Chargement…"
        }
      />

      <FilterBar
        search={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Rechercher par nom ou email…"
            ariaLabel="Rechercher un utilisateur"
          />
        }
        chips={ROLES.map((r) => {
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
      />

      {users === null ? (
        <Skeleton style={{ height: 360, borderRadius: "var(--radius-lg)" }} />
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
