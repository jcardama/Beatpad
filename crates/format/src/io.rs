use std::collections::BTreeMap;
use std::io::{Read, Seek, Write};

use zip::result::ZipError;
use zip::write::SimpleFileOptions;
use zip::{ZipArchive, ZipWriter};

use crate::beat::Beat;
use crate::manifest::{Manifest, CURRENT_FORMAT_VERSION};

/// Name of the manifest entry at the archive root.
pub const MANIFEST_NAME: &str = "manifest.json";
/// Directory prefix under which sample files live.
pub const SAMPLES_DIR: &str = "samples/";

/// Caps to bound memory when reading an untrusted archive (decompression-bomb
/// defense). Audio samples are comfortably under these.
const MAX_SAMPLE_BYTES: u64 = 64 * 1024 * 1024;
const MAX_TOTAL_BYTES: u64 = 512 * 1024 * 1024;
const MAX_ENTRIES: usize = 1024;

#[derive(Debug)]
pub enum FormatError {
    Io(String),
    Json(String),
    Zip(String),
    /// A required entry (e.g. the manifest) was absent.
    Missing(String),
    /// The archive's `format_version` is newer than this build supports.
    UnsupportedVersion {
        found: u32,
        supported: u32,
    },
    /// The archive is structurally invalid or exceeds safety limits.
    Invalid(String),
}

impl std::fmt::Display for FormatError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FormatError::Io(m) => write!(f, "io error: {m}"),
            FormatError::Json(m) => write!(f, "json error: {m}"),
            FormatError::Zip(m) => write!(f, "zip error: {m}"),
            FormatError::Missing(m) => write!(f, "missing entry: {m}"),
            FormatError::UnsupportedVersion { found, supported } => write!(
                f,
                "unsupported .beat version {found} (this build supports up to {supported})"
            ),
            FormatError::Invalid(m) => write!(f, "invalid .beat: {m}"),
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

impl From<ZipError> for FormatError {
    fn from(e: ZipError) -> Self {
        FormatError::Zip(e.to_string())
    }
}

/// A sample key must be a plain file name (the format is flat — no directories
/// or traversal).
fn is_plain_filename(name: &str) -> bool {
    !name.is_empty() && name != ".." && !name.contains('/') && !name.contains('\\')
}

/// Serialize a [`Beat`] into a `.beat` archive (zip of `manifest.json` +
/// `samples/`).
pub fn write_beat<W: Write + Seek>(writer: W, beat: &Beat) -> Result<(), FormatError> {
    let mut zip = ZipWriter::new(writer);
    let options = SimpleFileOptions::default();

    zip.start_file(MANIFEST_NAME, options)?;
    zip.write_all(&serde_json::to_vec_pretty(&beat.manifest)?)?;

    for (name, bytes) in &beat.samples {
        if !is_plain_filename(name) {
            return Err(FormatError::Invalid(format!("bad sample name: {name}")));
        }
        zip.start_file(format!("{SAMPLES_DIR}{name}"), options)?;
        zip.write_all(bytes)?;
    }

    zip.finish()?;
    Ok(())
}

