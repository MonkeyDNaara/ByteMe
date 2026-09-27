"use client";

import { useState, type ReactNode } from "react";

type RecipeBodyTabsProps = {
  ingredients: ReactNode;
  steps: ReactNode | null;
  stepCount: number;
};

/**
 * Phone: "Ingredients / Steps" tabs. From `lg`: both side by side (the tab
 * bar disappears). Both panels are always rendered -- the inactive one is only
 * hidden with CSS below `lg`, so desktop never depends on the tab state.
 */
export default function RecipeBodyTabs({ ingredients, steps, stepCount }: RecipeBodyTabsProps) {
  const [tab, setTab] = useState<"ingredients" | "steps">("ingredients");

  const tabClass = (active: boolean) =>
    `h-10 flex-1 rounded-full text-sm font-semibold transition-colors ${
      active ? "bg-base-200 shadow-sm" : "text-base-content/70"
    }`;

  return (
    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:items-start lg:gap-12">
      {steps && (
        <div role="tablist" aria-label="Recipe sections" className="flex gap-1 rounded-full bg-base-300 p-1 lg:hidden">
          <button
            type="button"
            role="tab"
            id="tab-ingredients"
            aria-selected={tab === "ingredients"}
            aria-controls="panel-ingredients"
            onClick={() => setTab("ingredients")}
            className={tabClass(tab === "ingredients")}
          >
            🥕 Ingredients
          </button>
          <button
            type="button"
            role="tab"
            id="tab-steps"
            aria-selected={tab === "steps"}
            aria-controls="panel-steps"
            onClick={() => setTab("steps")}
            className={tabClass(tab === "steps")}
          >
            👣 Steps ({stepCount})
          </button>
        </div>
      )}

      <div
        id="panel-ingredients"
        role={steps ? "tabpanel" : undefined}
        aria-labelledby={steps ? "tab-ingredients" : undefined}
        className={`${steps && tab !== "ingredients" ? "hidden" : ""} lg:sticky lg:top-24 lg:block`}
      >
        {ingredients}
      </div>

      {steps && (
        <div
          id="panel-steps"
          role="tabpanel"
          aria-labelledby="tab-steps"
          className={`${tab !== "steps" ? "hidden" : ""} lg:block`}
        >
          {steps}
        </div>
      )}
    </div>
  );
}
