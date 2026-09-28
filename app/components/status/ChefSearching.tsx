/**
 * Tiny animated 404 scene, pure CSS + emoji (0 KB of images):
 * a chef searches with a magnifying glass next to a steaming bowl while a
 * noodle slips over the rim. Every animation is `motion-safe:`, so with
 * "reduce motion" turned on it's a still picture. Works in light and dark mode.
 * Keyframes live in globals.css (@theme).
 */
export default function ChefSearching() {
  return (
    <div
      role="img"
      aria-label="A chef searching with a magnifying glass next to a bowl of noodles"
      className="relative h-40 w-64 select-none"
    >
      {/* Steam puffs, each one starting a bit later */}
      {["left-[58px] [animation-delay:0s]", "left-[76px] [animation-delay:0.8s]", "left-[94px] [animation-delay:1.6s]"].map(
        (position) => (
          <span
            key={position}
            aria-hidden="true"
            className={`absolute top-[62px] h-5 w-5 rounded-full bg-base-content/25 opacity-0 blur-[1px] motion-safe:animate-steam ${position}`}
          />
        ),
      )}

      {/* The bowl */}
      <span aria-hidden="true" className="absolute bottom-3 left-10 text-7xl leading-none">
        🍜
      </span>

      {/* The noodle hanging over the rim (after the bowl, so it's drawn on top): grows from its top edge */}
      <svg
        aria-hidden="true"
        viewBox="0 0 12 40"
        className="absolute left-[34px] top-[100px] z-10 h-12 w-3.5 origin-top text-warning motion-safe:animate-noodle"
      >
        <path d="M6 0 C 1 8, 11 14, 6 22 S 1 34, 6 40" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
      </svg>

      {/* The chef, looking around */}
      <span aria-hidden="true" className="absolute bottom-3 right-4 text-6xl leading-none motion-safe:animate-peek">
        🧑‍🍳
      </span>

      {/* The magnifying glass, sweeping */}
      <span aria-hidden="true" className="absolute bottom-10 right-16 text-3xl leading-none motion-safe:animate-magnify">
        🔍
      </span>

      {/* "?" above the chef */}
      <span
        aria-hidden="true"
        className="absolute right-6 top-12 text-2xl font-extrabold text-link opacity-100 motion-safe:animate-wonder motion-safe:opacity-0"
      >
        ?
      </span>
    </div>
  );
}
