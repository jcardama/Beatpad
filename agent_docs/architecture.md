# BeatPad Architecture

## Workspace

Cargo workspace (root `Cargo.toml`, `resolver = "2"`) + a pnpm/Vite frontend.

```
beatpad/
├─ src-tauri/        Tauri v2 shell (Cargo package `app`)
├─ src/              React frontend (MVP: model → presenters → views)
├─ crates/
│  ├─ engine/        audio engine (kira), no Tauri dep
│  └─ format/        the .beat archive format
└─ apps/web/         (future) community beat repository
```

Crate dependency direction (never reversed): `app` → `engine`, `app` → `format`. The engine and format crates know nothing of Tauri, so both are unit-testable headless.

## The input → audio pipeline

Everything funnels into one normalized type so the source (keyboard now, MIDI later) is irrelevant to the engine:

```
keydown/keyup (webview)
  → useKeyboardInput.ts            (src/presenters/useKeyboardInput.ts)
  → triggerPad/releasePad          (src/model/ipc/commands.ts → ipc/client.ts)
  → invoke (Tauri IPC)
  → commands::trigger_pad          (src-tauri/src/commands.rs)
  → input::pad_event → PadEvent    (src-tauri/src/input.rs)
  → channel send                   (src-tauri/src/state.rs)
  → Engine::handle_event           (crates/engine/src/engine.rs)
  → Backend::play → kira           (crates/engine/src/backend/kira_backend.rs)
```

`engine::PadEvent { pad: PadId, velocity: u8, phase: Press | Release }` is the seam. A future MIDI source (`midir`) produces the same `PadEvent` and joins at `state.rs` — nothing downstream changes. See `agent_docs/audio-engine.md` for the threading model.

## Engine seams (`crates/engine/`)

- `event.rs` — `PadId`, `Phase`, `PadEvent`.
- `backend/mod.rs` — `Backend` trait: associated `Sample: Send + 'static`, manager-independent `decode(bytes)` / infallible `register_sample(pad, sample)` / `play` / `stop` / `set_looping` / `device_label`. Loading commands decode on a blocking worker before sending ready samples to the audio thread. The engine drives pads only through this trait, never kira types directly, so kira is swappable.
- `track.rs` — `Track` trait: a pad's voice (`trigger` / `release` / `set_looping`).
- `effect.rs` — `Effect` trait + `Gain`. The seam where hosted CLAP/VST plugins will slot in as chain nodes.
- `backend/kira_backend.rs` — `KiraBackend` (owns the `AudioManager`) + `KiraTrack`, with opaque `KiraSample` carrying decoded audio across the command channel.
- `engine.rs` — `Engine<B: Backend>`, routes `PadEvent`s by phase.

## Frontend MVP layering (`src/`)

- **Model** — `model/domain/` (types, the key→pad map), `model/ipc/client.ts` (the *only* file importing `@tauri-apps/*`; ESLint forbids it elsewhere), `model/ipc/commands.ts` (typed wrappers), `model/store/transportStore.ts` (zustand).
- **Presenter** — `presenters/usePadGrid.ts` (domain → pad view-models + press/release), `presenters/useKeyboardInput.ts` (keys via `event.code`, autorepeat-deduped, blur-release). No JSX → unit-testable (`presenters/__tests__/`).
- **View** — `views/PadGridView.tsx`, `views/PadView.tsx`: props in, callbacks out, no logic. `App.tsx` is the composition root wiring presenter ↔ view ↔ keyboard.

## Scaffold state

8×8 grid (64 pads) played as two banks of 4 rows. The 32 physical keys (`1‑8/QWERTYUI/ASDFGHJK/ZXCVBNM,`) address the active bank; **Tab** flips banks (`useKeyboardInput` + `transportStore.bank`). All pads map to one bundled sample (`src-tauri/assets/pad.wav`, `include_bytes!`).

Play modes (`engine::PlayMode`): one-shot / hold-loop / toggle-loop, set globally via `set_pad_mode`. Lit state is optimistic (presenter, on press); **looping** state is authoritative — the audio thread emits `loop-changed` events (`src-tauri/src/state.rs`) that `useLoopEvents` reflects into the store. Tempo-synced loops and real `.beat` pack loading come next.
