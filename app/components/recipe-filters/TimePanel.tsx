import { useId } from "react";

import { TIME_PRESETS } from "./filterParams";

type TimePanelProps = {
  value: number | null;
  onChange: (maxTime: number | null) => void;
};

export default function TimePanel({ value, onChange }: TimePanelProps) {
  // Radio groups need a unique `name`. The panel is rendered twice (desktop
  // dropdown + mobile sheet), so a hard-coded name would link both groups.
  const name = useId();

  // A custom value from a link (e.g. ?maxTime=25) gets its own option.
  const options: (number | null)[] = [null, ...TIME_PRESETS];
  if (value !== null && !options.includes(value)) options.push(value);

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="sr-only">Cook time</legend>
      {options.map((option) => (
        <label
          key={option ?? "any"}
          className="flex h-10 cursor-pointer items-center gap-3 rounded-field px-2 text-sm hover:bg-base-300"
        >
          <input
            type="radio"
            name={name}
            className="radio radio-sm radio-primary"
            checked={value === option}
            onChange={() => onChange(option)}
          />
          {option === null ? "Any time" : `Up to ${option} min`}
        </label>
      ))}
    </fieldset>
  );
}
