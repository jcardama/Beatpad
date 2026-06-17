use engine::{PadEvent, PadId, Phase};

/// Normalize a webview pad command into an engine [`PadEvent`]. This is the
/// single seam every input source funnels through: the keyboard sends pad
/// indices today; a MIDI source (`midir`) will produce the same `PadEvent`
/// later without the engine knowing the difference.
pub fn pad_event(pad: u16, phase: Phase, velocity: u8) -> PadEvent {
    PadEvent {
        pad: PadId(pad),
        velocity,
        phase,
    }
}
