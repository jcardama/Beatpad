import { useBank } from "@/presenters/useBank";
import { useKeyboardInput } from "@/presenters/useKeyboardInput";
import { useLoopEvents } from "@/presenters/useLoopEvents";
import { usePadActions } from "@/presenters/usePadActions";
import { usePadGrid } from "@/presenters/usePadGrid";
import { useSoundEvents } from "@/presenters/useSoundEvents";
import { BoardView } from "@/views/BoardView";

/** Composition root: wires presenters to the board, keyboard, and engine events. */
function App() {
  const { pads, press, release } = usePadGrid();
  const { bank, toggleBank } = useBank();
  const { setMode, assignSound, clearSound, loadPack } = usePadActions();
  useKeyboardInput({ press, release, bank, toggleBank });
  useLoopEvents();
  useSoundEvents();

  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-background p-3">
      <div
        className="aspect-square"
        style={{ width: "min(100vw - 1.5rem, 100vh - 1.5rem)" }}
      >
        <BoardView
          pads={pads}
          bank={bank}
          onToggleBank={toggleBank}
          onPress={press}
          onRelease={release}
          onSetMode={setMode}
          onAssign={assignSound}
          onClear={clearSound}
          onLoadPack={loadPack}
        />
      </div>
    </main>
  );
}

export default App;
