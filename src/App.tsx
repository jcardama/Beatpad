import { useBank } from "@/presenters/useBank";
import { useKeyboardInput } from "@/presenters/useKeyboardInput";
import { useLoopEvents } from "@/presenters/useLoopEvents";
import { useModeControl } from "@/presenters/useModeControl";
import { usePadGrid } from "@/presenters/usePadGrid";
import { BoardView } from "@/views/BoardView";

/** Composition root: wires presenters to the board, keyboard, and engine events. */
function App() {
  const { pads, press, release } = usePadGrid();
  const { mode, setMode } = useModeControl();
  const { bank, toggleBank } = useBank();
  useKeyboardInput({ press, release, bank, toggleBank });
  useLoopEvents();

  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-background p-3">
      <div
        className="aspect-square"
        style={{ width: "min(100vw - 1.5rem, 100vh - 1.5rem)" }}
      >
        <BoardView
          pads={pads}
          mode={mode}
          bank={bank}
          onSetMode={setMode}
          onToggleBank={toggleBank}
          onPress={press}
          onRelease={release}
        />
      </div>
    </main>
  );
}

export default App;
