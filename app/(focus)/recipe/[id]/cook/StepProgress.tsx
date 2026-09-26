import type { CookingStep } from "@/lib/recipe";

type StepProgressProps = {
  steps: CookingStep[];
  current: number;
  finished: boolean;
  onSelect: (stepIndex: number) => void;
};

/** One clickable segment per step: ✓ on finished steps, the current one bold. */
export default function StepProgress({ steps, current, finished, onSelect }: StepProgressProps) {
  return (
    <nav aria-label="Steps" className="px-4 pt-4 sm:px-8 sm:pt-5">
      <ol className="flex gap-1.5 sm:gap-3">
        {steps.map((step, index) => {
          const done = finished || index < current;
          const active = !finished && index === current;
          return (
            <li key={step.number} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? "step" : undefined}
                className="group flex w-full flex-col gap-2 text-left"
              >
                <span
                  className={`h-1.5 rounded-full transition-colors ${
                    done || active ? "bg-link" : "bg-base-300 group-hover:bg-primary/50"
                  }`}
                />
                <span
                  className={`hidden truncate text-[13px] sm:block ${
                    active ? "font-bold text-base-content" : "text-base-content/60 group-hover:text-base-content"
                  }`}
                >
                  {done && "✓ "}
                  {index + 1} · {step.title || `Step ${index + 1}`}
                </span>
                <span className="sr-only sm:hidden">
                  Step {index + 1}
                  {done ? " (done)" : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
