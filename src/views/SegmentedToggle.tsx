import { cn } from "@/lib/utils";

interface Props<T extends string> {
  label?: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Segmented control (a single-choice radio group), optionally labelled. */
export function SegmentedToggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  const control = (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex rounded-lg border border-border bg-muted/40 p-1 shadow-[inset_0_1px_2px_rgb(0_0_0/0.08)]"
    >
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "rounded-md px-3 py-1 text-sm transition-all",
            value === o.id
              ? "tactile edge-light relative bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  if (!label) return control;
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      {control}
    </div>
  );
}
