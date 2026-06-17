use crossbeam_channel::{unbounded, Sender};
use engine::{Backend, Engine, KiraBackend, PadEvent, PadId};

/// Bundled scaffold sample, embedded at compile time so dev and the packaged
/// app behave identically. Real sample packs load from `.beat` archives later.
const PAD_SAMPLE: &[u8] = include_bytes!("../assets/pad.wav");

/// Number of pads wired up for the vertical slice (4×4).
const PAD_COUNT: u16 = 16;

/// Shared application state held by Tauri. Holds only the channel sender — the
/// audio engine and its kira `AudioManager` live entirely on the audio thread,
/// so nothing audio-related is ever locked inside a command.
pub struct AppState {
    tx: Sender<PadEvent>,
}

impl AppState {
    /// Spawn the audio thread and return a handle holding its event sender.
    pub fn spawn() -> Self {
        let (tx, rx) = unbounded::<PadEvent>();

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
            // Drains until the sender (and thus the app) is dropped.
            while let Ok(event) = rx.recv() {
                engine.handle_event(event);
            }
        });

        Self { tx }
    }

    pub fn send(&self, event: PadEvent) {
        // A full/closed channel only happens during shutdown; dropping is fine.
        let _ = self.tx.send(event);
    }
}
