"use client";

import { useRef, useState } from "react";

import { fieldClass, textareaClass } from "./fieldStyles";

export type StepFormValue = {
  title: string;
  description: string;
  ingredients: string;
  timeMinutes: number | null;
};

type StepsEditorProps = {
  value: StepFormValue[];
  onChange: (steps: StepFormValue[]) => void;
};

const iconButton =
  "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors hover:bg-base-300 disabled:opacity-30 disabled:hover:bg-transparent";

/** Controlled like IngredientsEditor: the steps live in the parent, the draft card here. */
export default function StepsEditor({ value, onChange }: StepsEditorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [minutes, setMinutes] = useState("");
  // null = the draft card adds a new step; a number = it edits that step.
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const draftRef = useRef<HTMLDivElement>(null);

  const resetDraft = () => {
    setTitle("");
    setDescription("");
    setIngredients("");
    setMinutes("");
    setEditingIndex(null);
  };

  const save = () => {
    const trimmedDescription = description.trim();
    if (!trimmedDescription) return;
    const parsed = minutes.trim() === "" ? null : Number(minutes);
    const step: StepFormValue = {
      title: title.trim(),
      description: trimmedDescription,
      ingredients: ingredients.trim(),
      timeMinutes: parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : null,
    };
    onChange(editingIndex === null ? [...value, step] : value.map((s, i) => (i === editingIndex ? step : s)));
    resetDraft();
  };

  const startEdit = (index: number) => {
    const step = value[index];
    setTitle(step.title);
    setDescription(step.description);
    setIngredients(step.ingredients);
    setMinutes(step.timeMinutes != null ? String(step.timeMinutes) : "");
    setEditingIndex(index);
    draftRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const remove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
    if (editingIndex === index) resetDraft();
    else if (editingIndex !== null && index < editingIndex) setEditingIndex(editingIndex - 1);
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
    if (editingIndex === index) setEditingIndex(target);
    else if (editingIndex === target) setEditingIndex(index);
  };

  const draftNumber = editingIndex === null ? value.length + 1 : editingIndex + 1;

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <ol className="flex flex-col gap-3">
          {value.map((step, index) => (
            <li
              key={index}
              className={`flex gap-4 rounded-2xl border bg-base-100 p-4 ${
                editingIndex === index ? "border-primary" : "border-base-300"
              }`}
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-content"
              >
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-bold">{step.title || `Step ${index + 1}`}</span>
                <p className="text-sm leading-relaxed text-base-content/75">{step.description}</p>
                {(step.ingredients || step.timeMinutes) && (
                  <p className="text-sm text-base-content/60">
                    {[step.ingredients && `🥣 ${step.ingredients}`, step.timeMinutes && `⏱ ${step.timeMinutes} min`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-start">
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move step ${index + 1} up`} className={iconButton}>
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === value.length - 1}
                  aria-label={`Move step ${index + 1} down`}
                  className={iconButton}
                >
                  ↓
                </button>
                <button type="button" onClick={() => startEdit(index)} aria-label={`Edit step ${index + 1}`} className={iconButton}>
                  ✏️
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Delete step ${index + 1}`}
                  className={`${iconButton} hover:bg-error/15 hover:text-error`}
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {/* Draft card: adds a new step or edits an existing one */}
      <div ref={draftRef} className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-primary/50 p-4">
        <span className="text-sm font-bold text-link">
          {editingIndex === null ? `Step ${draftNumber}` : `Editing step ${draftNumber}`}
        </span>
        <label htmlFor="step-title" className="sr-only">
          Step title
        </label>
        <input
          id="step-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title (optional), e.g. Simmer"
          className={`${fieldClass} w-full`}
        />
        <label htmlFor="step-description" className="sr-only">
          Step description
        </label>
        <textarea
          id="step-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What happens in this step?"
          rows={2}
          className={textareaClass}
        />
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          <label htmlFor="step-ingredients" className="sr-only">
            Ingredients used in this step
          </label>
          <input
            id="step-ingredients"
            type="text"
            value={ingredients}
            onChange={(event) => setIngredients(event.target.value)}
            placeholder="🥣 Ingredients used (optional)"
            className={`${fieldClass} min-w-40 flex-1`}
          />
          <label htmlFor="step-minutes" className="sr-only">
            Timer in minutes
          </label>
          <input
            id="step-minutes"
            type="number"
            step="any"
            min="0"
            inputMode="decimal"
            value={minutes}
            onChange={(event) => setMinutes(event.target.value)}
            placeholder="⏱ min"
            className={`${fieldClass} w-28`}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={save} disabled={!description.trim()} className="btn btn-primary h-11 rounded-full px-5 font-bold">
            {editingIndex === null ? "+ Add step" : "Save step"}
          </button>
          {editingIndex !== null && (
            <button type="button" onClick={resetDraft} className="btn btn-ghost h-11 rounded-full">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Unchanged format for the server action */}
      {value.map((step, index) => (
        <input key={index} type="hidden" name="steps" value={JSON.stringify(step)} />
      ))}
    </div>
  );
}
