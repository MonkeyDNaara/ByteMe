export type FilterPill = { key: string; label: string; onRemove: () => void };

type ActiveFilterPillsProps = {
  pills: FilterPill[];
  onClearAll: () => void;
  /** Result count shown in front of the pills (desktop bar). */
  count?: number;
};

export default function ActiveFilterPills({ pills, onClearAll, count }: ActiveFilterPillsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {count !== undefined && (
        <span className="font-bold" aria-live="polite">
          {count} {count === 1 ? "recipe" : "recipes"}
        </span>
      )}
      {count !== undefined && pills.length > 0 && (
        <span aria-hidden="true" className="text-base-content/40">
          ·
        </span>
      )}
      {pills.map((pill) => (
        <button
          key={pill.key}
          type="button"
          onClick={pill.onRemove}
          className="flex h-8 items-center gap-1.5 rounded-full bg-primary/25 px-3 transition-colors hover:bg-primary/40"
        >
          {pill.label}
          <span aria-hidden="true">✕</span>
          <span className="sr-only">(remove filter)</span>
        </button>
      ))}
      {pills.length > 0 && (
        <button type="button" onClick={onClearAll} className="px-1 font-semibold text-link hover:underline">
          Clear all
        </button>
      )}
    </div>
  );
}
