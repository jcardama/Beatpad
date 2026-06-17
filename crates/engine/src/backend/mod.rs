pub mod kira_backend;

use crate::event::PadId;

/// Errors a backend can surface while loading or initializing audio.
#[derive(Debug)]
pub enum BackendError {
    Init(String),
    Load(String),
}

impl std::fmt::Display for BackendError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BackendError::Init(m) => write!(f, "audio init failed: {m}"),
            BackendError::Load(m) => write!(f, "sample load failed: {m}"),
        }
    }
}

impl std::error::Error for BackendError {}

/// Abstraction over the audio backend so kira stays swappable. The engine
/// drives pads through this trait and never touches kira types directly.
pub trait Backend {
    fn register_sample(&mut self, pad: PadId, bytes: Vec<u8>) -> Result<(), BackendError>;
    fn play(&mut self, pad: PadId, velocity: u8);
    fn stop(&mut self, pad: PadId);
    fn set_looping(&mut self, pad: PadId, looping: bool);
    /// Human-readable name of the selected output device (for startup logging).
    fn device_label(&self) -> String;
}
