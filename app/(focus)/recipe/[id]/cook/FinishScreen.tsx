"use client";

import Image from "next/image";

import { useToast } from "@/app/components/toast/ToastProvider";
import { isOptimizableImageUrl, type Recipe } from "@/lib/recipe";
import { useFavorites } from "@/lib/useFavorites";

type FinishScreenProps = {
  recipe: Recipe;
  onBackToSteps: () => void;
  onBackToRecipe: () => void;
  onSurprise: () => void;
};

export default function FinishScreen({ recipe, onBackToSteps, onBackToRecipe, onSurprise }: FinishScreenProps) {
  const showToast = useToast();
  const { isFavorite, setFavoriteState, isLoggedIn } = useFavorites();
  const saved = isFavorite(recipe.id);

  const saveToFavorites = () => {
    if (!isLoggedIn) {
      showToast({ message: "Sign in to save your favorite recipes", action: { label: "Sign in", href: "/auth/sign-in" } });
      return;
    }
    setFavoriteState(recipe.id, true);
    showToast({ message: "💜 Saved to favorites", action: { label: "View", href: "/favorites" } });
  };

  return (
    <section className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-5 px-4 py-10 text-center sm:py-16">
      <div className="relative h-44 w-44 overflow-hidden rounded-full border-8 border-base-200 shadow-xl sm:h-56 sm:w-56">
        <Image
          src={recipe.image_url}
          alt=""
          fill
          sizes="224px"
          className="object-cover"
          unoptimized={!isOptimizableImageUrl(recipe.image_url)}
        />
      </div>
      <span aria-hidden="true" className="text-5xl">
        🎉
      </span>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Bon appétit!</h1>
      <p className="text-lg leading-relaxed text-base-content/70">
        You cooked <strong className="text-base-content">{recipe.name}</strong> in {recipe.steps.length}{" "}
        {recipe.steps.length === 1 ? "step" : "steps"}. Enjoy it — you earned it.
      </p>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={saveToFavorites}
          disabled={saved}
          className="btn btn-secondary h-13 rounded-full px-6 text-base font-bold disabled:bg-secondary/60 disabled:text-secondary-content"
        >
          {saved ? "💜 In your favorites" : "❤️ Loved it — save to favorites"}
        </button>
        <button
          type="button"
          onClick={onBackToRecipe}
          className="btn h-13 rounded-full border-primary bg-base-100 px-6 text-base font-semibold hover:bg-primary/15"
        >
          Back to recipe
        </button>
      </div>

      <button type="button" onClick={onSurprise} className="font-semibold text-link hover:underline">
        🎲 Surprise me with the next one →
      </button>
      <button type="button" onClick={onBackToSteps} className="text-sm text-base-content/60 hover:underline">
        ← Back to the steps
      </button>
    </section>
  );
}
