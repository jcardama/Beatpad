import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  padKeyCount,
  type Keybindings,
  type KeyScheme,
} from "@/model/domain/keybindings";
import { PAD_MODES, type PadMode } from "@/model/domain/pad";
import { THEMES, type Theme } from "@/model/domain/theme";
import { KeyRecorder } from "./KeyRecorder";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  keybindings: Keybindings;
  onSetScheme: (scheme: KeyScheme) => void;
  onAssignPadKey: (index: number, code: string) => void;
  onAssignBankKey: (code: string) => void;
  onAssignModeKey: (mode: PadMode, code: string) => void;
  onResetKeybindings: () => void;
}

const SCHEMES: { id: KeyScheme; label: string }[] = [
  { id: "banked", label: "Banked (32)" },
  { id: "direct", label: "Direct (64)" },
];

const THEME_LABEL: Record<Theme, string> = {
  system: "System",
  dark: "Dark",
  light: "Light",
};

export function SettingsDialog({
  open,
  onOpenChange,
  theme,
  onThemeChange,
  keybindings,
  onSetScheme,
  onAssignPadKey,
  onAssignBankKey,
  onAssignModeKey,
  onResetKeybindings,
}: Props) {
  const banked = keybindings.scheme === "banked";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-6 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Appearance</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <div className="inline-flex rounded-lg border border-border p-1">
              {THEMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onThemeChange(t)}
                  className={cn(
                    "rounded-md px-3 py-1 text-sm transition-colors",
                    theme === t
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {THEME_LABEL[t]}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Keybindings</h3>
            <button
              type="button"
              onClick={onResetKeybindings}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Reset to defaults
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Key layout</span>
            <div className="inline-flex rounded-lg border border-border p-1">
              {SCHEMES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onSetScheme(s.id)}
                  className={cn(
                    "rounded-md px-3 py-1 text-sm transition-colors",
                    keybindings.scheme === s.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {banked
              ? "32 keys play one half; the bank key flips halves. Click a key, then press the new one. Esc cancels."
              : "One key per pad (for big keyboards or a MIDI Launchpad). Click a key, then press the new one. Esc cancels."}
          </p>

          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">
              {banked ? "Pads (one bank)" : "Pads"}
            </span>
            <div className="grid grid-cols-8 gap-1.5">
              {Array.from({ length: padKeyCount(keybindings.scheme) }, (_, i) => (
                <KeyRecorder
                  key={i}
                  code={keybindings.padKeys[i] ?? ""}
                  onCapture={(code) => onAssignPadKey(i, code)}
                  className="aspect-square"
                />
              ))}
            </div>
          </div>

          {banked && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Switch bank</span>
              <KeyRecorder
                code={keybindings.bankKey}
                onCapture={onAssignBankKey}
                className="h-8 w-20"
              />
            </div>
          )}

          {PAD_MODES.map((m) => (
            <div key={m.id} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{m.label}</span>
              <KeyRecorder
                code={keybindings.modeKeys[m.id]}
                onCapture={(code) => onAssignModeKey(m.id, code)}
                className="h-8 w-20"
              />
            </div>
          ))}
        </section>
      </DialogContent>
    </Dialog>
  );
}
