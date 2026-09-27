"use client";

import { chipClass } from "@/app/components/recipe-filters/chipClass";
import { CATEGORY_GROUPS, REQUIRED_CATEGORY_GROUP } from "@/lib/recipe";

import { required } from "./fieldStyles";

type LabelPickerProps = {
  /** Selected label values (lowercase). */
  value: string[];
  onChange: (labels: string[]) => void;
};

/** CATEGORY_GROUPS as toggle chips (buttons with aria-pressed) instead of checkboxes. */
export default function LabelPicker({ value, onChange }: LabelPickerProps) {
  const toggle = (label: string) =>
    onChange(value.includes(label) ? value.filter((item) => item !== label) : [...value, label]);

  return (
    <div className="flex flex-col gap-5">
      {CATEGORY_GROUPS.map((group) => (
        <fieldset key={group.name} className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold">
            {group.name}
            {group.name === REQUIRED_CATEGORY_GROUP && required}
          </legend>
          <div className="flex flex-wrap gap-2">
            {group.options.map(({ value: optionValue, label }) => {
              const active = value.includes(optionValue);
              return (
                <button
                  key={optionValue}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(optionValue)}
                  className={chipClass(active)}
                >
                  {label}
                  {active && <span aria-hidden="true">✓</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {/* Same repeated "categories" fields the checkboxes used to send */}
      {value.map((label) => (
        <input key={label} type="hidden" name="categories" value={label} />
      ))}
    </div>
  );
}
