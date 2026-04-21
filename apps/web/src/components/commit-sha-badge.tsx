/**
 * Renders the commit SHA at build time (NEXT_PUBLIC_BUILD_SHA env var).
 * Visually tiny; helps verify which build is running (PITFALLS #5 / UI-SPEC).
 */
export function CommitShaBadge() {
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev";
  const short = sha.slice(0, 7);
  return (
    <span
      className="text-foreground-muted"
      style={{ fontSize: "var(--font-size-sm)" }}
      aria-label={`Build ${short}`}
      title={sha}
    >
      v {short}
    </span>
  );
}
