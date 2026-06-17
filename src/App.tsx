import { useKeyboardInput } from "@/presenters/useKeyboardInput";
import { usePadGrid } from "@/presenters/usePadGrid";
import { PadGridView } from "@/views/PadGridView";

/** Composition root: wires the pad-grid presenter to the view and keyboard. */
function App() {
  const { pads, press, release } = usePadGrid();
  useKeyboardInput({ press, release });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-8 text-foreground">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Beat<span className="text-primary">Pad</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap a pad or hit the matching key.
        </p>
      </header>

      <div className="w-full max-w-md">
        <PadGridView pads={pads} onPress={press} onRelease={release} />
      </div>
    </main>
  );
}

export default App;
