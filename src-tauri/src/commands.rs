use engine::{PadId, Phase, PlayMode};
use tauri::State;

use crate::input::pad_event;
use crate::state::{AppState, AudioCmd};

/// Fixed velocity for keyboard input (the computer keyboard has no velocity
/// sensing). MIDI input will supply real velocities later.
const KEYBOARD_VELOCITY: u8 = 127;

#[tauri::command]
pub fn trigger_pad(pad: u16, state: State<AppState>) {
    state.send(AudioCmd::Pad(pad_event(
        pad,
        Phase::Press,
        KEYBOARD_VELOCITY,
    )));
}

#[tauri::command]
pub fn release_pad(pad: u16, state: State<AppState>) {
    state.send(AudioCmd::Pad(pad_event(pad, Phase::Release, 0)));
}

#[tauri::command]
pub fn set_pad_mode(pad: u16, mode: String, state: State<AppState>) {
    let mode = match mode.as_str() {
        "hold_loop" => PlayMode::HoldLoop,
        "toggle_loop" => PlayMode::ToggleLoop,
        _ => PlayMode::OneShot,
    };
    state.send(AudioCmd::SetMode(PadId(pad), mode));
}
