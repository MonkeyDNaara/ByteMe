"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { scrollBehavior, usePrefersReducedMotion } from "@/lib/motion";

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
  "hit-area relative flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors hover:bg-base-300 disabled:opacity-30 disabled:hover:bg-transparent";

// Stable ids for drag & drop. A sortable list can't use `key={index}`: when a
// card moves, React (and dnd-kit) would keep the POSITION's identity instead
// of the card's. Each step object gets an id the first time we see it -- like
// a primary key vs. a row number. Moving a step keeps the same object (same
// id); editing creates a new object (new id), which is fine. A WeakMap lets
// removed steps be garbage-collected, and the ids never reach the server.
const stepIds = new WeakMap<StepFormValue, string>();
let nextStepId = 0;
function idFor(step: StepFormValue): string {
  let id = stepIds.get(step);
  if (!id) {
    nextStepId += 1;
    id = `step-${nextStepId}`;
    stepIds.set(step, id);
  }
  return id;
}

/** Controlled like IngredientsEditor: the steps live in the parent, the draft card here. */
export default function StepsEditor({ value, onChange }: StepsEditorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [minutes, setMinutes] = useState("");
  // null = the draft card adds a new step; otherwise the step being edited.
  // Tracked by object (not index), so it stays right when steps are moved.
  const [editing, setEditing] = useState<StepFormValue | null>(null);
  const draftRef = useRef<HTMLDivElement>(null);
  const dndId = useId();

  const ids = value.map(idFor);
  const positionOf = (id: UniqueIdentifier) => ids.indexOf(String(id)) + 1;

  const sensors = useSensors(
    // 5px before a drag starts, so a normal click/tap on the handle doesn't count as a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    // Keyboard: focus the handle, Space to pick up, arrow keys to move, Space to drop.
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Screen-reader messages in "step 3" words instead of internal ids.
  const announcements: Announcements = {
    onDragStart: ({ active }) => `Picked up step ${positionOf(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over ? `Step ${positionOf(active.id)} is over position ${positionOf(over.id)}.` : "Not over a position.",
    onDragEnd: ({ active, over }) =>
      over ? `Step ${positionOf(active.id)} moved to position ${positionOf(over.id)}.` : "Step dropped.",
    onDragCancel: ({ active }) => `Moving step ${positionOf(active.id)} was cancelled.`,
  };

  const resetDraft = () => {
    setTitle("");
    setDescription("");
    setIngredients("");
    setMinutes("");
    setEditing(null);
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
    onChange(editing === null ? [...value, step] : value.map((s) => (s === editing ? step : s)));
    resetDraft();
  };

  const startEdit = (step: StepFormValue) => {
    setTitle(step.title);
    setDescription(step.description);
    setIngredients(step.ingredients);
    setMinutes(step.timeMinutes != null ? String(step.timeMinutes) : "");
    setEditing(step);
    draftRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: "center" });
  };

  const remove = (index: number) => {
    if (value[index] === editing) resetDraft();
    onChange(value.filter((_, i) => i !== index));
  };

  // ↑ / ↓ stay as the non-drag alternative (WCAG 2.2 · 2.5.7 Dragging Movements).
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    onChange(arrayMove(value, index, target));
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onChange(arrayMove(value, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
  };

  const draftNumber = editing === null ? value.length + 1 : value.indexOf(editing) + 1;

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          accessibility={{
            announcements,
            screenReaderInstructions: {
              draggable:
                "To reorder, press Space to pick up the step, use the arrow keys to move it, and Space again to drop it. Press Escape to cancel.",
            },
          }}
        >
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ol className="flex flex-col gap-3">
              {value.map((step, index) => (
                <SortableStep key={ids[index]} id={ids[index]} number={index + 1} isEditing={step === editing}>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-bold">{step.title || `Step ${index + 1}`}</span>
                    <p className="text-sm leading-relaxed text-base-content/75">{step.description}</p>
                    {(step.ingredients || step.timeMinutes) && (
                      <p className="text-sm text-base-content/70">
                        {[step.ingredients && `🥣 ${step.ingredients}`, step.timeMinutes && `⏱ ${step.timeMinutes} min`]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-start">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move step ${index + 1} up`}
                      className={iconButton}
                    >
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
                    <button type="button" onClick={() => startEdit(step)} aria-label={`Edit step ${index + 1}`} className={iconButton}>
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
                </SortableStep>
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      {/* Draft card: adds a new step or edits an existing one */}
      <div ref={draftRef} className="flex flex-col gap-3 rounded-2xl border-2 border-dashed border-primary/50 p-4">
        <span className="text-sm font-bold text-link">
          {editing === null ? `Step ${draftNumber}` : `Editing step ${draftNumber}`}
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
            {editing === null ? "+ Add step" : "Save step"}
          </button>
          {editing !== null && (
            <button type="button" onClick={resetDraft} className="btn btn-ghost h-11 rounded-full">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Unchanged format for the server action (the ids stay client-side) */}
      {value.map((step, index) => (
        <input key={ids[index]} type="hidden" name="steps" value={JSON.stringify(step)} />
      ))}
    </div>
  );
}

type SortableStepProps = {
  id: string;
  number: number;
  isEditing: boolean;
  children: ReactNode;
};

/** One draggable step card. Only the ⠿ handle starts a drag, so scrolling on a phone still works. */
function SortableStep({ id, number, isEditing, children }: SortableStepProps) {
  const reduceMotion = usePrefersReducedMotion();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    // The "slide aside" animation is an inline style, so `motion-safe:` can't turn it off.
    transition: reduceMotion ? null : undefined,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex gap-3 rounded-2xl border bg-base-100 p-4 sm:gap-4 ${
        isEditing ? "border-primary" : "border-base-300"
      } ${isDragging ? "relative z-10 shadow-xl ring-2 ring-primary" : ""}`}
    >
      {/* Phones: handle above the number (saves width); side by side from sm. */}
      <div className="flex shrink-0 flex-col items-center gap-1 sm:flex-row sm:items-start sm:gap-2">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Drag step ${number} to reorder`}
          // touch-none: on phones the handle drags instead of scrolling the page.
          className={`${iconButton} shrink-0 cursor-grab touch-none text-lg text-base-content/70 active:cursor-grabbing`}
        >
          ⠿
        </button>
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-content"
        >
          {number}
        </span>
      </div>
      {children}
    </li>
  );
}
