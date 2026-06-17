<div align="center">

# BeatPad

**A Launchpad-style beat pad for your computer keyboard — on Windows, macOS, and Linux.**

[![CI](https://github.com/jcardama/beatpad/actions/workflows/ci.yml/badge.svg)](https://github.com/jcardama/beatpad/actions/workflows/ci.yml)
[![License: GPL-3.0](https://img.shields.io/badge/License-GPL%203.0-277BB2.svg)](./LICENSE)

</div>

BeatPad turns your keyboard into a grid of velocity pads: hit a key, fire a sample, instantly. It's a fresh, open-source rebuild of the original BeatPad — built on a low-latency Rust audio engine so finger-drumming feels immediate.

## Why

- **Instant** — pads trigger through a native Rust audio engine, not a browser tab.
- **Keyboard-first** — no hardware required; real MIDI controllers (including Launchpads) come later via the same input pipeline.
- **Open** — beats are shared as a documented `.beat` archive format (a zip of samples + a manifest, defined in [`crates/format/`](./crates/format)), paving the way for a community pack repository.
- **Cross-platform** — one codebase ships to Windows, macOS, and Linux (Tauri).

## Status

Early rebuild. The current build is a working vertical slice: a 4×4 pad grid that plays a bundled sample from keyboard or click. Looping, sample-pack loading, and MIDI are on the roadmap.

## Install

Builds are published on the [Releases](https://github.com/jcardama/beatpad/releases) page (coming soon). For now, run from source.

## Quick start (from source)

**Prerequisites:** [Node 20+](https://nodejs.org) with [pnpm](https://pnpm.io), the [Rust toolchain](https://rustup.rs), and the [Tauri v2 system dependencies](https://v2.tauri.app/start/prerequisites/) for your OS (on Debian/Ubuntu: `libwebkit2gtk-4.1-dev`, `libasound2-dev`, plus the usual build tools).

```bash
git clone https://github.com/jcardama/beatpad.git
cd beatpad
pnpm install
pnpm tauri dev
```

## Pads

The scaffold maps a 4×4 grid to a classic finger-drumming layout:

```
1  2  3  4
Q  W  E  R
A  S  D  F
Z  X  C  V
```

Press a key (or click a pad) to trigger it.

## Architecture

| Part | Path | What it is |
| --- | --- | --- |
| Shell | `src-tauri/` | Tauri v2 host: IPC, window, audio thread |
| Frontend | `src/` | React + TypeScript + Tailwind + shadcn (MVP layering) |
| Engine | `crates/engine/` | Rust audio via [kira](https://crates.io/crates/kira), behind swappable traits |
| Format | `crates/format/` | The open `.beat` archive spec |

The engine is Tauri-free and unit-testable; all input normalizes to a single `PadEvent` so keyboard today and MIDI tomorrow share one path.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md). We use [Conventional Commits](https://www.conventionalcommits.org/).

## License

[GPL-3.0](./LICENSE). By contributing, you agree your contributions are licensed under GPL-3.0.
