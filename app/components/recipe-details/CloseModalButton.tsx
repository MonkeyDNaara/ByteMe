"use client";

import { useRouter } from "next/navigation";

export default function CloseModalButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Close recipe"
      className="btn btn-circle h-10 min-h-10 w-10 shrink-0 border-none bg-base-300 hover:bg-base-content/15"
    >
      ✕
    </button>
  );
}
