<p align="center">
  <img src="assets/logo.png" alt="BeatPad" width="128" />
</p>

# BeatPad

[![CI](https://github.com/jcardama/Beatpad/actions/workflows/ci.yml/badge.svg)](https://github.com/jcardama/Beatpad/actions/workflows/ci.yml)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL--3.0-blue.svg)](LICENSE)
![Platform: Windows / macOS / Linux](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-277BB2)
[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?logo=buy-me-a-coffee&logoColor=000)](https://buymeacoffee.com/jcardama)

A Launchpad-style beat pad for your computer keyboard.

<!-- TODO: drop a demo gif/video here once the grid + looping are camera-ready -->

## What Makes It Different

Most "make beats in the browser" tools run on the Web Audio API inside a tab. BeatPad is **native-audio-first**: pads trigger through a Rust engine ([kira](https://crates.io/crates/kira)) on a dedicated audio thread, so hitting a key feels instant — the way a hardware Launchpad does.

- **Sub-frame trigger latency** — a keypress crosses one in-process channel to a thread that owns the audio device; no browser audio graph in the hot path
- **Keyboard-first, MIDI-ready** — your keyboard *is* the grid today; real MIDI controllers (including Launchpads, with RGB feedback) join later through the exact same input pipeline, not a bolt-on
- **An open beat format** — beats are plain `.beat` archives (a zip of samples + a JSON manifest), built to be shared and, down the road, browsed in a community pack repository
- **One codebase, three OSes** — Windows, macOS, and Linux from a single Tauri build
- **GPL-3.0** — free and open; forks stay open

## Design Philosophy

A few deliberate choices, so you know what you're getting:

- **Native audio, not Web Audio.** The whole point is feel. Audio lives in Rust on its own thread that owns the device; the UI only ever sends it a normalized `PadEvent`. The webview never touches sound.
- **One input seam.** Keyboard, and later MIDI, both normalize to a single `PadEvent` before anything downstream sees them. Adding a controller never means a second code path.
- **A format, not a database.** What's shared between the desktop app and the future web repository is the open `.beat` spec — not our engine internals. The format is the contract.
- **Plugin-ready, but not yet.** The engine is built behind `Backend`/`Track`/`Effect` traits so a hosted CLAP (then VST) plugin can slot in as just another effect — without a rewrite. We're keeping the seam clean now and adding hosts later, rather than over-building today.

## Features

**Today**

- 8×8 pad grid (64 pads) played from the keyboard or by clicking — **Tab** flips the keyboard between the top and bottom halves, with the active half highlighted
- Three play modes: one-shot, hold-to-loop, and toggle-loop; looping pads pulse
- Native Rust audio engine with instant triggering; pads light on hit

**On the roadmap**

- Tempo-synced / quantized loops
- Loading shareable `.beat` sample packs
- Velocity-aware input
- MIDI input and hardware Launchpad RGB feedback
- CLAP / VST plugin hosting
- A web repository of community-curated beats

## Install

Builds will be published on the [Releases](https://github.com/jcardama/Beatpad/releases) page. Until then, run from source.

## Quick Start (from source)

Prerequisites: [Node 24+](https://nodejs.org) with [pnpm](https://pnpm.io), the [Rust toolchain](https://rustup.rs), and the [Tauri v2 system dependencies](https://v2.tauri.app/start/prerequisites/) for your OS. On Debian/Ubuntu that's `libwebkit2gtk-4.1-dev`, `libasound2-dev`, and the usual build tools.

```bash
git clone https://github.com/jcardama/Beatpad.git
cd Beatpad
pnpm install
pnpm tauri dev
```

## Pads

The 8×8 grid is played as two banks of 32 pads. Your keyboard's four rows address the **active** half; press **Tab** to flip to the other half. Press a key or click any pad to fire it:

```
1  2  3  4  5  6  7  8
Q  W  E  R  T  Y  U  I       ← these 32 keys play the
A  S  D  F  G  H  J  K          active half (top or bottom)
Z  X  C  V  B  N  M  ,

            Tab  ⇅  switch half
```

## Architecture

BeatPad is a Cargo workspace plus a Vite/React frontend:

| Part | Path | Responsibility |
|---|---|---|
| Shell | `src-tauri/` (`app`) | Thin Tauri v2 host: IPC, window, and the audio thread |
| Frontend | `src/` | React + TypeScript + Tailwind + shadcn, in an MVP layering (model → presenters → views) |
| Engine | `crates/engine/` | Audio via kira, behind swappable `Backend`/`Track`/`Effect` traits — no Tauri dependency |
| Format | `crates/format/` | The open `.beat` archive spec (serde + zip) |

The engine and format crates are Tauri-free and unit-tested. All input normalizes to a single `PadEvent`, so keyboard today and MIDI tomorrow share one path.

## Support

If you find BeatPad useful, consider supporting development:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?logo=buy-me-a-coffee&logoColor=000)](https://buymeacoffee.com/jcardama)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). We use [Conventional Commits](https://www.conventionalcommits.org/).

## License

[GPL-3.0](LICENSE). By contributing, you agree your contributions are licensed under GPL-3.0.
