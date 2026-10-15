import { useState, type ReactNode } from "react";
import { Keyboard, Package, Palette, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
    <div className="flex items-center justify-between gap-(--space-3)">
      <div className="min-w-0">
        <div>{label}</div>
        {hint && <p className="text-text-subtle">{hint}</p>}
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
        className="h-[560px] max-h-[calc(100%-2rem)] w-[672px] flex-row overflow-hidden"
      >
        <DialogDescription className="sr-only">
          {t((m) => m.settings.description)}
        </DialogDescription>

        <nav className="icon-line flex w-[200px] shrink-0 flex-col gap-0.5 p-(--space-2) pt-(--space-3)">
          <DialogTitle className="px-2 pb-(--space-2) font-mono text-[13px] leading-normal tracking-normal text-text-subtle">
            {t((m) => m.settings.title)}
          </DialogTitle>
          {nav.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={cn(
                "flex h-(--menu-item-height) items-center gap-2 rounded-(--radius-item) px-2 text-left",
                section === id
                  ? "bg-menu-marker-active text-text"
                  : "text-text-subtle hover:bg-menu-marker",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="hairline-y my-(--space-3)" />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center justify-between gap-(--space-2) px-(--space-3) pt-(--space-3)">
            <h2 className="title">{current.label}</h2>
            <div className="flex items-center gap-(--space-2)">
              {section === "keybindings" && (
                <Button variant="secondary" onClick={onResetKeybindings}>
                  {t((m) => m.settings.resetToDefaults)}
                </Button>
              )}
              <DialogClose asChild>
                <Button size="icon" aria-label={t((m) => m.common.close)}>
                  <XIcon />
                </Button>
              </DialogClose>
            </div>
          </div>

          {/* WebView2's native scrollbar arrows can't be removed via CSS; the
              header + the pane's bottom padding keep them clear of the corners. */}
          <div className="flex min-h-0 flex-1 flex-col gap-(--space-4) overflow-y-auto px-(--space-3) py-(--space-4)">
            {section === "appearance" && (
              <>
                <div className="flex flex-col gap-(--space-2)">
                  <div>
                    <div>{t((m) => m.settings.theme)}</div>
                    <p className="text-text-subtle">
                      {t((m) => m.settings.themeHint)}
                    </p>
                  </div>
                  <ThemePicker value={theme} onChange={onThemeChange} />
                </div>
                <Row label={t((m) => m.language.label)}>
                  <SegmentedToggle
                    options={localeOptions}
                    value={locale}
                    onChange={onLocaleChange}
                  />
                </Row>
              </>
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
                  className="h-(--button-height) w-48 rounded-(--radius-control) bg-field-surface px-(--space-2) text-text shadow-well placeholder:text-text-subtle"
                />
              </Row>
            )}

            {section === "keybindings" && (
              <>
                <Row label={t((m) => m.settings.keyLayout)}>
                  <SegmentedToggle
                    options={schemeOptions}
                    value={keybindings.scheme}
                    onChange={onSetScheme}
                  />
                </Row>

                <div className="flex flex-col gap-(--space-2)">
                  <div>
                    <div>
                      {banked
                        ? t((m) => m.settings.padsOneBank)
                        : t((m) => m.settings.pads)}
                    </div>
                    <p className="text-text-subtle">
                      {banked
                        ? t((m) => m.settings.helpBanked)
                        : t((m) => m.settings.helpDirect)}
                    </p>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
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

                <div className="flex flex-col gap-(--space-2)">
                  <div>{t((m) => m.settings.otherKeys)}</div>
                  <div className="flex flex-col gap-(--space-2)">
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
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
