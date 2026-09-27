"use client";

import Image from "next/image";

import { fieldClass, hintClass, labelClass, required } from "./fieldStyles";

type PhotoFieldProps = {
  url: string;
  onUrlChange: (url: string) => void;
  /** Whether the current URL failed to load (state lives in the parent). */
  broken: boolean;
  onBroken: (url: string) => void;
  isValidUrl: boolean;
};

/** Image URL + live preview, so a broken link shows up right away. */
export default function PhotoField({ url, onUrlChange, broken, onBroken, isValidUrl }: PhotoFieldProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div
        className="relative flex h-[110px] w-[160px] shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-base-300 bg-base-300 text-center text-xs text-base-content/70"
        aria-live="polite"
      >
        {isValidUrl && !broken ? (
          <Image
            // A new key per URL = a fresh <img>, so onError fires again for the next URL.
            key={url}
            src={url}
            alt="Preview of the recipe photo"
            fill
            sizes="160px"
            unoptimized
            className="object-cover"
            onError={() => onBroken(url)}
          />
        ) : broken ? (
          <span className="px-3 text-error">⚠️ Can&apos;t load this image</span>
        ) : (
          <span aria-hidden="true" className="text-3xl">
            📷
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="image_url" className={labelClass}>
          Image URL{required}
        </label>
        <input
          id="image_url"
          name="image_url"
          type="url"
          inputMode="url"
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          placeholder="https://images.unsplash.com/…"
          className={`${fieldClass} w-full`}
        />
        <p className={hintClass}>Paste a link to a photo (https://…). The preview updates as you type.</p>
      </div>
    </div>
  );
}
