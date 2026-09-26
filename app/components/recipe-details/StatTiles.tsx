import { getDifficultyLabel, type Recipe } from "@/lib/recipe";

import DifficultyPots from "./DifficultyPots";
import LikesCount from "./LikesCount";

const tileClass =
  "flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl border border-base-300 bg-base-200 px-3 py-3 text-center";

/** Three value-only tiles: time · difficulty · likes (centered, no captions). */
export default function StatTiles({ recipe, initiallyFavorite }: { recipe: Recipe; initiallyFavorite: boolean }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <div className={tileClass}>
        <span className="text-base font-bold sm:text-lg">⏱ {recipe.time} min</span>
        <span className="sr-only">cook time</span>
      </div>

      <div className={tileClass}>
        {recipe.difficulty != null ? (
          <>
            <span className="text-sm sm:text-base">
              <DifficultyPots level={recipe.difficulty} />
            </span>
            <span className="text-xs text-base-content/70 sm:text-sm">{getDifficultyLabel(recipe.difficulty)}</span>
          </>
        ) : (
          <span className="text-sm text-base-content/60">No difficulty yet</span>
        )}
      </div>

      <div className={tileClass}>
        <span className="text-base font-bold sm:text-lg">
          ❤️ <LikesCount recipeId={recipe.id} likes={recipe.likes} initiallyFavorite={initiallyFavorite} />
        </span>
        <span className="sr-only">likes</span>
      </div>
    </div>
  );
}
