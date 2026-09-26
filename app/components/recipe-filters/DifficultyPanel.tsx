import { DIFFICULTY_EMOJI, DIFFICULTY_LABELS, type DifficultyLevel } from "@/lib/recipe";

type DifficultyPanelProps = {
  /** Levels that exist in the current recipe list. */
  levels: number[];
  selected: number[];
  onToggle: (level: number) => void;
};

export default function DifficultyPanel({ levels, selected, onToggle }: DifficultyPanelProps) {
  if (levels.length === 0) {
    return <p className="px-2 py-1 text-sm text-base-content/60">No rated recipes yet.</p>;
  }

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="sr-only">Difficulty</legend>
      {levels.map((level) => (
        <label
          key={level}
          className="flex h-10 cursor-pointer items-center gap-3 whitespace-nowrap rounded-field px-2 text-sm hover:bg-base-300"
        >
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={selected.includes(level)}
            onChange={() => onToggle(level)}
          />
          <span aria-hidden="true" className="tracking-tighter">
            {Array.from({ length: 5 }, (_, index) => (
              <span key={index} className={index < level ? "" : "opacity-25"}>
                {DIFFICULTY_EMOJI}
              </span>
            ))}
          </span>
          <span>{DIFFICULTY_LABELS[level as DifficultyLevel]}</span>
        </label>
      ))}
    </fieldset>
  );
}
