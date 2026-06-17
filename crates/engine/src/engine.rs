use crate::backend::Backend;
use crate::event::{PadEvent, Phase};

/// The audio engine: owns a [`Backend`] and routes normalized [`PadEvent`]s to
/// it. UI-agnostic and backend-agnostic — it knows nothing of Tauri or kira.
pub struct Engine<B: Backend> {
    backend: B,
}

impl<B: Backend> Engine<B> {
    pub fn new(backend: B) -> Self {
        Self { backend }
    }

    /// Route one pad gesture to the backend.
    pub fn handle_event(&mut self, event: PadEvent) {
        match event.phase {
            Phase::Press => self.backend.play(event.pad, event.velocity),
            Phase::Release => self.backend.stop(event.pad),
        }
    }

    pub fn backend_mut(&mut self) -> &mut B {
        &mut self.backend
    }

    pub fn device_label(&self) -> String {
        self.backend.device_label()
    }
}
