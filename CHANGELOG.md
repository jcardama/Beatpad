# Changelog

All notable changes to BeatPad are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/) and the project adheres to
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Initial project scaffold: Tauri v2 shell, React + TypeScript + Tailwind + shadcn frontend (MVP layering), and a Rust audio engine (`kira`) behind swappable `Backend`/`Track`/`Effect` traits.
- Keyboard → `PadEvent` → audio-thread pipeline; 4×4 pad grid vertical slice that plays a bundled sample.
- Open `.beat` archive format (`crates/format`) with manifest serde types and zip read/write.
