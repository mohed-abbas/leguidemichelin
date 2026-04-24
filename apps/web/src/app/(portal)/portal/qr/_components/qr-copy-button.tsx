"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrCopyButtonProps {
  url: string;
}

export function QrCopyButton({ url }: QrCopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (insecure context, permission denied) — silently noop.
    }
  }

  return (
    <Button type="button" variant="outline" onClick={handleCopy} aria-live="polite">
      {copied ? (
        <>
          <Check size={14} aria-hidden style={{ marginRight: "var(--space-xs)" }} />
          Copié
        </>
      ) : (
        <>
          <Copy size={14} aria-hidden style={{ marginRight: "var(--space-xs)" }} />
          Copier le lien
        </>
      )}
    </Button>
  );
}
