"use client";

import { useState } from "react";

import { BadgeRow } from "./BadgeRow";
import { CollectionList } from "./CollectionList";
import { ExperiencesPanel } from "./ExperiencesPanel";
import { RewardCard } from "./RewardCard";
import { StarCountHero } from "./StarCountHero";
import type { BestExperienceChip } from "./BestExperiencesGrid";
import type { ExperienceCardData } from "./ExperienceCard";
import type { CollectionItem } from "../_data";

type Tab = "etoiles" | "experiences";

export function ChasseurTabs({
  items,
  starCount,
  bestExperiences,
  experiences,
}: {
  items: CollectionItem[];
  starCount: number;
  bestExperiences: BestExperienceChip[];
  experiences: ExperienceCardData[];
}) {
  const [tab, setTab] = useState<Tab>("etoiles");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        paddingBottom: 32,
      }}
    >
      <div
        role="tablist"
        aria-label="Chasseur d’étoiles"
        style={{
          display: "flex",
          gap: 14,
          paddingInline: 16,
          paddingTop: 24,
        }}
      >
        <TabButton
          label="Mes étoiles"
          active={tab === "etoiles"}
          onClick={() => setTab("etoiles")}
          controls="tabpanel-etoiles"
        />
        <TabButton
          label="Mes expériences"
          active={tab === "experiences"}
          onClick={() => setTab("experiences")}
          controls="tabpanel-experiences"
        />
      </div>

      {tab === "etoiles" ? (
        <section
          id="tabpanel-etoiles"
          role="tabpanel"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 32,
            paddingTop: 24,
          }}
        >
          <StarCountHero count={starCount} />
          <BadgeRow />
          <CollectionList items={items} />
          <RewardCard />
        </section>
      ) : (
        <section id="tabpanel-experiences" role="tabpanel">
          <ExperiencesPanel bestExperiences={bestExperiences} experiences={experiences} />
        </section>
      )}
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
  controls,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  controls: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      style={{
        flex: 1,
        height: 37,
        borderRadius: 8,
        border: active ? "1px solid var(--color-ink)" : "1px solid transparent",
        background: "var(--color-surface)",
        color: "var(--color-ink)",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: "var(--font-weight-bold)",
        lineHeight: "16.2px",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}
