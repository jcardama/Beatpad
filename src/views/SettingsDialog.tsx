import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  padKeyCount,
  type Keybindings,
  type KeyScheme,
} from "@/model/domain/keybindings";
import { PAD_MODES, type PadMode } from "@/model/domain/pad";
import { THEMES, type Theme } from "@/model/domain/theme";
import { KeyRecorder } from "./KeyRecorder";
import { SegmentedToggle } from "./SegmentedToggle";

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

const THEME_OPTIONS: { id: Theme; label: string }[] = THEMES.map((id) => ({
  id,
  label: { system: "System", dark: "Dark", light: "Light" }[id],
}));

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
          <DialogDescription className="sr-only">
            Appearance and keyboard mappings.
          </DialogDescription>
        </DialogHeader>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold">Appearance</h3>
          <SegmentedToggle
            label="Theme"
            options={THEME_OPTIONS}
            value={theme}
            onChange={onThemeChange}
          />
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
          <SegmentedToggle
            label="Key layout"
            options={SCHEMES}
            value={keybindings.scheme}
            onChange={onSetScheme}
          />

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
