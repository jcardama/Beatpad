# The `.beat` Format

An open archive format so beats are shareable — the keystone for the future community repository. A `.beat` file is a **zip** containing a manifest plus the samples it references. The format spec (not the Rust engine) is the artifact shared between the desktop app and the future `apps/web` site.

Defined in `crates/format/`. No Tauri dependency; roundtrip-tested.

## Archive layout

```
something.beat (zip)
├─ manifest.json        # the Manifest struct, pretty-printed
└─ samples/
   ├─ kick.wav
   ├─ snare.wav
   └─ …
```

Constants: `MANIFEST_NAME = "manifest.json"`, `SAMPLES_DIR = "samples/"` (`crates/format/src/io.rs`).

## Manifest schema

Mirrors the serde structs in `crates/format/src/manifest.rs` — that file is the source of truth:

- `format_version: u32` — `CURRENT_FORMAT_VERSION` (bump on incompatible changes).
- `name: String`, `author: String`, `bpm: f32`.
- `grid: { rows: u8, cols: u8 }`.
- `pads: [{ pad: u16, sample: String, mode: PadMode }]` — `pad` is a linear, row-major index; `sample` is a file name under `samples/`; `mode` is `one_shot | hold_loop | toggle_loop`.
- `metadata: { String: String }` — free-form, optional.

## API

- `read_beat(reader) -> Result<Beat, FormatError>` and `write_beat(writer, &Beat)` in `crates/format/src/io.rs`.
- `Beat { manifest: Manifest, samples: BTreeMap<String, Vec<u8>> }` (`beat.rs`) — manifest plus raw sample bytes keyed by file name (no `samples/` prefix).

## Notes

- The scaffold does **not** load `.beat` files yet — it plays one embedded sample. Wiring the app to load a `.beat` (and the engine to register its samples per `PadMapping`) is upcoming work.
- When evolving the schema, change `manifest.rs` and bump `CURRENT_FORMAT_VERSION`; keep the web previewer's schema in sync (it reads the same JSON).
