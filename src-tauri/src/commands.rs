use std::collections::BTreeMap;

use engine::{PadId, Phase, PlayMode};
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::input::pad_event;
use crate::state::{AppState, AudioCmd, PackEntry, SampleStore, PAD_COUNT};

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
pub fn load_pad_sound(
    pad: u16,
    path: String,
    state: State<AppState>,
    samples: State<SampleStore>,
) -> Result<(), String> {
    if pad >= PAD_COUNT {
        return Err("pad out of range".into());
    }
    let bytes = std::fs::read(&path).map_err(|e| e.to_string())?;
    samples.set(pad, file_name(&path), bytes.clone());
    state.send(AudioCmd::LoadSound(PadId(pad), bytes));
    Ok(())
}

/// Load a `.beat` pack, replacing the board. Returns each filled pad + its mode.
#[tauri::command]
pub fn load_beat_pack(
    path: String,
    state: State<AppState>,
    samples: State<SampleStore>,
) -> Result<Vec<LoadedPad>, String> {
    let file = std::fs::File::open(&path).map_err(|e| e.to_string())?;
    let beat = format::read_beat(file).map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    let mut loaded = Vec::new();
    let mut cached = Vec::new();
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
                cached.push((mapping.pad, mapping.sample.clone(), bytes.clone()));
            }
            None => log::warn!(
                "pack pad {} references missing sample '{}'; skipped",
                mapping.pad,
                mapping.sample
            ),
        }
    }

    // The pack replaces the board, so the save cache is rebuilt to match — only
    // once we know the load is worth applying (a non-empty result).
    if !cached.is_empty() {
        samples.clear();
        for (pad, name, bytes) in cached {
            samples.set(pad, name, bytes);
        }
    }

    state.send(AudioCmd::LoadPack(entries));
    Ok(loaded)
}

/// Stop every running loop at once (panic).
#[tauri::command]
pub fn stop_all(state: State<AppState>) {
    state.send(AudioCmd::StopAll);
}

/// Remove the sound from a single pad.
#[tauri::command]
pub fn clear_pad(pad: u16, state: State<AppState>, samples: State<SampleStore>) {
    if pad >= PAD_COUNT {
        return;
    }
    samples.remove(pad);
    state.send(AudioCmd::Clear(PadId(pad)));
}

/// Manifest fields the UI supplies when saving a board to a `.beat`.
#[derive(Deserialize)]
pub struct SaveMeta {
    name: String,
    author: String,
    bpm: f32,
}

/// Write the current board to a `.beat` archive. `modes` is indexed by pad
/// (the UI owns per-pad modes); sample bytes come from the save cache.
#[tauri::command]
pub fn save_beat(
    path: String,
    meta: SaveMeta,
    modes: Vec<String>,
    samples: State<SampleStore>,
) -> Result<(), String> {
    let store = samples.0.lock().unwrap();
    if store.is_empty() {
        return Err("the board is empty".into());
    }

    let mut sample_bytes = BTreeMap::new();
    let mut pads = Vec::new();
    for (&pad, entry) in store.iter() {
        // Prefix with the pad index so two pads can carry same-named files.
        let sample = format!("{pad}_{}", entry.name);
        sample_bytes.insert(sample.clone(), entry.bytes.clone());
        let mode = modes
            .get(pad as usize)
            .map(|m| to_format_mode(m))
            .unwrap_or(format::PadMode::OneShot);
        pads.push(format::PadMapping { pad, sample, mode });
    }

    let manifest = format::Manifest {
        format_version: format::CURRENT_FORMAT_VERSION,
        name: meta.name,
        author: meta.author,
        bpm: meta.bpm,
        grid: format::GridSize { rows: 8, cols: 8 },
        pads,
        metadata: BTreeMap::new(),
    };
    let beat = format::Beat {
        manifest,
        samples: sample_bytes,
    };
    let file = std::fs::File::create(&path).map_err(|e| e.to_string())?;
    format::write_beat(file, &beat).map_err(|e| e.to_string())
}

/// The trailing file name of a path, for naming samples inside the archive.
fn file_name(path: &str) -> String {
    std::path::Path::new(path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("sample")
        .to_string()
}

/// Show or hide the native menu bar. The UI owns the visibility state (toggled
/// by Alt) and persists it, so this just applies the requested value.
#[tauri::command]
pub fn set_menu_visible(window: tauri::WebviewWindow, visible: bool) {
    let _ = if visible {
        window.show_menu()
    } else {
        window.hide_menu()
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

fn to_format_mode(mode: &str) -> format::PadMode {
    match mode {
        "hold_loop" => format::PadMode::HoldLoop,
        "toggle_loop" => format::PadMode::ToggleLoop,
        _ => format::PadMode::OneShot,
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
    fn to_format_mode_maps_known_strings_and_defaults() {
        assert!(matches!(
            to_format_mode("hold_loop"),
            format::PadMode::HoldLoop
        ));
        assert!(matches!(
            to_format_mode("toggle_loop"),
            format::PadMode::ToggleLoop
        ));
        assert!(matches!(
            to_format_mode("one_shot"),
            format::PadMode::OneShot
        ));
        assert!(matches!(to_format_mode("???"), format::PadMode::OneShot));
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
