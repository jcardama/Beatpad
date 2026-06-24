import { useBank } from "@/presenters/useBank";
import { useBeatFile } from "@/presenters/useBeatFile";
import { useBoardMenuSync } from "@/presenters/useBoardMenuSync";
import { useDocumentLang } from "@/presenters/useDocumentLang";
import { useKeybindings } from "@/presenters/useKeybindings";
import { useKeyboardInput } from "@/presenters/useKeyboardInput";
import { useLoopEvents } from "@/presenters/useLoopEvents";
import { useMenuEvents } from "@/presenters/useMenuEvents";
import { useMenuToggle } from "@/presenters/useMenuToggle";
import { useModeControl } from "@/presenters/useModeControl";
import { usePadActions } from "@/presenters/usePadActions";
import { usePadGrid } from "@/presenters/usePadGrid";
import { usePersistBoard } from "@/presenters/usePersistBoard";
import { usePersistSettings } from "@/presenters/usePersistSettings";
import { useSettings } from "@/presenters/useSettings";
import { useSoundErrorEvents } from "@/presenters/useSoundErrorEvents";
import { useSoundEvents } from "@/presenters/useSoundEvents";
import { useTheme } from "@/presenters/useTheme";
import { useUpdateCheck } from "@/presenters/useUpdateCheck";
import { BoardView } from "@/views/BoardView";
import { SettingsDialog } from "@/views/SettingsDialog";
import { Toaster } from "@/views/Toaster";

/** Composition root: wires presenters to the board, keyboard, and engine events. */
function App() {
  const { pads, press, release } = usePadGrid();
  const { bank, toggleBank } = useBank();
  const { mode, setMode: setGlobalMode } = useModeControl();
  const { setMode: setPadMode, assignSound, clearSound, clearBoard, loadPack } =
    usePadActions();
  const settings = useSettings();
  const keys = useKeybindings();
  useTheme();
  useDocumentLang();
  usePersistSettings();
  usePersistBoard();
  useKeyboardInput({ press, release, bank, toggleBank, setGlobalMode });
  useLoopEvents();
  useSoundEvents();
  useSoundErrorEvents();
  useMenuEvents({ onOpenPack: loadPack, onClearBoard: clearBoard });
  useMenuToggle();
  useBoardMenuSync();
  useUpdateCheck();
  useBeatFile();

  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-background p-3">
      <div
        className="aspect-square"
        style={{ width: "min(100vw - 1.5rem, 100vh - 1.5rem)" }}
      >
        <BoardView
          pads={pads}
          bank={bank}
          banked={keys.keybindings.scheme === "banked"}
          mode={mode}
          onToggleBank={toggleBank}
          onPress={press}
          onRelease={release}
          onSetGlobalMode={setGlobalMode}
          onSetPadMode={setPadMode}
          onAssign={assignSound}
          onClear={clearSound}
        />
      </div>

      <SettingsDialog
        open={settings.open}
        onOpenChange={settings.setOpen}
        theme={settings.theme}
        onThemeChange={settings.setTheme}
        locale={settings.locale}
        onLocaleChange={settings.setLocale}
        author={settings.author}
        onAuthorChange={settings.setAuthor}
        keybindings={keys.keybindings}
        onSetScheme={keys.setScheme}
        onAssignPadKey={keys.assignPadKey}
        onAssignBankKey={keys.assignBankKey}
        onAssignModeKey={keys.assignModeKey}
        onAssignPanicKey={keys.assignPanicKey}
        onResetKeybindings={keys.reset}
      />

      <Toaster />
    </main>
  );
}

export default App;
