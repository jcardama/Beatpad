use std::collections::BTreeMap;

use serde::{Deserialize, Serialize};

/// Bump when the on-disk shape changes incompatibly.
pub const CURRENT_FORMAT_VERSION: u32 = 1;

/// Pad grid dimensions (e.g. 8×8 like a Launchpad).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct GridSize {
    pub rows: u8,
    pub cols: u8,
}

/// How a pad plays back its sample.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PadMode {
    OneShot,
    HoldLoop,
    ToggleLoop,
}

/// Binds one pad (linear, row-major index) to a sample file inside the
/// archive's `samples/` directory.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PadMapping {
    pub pad: u16,
    pub sample: String,
    pub mode: PadMode,
}

/// The `manifest.json` at the root of a `.beat` archive.
#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct Manifest {
    pub format_version: u32,
    pub name: String,
    pub author: String,
    pub bpm: f32,
    pub grid: GridSize,
    pub pads: Vec<PadMapping>,
    #[serde(default)]
    pub metadata: BTreeMap<String, String>,
}
