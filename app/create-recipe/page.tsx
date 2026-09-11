"use client";

import { createRecipe, RecipeState } from "@/dbQueries";
import React, { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  return (
    <div className="flex flex-col items-center my-12 mx-auto max-w-9/10 w-fit border rounded-xl">
      <p className="w-fit">Create Your Recipe</p>
      <form action={formAction} className="flex flex-col items-center">
        <div className="flex flex-col w-9/10 my-2">
          <label htmlFor="name" className="cursor-pointer">
            Recipe Name:
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Your recipe name"
          />
        </div>
        <div className="flex flex-col w-9/10 my-2">
          <label htmlFor="description" className="cursor-pointer">
            Recipe Description:
          </label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="Describe your recipe here"
          />
        </div>
        <div className="flex flex-col w-9/10 my-2">
          <label htmlFor="snippet" className="cursor-pointer">
            Short Description:
          </label>
          <input
            id="snippet"
            name="snippet"
            type="text"
            placeholder="Give a short recipe description"
          />
        </div>
        <div className="flex flex-col w-9/10 my-2">
          <label htmlFor="time" className="cursor-pointer">
            Prep / Cook Time (Minutes):
          </label>
          <input id="time" name="time" type="number" placeholder="45" />
        </div>
        <div className="flex flex-col w-9/10 my-2">
          <label htmlFor="ingredients" className="cursor-pointer">
            Ingredients:
          </label>
          <input
            type="text"
            value={ingredient}
            onChange={(e) => setIngredient(e.target.value)}
            placeholder="Tomato"
          />

          <button
            type="button"
            onClick={() => {
              if (!ingredient.trim()) return;

              setIngredients([...ingredients, ingredient.trim()]);
              setIngredient("");
            }}
            className="btn btn-primary btn-sm my-2 w-32"
          >
            Add Ingredient
          </button>

          {ingredients.map((ingredient, index) => (
            <input
              key={index}
              type="hidden"
              name="ingredients"
              value={ingredient}
            />
          ))}
        </div>
        <div className="flex flex-col w-9/10 my-2">
          <label htmlFor="image" className="cursor-pointer">
            Image:
          </label>
          <input
            id="image"
            name="image_url"
            type="text"
            placeholder="Image URL"
          />
        </div>

        <div className="flex flex-col w-9/10 my-2">
          <p>Categories:</p>
          <div className="flex justify-center flex-wrap">
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="breakfast"
                className="mr-1"
              />
              Breakfast
            </label>
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="lunch"
                className="mr-1"
              />
              Lunch
            </label>
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="dinner"
                className="mr-1"
              />
              Dinner
            </label>
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="dessert"
                className="mr-1"
              />
              Dessert
            </label>
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="vegetarian"
                className="mr-1"
              />
              Vegetarian
            </label>
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="vegan"
                className="mr-1"
              />
              Vegan
            </label>
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="beef"
                className="mr-1"
              />
              Beef
            </label>
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="fish"
                className="mr-1"
              />
              Fish
            </label>
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="chicken"
                className="mr-1"
              />
              Chicken
            </label>
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="sweet"
                className="mr-1"
              />
              Sweet
            </label>
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="salty"
                className="mr-1"
              />
              Salty
            </label>
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="fast"
                className="mr-1"
              />
              Fast
            </label>
            <label className="mx-2 cursor-pointer">
              <input
                type="checkbox"
                name="categories"
                value="takesTime"
                className="mr-1"
              />
              Takes Time
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary btn-sm my-2 w-32"
        >
          Send Recipe
        </button>
      </form>
    </div>
  );
}

export default CreateRecipe;
