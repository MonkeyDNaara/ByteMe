import type { CookingStep } from "@/lib/recipe";

const badgeClass = "inline-flex items-center gap-1.5 rounded-full bg-base-300 px-3 py-1 text-sm";

/** Numbered steps with 🥣 ingredient and ⏱ timer badges. */
export default function StepList({ steps }: { steps: CookingStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step) => (
        <li
          key={step.number}
          className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4 border-b border-base-300 py-5 last:border-b-0"
        >
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-primary-content"
          >
            {step.number}
          </span>
          <div className="flex flex-col gap-2">
            <h3 className="text-[17px] font-bold">
              <span className="sr-only">Step {step.number}: </span>
              {step.title}
            </h3>
            <p className="leading-relaxed text-base-content/80">{step.description}</p>
            {(step.ingredients.trim() || step.timeMinutes) && (
              <div className="flex flex-wrap gap-2">
                {step.ingredients.trim() && <span className={badgeClass}>🥣 {step.ingredients}</span>}
                {step.timeMinutes ? <span className={badgeClass}>⏱ {step.timeMinutes} min</span> : null}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
