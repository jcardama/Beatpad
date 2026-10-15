/** Sample formats the engine can decode. */
export const AUDIO_EXTENSIONS = ["wav", "ogg", "mp3", "flac"] as const;

/** The last path segment, for either separator. */
export function fileName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path;
}

export function isAudioFile(path: string): boolean {
  const ext = fileName(path).split(".").pop()?.toLowerCase();
  return (AUDIO_EXTENSIONS as readonly string[]).includes(ext ?? "");
}
