use std::collections::BTreeMap;
use std::sync::Mutex;

use crossbeam_channel::{unbounded, Sender};
use engine::{BackendError, Engine, KiraBackend, KiraSample, PadEvent, PadId, PlayMode};
use serde::Serialize;
use tauri::{AppHandle, Emitter};

/// Number of pads (8×8 grid, played as two banks of 4 rows).
pub const PAD_COUNT: u16 = 64;

/// One pad's saved sample: its file name plus the raw encoded bytes.
pub struct SampleEntry {
    pub name: String,
    pub bytes: Vec<u8>,
}

/// Byte cache of the loaded samples, keyed by pad — the document model used to
/// write the board back to a `.beat`. The audio thread keeps only *decoded*
/// audio, so the raw bytes for serialization live here. Held behind a `Mutex`
/// in Tauri state; this is NOT the audio engine (which stays on its own thread).
/// Mutating commands hold this lock through sending their matching `AudioCmd`
/// so the cache and audio command queue apply mutations in the same order.
#[derive(Default)]
pub struct SampleStore(pub Mutex<BTreeMap<u16, SampleEntry>>);

/// One pad's entry in a loaded sample pack.
pub struct PackEntry {
    pub pad: PadId,
    pub sample: Result<KiraSample, BackendError>,
    pub mode: PlayMode,
}

/// Work item sent to the audio thread.
pub enum AudioCmd {
    Pad(PadEvent),
    SetMode(PadId, PlayMode),
    /// Load (or replace) a single pad's sample.
    LoadSound(PadId, Result<KiraSample, BackendError>),
    /// Replace the whole board with a sample pack.
    LoadPack(Vec<PackEntry>),
    /// Remove a single pad's sample.
    Clear(PadId),
    /// Stop every running loop at once (panic).
    StopAll,
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

/// Emitted when a sample failed to decode in the loading worker.
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
                    AudioCmd::LoadSound(pad, sample) => {
                        load_one(&app, &mut engine, &mut last_loop, pad, sample);
                    }
                    AudioCmd::LoadPack(entries) => {
                        for pad in 0..PAD_COUNT {
                            clear_one(&app, &mut engine, &mut last_loop, PadId(pad));
                        }
                        for entry in entries {
                            engine.set_mode(entry.pad, entry.mode);
                            load_one(&app, &mut engine, &mut last_loop, entry.pad, entry.sample);
                        }
                    }
                    AudioCmd::Clear(pad) => {
                        clear_one(&app, &mut engine, &mut last_loop, pad);
                    }
                    AudioCmd::StopAll => {
                        for pad in engine.stop_all() {
                            emit_loop(&app, &mut last_loop, pad, false);
                        }
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
    sample: Result<KiraSample, BackendError>,
) {
    match engine.load_sample(pad, sample) {
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
