# BeatPad

Launchpad-style beat pad: the computer keyboard (and later MIDI) as the pad grid. Tauri v2 shell, React/TS UI, and a Rust audio engine. Open source (GPL-3.0), shipped through GitHub Releases. Planned: a web repository of community `.beat` packs.

## Stack and layout

- **Shell**: `src-tauri/` (Cargo package `app`), a thin Tauri v2 host. IPC commands, the window, and the audio thread spawn. Nothing else.
- **Frontend**: `src/`, Vite + React + TS + Tailwind v4 + shadcn. MVP layering: `model/` (domain and the single IPC client) → `presenters/` (hooks, no JSX) → `views/` (presentational).
- **Engine**: `crates/engine/`, audio through `kira` 0.12 behind our own `Backend`/`Track`/`Effect` traits. No Tauri dependency.
- **Format**: `crates/format/`, the open `.beat` archive spec (serde + zip).
- Name code by **role, not brand** (`engine`, not `beatpad-engine`). Only the repository root carries "beatpad".

## Commands

`package.json` scripts and the Cargo workspace are the source of truth. The ones that need context:

- `pnpm tauri dev` runs the app.
- `cargo run -p engine --example smoke -- src-tauri/assets/pad.wav` is the audio smoke test.
- The full check is what CI runs, listed in `CONTRIBUTING.md`. CI uses pnpm 10.

## Conventions

- Architecture is **SOLID + MVP**: View ← Presenter ← Model (IPC client). Only `src/model/ipc/` imports `@tauri-apps/*`; ESLint enforces it.
- Audio runs on a dedicated thread that owns kira's `AudioManager`. Commands only `send()` a `PadEvent` down a channel, so the engine stays out of Tauri state.
- Conventional Commits with a lowercase subject and no trailing period, per `CONTRIBUTING.md`.
- Verify before claiming done: run the test and read its output.

## Docs (read when relevant)

- `agent_docs/architecture.md`: crate and module map, the `PadEvent`/`Backend`/`Track`/`Effect` seams, data flow, MVP layering.
- `agent_docs/audio-engine.md`: kira 0.12 usage, the audio-actor model, the looping and tempo plan, the CLAP/VST plugin seam.
- `agent_docs/beat-format.md`: the `.beat` archive spec and its serde types.

<important if="touching audio playback, looping, kira, or the audio thread">
Read `agent_docs/audio-engine.md` first: the threading model and kira 0.12's API shape have non-obvious constraints.
</important>
<important if="adding MIDI or any new input source">
All input normalizes to `engine::PadEvent` in `src-tauri/src/input.rs`. Feed that same pipeline.
</important>
<important if="creating a release or tagging">
The version lives in `package.json` and `src-tauri/tauri.conf.json`. Releases are CI-only, triggered by a `v*` tag; users only ever get CI-built artifacts.
</important>

## Summarization

When summarizing or compacting a session, preserve:

- Files modified and the specific changes made (snippets where possible)
- Current branch and uncommitted work
- Active feature or phase, and any blockers
- Audio-thread and kira API state, if mid-change
- `.beat` format or schema state, if in progress
- All user corrections and preferences from the session
