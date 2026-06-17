# Contributing to BeatPad

Thanks for your interest in contributing to BeatPad!

## Code of Conduct

Be respectful and constructive in all interactions.

## How to contribute

### Reporting issues

- Search existing issues before opening a new one.
- Use a clear, descriptive title.
- Include steps to reproduce, and your OS / audio setup for bugs.

### Pull requests

1. Fork the repository.
2. Create a branch (`git checkout -b feat/amazing-feature`).
3. Make your changes.
4. Run the checks:
   - Frontend: `pnpm lint && pnpm test && pnpm build`
   - Rust: `cargo fmt --all -- --check && cargo clippy --all-targets -- -D warnings && cargo test --workspace`
5. Commit with [Conventional Commits](https://www.conventionalcommits.org/).
6. Push and open a PR.

PRs must pass CI and receive at least one approving review before merging. Changes to `.github/` require owner review.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new features
- `fix:` — bug fixes
- `docs:` — documentation changes
- `chore:` — maintenance tasks
- `refactor:` — code refactoring
- `test:` — test additions/changes

## Code style

Formatting and linting are enforced by tooling, not by review:

- **Rust** — `cargo fmt` + `cargo clippy` (warnings are errors in CI).
- **TypeScript/React** — ESLint. Note the guardrail: only `src/model/ipc/` may import `@tauri-apps/*` (the View and Presenter layers go through the IPC client).

Add tests for new behavior where practical. The audio engine (`crates/engine`) and format (`crates/format`) are Tauri-free and unit-testable; presenters are testable headless with Vitest.

## Development setup

See [README.md](./README.md#quick-start-from-source) for prerequisites and the run command. The shell lives in `src-tauri/`, the UI in `src/` (model → presenters → views), and the audio/format logic in `crates/engine/` and `crates/format/`.

## License

By contributing, you agree that your contributions will be licensed under GPL-3.0.
