"use client";

import { createRecipe, RecipeState } from "@/dbQueries";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORY_OPTIONS = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "dessert", label: "Dessert" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "beef", label: "Beef" },
  { value: "fish", label: "Fish" },
  { value: "chicken", label: "Chicken" },
  { value: "sweet", label: "Sweet" },
  { value: "salty", label: "Salty" },
  { value: "fast", label: "Fast" },
  { value: "takesTime", label: "Takes Time" },
];

function CreateRecipe() {
  const router = useRouter();
  const [ingredient, setIngredient] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);

  const handleCreateRecipe = async (
    prevState: RecipeState,
    formData: FormData,
  ): Promise<RecipeState> => {
    return await createRecipe(prevState, formData);
  };

  const [state, formAction, isPending] = useActionState(
    handleCreateRecipe,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      router.back();
    }
  }, [state, router]);

  const addIngredient = () => {
    if (!ingredient.trim()) return;
    setIngredients([...ingredients, ingredient.trim()]);
    setIngredient("");
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Create a recipe
        </h1>
        <p className="text-sm text-base-content/70">
          Share your own recipe with the collection — fill in the details
          below.
        </p>
      </header>

      <form
        action={formAction}
        className="card flex flex-col gap-5 bg-base-200 p-6 shadow-md sm:p-8"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-semibold">
            Recipe name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your recipe name"
            className="input input-bordered w-full"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-sm font-semibold">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Describe your recipe here"
            rows={4}
            className="textarea textarea-bordered w-full"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="snippet" className="text-sm font-semibold">
            Short description
          </label>
          <input
            id="snippet"
            name="snippet"
            type="text"
            placeholder="Give a short recipe description"
            className="input input-bordered w-full"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="time" className="text-sm font-semibold">
            Prep / cook time (minutes)
          </label>
          <input
            id="time"
            name="time"
            type="number"
            placeholder="45"
            className="input input-bordered w-full sm:w-40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="ingredient" className="text-sm font-semibold">
            Ingredients
          </label>
          <div className="flex gap-2">
            <input
              id="ingredient"
              type="text"
              value={ingredient}
              onChange={(event) => setIngredient(event.target.value)}
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
                <span key={`${item}-${index}`} className="badge badge-outline gap-2">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    aria-label={`Remove ${item}`}
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
              key={`hidden-${item}-${index}`}
              type="hidden"
              name="ingredients"
              value={item}
            />
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="image" className="text-sm font-semibold">
            Image URL
          </label>
          <input
            id="image"
            name="image_url"
            type="text"
            placeholder="Image URL"
            className="input input-bordered w-full"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Categories</p>
          <div className="flex flex-wrap gap-3">
            {CATEGORY_OPTIONS.map(({ value, label }) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="categories"
                  value={value}
                  className="checkbox checkbox-sm"
                />
                {label}
              </label>
            ))}
          </div>
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
          {isPending ? "Saving…" : "Send Recipe"}
        </button>
      </form>
    </div>
  );
}

export default CreateRecipe;
