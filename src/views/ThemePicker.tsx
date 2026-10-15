import { cn } from "@/lib/utils";
import { THEMES, type Theme } from "@/model/domain/theme";
import { useT } from "@/presenters/useT";

/** Fixed swatch colours per theme — each card always previews its own look,
 *  independent of the currently-active theme. */
const SWATCH: Record<"dark" | "light" | "gold", { bg: string; side: string; bar: string }> = {
  dark: { bg: "#161616", side: "#0c0c0c", bar: "#3b3b3b" },
  light: { bg: "#fafafa", side: "#e3e3e3", bar: "#c9c9c9" },
  gold: { bg: "#cda765", side: "#b9904c", bar: "#e8cf99" },
};

function Mini({ kind }: { kind: "dark" | "light" | "gold" }) {
  const s = SWATCH[kind];
  return (
    <div className="flex h-full w-full gap-1 p-1.5" style={{ background: s.bg }}>
      <div className="w-1/4 rounded-sm" style={{ background: s.side }} />
      <div className="flex flex-1 flex-col gap-1">
        <div className="h-1.5 w-3/4 rounded-full" style={{ background: s.bar }} />
        <div className="mt-auto flex gap-1">
          <div className="h-4 flex-1 rounded-sm" style={{ background: s.bar }} />
          <div className="h-4 flex-1 rounded-sm" style={{ background: s.bar }} />
        </div>
      </div>
    </div>
  );
}

/** `system` previews as a diagonal dark/light split. */
function SystemMini() {
  return (
    <div className="relative h-full w-full">
      <Mini kind="dark" />
      <div
        className="absolute inset-0"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 38% 100%)" }}
      >
        <Mini kind="light" />
      </div>
    </div>
  );
}

export function ThemePicker({
  value,
  onChange,
}: {
  value: Theme;
  onChange: (theme: Theme) => void;
}) {
  const t = useT();
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {THEMES.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className="group flex flex-col gap-2 outline-none"
        >
          <div
            className={cn(
              "edge-light relative aspect-[1.3] overflow-hidden rounded-lg ring-offset-2 ring-offset-popover transition group-focus-visible:ring-2 group-focus-visible:ring-ring",
              value === id
                ? "ring-2 ring-primary"
                : "ring-1 ring-border group-hover:ring-foreground/30",
            )}
          >
            {id === "system" ? <SystemMini /> : <Mini kind={id} />}
          </div>
          <span
            className={cn(
              "text-center text-xs transition-colors",
              value === id ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {t((m) => m.theme[id])}
          </span>
        </button>
      ))}
    </div>
  );
}
