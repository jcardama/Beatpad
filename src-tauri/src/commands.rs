use engine::{PadId, Phase, PlayMode};
use serde::Serialize;
use tauri::State;

use crate::input::pad_event;
use crate::state::{AppState, AudioCmd, PackEntry, PAD_COUNT};

/// What a `.beat` pack filled: a pad plus the mode the pack assigned it, so the
/// UI can reflect per-pad modes after loading.
#[derive(Serialize)]
pub struct LoadedPad {
    pad: u16,
    mode: String,
}

/// Fixed velocity for keyboard input (the computer keyboard has no velocity
/// sensing). MIDI input will supply real velocities later.
const KEYBOARD_VELOCITY: u8 = 127;

#[tauri::command]
pub fn trigger_pad(pad: u16, state: State<AppState>) {
    if pad >= PAD_COUNT {
        return;
    }
    state.send(AudioCmd::Pad(pad_event(
        pad,
        Phase::Press,
        KEYBOARD_VELOCITY,
    )));
}

#[tauri::command]
pub fn release_pad(pad: u16, state: State<AppState>) {
    if pad >= PAD_COUNT {
        return;
    }
    state.send(AudioCmd::Pad(pad_event(pad, Phase::Release, 0)));
}

#[tauri::command]
pub fn set_pad_mode(pad: u16, mode: String, state: State<AppState>) {
    if pad >= PAD_COUNT {
        return;
    }
    state.send(AudioCmd::SetMode(PadId(pad), parse_mode(&mode)));
}

/// Load (or replace) the sound on a single pad from a file on disk.
#[tauri::command]
pub fn load_pad_sound(pad: u16, path: String, state: State<AppState>) -> Result<(), String> {
    if pad >= PAD_COUNT {
        return Err("pad out of range".into());
    }
    let bytes = std::fs::read(&path).map_err(|e| e.to_string())?;
    state.send(AudioCmd::LoadSound(PadId(pad), bytes));
    Ok(())
}

/// Load a `.beat` pack, replacing the board. Returns each filled pad + its mode.
#[tauri::command]
pub fn load_beat_pack(path: String, state: State<AppState>) -> Result<Vec<LoadedPad>, String> {
    let file = std::fs::File::open(&path).map_err(|e| e.to_string())?;
    let beat = format::read_beat(file).map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    let mut loaded = Vec::new();
    for mapping in &beat.manifest.pads {
        if mapping.pad >= PAD_COUNT {
            log::warn!("pack pad {} is outside the grid; skipped", mapping.pad);
            continue;
        }
        match beat.samples.get(&mapping.sample) {
            Some(bytes) => {
                entries.push(PackEntry {
                    pad: PadId(mapping.pad),
                    bytes: bytes.clone(),
                    mode: from_format_mode(mapping.mode),
                });
                loaded.push(LoadedPad {
                    pad: mapping.pad,
                    mode: format_mode_str(mapping.mode).to_string(),
                });
            }
            None => log::warn!(
                "pack pad {} references missing sample '{}'; skipped",
                mapping.pad,
                mapping.sample
            ),
        }
    }

    state.send(AudioCmd::LoadPack(entries));
    Ok(loaded)
}

/// Remove the sound from a single pad.
#[tauri::command]
pub fn clear_pad(pad: u16, state: State<AppState>) {
    if pad >= PAD_COUNT {
        return;
    }
    state.send(AudioCmd::Clear(PadId(pad)));
}

/// Show/hide the native menu bar (bound to Alt; the bar is hidden by default).
#[tauri::command]
pub fn toggle_menu(window: tauri::WebviewWindow) {
    let visible = window.is_menu_visible().unwrap_or(false);
    let _ = if visible {
        window.hide_menu()
    } else {
        window.show_menu()
    };
}

fn parse_mode(mode: &str) -> PlayMode {
    match mode {
        "hold_loop" => PlayMode::HoldLoop,
        "toggle_loop" => PlayMode::ToggleLoop,
        _ => PlayMode::OneShot,
    }
}

fn from_format_mode(mode: format::PadMode) -> PlayMode {
    match mode {
        format::PadMode::HoldLoop => PlayMode::HoldLoop,
        format::PadMode::ToggleLoop => PlayMode::ToggleLoop,
        format::PadMode::OneShot => PlayMode::OneShot,
    }
}

fn format_mode_str(mode: format::PadMode) -> &'static str {
    match mode {
        format::PadMode::OneShot => "one_shot",
        format::PadMode::HoldLoop => "hold_loop",
        format::PadMode::ToggleLoop => "toggle_loop",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_mode_maps_known_strings_and_defaults_to_one_shot() {
        assert!(matches!(parse_mode("hold_loop"), PlayMode::HoldLoop));
        assert!(matches!(parse_mode("toggle_loop"), PlayMode::ToggleLoop));
        assert!(matches!(parse_mode("one_shot"), PlayMode::OneShot));
        assert!(matches!(parse_mode("nonsense"), PlayMode::OneShot));
    }

    #[test]
    fn format_mode_str_round_trips_through_parse_mode() {
        for mode in [
            format::PadMode::OneShot,
            format::PadMode::HoldLoop,
            format::PadMode::ToggleLoop,
        ] {
            let engine_mode = from_format_mode(mode);
            let reparsed = parse_mode(format_mode_str(mode));
            assert_eq!(
                std::mem::discriminant(&engine_mode),
                std::mem::discriminant(&reparsed)
            );
        }
    }
}
