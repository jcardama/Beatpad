import { cn } from "@/lib/utils";

interface Props<T extends string> {
  label?: string;
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** Single-choice chip group (a radio group), optionally labelled. */
export function SegmentedToggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  const control = (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={cn(
            "flex h-[26px] items-center rounded-full px-2.5 whitespace-nowrap",
            value === o.id
              ? "bg-control-on text-on-control [text-shadow:none]"
              : "bg-chip-surface text-text",
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
      <span className="text-text-subtle">{label}</span>
      {control}
    </div>
  );
}
