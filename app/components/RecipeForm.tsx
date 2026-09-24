"use client";

import {
  type SyntheticEvent,
  useActionState,
  useEffect,
  useState,
} from "react";

import type { RecipeState } from "@/dbQueries";
import {
  CATEGORY_GROUPS,
  DIFFICULTY_EMOJI,
  DIFFICULTY_LABELS,
  DIFFICULTY_LEVELS,
  formatIngredientLine,
  getCategoryGroup,
  type IngredientDetail,
  INGREDIENT_UNITS,
  REQUIRED_CATEGORY_GROUP,
} from "@/lib/recipe";

// `number` is left out -- it's never edited directly, just the step's
// position in the array (see dbQueries.ts's replaceSteps), so the editing
// state only needs to track the fields a step actually carries.
type StepFormValue = {
  description: string;
  ingredients: string;
  timeMinutes: number | null;
};

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
  /** Pre-fills the form when editing an existing recipe; omitted for create. */
  defaultValues?: RecipeFormValues;
  submitLabel: string;
  pendingLabel: string;
  /** Called after the action reports success (the caller decides where to navigate). */
  onSuccess: () => void;
};

export default function RecipeForm({
  action,
  defaultValues,
  submitLabel,
  pendingLabel,
  onSuccess,
}: RecipeFormProps) {
  const [ingredientName, setIngredientName] = useState("");
  const [ingredientAmount, setIngredientAmount] = useState("");
  const [ingredientUnit, setIngredientUnit] = useState("");
  const [ingredients, setIngredients] = useState<IngredientDetail[]>(
    defaultValues?.ingredients ?? [],
  );
  const [ingredientsError, setIngredientsError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [stepDescription, setStepDescription] = useState("");
  const [stepIngredients, setStepIngredients] = useState("");
  const [stepTimeMinutes, setStepTimeMinutes] = useState("");
  const [steps, setSteps] = useState<StepFormValue[]>(
    defaultValues?.steps ?? [],
  );

  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state?.success) onSuccess();
  }, [state, onSuccess]);

  const addIngredient = () => {
    const name = ingredientName.trim();
    if (!name) return;

    const parsedAmount =
      ingredientAmount.trim() === "" ? null : Number(ingredientAmount);
    const amount =
      parsedAmount != null && Number.isFinite(parsedAmount)
        ? parsedAmount
        : null;

    setIngredients([...ingredients, { name, amount, unit: ingredientUnit }]);
    setIngredientName("");
    setIngredientAmount("");
    setIngredientUnit("");
    setIngredientsError(null);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    const description = stepDescription.trim();
    if (!description) return;

    const parsedTime =
      stepTimeMinutes.trim() === "" ? null : Number(stepTimeMinutes);
    const timeMinutes =
      parsedTime != null && Number.isFinite(parsedTime) ? parsedTime : null;

    setSteps([
      ...steps,
      { description, ingredients: stepIngredients.trim(), timeMinutes },
    ]);
    setStepDescription("");
    setStepIngredients("");
    setStepTimeMinutes("");
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const moveStep = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= steps.length) return;

    const next = [...steps];
    [next[index], next[target]] = [next[target], next[index]];
    setSteps(next);
  };

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    // Native `required` covers the plain text/number fields. Ingredients and
    // categories are both submitted as repeated fields (hidden inputs /
    // checkboxes sharing a name), which `required` can't express as "at
    // least one of these" -- so that's checked here instead.
    if (ingredients.length === 0) {
      event.preventDefault();
      setIngredientsError("Add at least one ingredient.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const selectedCategories = formData.getAll("categories").map(String);
    const hasRequiredGroup = selectedCategories.some(
      (category) => getCategoryGroup(category) === REQUIRED_CATEGORY_GROUP,
    );
    if (!hasRequiredGroup) {
      event.preventDefault();
      setCategoryError("Select at least one meal or course type.");
      return;
    }
  };

  const selectedCategories = new Set(
    (defaultValues?.categories ?? []).map((category) => category.toLowerCase()),
  );

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="card flex flex-col gap-5 bg-base-200 p-6 shadow-md sm:p-8"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-semibold">
          Recipe name<span className="ml-1 text-error">*</span>
        </label>{" "}
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Your recipe name"
          defaultValue={defaultValues?.name}
          required
          className="input input-bordered w-full"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-semibold">
          Description<span className="ml-1 text-error">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Describe your recipe here"
          rows={4}
          defaultValue={defaultValues?.description}
          required
          className="textarea textarea-bordered w-full"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="snippet" className="text-sm font-semibold">
          Short description<span className="ml-1 text-error">*</span>
        </label>
        <input
          id="snippet"
          name="snippet"
          type="text"
          placeholder="Give a short recipe description"
          defaultValue={defaultValues?.snippet}
          required
          className="input input-bordered w-full"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="time" className="text-sm font-semibold">
          Prep / cook time (minutes)<span className="ml-1 text-error">*</span>
        </label>
        <input
          id="time"
          name="time"
          type="number"
          placeholder="45"
          defaultValue={defaultValues?.time}
          required
          className="input input-bordered w-full sm:w-40"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="ingredient" className="text-sm font-semibold">
          Ingredients<span className="ml-1 text-error">*</span>
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="number"
            step="any"
            min="0"
            value={ingredientAmount}
            onChange={(event) => setIngredientAmount(event.target.value)}
            placeholder="2"
            aria-label="Ingredient amount"
            className="input input-bordered w-full sm:w-24"
          />
          <select
            value={ingredientUnit}
            onChange={(event) => setIngredientUnit(event.target.value)}
            aria-label="Ingredient unit"
            className="select select-bordered w-full sm:w-32"
          >
            <option value="">(no unit)</option>
            {INGREDIENT_UNITS.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <input
            id="ingredient"
            type="text"
            value={ingredientName}
            onChange={(event) => setIngredientName(event.target.value)}
            placeholder="Tomato"
            className="input input-bordered w-full"
          />
          <button
            type="button"
            onClick={addIngredient}
            className="btn btn-primary btn-sm shrink-0"
          >
            Add
          </button>
        </div>

        {ingredients.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {ingredients.map((item, index) => (
              <span
                key={`${item.name}-${item.unit}-${index}`}
                className="badge badge-outline gap-2"
              >
                {formatIngredientLine(item)}
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  aria-label={`Remove ${item.name}`}
                  className="text-base-content/60 hover:text-error"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {ingredients.map((item, index) => (
          <input
            key={`hidden-${item.name}-${item.unit}-${index}`}
            type="hidden"
            name="ingredients"
            value={JSON.stringify(item)}
          />
        ))}

        {ingredientsError && (
          <p className="text-sm text-error">{ingredientsError}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="step-description" className="text-sm font-semibold">
          Cooking steps
        </label>
        <p className="text-xs text-base-content/60">
          Optional. Add steps to enable a &ldquo;Start cooking&rdquo; guided
          view on the recipe page. Leave empty if this recipe doesn&apos;t
          need one.
        </p>

        <div className="flex flex-col gap-2 rounded-box border border-base-300 p-3">
          <textarea
            id="step-description"
            value={stepDescription}
            onChange={(event) => setStepDescription(event.target.value)}
            placeholder="Describe this step"
            rows={2}
            aria-label="Step description"
            className="textarea textarea-bordered w-full"
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={stepIngredients}
              onChange={(event) => setStepIngredients(event.target.value)}
              placeholder="Ingredients used (optional)"
              aria-label="Step ingredients"
              className="input input-bordered w-full"
            />
            <input
              type="number"
              step="any"
              min="0"
              value={stepTimeMinutes}
              onChange={(event) => setStepTimeMinutes(event.target.value)}
              placeholder="Minutes"
              aria-label="Step time in minutes"
              className="input input-bordered w-full sm:w-28"
            />
            <button
              type="button"
              onClick={addStep}
              className="btn btn-primary btn-sm shrink-0"
            >
              Add step
            </button>
          </div>
        </div>

        {steps.length > 0 && (
          <ol className="flex flex-col gap-2">
            {steps.map((step, index) => (
              <li
                key={`${step.description}-${index}`}
                className="flex items-start justify-between gap-3 rounded-box bg-base-100 p-3 text-sm"
              >
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Step {index + 1}</p>
                  <p className="text-base-content/80">{step.description}</p>
                  {(step.ingredients || step.timeMinutes != null) && (
                    <p className="text-xs text-base-content/60">
                      {[
                        step.ingredients || null,
                        step.timeMinutes != null
                          ? `⏱ ${step.timeMinutes} min`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveStep(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move step ${index + 1} up`}
                    className="btn btn-ghost btn-xs"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(index, 1)}
                    disabled={index === steps.length - 1}
                    aria-label={`Move step ${index + 1} down`}
                    className="btn btn-ghost btn-xs"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    aria-label={`Remove step ${index + 1}`}
                    className="btn btn-ghost btn-xs text-error"
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}

        {steps.map((step, index) => (
          <input
            key={`hidden-step-${index}`}
            type="hidden"
            name="steps"
            value={JSON.stringify({
              description: step.description,
              ingredients: step.ingredients,
              timeMinutes: step.timeMinutes,
            })}
          />
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="image" className="text-sm font-semibold">
          Image URL<span className="ml-1 text-error">*</span>
        </label>
        <input
          id="image"
          name="image_url"
          type="text"
          placeholder="Image URL"
          defaultValue={defaultValues?.image_url}
          required
          className="input input-bordered w-full"
        />
      </div>

      <div
        onChange={() => setCategoryError(null)}
        className="flex flex-col gap-4"
      >
        {CATEGORY_GROUPS.map((group) => (
          <div key={group.name} className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              {group.name}
              {group.name === REQUIRED_CATEGORY_GROUP && (
                <span className="ml-1 text-error">*</span>
              )}
            </p>
            <div className="flex flex-wrap gap-3">
              {group.options.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="categories"
                    value={value}
                    defaultChecked={selectedCategories.has(value)}
                    className="checkbox checkbox-sm"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        ))}
        {categoryError && <p className="text-sm text-error">{categoryError}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="difficulty" className="text-sm font-semibold">
          Difficulty<span className="ml-1 text-error">*</span>
        </label>
        <select
          id="difficulty"
          name="difficulty"
          defaultValue={defaultValues?.difficulty ?? ""}
          required
          className="select select-bordered w-full"
        >
          <option value="" disabled>
            Select a difficulty
          </option>
          {DIFFICULTY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {DIFFICULTY_EMOJI.repeat(level)} — {DIFFICULTY_LABELS[level]}
            </option>
          ))}
        </select>
      </div>

      {state && !state.success && state.message && (
        <div role="alert" className="alert alert-error">
          <span>{state.message}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary w-full"
      >
        {isPending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
