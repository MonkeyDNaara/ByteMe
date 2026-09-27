"use client";

import { useActionState, useEffect, useEffectEvent, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import DeleteRecipeButton from "@/app/components/DeleteRecipeButton";
import RecipeCard from "@/app/components/RecipeCard";
import type { RecipeState } from "@/dbQueries";
import { z } from "zod";

import { scrollBehavior } from "@/lib/motion";
import { getCategoryGroup, IngredientDetail, REQUIRED_CATEGORY_GROUP, type Recipe } from "@/lib/recipe";
import { useFormDraft } from "@/lib/useFormDraft";

import DifficultyPicker from "./DifficultyPicker";
import { fieldClass, hintClass, labelClass, required, textareaClass } from "./fieldStyles";
import IngredientsEditor from "./IngredientsEditor";
import LabelPicker from "./LabelPicker";
import PhotoField from "./PhotoField";
import SectionCard from "./SectionCard";
import StepsEditor, { type StepFormValue } from "./StepsEditor";

export type RecipeFormValues = {
  name: string;
  description: string;
  snippet: string;
  time: number;
  ingredients: IngredientDetail[];
  steps: StepFormValue[];
  categories: string[];
  image_url: string;
  difficulty: number | null;
};

type RecipeFormProps = {
  action: (prevState: RecipeState, formData: FormData) => Promise<RecipeState>;
  /** Pre-fills the form when editing; omitted for create. */
  defaultValues?: RecipeFormValues;
  submitLabel: string;
  pendingLabel: string;
  /** Called after the action reports success (the caller decides where to go). */
  onSuccess: () => void;
  /** Edit mode: shows "Delete recipe" in the bottom bar. */
  deleteRecipeId?: number;
  /** Separate auto-saved draft per form: "create" or "edit:<recipeId>". */
  draftScope: string;
};

// Shape of an auto-saved draft (= the form's state, `time` still as typed).
// Validated when read back from localStorage, see useFormDraft.
const DraftSchema = z.object({
  name: z.string(),
  snippet: z.string(),
  description: z.string(),
  time: z.string(),
  imageUrl: z.string(),
  ingredients: z.array(IngredientDetail),
  steps: z.array(
    z.object({ title: z.string(), description: z.string(), ingredients: z.string(), timeMinutes: z.number().nullable() }),
  ),
  categories: z.array(z.string()),
  difficulty: z.number().int().min(1).max(5).nullable(),
});

const draftTimeFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" });

const SNIPPET_MAX = 90;

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function RecipeForm({
  action,
  defaultValues,
  submitLabel,
  pendingLabel,
  onSuccess,
  deleteRecipeId,
  draftScope,
}: RecipeFormProps) {
  const router = useRouter();

  // Controlled state (instead of defaultValue): the live preview, the
  // checklist and the ✓ on every section need to read these values.
  // Bonus: React no longer resets the fields when the server returns an error.
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [snippet, setSnippet] = useState(defaultValues?.snippet ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [time, setTime] = useState(defaultValues?.time ? String(defaultValues.time) : "");
  const [imageUrl, setImageUrl] = useState(defaultValues?.image_url ?? "");
  const [brokenImageUrl, setBrokenImageUrl] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<IngredientDetail[]>(defaultValues?.ingredients ?? []);
  const [steps, setSteps] = useState<StepFormValue[]>(defaultValues?.steps ?? []);
  const [categories, setCategories] = useState<string[]>(
    (defaultValues?.categories ?? []).map((category) => category.toLowerCase()),
  );
  const [difficulty, setDifficulty] = useState<number | null>(defaultValues?.difficulty ?? null);
  const [showErrors, setShowErrors] = useState(false);

  const [state, formAction, isPending] = useActionState(action, null);

  // --- Auto-saved draft (localStorage) ---------------------------------------
  const draft = useFormDraft({
    scope: draftScope,
    schema: DraftSchema,
    values: { name, snippet, description, time, imageUrl, ingredients, steps, categories, difficulty },
  });

  const restoreDraft = () => {
    if (!draft.pendingDraft) return;
    const values = draft.pendingDraft.values;
    setName(values.name);
    setSnippet(values.snippet);
    setDescription(values.description);
    setTime(values.time);
    setImageUrl(values.imageUrl);
    setIngredients(values.ingredients);
    setSteps(values.steps);
    setCategories(values.categories);
    setDifficulty(values.difficulty);
    draft.markRestored();
  };

  // useEffectEvent (React 19.2): always calls the LATEST onSuccess without
  // making it a dependency. The parents pass a new inline function on every
  // render -- as a dependency, the effect would re-run on each render and
  // navigate / toast several times.
  const handleSuccess = useEffectEvent(() => {
    draft.clear(); // published/saved -> the draft has done its job
    onSuccess();
  });
  useEffect(() => {
    if (state?.success) handleSuccess();
  }, [state]);

  // --- Validation (derived on every render) ---------------------------------
  const isValidUrl = isHttpUrl(imageUrl.trim());
  const imageBroken = brokenImageUrl === imageUrl; // derived: resets itself when the URL changes
  const hasMealType = categories.some((category) => getCategoryGroup(category) === REQUIRED_CATEGORY_GROUP);

  const sections = [
    {
      id: "section-basics",
      label: "The basics",
      done: Boolean(name.trim() && snippet.trim() && description.trim() && Number(time) > 0),
      error: "Fill in name, short description, about this dish and the time.",
    },
    {
      id: "section-photo",
      label: "Photo",
      done: isValidUrl && !imageBroken,
      error: imageBroken ? "This image can't be loaded — try another link." : "Add a valid image link (https://…).",
    },
    { id: "section-ingredients", label: "At least one ingredient", done: ingredients.length > 0, error: "Add at least one ingredient." },
    { id: "section-steps", label: "Cooking steps (optional)", done: steps.length > 0, optional: true, error: "" },
    {
      id: "section-labels",
      label: "Meal type + difficulty",
      done: hasMealType && difficulty !== null,
      error: !hasMealType ? "Pick at least one meal or course type." : "Choose a difficulty.",
    },
  ];
  const missing = sections.filter((section) => !section.optional && !section.done);
  const errorFor = (id: string) => {
    const section = sections.find((s) => s.id === id)!;
    return { done: section.done, showError: showErrors && !section.done && !section.optional, errorText: section.error };
  };

  // Publish is always clickable. If something is missing, jump to the first
  // incomplete section instead of silently doing nothing (a disabled button
  // wouldn't tell anyone WHY it's disabled).
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (missing.length === 0) return;
    event.preventDefault();
    setShowErrors(true);
    const first = document.getElementById(missing[0].id);
    first?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
    first?.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true });
  };

  const handleCancel = () => {
    // A deliberate cancel = "I don't want this" -> no draft next time.
    // (Drafts protect against accidents: closed tab, back swipe, crash.)
    draft.clear();
    if (window.history.length > 1) router.back();
    else router.push("/all-recipes");
  };

  // The live preview renders the real RecipeCard with a "fake" recipe from the form.
  const previewRecipe: Recipe = {
    id: "preview",
    name: name.trim() || "Your recipe name",
    snippet: snippet.trim() || "Your short description shows up here.",
    description,
    time: Number(time) || 0,
    categories,
    difficulty,
    image_url: isValidUrl && !imageBroken ? imageUrl.trim() : "",
    likes: 0,
    ingredients: [],
    ingredientDetails: ingredients,
    steps: [],
    user_id: null,
    author_name: null,
  };

  return (
    // The bottom bar sits OUTSIDE the <form>: the delete button brings its own
    // <form> (inside a dialog), and forms must not be nested in HTML. The
    // Publish button still submits via the `form="recipe-form"` attribute.
    <div className="flex flex-col gap-8">
    {draft.pendingDraft && (
      <div
        role="status"
        className="flex flex-wrap items-center gap-3 rounded-box border border-info/50 bg-info/15 px-4 py-3 sm:px-5"
      >
        <span aria-hidden="true" className="text-2xl">
          📝
        </span>
        <p className="min-w-48 flex-1 text-sm">
          <span className="font-semibold">You have an unsaved draft</span> from{" "}
          {draftTimeFormat.format(draft.pendingDraft.savedAt)}. Restore it?
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={restoreDraft} className="btn btn-primary h-11 rounded-full px-5">
            Restore
          </button>
          <button type="button" onClick={draft.discard} className="btn btn-ghost h-11 rounded-full px-4">
            Discard
          </button>
        </div>
      </div>
    )}
    <form id="recipe-form" action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* 1 · Basics */}
          <SectionCard id="section-basics" number={1} title="The basics" {...errorFor("section-basics")}>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className={labelClass}>
                Recipe name{required}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Vegan Lentil Bolognese"
                className={`${fieldClass} w-full`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="snippet" className={labelClass}>
                Short description{required}
              </label>
              <input
                id="snippet"
                name="snippet"
                type="text"
                value={snippet}
                onChange={(event) => setSnippet(event.target.value)}
                maxLength={SNIPPET_MAX}
                aria-describedby="snippet-hint"
                placeholder="One sentence that makes people hungry"
                className={`${fieldClass} w-full`}
              />
              <p id="snippet-hint" className={`${hintClass} flex justify-between`}>
                <span>Shown on the recipe card</span>
                <span className={snippet.length >= SNIPPET_MAX ? "font-semibold text-warning" : ""}>
                  {snippet.length} / {SNIPPET_MAX} characters
                </span>
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="description" className={labelClass}>
                About this dish{required}
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What makes it special? Where is it from? Any tips?"
                className={textareaClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="time" className={labelClass}>
                Total time{required}
              </label>
              <div className="relative w-40">
                <input
                  id="time"
                  name="time"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  placeholder="45"
                  className={`${fieldClass} w-full pr-14`}
                />
                <span aria-hidden="true" className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-sm text-base-content/70">
                  min
                </span>
              </div>
            </div>
          </SectionCard>

          {/* 2 · Photo */}
          <SectionCard id="section-photo" number={2} title="Photo" {...errorFor("section-photo")}>
            <PhotoField
              url={imageUrl}
              onUrlChange={setImageUrl}
              broken={imageBroken}
              onBroken={setBrokenImageUrl}
              isValidUrl={isValidUrl}
            />
          </SectionCard>

          {/* 3 · Ingredients */}
          <SectionCard id="section-ingredients" number={3} title="Ingredients" {...errorFor("section-ingredients")}>
            <IngredientsEditor value={ingredients} onChange={setIngredients} />
          </SectionCard>

          {/* 4 · Steps (optional) */}
          <SectionCard
            id="section-steps"
            number={4}
            title="Cooking steps"
            {...errorFor("section-steps")}
            badge={<span className="badge border-none bg-accent text-accent-content">Unlocks 🍳 cooking mode</span>}
          >
            <p className={hintClass}>Optional. With steps, your recipe gets a guided cooking mode with timers.</p>
            <StepsEditor value={steps} onChange={setSteps} />
          </SectionCard>

          {/* 5 · Labels & difficulty */}
          <SectionCard id="section-labels" number={5} title="Labels & difficulty" {...errorFor("section-labels")}>
            <LabelPicker value={categories} onChange={setCategories} />
            <DifficultyPicker value={difficulty} onChange={setDifficulty} />
          </SectionCard>
        </div>

        {/* Sidebar: live preview + checklist */}
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-base-content/70">Live preview</span>
            <div aria-hidden="true">
              <RecipeCard recipe={previewRecipe} preview />
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-box border border-base-300 bg-base-200 p-5">
            <h2 className="font-bold">Ready to publish?</h2>
            <ul className="flex flex-col gap-1.5 text-sm">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="flex items-center gap-2 hover:underline">
                    <span aria-hidden="true">{section.done ? "✅" : section.optional ? "➖" : "➕"}</span>
                    <span className={section.done ? "" : "text-base-content/70"}>{section.label}</span>
                    <span className="sr-only">{section.done ? "(done)" : "(missing)"}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {state && !state.success && state.message && (
        <div role="alert" className="alert alert-error">
          <span>⚠️ {state.message}</span>
        </div>
      )}

    </form>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-t border-base-300 bg-base-100/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6">
        <p className="min-w-0 flex-1 text-sm" aria-live="polite">
          {missing.length === 0 ? (
            <span className="font-semibold">All required fields done 🎉</span>
          ) : (
            <span className="text-base-content/70">
              Missing: {missing.map((section) => section.label).join(" · ")}
            </span>
          )}
        </p>
        {deleteRecipeId !== undefined && (
          <DeleteRecipeButton recipeId={deleteRecipeId} redirectTo="/all-recipes" className="h-12 rounded-full" />
        )}
        <button type="button" onClick={handleCancel} className="btn btn-ghost h-12 rounded-full">
          Cancel
        </button>
        <button type="submit" form="recipe-form" disabled={isPending} className="btn btn-primary h-12 rounded-full px-7 text-base font-bold">
          {isPending ? pendingLabel : submitLabel}
        </button>
      </div>
    </div>
  );
}
