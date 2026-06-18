import { ask, message, open } from "@tauri-apps/plugin-dialog";

/** Surface an error to the user via a native dialog. */
export const showError = async (msg: string): Promise<void> => {
  await message(msg, { title: "BeatPad", kind: "error" });
};

/** Surface an informational message via a native dialog. */
export const showInfo = async (msg: string): Promise<void> => {
  await message(msg, { title: "BeatPad", kind: "info" });
};

/** Ask a yes/no question via a native dialog. Resolves to the user's choice. */
export const confirm = (msg: string): Promise<boolean> =>
  ask(msg, { title: "BeatPad", kind: "info" });

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
