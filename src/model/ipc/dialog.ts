import { open, save } from "@tauri-apps/plugin-dialog";

/** Native save dialog for a `.beat` pack. Returns the chosen path, or null. */
export async function pickSaveBeat(defaultPath?: string): Promise<string | null> {
  const result = await save({
    defaultPath,
    filters: [{ name: "Beat pack", extensions: ["beat"] }],
  });
  return result ?? null;
}

/** Native file picker for a single audio sample. Returns the path, or null. */
export async function pickSoundFile(): Promise<string | null> {
  const result = await open({
    multiple: false,
    directory: false,
    filters: [{ name: "Audio", extensions: ["wav", "ogg", "mp3", "flac"] }],
  });
  return typeof result === "string" ? result : null;
}

/** Native file picker for a `.beat` pack. Returns the path, or null. */
export async function pickBeatPack(): Promise<string | null> {
  const result = await open({
    multiple: false,
    directory: false,
    filters: [{ name: "Beat pack", extensions: ["beat", "zip"] }],
  });
  return typeof result === "string" ? result : null;
}
