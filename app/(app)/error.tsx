"use client";

import { useRouter } from "next/navigation";

export default function Error() {
  const router = useRouter();

  return (
    <div>
      <p>Something went wrong</p>
      <button onClick={() => router.back()}>Go back</button>
    </div>
  );
}
