# Changelog

All notable changes to BeatPad are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/) and the project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-06-18

### Added
- Project foundation: Tauri v2 shell, React + TypeScript + Tailwind + shadcn frontend (MVP layering: model → presenters → views), and a Rust audio engine (`kira`) behind swappable `Backend`/`Track`/`Effect` traits.
- Keyboard → `PadEvent` → audio-thread pipeline (MIDI-ready); the engine runs on its own thread and is never locked behind a `Mutex`.
- 8×8 pad grid played as two banks of 32 keys (Tab flips the active half), with selectable **Banked** (32-key) and **Direct** (64-key) layouts.
- Three play modes per pad — one-shot, hold-loop, toggle-loop — settable per pad (right-click menu) or across the whole board (global mode buttons).
- Per-pad sounds: load, replace, or clear a sample from the pad menu; open and close `.beat` sample packs.
- Open `.beat` archive format (`crates/format`): manifest serde types + zip read/write.
- Native OS titlebar and window menu (BeatPad / File / Edit / View / Window / Help) — About, Preferences, Open/Close pack, Clear board, theme switch, Always on Top, and Changelog/GitHub/Facebook/Licenses links; Alt toggles the menu bar.
- Settings panel: theme (System/Dark/Light), language, and fully remappable keybindings with click-to-record.
- Internationalization: typed message catalogs with OS-language detection, an in-app language switch, persistence, and a synced `<html lang>`. Ships **English** and **Spanish**.
- Board persistence: per-pad assigned sounds and modes are saved and replayed on startup (missing files are dropped silently).
- Automatic update check: polls GitHub Releases on startup and once a day, plus a **Check for Updates** menu item, surfacing the result in-app (no redirect) with an opt-in to open the releases page.
- In-app toast notifications: update results and sample/pack load failures surface as themed, auto-dismissing toasts instead of native OS dialogs.

### Changed
- Grew the grid from the original 4×4 scaffold to 8×8; reverted the custom titlebar to the native OS titlebar + menu.
- Theme, language, and keybindings follow the OS by default and persist via the store plugin.
- Refined the visual language: a tighter, weight-led type scale (ported from the Spotify Mobile kit, rendered in Geist) over a brand-anchored palette — `#333` ink as light-mode text and the dark surface family, with `#277bb2` as the sole accent.
- The About dialog and update check read the version from the build (`CARGO_PKG_VERSION`) rather than a hardcoded string.
- Updated dependencies: `zip` 8, `@vitejs/plugin-react` 5, TypeScript 6, and the CI GitHub Actions (v6); CI now runs with `--locked`.

### Fixed
- Settings hydration no longer clobbers an edit made before the initial load resolves.
- An empty or unusable `.beat` pack now reports an error and leaves the board intact instead of silently wiping it.
- Sample-load and pack-load failures surface to the user; dropped pack pads (out-of-grid or missing sample) and kira play errors are logged.
- Changing a looping pad's mode stops the voice instead of stranding it; one-shot hits skip a redundant loop reset.
- Keyboard autorepeat no longer floods the engine with IPC, and key events are ignored while typing in inputs.
- The BeatPad window icon is applied at runtime, so Linux/WSLg shows it in the taskbar instead of a generic placeholder.

### Security
- Set a restrictive Content-Security-Policy and removed the unused `opener` capability.
- `.beat` reads are memory-bounded (per-entry, per-sample, and total-size caps), reject Zip-slip paths, and validate `format_version`.
- Per-pad IPC commands reject out-of-grid pad indices.

[Unreleased]: https://github.com/jcardama/Beatpad/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/jcardama/Beatpad/releases/tag/v0.1.0
