import Image from "next/image";
import Link from "next/link";

import FavoriteButton from "@/app/components/FavoriteButton";
import {
  formatLabel,
  isOptimizableImageUrl,
  type MealType,
  type Recipe,
} from "@/lib/recipe";

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
          src={recipe.image_url}
          alt={recipe.name}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="object-cover"
          unoptimized={!isOptimizableImageUrl(recipe.image_url)}
        />
        {meal && (
          <span
            className={`badge ${mealBadge[meal]} absolute left-3 top-3 font-medium`}
          >
            {meal}
          </span>
        )}
      </figure>

      <div className="card-body flex-1 gap-3">
        <h4 className="card-title line-clamp-1 text-lg">{recipe.name}</h4>
        <p className="line-clamp-2 text-sm text-base-content/70">
          {recipe.snippet}
        </p>

        {/* Reserves one badge row's height even with zero/few categories, so
            this section is a similar size across cards instead of collapsing
            and leaving a big gap for mt-auto (below) to paper over. */}
        <div className="flex min-h-7 flex-wrap gap-1.5">
          {recipe.categories.map((category) => (
            <span key={category} className="badge badge-outline badge-sm">
              {formatLabel(category)}
            </span>
          ))}
        </div>

        {/* mt-auto is now just a safety net -- title/snippet/labels above are
            reserved to consistent heights, so it rarely has much space left
            to absorb, unlike before when it alone had to bridge cards of
            very different content lengths. */}
        <div className="card-actions mt-auto items-center justify-between text-sm text-base-content/70">
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
          className="flex h-full flex-col rounded-box focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </article>
  );
}
