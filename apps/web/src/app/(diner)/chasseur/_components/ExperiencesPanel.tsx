"use client";

import { useMemo, useState } from "react";

import { BestExperiencesGrid, type BestExperienceChip } from "./BestExperiencesGrid";
import { ExperienceCard, type ExperienceCardData } from "./ExperienceCard";
import { ExperiencesSearchBar } from "./ExperiencesSearchBar";

export function ExperiencesPanel({
  bestExperiences,
  experiences,
}: {
  bestExperiences: BestExperienceChip[];
  experiences: ExperienceCardData[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return experiences;
    return experiences.filter((x) => {
      const haystack = [x.restaurantName, x.createdAt, x.dishName, x.note ?? ""]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [experiences, query]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        paddingTop: 24,
      }}
    >
      <ExperiencesSearchBar value={query} onChange={setQuery} />

      <BestExperiencesGrid items={bestExperiences} />

      {filtered.length === 0 ? (
        <div
          style={{
            paddingInline: 16,
            paddingBlock: 40,
            textAlign: "center",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--font-size-md)",
            color: "var(--color-ink-muted)",
          }}
        >
          Aucune expérience trouvée.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 36,
            paddingTop: 8,
          }}
        >
          {filtered.map((exp) => (
            <ExperienceCard key={exp.souvenirId} data={exp} />
          ))}
        </div>
      )}
    </div>
  );
}
