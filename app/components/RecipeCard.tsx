import Image from "next/image";

import type { MealType, Recipe } from "@/lib/recipe";

type RecipeCardProps = {
  recipe: Recipe;
  /** Optional meal badge shown on the image (used on the "recipes of the day" section). */
  meal?: MealType;
};

export default function RecipeCard({ meal, recipe }: RecipeCardProps) {
  return (
    <article className="card bg-base-200 shadow-md transition-shadow hover:shadow-xl">
      <figure className="relative h-48">
        <Image
          src={recipe.img_url}
          alt={recipe.name}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
        {meal && (
          <span className="badge badge-secondary absolute left-3 top-3 font-medium">
            {meal}
          </span>
        )}
      </figure>

      <div className="card-body gap-3">
        <h4 className="card-title text-lg">{recipe.name}</h4>
        <p className="text-sm text-base-content/70">
          {recipe.short_description}
        </p>

        {recipe.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.labels.map((label) => (
              <span key={label} className="badge badge-outline badge-sm">
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="card-actions mt-1 items-center justify-between text-sm text-base-content/70">
          <span>⏱ {recipe.time} min</span>
          <span>❤ {recipe.likes}</span>
        </div>
      </div>
    </article>
  );
}
