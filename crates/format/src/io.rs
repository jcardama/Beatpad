use std::collections::BTreeMap;
use std::io::{Read, Seek, Write};

use zip::write::SimpleFileOptions;
use zip::{ZipArchive, ZipWriter};

use crate::beat::Beat;
use crate::manifest::Manifest;

/// Name of the manifest entry at the archive root.
pub const MANIFEST_NAME: &str = "manifest.json";
/// Directory prefix under which sample files live.
pub const SAMPLES_DIR: &str = "samples/";

#[derive(Debug)]
pub enum FormatError {
    Io(String),
    Json(String),
    Zip(String),
    /// A required entry (e.g. the manifest) was absent.
    Missing(String),
}

impl std::fmt::Display for FormatError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FormatError::Io(m) => write!(f, "io error: {m}"),
            FormatError::Json(m) => write!(f, "json error: {m}"),
            FormatError::Zip(m) => write!(f, "zip error: {m}"),
            FormatError::Missing(m) => write!(f, "missing entry: {m}"),
        }
    }
}

impl std::error::Error for FormatError {}

impl From<std::io::Error> for FormatError {
    fn from(e: std::io::Error) -> Self {
        FormatError::Io(e.to_string())
    }
}

impl From<serde_json::Error> for FormatError {
    fn from(e: serde_json::Error) -> Self {
        FormatError::Json(e.to_string())
    }
}

impl From<zip::result::ZipError> for FormatError {
    fn from(e: zip::result::ZipError) -> Self {
        FormatError::Zip(e.to_string())
    }
}

/// Serialize a [`Beat`] into a `.beat` archive (zip of `manifest.json` +
/// `samples/`).
pub fn write_beat<W: Write + Seek>(writer: W, beat: &Beat) -> Result<(), FormatError> {
    let mut zip = ZipWriter::new(writer);
    let options = SimpleFileOptions::default();

    zip.start_file(MANIFEST_NAME, options)?;
    zip.write_all(&serde_json::to_vec_pretty(&beat.manifest)?)?;

    for (name, bytes) in &beat.samples {
        zip.start_file(format!("{SAMPLES_DIR}{name}"), options)?;
        zip.write_all(bytes)?;
    }

    zip.finish()?;
    Ok(())
}

/// Read a `.beat` archive back into a [`Beat`].
pub fn read_beat<R: Read + Seek>(reader: R) -> Result<Beat, FormatError> {
    let mut archive = ZipArchive::new(reader)?;

    let manifest: Manifest = {
        let mut entry = archive
            .by_name(MANIFEST_NAME)
            .map_err(|_| FormatError::Missing(MANIFEST_NAME.to_string()))?;
        let mut json = String::new();
        entry.read_to_string(&mut json)?;
        serde_json::from_str(&json)?
    };

    let mut samples = BTreeMap::new();
    for i in 0..archive.len() {
        let mut entry = archive.by_index(i)?;
        let name = entry.name().to_string();
        if let Some(file) = name.strip_prefix(SAMPLES_DIR) {
            if file.is_empty() {
                continue; // the directory entry itself
            }
            let mut bytes = Vec::new();
            entry.read_to_end(&mut bytes)?;
            samples.insert(file.to_string(), bytes);
        }
    }

    Ok(Beat { manifest, samples })
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;
    use std::io::Cursor;

    use super::*;
    use crate::manifest::{GridSize, Manifest, PadMapping, PadMode, CURRENT_FORMAT_VERSION};

    #[test]
    fn write_then_read_roundtrips() {
        let mut samples = BTreeMap::new();
        samples.insert("kick.wav".to_string(), vec![1, 2, 3, 4]);

        let beat = Beat {
            manifest: Manifest {
                format_version: CURRENT_FORMAT_VERSION,
                name: "Test Beat".into(),
                author: "jose".into(),
                bpm: 120.0,
                grid: GridSize { rows: 8, cols: 8 },
                pads: vec![PadMapping {
                    pad: 0,
                    sample: "kick.wav".into(),
                    mode: PadMode::OneShot,
                }],
                metadata: BTreeMap::new(),
            },
            samples,
        };

        let mut buf = Vec::new();
        write_beat(Cursor::new(&mut buf), &beat).expect("write");
        let read = read_beat(Cursor::new(&buf)).expect("read");

        assert_eq!(read, beat);
    }
}
