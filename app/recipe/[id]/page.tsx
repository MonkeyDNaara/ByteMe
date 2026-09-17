import Image from "next/image";
import { notFound } from "next/navigation";

import BackButton from "@/app/components/BackButton";
import FavoriteButton from "@/app/components/FavoriteButton";
import {
  DIFFICULTY_EMOJI,
  formatLabel,
  getDifficultyLabel,
  getRecipeById,
  isOptimizableImageUrl,
} from "@/lib/recipe";

export default async function RecipeDetailPage({
  params,
}: PageProps<"/recipe/[id]">) {
  const { id } = await params;
  const recipe = await getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <BackButton />

      <div className="relative h-64 overflow-hidden rounded-box sm:h-80">
        <Image
          src={recipe.image_url}
          alt={recipe.name}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
          unoptimized={!isOptimizableImageUrl(recipe.image_url)}
          priority
        />
      </div>

      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {recipe.name}
          </h1>
          <FavoriteButton recipeId={recipe.id} size="md" />
        </div>

        <p className="text-base-content/80">{recipe.snippet}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
          <span>⏱ {recipe.time} min</span>
          <span>❤ {recipe.likes} likes</span>
        </div>

        {recipe.difficulty != null && (
          <div className="flex items-center gap-2 text-sm text-base-content/70">
            <span>
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className={index < recipe.difficulty! ? "" : "opacity-25"}
                >
                  {DIFFICULTY_EMOJI}
                </span>
              ))}
            </span>
            <span>{getDifficultyLabel(recipe.difficulty)}</span>
          </div>
        )}

        {recipe.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.categories.map((category, index) => (
              <span
                key={`${category}-${index}`}
                className="badge badge-outline badge-sm"
              >
                {formatLabel(category)}
              </span>
            ))}
          </div>
        )}
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        <ul className="list-inside list-disc space-y-1 text-base-content/80">
          {recipe.ingredients.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Method</h2>
        <p className="leading-relaxed text-base-content/80">
          {recipe.description}
        </p>
      </section>
    </div>
  );
}
