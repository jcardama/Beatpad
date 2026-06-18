use crossbeam_channel::{unbounded, Sender};
use engine::{Engine, KiraBackend, PadEvent, PadId, PlayMode};
use serde::Serialize;
use tauri::{AppHandle, Emitter};

/// Number of pads (8×8 grid, played as two banks of 4 rows).
pub const PAD_COUNT: u16 = 64;

/// One pad's entry in a loaded sample pack.
pub struct PackEntry {
    pub pad: PadId,
    pub bytes: Vec<u8>,
    pub mode: PlayMode,
}

/// Work item sent to the audio thread.
pub enum AudioCmd {
    Pad(PadEvent),
    SetMode(PadId, PlayMode),
    /// Load (or replace) a single pad's sample.
    LoadSound(PadId, Vec<u8>),
    /// Replace the whole board with a sample pack.
    LoadPack(Vec<PackEntry>),
    /// Remove a single pad's sample.
    Clear(PadId),
}

/// Emitted when a pad's looping state flips, so the view reflects the engine as
/// the single source of truth.
#[derive(Clone, Serialize)]
struct LoopChanged {
    pad: u16,
    looping: bool,
}

/// Emitted when a pad gains or loses a sample, so the view can grey out empties.
#[derive(Clone, Serialize)]
struct SoundChanged {
    pad: u16,
    loaded: bool,
}

/// Emitted when a sample fails to decode/load on the audio thread.
#[derive(Clone, Serialize)]
struct SoundLoadFailed {
    pad: u16,
    error: String,
}

/// Shared application state held by Tauri. Holds only the channel sender — the
/// engine and its kira `AudioManager` live entirely on the audio thread, so
/// nothing audio-related is ever locked inside a command.
pub struct AppState {
    tx: Sender<AudioCmd>,
}

impl AppState {
    /// Spawn the audio thread and return a handle holding its command sender.
    /// Pads start empty — samples are loaded at runtime from `.beat` packs or
    /// per-pad files.
    pub fn spawn(app: AppHandle) -> Self {
        let (tx, rx) = unbounded::<AudioCmd>();

        std::thread::spawn(move || {
            let backend = match KiraBackend::new() {
                Ok(backend) => backend,
                Err(e) => {
                    log::error!("audio init failed: {e}");
                    return;
                }
            };
            let mut engine = Engine::new(backend);
            log::info!("audio output: {}", engine.device_label());
            let mut last_loop = vec![false; PAD_COUNT as usize];

            // Drains until the sender (and thus the app) is dropped.
            while let Ok(cmd) = rx.recv() {
                match cmd {
                    AudioCmd::Pad(event) => {
                        let pad = event.pad;
                        engine.handle_event(event);
                        emit_loop(&app, &mut last_loop, pad, engine.is_looping(pad));
                    }
                    AudioCmd::SetMode(pad, mode) => engine.set_mode(pad, mode),
                    AudioCmd::LoadSound(pad, bytes) => {
                        load_one(&app, &mut engine, &mut last_loop, pad, bytes);
                    }
                    AudioCmd::LoadPack(entries) => {
                        // An empty pack (no usable pads) leaves the board intact
                        // rather than silently wiping it.
                        if !entries.is_empty() {
                            for pad in 0..PAD_COUNT {
                                clear_one(&app, &mut engine, &mut last_loop, PadId(pad));
                            }
                            for entry in entries {
                                engine.set_mode(entry.pad, entry.mode);
                                load_one(&app, &mut engine, &mut last_loop, entry.pad, entry.bytes);
                            }
                        }
                    }
                    AudioCmd::Clear(pad) => {
                        clear_one(&app, &mut engine, &mut last_loop, pad);
                    }
                }
            }
        });

        Self { tx }
    }

    pub fn send(&self, cmd: AudioCmd) {
        // A closed channel only happens during shutdown; dropping is fine.
        let _ = self.tx.send(cmd);
    }
}

fn load_one(
    app: &AppHandle,
    engine: &mut Engine<KiraBackend>,
    last_loop: &mut [bool],
    pad: PadId,
    bytes: Vec<u8>,
) {
    match engine.load_sample(pad, bytes) {
        Ok(()) => {
            emit_loop(app, last_loop, pad, engine.is_looping(pad));
            let _ = app.emit(
                "sound-changed",
                SoundChanged {
                    pad: pad.0,
                    loaded: true,
                },
            );
        }
        Err(e) => {
            log::error!("load pad {} failed: {e}", pad.0);
            let _ = app.emit(
                "sound-load-failed",
                SoundLoadFailed {
                    pad: pad.0,
                    error: e.to_string(),
                },
            );
        }
    }
}

fn clear_one(
    app: &AppHandle,
    engine: &mut Engine<KiraBackend>,
    last_loop: &mut [bool],
    pad: PadId,
) {
    if !engine.is_loaded(pad) {
        return;
    }
    engine.clear(pad);
    emit_loop(app, last_loop, pad, engine.is_looping(pad));
    let _ = app.emit(
        "sound-changed",
        SoundChanged {
            pad: pad.0,
            loaded: false,
        },
    );
}

fn emit_loop(app: &AppHandle, last: &mut [bool], pad: PadId, looping: bool) {
    let idx = pad.0 as usize;
    if idx < last.len() && last[idx] != looping {
        last[idx] = looping;
        let _ = app.emit(
            "loop-changed",
            LoopChanged {
                pad: pad.0,
                looping,
            },
        );
    }
}
