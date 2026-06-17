//! kira smoke test: load a WAV and trigger it through the real engine so we
//! confirm the API shape and that audio actually reaches the output device
//! (notably WSLg/PulseAudio). Run: `cargo run -p engine --example smoke -- <wav>`.

use std::time::Duration;

use engine::{Backend, Engine, KiraBackend, PadEvent, PadId, Phase};

fn main() {
    let path = std::env::args().nth(1).expect("usage: smoke <path-to-wav>");
    let bytes = std::fs::read(&path).expect("read sample file");

    let mut backend = KiraBackend::new().expect("init audio backend");
    println!("output device: {}", backend.device_label());
    backend
        .register_sample(PadId(0), bytes)
        .expect("register sample");

    let mut engine = Engine::new(backend);
    println!("triggering pad 0 three times (listen for three thumps)...");
    for i in 0..3 {
        engine.handle_event(PadEvent {
            pad: PadId(0),
            velocity: 127,
            phase: Phase::Press,
        });
        println!("  hit {}", i + 1);
        std::thread::sleep(Duration::from_millis(550));
    }
    std::thread::sleep(Duration::from_millis(300));
    println!("done");
}
