use std::collections::{HashMap, HashSet};

use crate::backend::{Backend, BackendError};
use crate::event::{PadEvent, PadId, Phase};
use crate::mode::PlayMode;

/// The audio engine: owns a [`Backend`], tracks each pad's [`PlayMode`], and
/// routes normalized [`PadEvent`]s accordingly. UI- and backend-agnostic — it
/// knows nothing of Tauri or kira.
pub struct Engine<B: Backend> {
    backend: B,
    modes: HashMap<PadId, PlayMode>,
    looping: HashSet<PadId>,
}

impl<B: Backend> Engine<B> {
    pub fn new(backend: B) -> Self {
        Self {
            backend,
            modes: HashMap::new(),
            looping: HashSet::new(),
        }
    }

    pub fn set_mode(&mut self, pad: PadId, mode: PlayMode) {
        // Changing a looping pad's mode must stop the voice, or it strands with
        // no release path.
        if self.looping.remove(&pad) {
            self.backend.stop(pad);
        }
        self.modes.insert(pad, mode);
    }

    fn mode(&self, pad: PadId) -> PlayMode {
        self.modes.get(&pad).copied().unwrap_or_default()
    }

    /// Load (or replace) a pad's sample. Stops any loop on that pad first so a
    /// replaced sample never leaves an orphaned voice playing.
    pub fn load_sample(&mut self, pad: PadId, bytes: Vec<u8>) -> Result<(), BackendError> {
        if self.looping.remove(&pad) {
            self.backend.stop(pad);
        }
        self.backend.register_sample(pad, bytes)
    }

    /// Remove a pad's sample, stopping any loop on it.
    pub fn clear(&mut self, pad: PadId) {
        if self.looping.remove(&pad) {
            self.backend.stop(pad);
        }
        self.backend.clear(pad);
    }

    /// Whether the pad has a sample loaded.
    pub fn is_loaded(&self, pad: PadId) -> bool {
        self.backend.is_loaded(pad)
    }

    /// Whether the pad is currently looping (held-loop active or toggle-loop on).
    pub fn is_looping(&self, pad: PadId) -> bool {
        self.looping.contains(&pad)
    }

    /// Route one pad gesture, applying the pad's play mode.
    pub fn handle_event(&mut self, event: PadEvent) {
        let pad = event.pad;
        match (self.mode(pad), event.phase) {
            (PlayMode::OneShot, Phase::Press) => {
                // A one-shot chokes any loop on this pad, so drop its loop state.
                self.backend.set_looping(pad, false);
                self.backend.play(pad, event.velocity);
                self.looping.remove(&pad);
            }
            (PlayMode::HoldLoop, Phase::Press) => self.start_loop(pad, event.velocity),
            (PlayMode::HoldLoop, Phase::Release) => self.stop_loop(pad),
            (PlayMode::ToggleLoop, Phase::Press) => {
                if self.looping.contains(&pad) {
                    self.stop_loop(pad);
                } else {
                    self.start_loop(pad, event.velocity);
                }
            }
            // One-shot release and toggle-loop release are no-ops.
            (PlayMode::OneShot, Phase::Release) | (PlayMode::ToggleLoop, Phase::Release) => {}
        }
    }

    fn start_loop(&mut self, pad: PadId, velocity: u8) {
        self.backend.set_looping(pad, true);
        self.backend.play(pad, velocity);
        self.looping.insert(pad);
    }

    fn stop_loop(&mut self, pad: PadId) {
        self.backend.stop(pad);
        self.looping.remove(&pad);
    }

    pub fn backend_mut(&mut self) -> &mut B {
        &mut self.backend
    }

