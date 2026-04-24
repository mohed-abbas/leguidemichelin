import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ImageOff, QrCode, UtensilsCrossed } from "lucide-react";
import { getServerSession } from "@/lib/get-server-session";
import { serverApi } from "@/lib/server-api";
import type { DishResponseType, RestaurantResponseType } from "@repo/shared-schemas";

const STAR_LABELS: Record<string, string> = {
  BIB: "Bib Gourmand",
  ONE: "1 étoile",
  TWO: "2 étoiles",
  THREE: "3 étoiles",
};

const STAR_SYMBOLS: Record<string, string> = {
  BIB: "🍽",
  ONE: "⭐",
  TWO: "⭐⭐",
  THREE: "⭐⭐⭐",
};

function formatPriceEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default async function PortalDashboardPage() {
  const session = await getServerSession();
  if (!session || session.user.role !== "RESTAURANT_STAFF") {
    redirect("/portal/login");
  }

  const restaurantId = session.user.restaurantId;
  let restaurant: RestaurantResponseType | null = null;
  let dishes: DishResponseType[] = [];

  if (restaurantId) {
    const [restaurantResult, dishesResult] = await Promise.allSettled([
      serverApi.get<RestaurantResponseType>(`/restaurants/${restaurantId}`),
      serverApi.get<{ items: DishResponseType[] }>("/portal/dishes"),
    ]);
    if (restaurantResult.status === "fulfilled") restaurant = restaurantResult.value;
    if (dishesResult.status === "fulfilled") dishes = dishesResult.value.items;
  }

  const dishCount = dishes.length;
  const dishesWithPhoto = dishes.filter((d) => d.defaultImageKey).length;
  const photoCoverage = dishCount > 0 ? Math.round((dishesWithPhoto / dishCount) * 100) : 0;
  const staffName = session.user.name ?? session.user.email;

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xl)",
        maxWidth: "1040px",
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--font-size-sm)",
            color: "var(--color-ink-muted)",
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          Portail restaurateur
        </p>
        <h1
          style={{
            fontSize: "var(--font-size-h1)",
            fontWeight: "var(--font-weight-semibold)",
            lineHeight: "var(--line-height-xl)",
            margin: 0,
          }}
        >
          Bonjour, {staffName}
        </h1>
      </header>

      {restaurant ? (
        <article
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div
            style={{
              padding: "var(--space-xl)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-sm)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-xs)",
                fontSize: "var(--font-size-sm)",
                color: "var(--color-ink-muted)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--color-primary)",
                }}
                aria-hidden
              />
              <span>Votre établissement</span>
            </div>
            <h2
              style={{
                margin: 0,
                fontSize: "var(--font-size-xl)",
                fontWeight: "var(--font-weight-semibold)",
                lineHeight: "var(--line-height-xl)",
              }}
            >
              {restaurant.name}
            </h2>
            <p
              style={{
                margin: 0,
                color: "var(--color-ink-muted)",
                fontSize: "var(--font-size-base)",
              }}
            >
              {restaurant.city}
              {restaurant.cuisine ? ` · ${restaurant.cuisine}` : ""}
            </p>
            <p
              style={{
                margin: 0,
                color: "var(--color-ink-subtle)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {restaurant.address}
            </p>
            <div
              style={{
                marginTop: "var(--space-sm)",
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-xs)",
                padding: "var(--space-xs) var(--space-sm)",
                background: "var(--color-surface-muted)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-full)",
                fontSize: "var(--font-size-xs)",
                color: "var(--color-ink)",
                width: "fit-content",
              }}
            >
              <span aria-label={STAR_LABELS[restaurant.michelinRating]}>
                {STAR_SYMBOLS[restaurant.michelinRating]}
              </span>
              <span>{STAR_LABELS[restaurant.michelinRating]}</span>
            </div>
          </div>
          {restaurant.heroImageKey ? (
            <div
              style={{
                width: "240px",
                background: "var(--color-surface-muted)",
                overflow: "hidden",
              }}
            >
              <img
                src={`/api/images/${restaurant.heroImageKey}`}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          ) : null}
        </article>
      ) : (
        <article
          role="alert"
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-lg)",
            color: "var(--color-ink-muted)",
          }}
        >
          Impossible de charger les informations de votre établissement. Réessayez plus tard.
        </article>
      )}

      <div
        style={{
          display: "grid",
          gap: "var(--space-md)",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <StatCard
          icon={<UtensilsCrossed size={18} aria-hidden />}
          label="Plats au menu"
          value={dishCount.toString()}
          hint={dishCount === 0 ? "Ajoutez votre premier plat" : `${dishesWithPhoto} avec photo`}
        />
        <StatCard
          icon={<ImageOff size={18} aria-hidden />}
          label="Couverture photos"
          value={dishCount === 0 ? "—" : `${photoCoverage}%`}
          hint={
            dishCount === 0
              ? "Pas encore de plats"
              : photoCoverage === 100
                ? "Tous vos plats ont une photo"
                : `${dishCount - dishesWithPhoto} plat${dishCount - dishesWithPhoto > 1 ? "s" : ""} sans photo`
          }
          accent={dishCount > 0 && photoCoverage < 100 ? "warning" : "success"}
        />
        <StatCard
          icon={<QrCode size={18} aria-hidden />}
          label="QR Code"
          value="Prêt"
          hint="À imprimer et afficher en salle"
        />
      </div>

      <div
        style={{
          display: "grid",
          gap: "var(--space-md)",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        <ActionCard
          href="/portal/menu"
          title="Gérer le menu"
          description="Ajoutez, modifiez et illustrez les plats de votre carte."
          cta="Ouvrir le menu"
        />
        <ActionCard
          href="/portal/qr"
          title="Imprimer le QR Code"
          description="Téléchargez le QR en PNG ou SVG pour l'afficher en salle."
          cta="Voir le QR"
        />
      </div>

      {dishCount > 0 ? (
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
          <header
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              Aperçu de la carte
            </h2>
            <Link
              href="/portal/menu"
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-primary)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "var(--space-xs)",
              }}
            >
              Tout voir <ArrowRight size={14} aria-hidden />
            </Link>
          </header>
          <div
            style={{
              display: "grid",
              gap: "var(--space-md)",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            }}
          >
            {dishes.slice(0, 4).map((dish) => (
              <article
                key={dish.id}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: "120px",
                    background: "var(--color-surface-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-ink-subtle)",
                  }}
                >
                  {dish.defaultImageKey ? (
                    <img
                      src={`/api/images/${dish.defaultImageKey}`}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <ImageOff size={24} aria-hidden />
                  )}
                </div>
                <div
                  style={{
                    padding: "var(--space-md)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-xs)",
                  }}
                >
                  <span
                    style={{
                      fontWeight: "var(--font-weight-semibold)",
                      fontSize: "var(--font-size-base)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {dish.name}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    {formatPriceEUR(dish.priceCents)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section
          style={{
            background: "var(--color-surface)",
            border: "1px dashed var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-2xl)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
            alignItems: "center",
          }}
        >
          <UtensilsCrossed size={32} aria-hidden style={{ color: "var(--color-ink-subtle)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            <h3
              style={{
                margin: 0,
                fontSize: "var(--font-size-lg)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              Votre carte est vide
            </h3>
            <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
              Ajoutez des plats pour que les diners puissent les scanner.
            </p>
          </div>
          <Link
            href="/portal/menu"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-xs)",
              padding: "var(--space-sm) var(--space-lg)",
              background: "var(--color-primary)",
              color: "var(--color-primary-fg)",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              fontWeight: "var(--font-weight-semibold)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            Ajouter un plat <ArrowRight size={14} aria-hidden />
          </Link>
        </section>
      )}
    </section>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent?: "success" | "warning";
}) {
  const accentColor =
    accent === "warning"
      ? "var(--color-warning)"
      : accent === "success"
        ? "var(--color-success)"
        : "var(--color-ink-muted)";
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-lg)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xs)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-xs)",
          color: "var(--color-ink-muted)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        {icon}
        <span>{label}</span>
      </div>
      <span
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          lineHeight: "var(--line-height-xl)",
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          color: accentColor,
        }}
      >
        {hint}
      </span>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  cta,
}: {
  href: string;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-lg)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-sm)",
        textDecoration: "none",
        color: "inherit",
        transition:
          "border-color var(--duration-fast) var(--ease-standard), box-shadow var(--duration-fast) var(--ease-standard)",
      }}
    >
      <span
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-semibold)",
        }}
      >
        {title}
      </span>
      <span
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-ink-muted)",
          lineHeight: "var(--line-height-sm)",
        }}
      >
        {description}
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-xs)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--color-primary)",
          marginTop: "var(--space-xs)",
        }}
      >
        {cta} <ArrowRight size={14} aria-hidden />
      </span>
    </Link>
  );
}
