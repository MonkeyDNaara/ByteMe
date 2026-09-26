import CloseModalButton from "@/app/components/recipe-details/CloseModalButton";

/** Skeleton shown inside the modal while the recipe loads on the server. */
export default function RecipeModalLoading() {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-base-300 pl-6 pr-3">
        <span className="h-4 flex-1 animate-pulse rounded-full bg-base-300" />
        <CloseModalButton />
      </div>
      <div className="flex animate-pulse flex-col gap-5 px-6 py-6" aria-busy="true" aria-label="Loading recipe">
        <div className="h-[220px] rounded-box bg-base-300 sm:h-[260px]" />
        <div className="h-5 w-40 rounded-full bg-base-300" />
        <div className="h-8 w-3/4 rounded-full bg-base-300" />
        <div className="h-4 w-full rounded-full bg-base-300" />
        <div className="h-4 w-2/3 rounded-full bg-base-300" />
      </div>
    </>
  );
}
