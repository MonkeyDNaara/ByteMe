/** Shared look for the toggleable filter chips. */
export function chipClass(active: boolean): string {
  return `flex h-9 shrink-0 items-center gap-1 rounded-full border px-3.5 text-sm font-medium transition-colors ${
    active
      ? "border-primary bg-primary text-primary-content"
      : "border-base-300 bg-base-100 hover:border-primary hover:bg-primary/15"
  }`;
}
