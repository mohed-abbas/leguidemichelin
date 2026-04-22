"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  redirectTo?: string;
  children?: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>["variant"];
}

export function LogoutButton({
  redirectTo = "/login",
  children = "Se déconnecter",
  variant = "outline",
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await authClient.signOut();
      router.replace(redirectTo);
      // Refresh so any server-component session reads invalidate immediately.
      router.refresh();
    } catch {
      toast.error("Impossible de se déconnecter, réessayez.");
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant={variant} onClick={handleClick} disabled={loading}>
      {loading ? "Déconnexion…" : children}
    </Button>
  );
}
