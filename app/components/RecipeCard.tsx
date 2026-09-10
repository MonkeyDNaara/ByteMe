import Image from "next/image";
import Link from "next/link";

import FavoriteButton from "@/app/components/FavoriteButton";
import type { MealType, Recipe } from "@/lib/recipe";

// Theme-aware badge colour per meal: green / yellow / red.
const mealBadge: Record<MealType, string> = {
  Breakfast: "badge-success",
  Lunch: "badge-warning",
  Dinner: "badge-error",
};

type RecipeCardProps = {
  recipe: Recipe;
  /** Optional meal badge shown on the image (used on the "recipes of the day" section). */
  meal?: MealType;
  /** When set, the card image + body link to this path. */
  href?: string;
};

export default function RecipeCard({ meal, recipe, href }: RecipeCardProps) {
  const content = (
    <>
      <figure className="relative h-48">
        <Image
          src={recipe.img_url}
          alt={recipe.name}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
        />
        {meal && (
          <span
            className={`badge ${mealBadge[meal]} absolute left-3 top-3 font-medium`}
          >
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
    </>
  );

  return (
    <article className="card relative overflow-hidden bg-base-200 shadow-md transition-shadow hover:shadow-xl">
      <FavoriteButton
        recipeId={recipe.id}
        className="absolute right-3 top-3 z-10"
      />

      {href ? (
        <Link
          href={href}
          className="flex flex-col rounded-box focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </article>
  );
}
