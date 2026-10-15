import { useState, type ReactNode } from "react";
import { Keyboard, Package, Palette } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  padKeyCount,
  type Keybindings,
  type KeyScheme,
} from "@/model/domain/keybindings";
import { LOCALES, type Locale } from "@/model/i18n/locale";
import { PAD_MODES, type PadMode } from "@/model/domain/pad";
import { type Theme } from "@/model/domain/theme";
import { useT } from "@/presenters/useT";
import { KeyRecorder } from "./KeyRecorder";
import { SegmentedToggle } from "./SegmentedToggle";
import { ThemePicker } from "./ThemePicker";

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
  onAssignPanicKey: (code: string) => void;
  onResetKeybindings: () => void;
}

type SectionId = "appearance" | "keybindings" | "packs";

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-border/60 py-3.5 last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
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
  onAssignPanicKey,
  onResetKeybindings,
}: Props) {
  const t = useT();
  const [section, setSection] = useState<SectionId>("appearance");
  const banked = keybindings.scheme === "banked";

  const localeOptions = LOCALES.map((id) => ({
    id,
    label: t((m) => m.language[id]),
  }));
  const schemeOptions: { id: KeyScheme; label: string }[] = [
    { id: "banked", label: t((m) => m.scheme.banked) },
    { id: "direct", label: t((m) => m.scheme.direct) },
  ];

  const nav: { id: SectionId; label: string; Icon: typeof Palette }[] = [
    { id: "appearance", label: t((m) => m.settings.appearance), Icon: Palette },
    { id: "keybindings", label: t((m) => m.settings.keybindings), Icon: Keyboard },
    { id: "packs", label: t((m) => m.settings.packs), Icon: Package },
  ];
  const current = nav.find((n) => n.id === section) ?? nav[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="flex h-[78vh] max-h-[560px] min-h-[420px] w-full gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        <DialogDescription className="sr-only">
          {t((m) => m.settings.description)}
        </DialogDescription>

        <nav className="flex w-56 shrink-0 flex-col border-r border-border/60">
          <div className="flex h-16 shrink-0 items-center px-5">
            <DialogTitle className="text-xs font-medium tracking-heading text-muted-foreground uppercase">
              {t((m) => m.settings.title)}
            </DialogTitle>
          </div>
          <div className="flex flex-col gap-0.5 p-3">
            {nav.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                  section === id
                    ? "bg-foreground/10 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden pb-4">
          <div className="flex h-16 shrink-0 items-center justify-between gap-4 pr-14 pl-6">
            <h2 className="text-sm font-medium">{current.label}</h2>
            {section === "keybindings" && (
              <button
                type="button"
                onClick={onResetKeybindings}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                {t((m) => m.settings.resetToDefaults)}
              </button>
            )}
          </div>

          {/* WebView2's native scrollbar arrows can't be removed via CSS; the
              top bar + the pane's pb-4 keep them clear of the rounded corners. */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-6 py-4">
            {section === "appearance" && (
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {t((m) => m.settings.theme)}
                  </div>
                  <p className="mt-0.5 mb-3.5 text-xs text-muted-foreground">
                    {t((m) => m.settings.themeHint)}
                  </p>
                  <ThemePicker value={theme} onChange={onThemeChange} />
                </div>
                <Row label={t((m) => m.language.label)}>
                  <SegmentedToggle
                    options={localeOptions}
                    value={locale}
                    onChange={onLocaleChange}
                  />
                </Row>
              </div>
            )}

            {section === "packs" && (
              <Row
                label={t((m) => m.settings.author)}
                hint={t((m) => m.settings.authorHint)}
              >
                <input
                  id="author"
                  type="text"
                  value={author}
                  onChange={(e) => onAuthorChange(e.target.value)}
                  className="w-44 rounded-md border border-border bg-transparent px-2.5 py-1 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Row>
            )}

            {section === "keybindings" && (
              <div className="space-y-4">
                <Row label={t((m) => m.settings.keyLayout)}>
                  <SegmentedToggle
                    options={schemeOptions}
                    value={keybindings.scheme}
                    onChange={onSetScheme}
                  />
                </Row>

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
                    {Array.from(
                      { length: padKeyCount(keybindings.scheme) },
                      (_, i) => (
                        <KeyRecorder
                          key={i}
                          code={keybindings.padKeys[i] ?? ""}
                          onCapture={(code) => onAssignPadKey(i, code)}
                          className="aspect-square"
                        />
                      ),
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-muted-foreground">
                    {t((m) => m.settings.otherKeys)}
                  </span>
                  <div className="flex flex-col">
                    {banked && (
                      <Row label={t((m) => m.settings.switchBank)}>
                        <KeyRecorder
                          code={keybindings.bankKey}
                          onCapture={onAssignBankKey}
                          className="h-8 w-20"
                        />
                      </Row>
                    )}
                    <Row label={t((m) => m.settings.stopAll)}>
                      <KeyRecorder
                        code={keybindings.panicKey}
                        onCapture={onAssignPanicKey}
                        className="h-8 w-20"
                      />
                    </Row>
                    {PAD_MODES.map((id) => (
                      <Row key={id} label={t((m) => m.mode[id])}>
                        <KeyRecorder
                          code={keybindings.modeKeys[id]}
                          onCapture={(code) => onAssignModeKey(id, code)}
                          className="h-8 w-20"
                        />
                      </Row>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
