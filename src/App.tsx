import { useBank } from "@/presenters/useBank";
import { useBoardMenuSync } from "@/presenters/useBoardMenuSync";
import { useKeyboardInput } from "@/presenters/useKeyboardInput";
import { useLoopEvents } from "@/presenters/useLoopEvents";
import { useMenuEvents } from "@/presenters/useMenuEvents";
import { useMenuToggle } from "@/presenters/useMenuToggle";
import { useModeControl } from "@/presenters/useModeControl";
import { usePadActions } from "@/presenters/usePadActions";
import { usePadGrid } from "@/presenters/usePadGrid";
import { useSoundEvents } from "@/presenters/useSoundEvents";
import { useTheme } from "@/presenters/useTheme";
import { BoardView } from "@/views/BoardView";

/** Composition root: wires presenters to the board, keyboard, and engine events. */
function App() {
  const { pads, press, release } = usePadGrid();
  const { bank, toggleBank } = useBank();
  const { mode, setMode: setGlobalMode } = useModeControl();
  const { setMode: setPadMode, assignSound, clearSound, clearBoard, loadPack } =
    usePadActions();
  useTheme();
  useKeyboardInput({ press, release, bank, toggleBank });
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
    </main>
  );
}

export default App;
