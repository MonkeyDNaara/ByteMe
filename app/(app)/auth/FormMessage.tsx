type FormMessageProps = {
  kind: "error" | "success";
  children: React.ReactNode;
  emoji?: string;
};

/** Friendly alert box for form errors (⚠️) and confirmations (📬, ✓). */
export default function FormMessage({ kind, children, emoji }: FormMessageProps) {
  const isError = kind === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        // text-base-content (not error-content): readable on the tinted box in light AND dark mode
        isError ? "bg-error/20 text-base-content" : "bg-accent text-accent-content"
      }`}
    >
      <span aria-hidden="true" className="text-lg leading-none">
        {emoji ?? (isError ? "⚠️" : "✓")}
      </span>
      <div>{children}</div>
    </div>
  );
}
