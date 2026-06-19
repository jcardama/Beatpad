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
import { LOCALES, type Locale } from "@/model/i18n/locale";
import { PAD_MODES, type PadMode } from "@/model/domain/pad";
import { THEMES, type Theme } from "@/model/domain/theme";
import { useT } from "@/presenters/useT";
import { KeyRecorder } from "./KeyRecorder";
import { SegmentedToggle } from "./SegmentedToggle";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  author: string;
  onAuthorChange: (author: string) => void;
  keybindings: Keybindings;
  onSetScheme: (scheme: KeyScheme) => void;
  onAssignPadKey: (index: number, code: string) => void;
  onAssignBankKey: (code: string) => void;
  onAssignModeKey: (mode: PadMode, code: string) => void;
  onResetKeybindings: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  theme,
  onThemeChange,
  locale,
  onLocaleChange,
  author,
  onAuthorChange,
  keybindings,
  onSetScheme,
  onAssignPadKey,
  onAssignBankKey,
  onAssignModeKey,
  onResetKeybindings,
}: Props) {
  const t = useT();
  const banked = keybindings.scheme === "banked";
  const themeOptions = THEMES.map((id) => ({ id, label: t((m) => m.theme[id]) }));
  const schemeOptions: { id: KeyScheme; label: string }[] = [
    { id: "banked", label: t((m) => m.scheme.banked) },
    { id: "direct", label: t((m) => m.scheme.direct) },
  ];
  const localeOptions = LOCALES.map((id) => ({
    id,
    label: t((m) => m.language[id]),
  }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="type-title">
            {t((m) => m.settings.title)}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t((m) => m.settings.description)}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollbar sits flush at the right edge but is inset top (header) and
            bottom (the dialog's p-4), so its arrows clear the rounded corners
            without horizontal spacing. `-mr-4` reaches the edge; `pr-4` keeps
            the content off the scrollbar. */}
        <div className="-mr-4 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-4">
        <section className="space-y-3">
          <h3 className="type-heading">{t((m) => m.settings.appearance)}</h3>
          <SegmentedToggle
            label={t((m) => m.settings.theme)}
            options={themeOptions}
            value={theme}
            onChange={onThemeChange}
          />
          <SegmentedToggle
            label={t((m) => m.language.label)}
            options={localeOptions}
            value={locale}
            onChange={onLocaleChange}
          />
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="author" className="text-sm text-muted-foreground">
              {t((m) => m.settings.author)}
            </label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => onAuthorChange(e.target.value)}
              className="w-44 rounded-md border border-border bg-transparent px-2.5 py-1 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="type-heading">{t((m) => m.settings.keybindings)}</h3>
            <button
              type="button"
              onClick={onResetKeybindings}
              className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              {t((m) => m.settings.resetToDefaults)}
            </button>
          </div>
          <SegmentedToggle
            label={t((m) => m.settings.keyLayout)}
            options={schemeOptions}
            value={keybindings.scheme}
            onChange={onSetScheme}
          />

          <p className="text-xs text-muted-foreground">
            {banked
              ? t((m) => m.settings.helpBanked)
              : t((m) => m.settings.helpDirect)}
          </p>

          <div className="space-y-2">
            <span className="text-xs text-muted-foreground">
              {banked
                ? t((m) => m.settings.padsOneBank)
                : t((m) => m.settings.pads)}
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
              <span className="text-sm text-muted-foreground">
                {t((m) => m.settings.switchBank)}
              </span>
              <KeyRecorder
                code={keybindings.bankKey}
                onCapture={onAssignBankKey}
                className="h-8 w-20"
              />
            </div>
          )}

          {PAD_MODES.map((id) => (
            <div key={id} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t((m) => m.mode[id])}
              </span>
              <KeyRecorder
                code={keybindings.modeKeys[id]}
                onCapture={(code) => onAssignModeKey(id, code)}
                className="h-8 w-20"
              />
            </div>
          ))}
        </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