    pub fn device_label(&self) -> String {
        self.backend.device_label()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::backend::BackendError;

    #[derive(Default)]
    struct MockBackend {
        calls: Vec<String>,
    }

    impl Backend for MockBackend {
        fn register_sample(&mut self, _pad: PadId, _bytes: Vec<u8>) -> Result<(), BackendError> {
            Ok(())
        }
        fn clear(&mut self, pad: PadId) {
            self.calls.push(format!("clear {}", pad.0));
        }
        fn is_loaded(&self, _pad: PadId) -> bool {
            false
        }
        fn play(&mut self, pad: PadId, _velocity: u8) {
            self.calls.push(format!("play {}", pad.0));
        }
        fn stop(&mut self, pad: PadId) {
            self.calls.push(format!("stop {}", pad.0));
        }
        fn set_looping(&mut self, pad: PadId, looping: bool) {
            self.calls.push(format!("loop {} {}", pad.0, looping));
        }
        fn device_label(&self) -> String {
            "mock".to_string()
        }
    }

    fn press(pad: u16) -> PadEvent {
        PadEvent {
            pad: PadId(pad),
            velocity: 127,
            phase: Phase::Press,
        }
    }

    fn release(pad: u16) -> PadEvent {
        PadEvent {
            pad: PadId(pad),
            velocity: 0,
            phase: Phase::Release,
        }
    }

    #[test]
    fn one_shot_plays_on_press_and_ignores_release() {
        let mut engine = Engine::new(MockBackend::default());
        engine.handle_event(press(0));
        engine.handle_event(release(0));
        assert_eq!(engine.backend_mut().calls, ["loop 0 false", "play 0"]);
        assert!(!engine.is_looping(PadId(0)));
    }

    #[test]
    fn hold_loop_loops_while_held() {
        let mut engine = Engine::new(MockBackend::default());
        engine.set_mode(PadId(1), PlayMode::HoldLoop);
        engine.handle_event(press(1));
        assert!(engine.is_looping(PadId(1)));
        engine.handle_event(release(1));
        assert!(!engine.is_looping(PadId(1)));
        assert_eq!(
            engine.backend_mut().calls,
            ["loop 1 true", "play 1", "stop 1"]
        );
    }

    #[test]
    fn toggle_loop_flips_on_each_press() {
        let mut engine = Engine::new(MockBackend::default());
        engine.set_mode(PadId(2), PlayMode::ToggleLoop);
        engine.handle_event(press(2));
        assert!(engine.is_looping(PadId(2)));
        engine.handle_event(release(2)); // no-op
        engine.handle_event(press(2));
        assert!(!engine.is_looping(PadId(2)));
        assert_eq!(
            engine.backend_mut().calls,
            ["loop 2 true", "play 2", "stop 2"]
        );
    }

    #[test]
    fn set_mode_stops_a_running_loop() {
        let mut engine = Engine::new(MockBackend::default());
        engine.set_mode(PadId(0), PlayMode::ToggleLoop);
        engine.handle_event(press(0));
        assert!(engine.is_looping(PadId(0)));

        // Switching the mode (e.g. from the settings panel) must stop the voice.
        engine.set_mode(PadId(0), PlayMode::OneShot);
        assert!(!engine.is_looping(PadId(0)));
        assert_eq!(engine.backend_mut().calls.last().unwrap(), "stop 0");
    }

    #[test]
    fn one_shot_press_clears_a_running_loop() {
        let mut engine = Engine::new(MockBackend::default());
        engine.set_mode(PadId(0), PlayMode::ToggleLoop);
        engine.handle_event(press(0)); // start the loop
        assert!(engine.is_looping(PadId(0)));

        // Play the pad in one-shot: the loop state must clear (no orphan).
        engine.set_mode(PadId(0), PlayMode::OneShot);
        engine.handle_event(press(0));
        assert!(!engine.is_looping(PadId(0)));

        // Back to toggle: a press starts a fresh loop, not a second one on top.
        engine.set_mode(PadId(0), PlayMode::ToggleLoop);
        engine.handle_event(press(0));
        assert!(engine.is_looping(PadId(0)));
    }
}
