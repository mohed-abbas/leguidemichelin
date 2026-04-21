import { CommitShaBadge } from "./commit-sha-badge";

/**
 * Footer disclaimer — REQUIRED on every page of both route groups
 * (DEMO-04 + PITFALLS #11 — UI-SPEC "Footer Disclaimer").
 */
export function FooterDisclaimer({
  align = "center",
}: {
  align?: "center" | "left";
}) {
  return (
    <footer
      role="contentinfo"
      className="flex w-full items-center justify-between gap-4 text-foreground-muted"
      style={{
        padding: "var(--space-lg) var(--space-md)",
        fontSize: "var(--font-size-sm)",
        textAlign: align,
      }}
    >
      <div style={{ textAlign: align, flex: 1 }}>
        <p style={{ margin: 0 }}>Non affilié à ou approuvé par le Guide Michelin.</p>
        <p style={{ margin: 0 }}>
          Not affiliated with or endorsed by Le Guide Michelin.
        </p>
      </div>
      <CommitShaBadge />
    </footer>
  );
}
