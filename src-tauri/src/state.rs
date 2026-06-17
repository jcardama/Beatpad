use crossbeam_channel::{unbounded, Sender};
use engine::{Backend, Engine, KiraBackend, PadEvent, PadId, PlayMode};
use serde::Serialize;
use tauri::{AppHandle, Emitter};

/// Bundled scaffold sample, embedded at compile time so dev and the packaged
/// app behave identically. Real sample packs load from `.beat` archives later.
const PAD_SAMPLE: &[u8] = include_bytes!("../assets/pad.wav");

/// Number of pads (8×8 grid, played as two banks of 4 rows).
const PAD_COUNT: u16 = 64;

/// Work item sent to the audio thread.
pub enum AudioCmd {
    Pad(PadEvent),
    SetMode(PadId, PlayMode),
}

/// Emitted to the UI whenever a pad's looping state flips, so the view reflects
/// the engine as the single source of truth (not optimistic guesses).
#[derive(Clone, Serialize)]
struct LoopChanged {
    pad: u16,
    looping: bool,
}

/// Shared application state held by Tauri. Holds only the channel sender — the
/// engine and its kira `AudioManager` live entirely on the audio thread, so
/// nothing audio-related is ever locked inside a command.
pub struct AppState {
    tx: Sender<AudioCmd>,
}

impl AppState {
    /// Spawn the audio thread and return a handle holding its command sender.
    pub fn spawn(app: AppHandle) -> Self {
        let (tx, rx) = unbounded::<AudioCmd>();

        std::thread::spawn(move || {
            let mut backend = match KiraBackend::new() {
                Ok(backend) => backend,
                Err(e) => {
                    eprintln!("[audio] init failed: {e}");
                    return;
                }
            };
            println!("[audio] output: {}", backend.device_label());

            for pad in 0..PAD_COUNT {
                if let Err(e) = backend.register_sample(PadId(pad), PAD_SAMPLE.to_vec()) {
                    eprintln!("[audio] register pad {pad} failed: {e}");
                }
            }

            let mut engine = Engine::new(backend);
            let mut last_loop = vec![false; PAD_COUNT as usize];

            // Drains until the sender (and thus the app) is dropped.
            while let Ok(cmd) = rx.recv() {
                match cmd {
                    AudioCmd::Pad(event) => {
                        let pad = event.pad;
                        engine.handle_event(event);
                        emit_loop_change(&app, &mut last_loop, pad, engine.is_looping(pad));
                    }
                    AudioCmd::SetMode(pad, mode) => engine.set_mode(pad, mode),
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

fn emit_loop_change(app: &AppHandle, last: &mut [bool], pad: PadId, looping: bool) {
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