/// Read a `.beat` archive back into a [`Beat`]. Bounds memory and rejects
/// malformed/unsupported archives (untrusted input).
pub fn read_beat<R: Read + Seek>(reader: R) -> Result<Beat, FormatError> {
    let mut archive = ZipArchive::new(reader)?;
    if archive.len() > MAX_ENTRIES {
        return Err(FormatError::Invalid("too many entries".into()));
    }

    let manifest: Manifest = {
        let entry = match archive.by_name(MANIFEST_NAME) {
            Ok(entry) => entry,
            Err(ZipError::FileNotFound) => {
                return Err(FormatError::Missing(MANIFEST_NAME.to_string()))
            }
            Err(e) => return Err(e.into()),
        };
        let mut json = String::new();
        entry.take(MAX_SAMPLE_BYTES).read_to_string(&mut json)?;
        serde_json::from_str(&json)?
    };
    if manifest.format_version > CURRENT_FORMAT_VERSION {
        return Err(FormatError::UnsupportedVersion {
            found: manifest.format_version,
            supported: CURRENT_FORMAT_VERSION,
        });
    }

    let mut samples = BTreeMap::new();
    let mut total: u64 = 0;
    for i in 0..archive.len() {
        let mut entry = archive.by_index(i)?;
        let Some(file) = entry.name().strip_prefix(SAMPLES_DIR) else {
            continue;
        };
        if file.is_empty() {
            continue; // the directory entry itself
        }
        let file = file.to_string();
        if !is_plain_filename(&file) {
            return Err(FormatError::Invalid(format!("bad sample path: {file}")));
        }

        // Read at most the cap+1 so a lying header can't blow up memory.
        let mut bytes = Vec::new();
        entry
            .by_ref()
            .take(MAX_SAMPLE_BYTES + 1)
            .read_to_end(&mut bytes)?;
        if bytes.len() as u64 > MAX_SAMPLE_BYTES {
            return Err(FormatError::Invalid(format!("sample too large: {file}")));
        }
        total += bytes.len() as u64;
        if total > MAX_TOTAL_BYTES {
            return Err(FormatError::Invalid("archive too large".into()));
        }
        samples.insert(file, bytes);
    }

    Ok(Beat { manifest, samples })
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;
    use std::io::Cursor;

    use super::*;
    use crate::manifest::{GridSize, Manifest, PadMapping, PadMode};

    fn sample_beat() -> Beat {
        let mut samples = BTreeMap::new();
        samples.insert("kick.wav".to_string(), vec![1, 2, 3, 4]);
        Beat {
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
        }
    }

    #[test]
    fn write_then_read_roundtrips() {
        let beat = sample_beat();
        let mut buf = Vec::new();
        write_beat(Cursor::new(&mut buf), &beat).expect("write");
        assert_eq!(read_beat(Cursor::new(&buf)).expect("read"), beat);
    }

    #[test]
    fn missing_manifest_is_missing_not_zip_error() {
        let mut buf = Vec::new();
        {
            let mut zip = ZipWriter::new(Cursor::new(&mut buf));
            zip.start_file("samples/kick.wav", SimpleFileOptions::default())
                .unwrap();
            zip.write_all(&[1, 2, 3]).unwrap();
            zip.finish().unwrap();
        }
        assert!(matches!(
            read_beat(Cursor::new(&buf)),
            Err(FormatError::Missing(_))
        ));
    }

    #[test]
    fn garbage_bytes_are_a_zip_error() {
        assert!(matches!(
            read_beat(Cursor::new(b"not a zip".to_vec())),
            Err(FormatError::Zip(_))
        ));
    }

    #[test]
    fn future_version_is_rejected() {
        let mut beat = sample_beat();
        beat.manifest.format_version = CURRENT_FORMAT_VERSION + 1;
        let mut buf = Vec::new();
        write_beat(Cursor::new(&mut buf), &beat).expect("write");
        assert!(matches!(
            read_beat(Cursor::new(&buf)),
            Err(FormatError::UnsupportedVersion { .. })
        ));
    }

    #[test]
    fn traversal_sample_name_is_rejected() {
        let beat = sample_beat();
        let mut buf = Vec::new();
        write_beat(Cursor::new(&mut buf), &beat).expect("write");
        // Splice in a traversal entry the writer would never produce.
        let mut buf2 = Vec::new();
        {
            let mut zip = ZipWriter::new(Cursor::new(&mut buf2));
            zip.start_file(MANIFEST_NAME, SimpleFileOptions::default())
                .unwrap();
            zip.write_all(&serde_json::to_vec(&beat.manifest).unwrap())
                .unwrap();
            zip.start_file("samples/../evil.wav", SimpleFileOptions::default())
                .unwrap();
            zip.write_all(&[0]).unwrap();
            zip.finish().unwrap();
        }
        assert!(matches!(
            read_beat(Cursor::new(&buf2)),
            Err(FormatError::Invalid(_))
        ));
    }
}
