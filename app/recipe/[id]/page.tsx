import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import FavoriteButton from "@/app/components/FavoriteButton";
import { getRecipeById } from "@/lib/recipe";

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
      <Link
        href="/all-recipes"
        className="text-sm text-base-content/70 hover:text-base-content"
      >
        ← All recipes
      </Link>

      <div className="relative h-64 overflow-hidden rounded-box sm:h-80">
        <Image
          src={recipe.img_url}
          alt={recipe.name}
          fill
          sizes="(min-width: 768px) 768px, 100vw"
          className="object-cover"
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

        <p className="text-base-content/80">{recipe.short_description}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/70">
          <span>⏱ {recipe.time} min</span>
          <span>❤ {recipe.likes} likes</span>
        </div>

        {recipe.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {recipe.labels.map((label) => (
              <span key={label} className="badge badge-outline badge-sm">
                {label}
              </span>
            ))}
          </div>
        )}
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        <ul className="list-inside list-disc space-y-1 text-base-content/80">
          {recipe.incredients.map((item) => (
            <li key={item}>{item}</li>
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
