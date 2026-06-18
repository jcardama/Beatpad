import { LazyStore } from "@tauri-apps/plugin-store";

// Persisted settings file in the app config dir (lazily created/loaded).
const store = new LazyStore("settings.json");

export async function loadSetting<T>(key: string, fallback: T): Promise<T> {
  const value = await store.get<T>(key);
  return value ?? fallback;
}

export async function saveSetting<T>(key: string, value: T): Promise<void> {
  await store.set(key, value);
  await store.save();
}
