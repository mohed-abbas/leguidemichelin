"use client";

/**
 * QrPasteUrl — tertiary tier of the /scan entry flow.
 *
 * Wrapped in a native `<details>`/`<summary>` disclosure so it stays
 * visible-on-demand but out of the primary visual hierarchy (CONTEXT.md
 * D-04). The summary label "Problème ? Coller l'URL" matches CONTEXT.md
 * "Specific Ideas" copy. Inside: a controlled shadcn Input + a submit Button.
 *
 * Intentionally NOT react-hook-form: the whole form is one field with one
 * validator (`extractRestaurantId`), and react-hook-form's overhead + error
 * wiring is heavier than a plain useState + toast.error. The login/signup
 * pages use RHF because they have multiple fields; this tier has one.
 *
 * Canonical refs:
 *   - .planning/phases/04-frontend-parallel-wave/04-CONTEXT.md D-04.
 */

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { extractRestaurantId } from "./scan-url";

export function QrPasteUrl() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = extractRestaurantId(value);
    if (!id) {
      toast.error("URL invalide. Format attendu : https://…/scan/<id>");
      return;
    }
    router.push(`/scan/${id}`);
  }

  return (
    <details
      style={{
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        padding: "var(--space-sm) var(--space-md)",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          fontSize: "var(--font-size-sm)",
          color: "var(--color-ink-muted)",
          paddingBlock: "var(--space-xs)",
          listStyle: "revert",
        }}
      >
        Problème ? Coller l&apos;URL
      </summary>
      <form
        onSubmit={onSubmit}
        style={{
          display: "flex",
          gap: "var(--space-sm)",
          marginTop: "var(--space-sm)",
        }}
      >
        <Input
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://…/scan/…"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="URL du QR code"
          style={{ flex: 1 }}
        />
        <Button type="submit" variant="outline">
          Ouvrir
        </Button>
      </form>
    </details>
  );
}
