"use client";

import { useRef, type KeyboardEvent } from "react";

import DifficultyPots from "@/app/components/recipe-details/DifficultyPots";
import { DIFFICULTY_LABELS, DIFFICULTY_LEVELS, type DifficultyLevel } from "@/lib/recipe";

import { required } from "./fieldStyles";

type DifficultyPickerProps = {
  value: number | null;
  onChange: (level: number) => void;
};

/**
 * 5 pot tiles as an accessible radio group ("roving tabindex"): Tab lands on
 * the selected tile only, the arrow keys move the selection -- exactly how
 * native radio buttons behave.
 */
export default function DifficultyPicker({ value, onChange }: DifficultyPickerProps) {
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number) => {
    const wrapped = (index + DIFFICULTY_LEVELS.length) % DIFFICULTY_LEVELS.length;
    onChange(DIFFICULTY_LEVELS[wrapped]);
    tileRefs.current[wrapped]?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      select(index + 1);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      select(index - 1);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span id="difficulty-label" className="text-sm font-semibold">
        Difficulty{required}
      </span>
      <div role="radiogroup" aria-labelledby="difficulty-label" className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {DIFFICULTY_LEVELS.map((level, index) => {
          const checked = value === level;
          const focusable = checked || (value === null && index === 0);
          return (
            <button
              key={level}
              ref={(element) => {
                tileRefs.current[index] = element;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={focusable ? 0 : -1}
              onClick={() => onChange(level)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-3 text-center transition-colors ${
                checked ? "border-primary bg-primary/25 ring-2 ring-primary" : "border-base-300 bg-base-100 hover:border-primary"
              }`}
            >
              <span className="text-sm">
                <DifficultyPots level={level} />
              </span>
              <span className="text-xs font-semibold leading-tight">{DIFFICULTY_LABELS[level as DifficultyLevel]}</span>
            </button>
          );
        })}
      </div>
      <input type="hidden" name="difficulty" value={value ?? ""} />
    </div>
  );
}
