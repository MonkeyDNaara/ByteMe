export default function Loading() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 animate-pulse">
      {/* Header */}
      <header className="flex flex-col gap-2">
        {/* Title */}
        <div className="h-10 w-48 animate-pulse rounded-box bg-base-300" />
      </header>

      {/* Recipe filters / cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-4 rounded-box bg-base-200 p-4"
          >
            {/* Image */}
            <div className="h-48 w-full animate-pulse rounded-box bg-base-300" />

            {/* Recipe title */}
            <div className="h-6 w-3/4 animate-pulse rounded bg-base-300" />

            {/* Description */}
            <div className="flex flex-col gap-2">
              <div className="h-4 w-full animate-pulse rounded bg-base-300" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-base-300" />
            </div>

            {/* Bottom info */}
            <div className="flex gap-2">
              <div className="h-6 w-20 animate-pulse rounded-full bg-base-300" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-base-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
