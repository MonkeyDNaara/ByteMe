"use client";

import { useId, useState } from "react";

import { authInputClass, authLabelClass } from "./authStyles";

type PasswordFieldProps = {
  label: string;
  autoComplete: "current-password" | "new-password";
  /** Sign-up / reset: show the live strength hint. */
  showStrength?: boolean;
  /** Optional element on the label line, e.g. "Forgot password?". */
  labelAside?: React.ReactNode;
};

const MIN_LENGTH = 8;

/**
 * 0-3 points. Only a HINT -- the real rule is still "at least 8 characters",
 * which is what the server action checks.
 */
function strengthOf(password: string): number {
  if (password.length < MIN_LENGTH) return password.length > 0 ? 1 : 0;
  let score = 1;
  if (/[a-zA-Z]/.test(password) && /\d/.test(password)) score++;
  if (password.length >= 12 || /[^a-zA-Z0-9]/.test(password)) score++;
  return score;
}

const STRENGTH_LABELS = ["", "Too short", "Good", "Strong"];

export default function PasswordField({ label, autoComplete, showStrength = false, labelAside }: PasswordFieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const [visible, setVisible] = useState(false);
  // Only tracked for the strength hint; the input itself stays uncontrolled
  // for the server action (it reads the value from FormData).
  const [value, setValue] = useState("");

  const strength = strengthOf(value);
  const longEnough = value.length >= MIN_LENGTH;
  const barColor = strength >= 3 ? "bg-success" : strength === 2 ? "bg-success/70" : "bg-warning";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={authLabelClass}>
          {label}
        </label>
        {labelAside}
      </div>

      <div className="relative">
        <input
          id={id}
          name="password"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          minLength={autoComplete === "new-password" ? MIN_LENGTH : undefined}
          required
          onChange={(event) => setValue(event.target.value)}
          aria-describedby={showStrength ? hintId : undefined}
          className={`${authInputClass} pr-20`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-pressed={visible}
          aria-controls={id}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 h-9 -translate-y-1/2 rounded-xl bg-base-300 px-3 text-[13px] font-semibold transition-colors hover:bg-base-content/15"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {showStrength && (
        <div id={hintId} className="flex flex-col gap-1.5 pt-1">
          <div className="flex gap-1" aria-hidden="true">
            {[1, 2, 3].map((step) => (
              <span
                key={step}
                className={`h-1.5 flex-1 rounded-full transition-colors ${strength >= step ? barColor : "bg-base-300"}`}
              />
            ))}
          </div>
          <span className={`text-[13px] ${longEnough ? "font-medium text-success" : "text-base-content/60"}`}>
            {longEnough ? "✓" : "○"} At least {MIN_LENGTH} characters
            {value && <span className="sr-only">. Strength: {STRENGTH_LABELS[strength]}</span>}
          </span>
        </div>
      )}
    </div>
  );
}
