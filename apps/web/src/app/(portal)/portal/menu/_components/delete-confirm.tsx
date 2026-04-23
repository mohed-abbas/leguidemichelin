"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { surfaceApiError } from "@/app/(diner)/_components/error-toast";

interface DeleteConfirmProps {
  open: boolean;
  dishName: string;
  dishId: string;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export function DeleteConfirm({ open, dishName, dishId, onClose, onDeleted }: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await api.delete(`/portal/dishes/${dishId}`);
      onDeleted(dishId);
      onClose();
    } catch (err) {
      surfaceApiError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer un plat</DialogTitle>
        </DialogHeader>
        <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
          Supprimer «&nbsp;{dishName}&nbsp;» ? Cette action est irréversible.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "var(--space-sm)",
            marginTop: "var(--space-md)",
          }}
        >
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Suppression…" : "Supprimer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
