"use client";

import { useState } from "react";
import Image from "next/image";

import { getMealType, isOptimizableImageUrl, type MealType } from "@/lib/recipe";

// Fallback look per meal type: an emoji on a tint that matches the meal badge
// colours (see mealBadge.ts), so a missing photo still looks intentional.
const FALLBACK: Record<MealType | "none", { emoji: string; tint: string }> = {
  Breakfast: { emoji: "🥞", tint: "bg-success/40" },
  Lunch: { emoji: "🥗", tint: "bg-warning/40" },
  Dinner: { emoji: "🍝", tint: "bg-error/40" },
  none: { emoji: "🍽️", tint: "bg-base-300" },
};

type RecipeImageProps = {
  src: string | null | undefined;
  alt: string;
  /** The recipe's categories -- used to pick the fallback emoji and tint. */
  categories?: string[];
  sizes: string;
  priority?: boolean;
  /** Classes for the <img> (e.g. object-cover, hover zoom). */
  className?: string;
  /** Font size of the fallback emoji, sized to the container. */
  emojiClassName?: string;
};

/**
 * `next/image` with `fill` + a fallback for recipes without a (working) photo.
 * The parent must be `relative` with a size, like for any `fill` image.
 *
 * Why one component: `next/image` throws on an empty `src`, and a broken URL
 * shows the browser's broken-image icon. Handling both here means every
 * recipe photo in the app is safe by default -- including future ones.
 */
export default function RecipeImage({
  src,
  alt,
  categories,
  sizes,
  priority = false,
  className = "object-cover",
  emojiClassName = "text-5xl",
}: RecipeImageProps) {
  // Remember WHICH url failed instead of a plain boolean: when `src` changes
  // (e.g. a different recipe), the comparison is false again and the new
  // image gets its chance -- no useEffect needed to reset the state.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    const { emoji, tint } = FALLBACK[getMealType(categories) ?? "none"];
    return (
      <div
        role={alt ? "img" : undefined}
        aria-label={alt ? `${alt} (no photo)` : undefined}
        aria-hidden={alt ? undefined : true}
        className={`absolute inset-0 flex items-center justify-center ${tint}`}
      >
        <span aria-hidden="true" className={emojiClassName}>
          {emoji}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      unoptimized={!isOptimizableImageUrl(src)}
      onError={() => setFailedSrc(src)}
    />
  );
}
