import { useBank } from "@/presenters/useBank";
import { useBoardMenuSync } from "@/presenters/useBoardMenuSync";
import { useKeybindings } from "@/presenters/useKeybindings";
import { useKeyboardInput } from "@/presenters/useKeyboardInput";
import { useLoopEvents } from "@/presenters/useLoopEvents";
import { useMenuEvents } from "@/presenters/useMenuEvents";
import { useMenuToggle } from "@/presenters/useMenuToggle";
import { useModeControl } from "@/presenters/useModeControl";
import { usePadActions } from "@/presenters/usePadActions";
import { usePadGrid } from "@/presenters/usePadGrid";
import { usePersistSettings } from "@/presenters/usePersistSettings";
import { useSettings } from "@/presenters/useSettings";
import { useSoundEvents } from "@/presenters/useSoundEvents";
import { useTheme } from "@/presenters/useTheme";
import { BoardView } from "@/views/BoardView";
import { SettingsDialog } from "@/views/SettingsDialog";

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
  usePersistSettings();
  useKeyboardInput({ press, release, bank, toggleBank, setGlobalMode });
  useLoopEvents();
  useSoundEvents();
  useMenuEvents({ onOpenPack: loadPack, onClearBoard: clearBoard });
  useMenuToggle();
  useBoardMenuSync();

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
        keybindings={keys.keybindings}
        onSetScheme={keys.setScheme}
        onAssignPadKey={keys.assignPadKey}
        onAssignBankKey={keys.assignBankKey}
        onAssignModeKey={keys.assignModeKey}
        onResetKeybindings={keys.reset}
      />
    </main>
  );
}

export default App;
