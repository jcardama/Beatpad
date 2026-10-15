import { cn } from "@/lib/utils";
import { THEMES, type ResolvedTheme, type Theme } from "@/model/domain/theme";
import { useT } from "@/presenters/useT";

/** Fixed swatch colours per theme — each tile always previews its own look,
 *  independent of the currently-active theme. */
const SWATCH: Record<ResolvedTheme, { bg: string; main: string; bar: string }> = {
  dark: { bg: "#1a1a1a", main: "#1a1a1a", bar: "#3a3a3a" },
  light: { bg: "#d8d8d8", main: "#ffffff", bar: "#c4c4c4" },
  gold: { bg: "#b48f52", main: "#e9d9a8", bar: "#c9b077" },
};

function Mini({ kind }: { kind: ResolvedTheme }) {
  const s = SWATCH[kind];
  return (
    <div className="grid h-full w-full grid-cols-[34%_1fr]" style={{ background: s.bg }}>
      <div className="flex flex-col gap-[5px] px-2 py-[9px]">
        <i className="h-1.5 rounded-xs" style={{ background: s.bar }} />
        <i className="h-1.5 w-2/3 rounded-xs" style={{ background: s.bar }} />
      </div>
      <div
        className="flex flex-col gap-[5px] rounded-tl-md px-2 py-[9px]"
        style={{ background: s.main }}
      >
        <i className="h-1.5 w-3/4 rounded-xs" style={{ background: s.bar }} />
        <div className="mt-auto flex gap-[5px]">
          <i className="h-[18px] flex-1 rounded-sm" style={{ background: s.bar }} />
          <i className="h-[18px] flex-1 rounded-sm" style={{ background: s.bar }} />
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

/** Four theme tiles, each set in a well; the checked one gets the selection ring. */
export function ThemePicker({
  value,
  onChange,
}: {
  value: Theme;
  onChange: (theme: Theme) => void;
}) {
  const t = useT();
  return (
    <div role="radiogroup" className="grid grid-cols-4 gap-(--space-2)">
      {THEMES.map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className="group flex flex-col gap-2 outline-none"
        >
          <div className="relative m-[3px]">
            <div className="well absolute -inset-[3px] rounded-(--radius-tile)" />
            <div className="relative aspect-[124/94] overflow-hidden rounded-(--radius-control)">
              {id === "system" ? <SystemMini /> : <Mini kind={id} />}
            </div>
            <div
              className={cn(
                "pointer-events-none absolute -inset-[3px] rounded-(--radius-tile)",
                value === id && "shadow-[0_0_0_1.5px_var(--selection-ring)]",
                "group-focus-visible:outline-[1.5px] group-focus-visible:outline-offset-4 group-focus-visible:outline-ink-strong group-focus-visible:outline-solid",
              )}
            />
          </div>
          <span className={value === id ? "text-text" : "text-text-subtle"}>
            {t((m) => m.theme[id])}
          </span>
        </button>
      ))}
    </div>
  );
}
