use engine::Phase;
use tauri::State;

use crate::input::pad_event;
use crate::state::AppState;

/// Fixed velocity for keyboard input (the computer keyboard has no
/// velocity sensing). MIDI input will supply real velocities later.
const KEYBOARD_VELOCITY: u8 = 127;

#[tauri::command]
pub fn trigger_pad(pad: u16, state: State<AppState>) {
    state.send(pad_event(pad, Phase::Press, KEYBOARD_VELOCITY));
}

#[tauri::command]
pub fn release_pad(pad: u16, state: State<AppState>) {
    state.send(pad_event(pad, Phase::Release, 0));
}
