import { AccountList } from "./_components/AccountList";
import { MyContentList } from "./_components/MyContentList";

export default function MePage() {
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA ?? "dev";
  const shortSha = sha.slice(0, 7);

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        paddingTop: "var(--space-lg)",
        paddingBottom: "calc(85px + env(safe-area-inset-bottom) + var(--space-lg))",
      }}
    >
      <h1
        style={{
          margin: 0,
          paddingInline: 14,
          marginBottom: 36,
          fontFamily: "var(--font-sans)",
          fontSize: "var(--font-size-h1)",
          fontWeight: "var(--font-weight-regular)",
          color: "var(--color-ink)",
          lineHeight: "normal",
        }}
      >
        Compte
      </h1>

      <MyContentList />

      <AccountList />

      <p
        style={{
          margin: 0,
          marginTop: 36,
          paddingInline: 16,
          fontFamily: "var(--font-sans)",
          fontSize: 17,
          fontWeight: "var(--font-weight-regular)",
          color: "var(--color-ink)",
          lineHeight: "normal",
        }}
      >
        Version build {shortSha}
      </p>
    </section>
  );
}

export const metadata = { title: "Compte — Guide Foodie Journey" };
