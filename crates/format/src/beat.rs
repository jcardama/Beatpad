use std::collections::BTreeMap;

use crate::manifest::Manifest;

/// An in-memory beat: its [`Manifest`] plus the raw bytes of every sample it
/// references, keyed by file name (without the `samples/` prefix).
#[derive(Debug, Clone, PartialEq)]
pub struct Beat {
    pub manifest: Manifest,
    pub samples: BTreeMap<String, Vec<u8>>,
}
