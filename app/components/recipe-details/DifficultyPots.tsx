import { DIFFICULTY_EMOJI } from "@/lib/recipe";

/** 🍲 × level, the remaining pots at 25% opacity. */
export default function DifficultyPots({ level }: { level: number }) {
  return (
    <span aria-hidden="true" className="whitespace-nowrap tracking-tighter">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < level ? "" : "opacity-25"}>
          {DIFFICULTY_EMOJI}
        </span>
      ))}
    </span>
  );
}
