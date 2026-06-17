import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

/**
 * The one and only bridge to the Rust backend. Every Tauri call goes through
 * here, so `@tauri-apps/*` is imported in exactly one place (enforced by the
 * ESLint `no-restricted-imports` guard). The View and Presenter layers depend
 * on this abstraction, never on Tauri directly.
 */
export const ipc = {
  invoke<T = void>(command: string, args?: Record<string, unknown>): Promise<T> {
    return invoke<T>(command, args);
  },
  listen<T>(event: string, handler: (payload: T) => void): Promise<UnlistenFn> {
    return listen<T>(event, (e) => handler(e.payload));
  },
};
