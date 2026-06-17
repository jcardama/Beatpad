/// A pad's voice: a loaded sample that can be triggered, released, and looped.
/// Backends provide concrete implementations (kira today, possibly a custom
/// graph once plugin hosting drives the design).
pub trait Track {
    /// Start the sample. `velocity` is 0–127 (MIDI-style); keyboard input
    /// sends a fixed value today.
    fn trigger(&mut self, velocity: u8);

    /// Stop the sample (used by hold-to-loop release and one-shot cut).
    fn release(&mut self);

    /// Toggle whether the sample loops. Loop tempo-sync is wired in later.
    fn set_looping(&mut self, looping: bool);
}
