use std::cell::RefCell;
use std::collections::HashMap;
use std::io::Cursor;
use std::rc::Rc;

use kira::backend::DefaultBackend;
use kira::sound::static_sound::{StaticSoundData, StaticSoundHandle};
use kira::{AudioManager, AudioManagerSettings, Tween};

use crate::backend::{Backend, BackendError};
use crate::event::PadId;
use crate::track::Track;

type SharedManager = Rc<RefCell<AudioManager>>;

/// A single pad's voice backed by kira. Holds the decoded sample and a shared
/// handle to the one [`AudioManager`] owned by the audio thread.
pub struct KiraTrack {
    manager: SharedManager,
    data: StaticSoundData,
    handle: Option<StaticSoundHandle>,
    looping: bool,
}

impl Track for KiraTrack {
    fn trigger(&mut self, _velocity: u8) {
        // Monophonic per pad: stop any voice still playing (notably a running
        // loop) before starting a new one, so voices are never orphaned.
        if let Some(handle) = self.handle.as_mut() {
            handle.stop(Tween::default());
        }
        let data = if self.looping {
            self.data.clone().loop_region(0.0..)
        } else {
            self.data.clone()
        };
        if let Ok(handle) = self.manager.borrow_mut().play(data) {
            self.handle = Some(handle);
        }
    }

    fn release(&mut self) {
        if let Some(handle) = self.handle.as_mut() {
            handle.stop(Tween::default());
        }
    }

    fn set_looping(&mut self, looping: bool) {
        self.looping = looping;
    }
}

/// kira-backed [`Backend`]. Owns the audio manager; lives entirely on the
/// audio thread (it is not `Send`, by design — only the event channel crosses
/// threads).
pub struct KiraBackend {
    manager: SharedManager,
    tracks: HashMap<PadId, KiraTrack>,
    device: String,
}

impl KiraBackend {
    pub fn new() -> Result<Self, BackendError> {
        let manager = AudioManager::<DefaultBackend>::new(AudioManagerSettings::default())
            .map_err(|e| BackendError::Init(e.to_string()))?;
        Ok(Self {
            manager: Rc::new(RefCell::new(manager)),
            tracks: HashMap::new(),
            device: default_output_label(),
        })
    }
}

impl Backend for KiraBackend {
    fn register_sample(&mut self, pad: PadId, bytes: Vec<u8>) -> Result<(), BackendError> {
        let data = StaticSoundData::from_cursor(Cursor::new(bytes))
            .map_err(|e| BackendError::Load(e.to_string()))?;
        self.tracks.insert(
            pad,
            KiraTrack {
                manager: Rc::clone(&self.manager),
                data,
                handle: None,
                looping: false,
            },
        );
        Ok(())
    }

    fn clear(&mut self, pad: PadId) {
        if let Some(mut track) = self.tracks.remove(&pad) {
            track.release(); // stop any voice before dropping the track
        }
    }

    fn is_loaded(&self, pad: PadId) -> bool {
        self.tracks.contains_key(&pad)
    }

    fn play(&mut self, pad: PadId, velocity: u8) {
        if let Some(track) = self.tracks.get_mut(&pad) {
            track.trigger(velocity);
        }
    }

    fn stop(&mut self, pad: PadId) {
        if let Some(track) = self.tracks.get_mut(&pad) {
            track.release();
        }
    }

    fn set_looping(&mut self, pad: PadId, looping: bool) {
        if let Some(track) = self.tracks.get_mut(&pad) {
            track.set_looping(looping);
        }
    }

    fn device_label(&self) -> String {
        self.device.clone()
    }
}

/// Describe the audio target so "no sound" on WSL2 is diagnosable at startup.
/// kira plays through cpal's default output (ALSA on Linux); under WSLg that
/// is bridged to PulseAudio, which `PULSE_SERVER` points at.
fn default_output_label() -> String {
    match std::env::var("PULSE_SERVER") {
        Ok(server) => format!("cpal default output (PulseAudio: {server})"),
        Err(_) => "cpal default output".to_string(),
    }
}
