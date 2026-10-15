# Audio Engine

The engine lives in `crates/engine/` and uses **kira 0.12** (not 0.10 — the API differs). It is Tauri-free and unit-testable.

## Threading model (the important part)

kira's `AudioManager` owns audio-thread state and is **not** a friendly shared object. Do **not** store it behind a `Mutex` in Tauri state — locking it inside a command (e.g. while starting a sound) risks compile errors (`!Send`/`!Sync` via the internal `Rc`) or stalls.

Instead, an **audio actor**:
- `src-tauri/src/state.rs` spawns one thread that creates `KiraBackend` (and thus the `AudioManager`) *inside* the thread, then loops `rx.recv()` → `Engine::handle_event`.
- `AppState` in Tauri state holds **only** a `crossbeam_channel::Sender<AudioCmd>` (cheap, `Send + Sync + Clone`).
- Input commands just send normalized pad events. Sample-loading commands read and decode via `Backend::decode` on a blocking worker, then send ready audio. The audio thread only registers samples; it never decodes them. Save-cache mutations hold their own lock through the matching send, but file reads and decoding stay outside it.
- Loading commands send each decode result, including failures, to the audio thread. Pack entries always apply their modes; sample loads stop an existing loop before handling the result. Decode failures emit `sound-load-failed` from the audio thread, and mapped samples remain in the save cache even if decoding fails. Packs with mapped samples replace the board even if every decode fails; packs with no mapped samples send nothing.

Because the manager is built inside the thread, the spawn closure only captures the `Receiver` (which is `Send`), so kira's `!Send` internals never cross a thread boundary. `KiraBackend`/`KiraTrack` share the manager within that one thread via `Rc<RefCell<AudioManager>>`.

## kira 0.12 API shape (as used)

- `AudioManager::<DefaultBackend>::new(AudioManagerSettings::default())` — the `DefaultBackend` annotation is required for inference. `use kira::backend::DefaultBackend;`
- `StaticSoundData::from_cursor(Cursor::new(bytes))` — used inside `KiraBackend::decode` on a blocking worker (symphonia is on by default). Returns an opaque `KiraSample`; `Engine::load_sample` and `Backend::register_sample` only insert this ready audio.
- `manager.play(sound_data)` → `StaticSoundHandle`.
- `handle.stop(Tween::default())` — stop a playing voice.
- Looping: `sound_data.loop_region(0.0..)` before `play`.

See `crates/engine/src/backend/kira_backend.rs` for the live usage; `crates/engine/examples/smoke.rs` is a runnable check.

## Output latency (Windows)

- The engine uses `AudioManagerSettings::default()`: cpal's default output device, its default config, and `BufferSize::Default`.
- kira exposes `CpalBackendSettings { device, config }`; a `StreamConfig` with `BufferSize::Fixed(n)` is its only public buffer control.
- On Windows, cpal 0.17.3 (still true in 0.18.2) always opens WASAPI shared, event-driven output via `IAudioClient::Initialize`, with periodicity 0.
- It offers neither exclusive mode nor `IAudioClient3` low-latency shared mode; callbacks follow the OS audio-engine period regardless of the requested buffer size.
- Measured on Windows 11 with a USB output at 48 kHz, stereo F32: `Fixed(64)`, `Fixed(128)`, `Fixed(256)`, `Fixed(480)`, `Fixed(960)`, and `Default` were all accepted without stream errors.
- All behaved identically: 480-frame (10 ms) callbacks, with a larger first callback of 1056 frames.
- cpal's WASAPI output timestamp sets `playback = callback + frames_in_this_callback`, so `playback − callback` is that callback's own length by construction (10 ms for the steady 480-frame callbacks, 22 ms for the 1056-frame first one). It is not an independent device-latency measurement or acoustic loopback.
- Do not plumb a Windows buffer-size setting expecting lower latency. Going below the engine period needs WASAPI exclusive mode or `IAudioClient3`, which cpal's WASAPI host does not offer, or cpal's optional `asio` host, which kira does not enable and which needs the ASIO SDK to build and an ASIO driver to run.
- macOS CoreAudio and other Windows devices are not yet measured; measure before changing the default.

## Looping & tempo (v1 plan)

- Each `KiraTrack` already carries a `looping` flag and `set_looping`. Trigger applies `loop_region` when set.
- Per-pad `PadMode` (`OneShot` | `HoldLoop` | `ToggleLoop`) lives in `crates/format/src/manifest.rs`. The engine should honor the mode on `Press`/`Release`.
- Tempo sync: use a kira `Clock` owned by the `Engine`; quantize loop start/stop to the clock at the project BPM so loops stay in time. This is the next feature.

## Plugin seam (CLAP/VST — later, do not build now)

Keep everything behind the `Backend`/`Track`/`Effect` traits so plugins are additive, not a rewrite:
- `effect.rs` defines `Effect { process(Frame) -> Frame }`. A hosted plugin becomes one more `Effect` node in a track's chain.
- Target **CLAP first** (open standard, Rust hosting via the `clack` crate); VST3 is secondary. If plugin hosting ever becomes central, the `Backend` trait lets us swap kira for a custom cpal graph without touching the rest of the app.

## WSL2 / WSLg audio

kira → cpal → ALSA, bridged to PulseAudio by WSLg. Requires `libasound2-dev` (build) + `libasound2-plugins` (runtime ALSA→pulse) and `~/.asoundrc` routing the default PCM to `pulse`. `KiraBackend::device_label()` logs the target at startup so "no sound" is diagnosable.
