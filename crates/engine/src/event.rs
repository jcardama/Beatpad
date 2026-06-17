/// Identifies a pad in the grid. Stays source-agnostic so keyboard input now
/// and MIDI input later both address the same pads.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub struct PadId(pub u16);

/// Whether a pad was pressed or released.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Phase {
    Press,
    Release,
}

/// A normalized pad gesture. Every input source (keyboard, MIDI, …) produces
/// this single type, so the engine never knows or cares where it came from.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct PadEvent {
    pub pad: PadId,
    pub velocity: u8,
    pub phase: Phase,
}
