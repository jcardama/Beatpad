import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { PAD_COUNT } from "@/model/domain/pad";
import { useTransportStore } from "@/model/store/transportStore";

// The presenter is testable headless because the IPC layer is mockable — no
// Tauri runtime needed.
vi.mock("@/model/ipc/commands", () => ({
  triggerPad: vi.fn(),
  releasePad: vi.fn(),
}));

import { releasePad, triggerPad } from "@/model/ipc/commands";
import { usePadGrid } from "@/presenters/usePadGrid";

describe("usePadGrid", () => {
  beforeEach(() => {
    useTransportStore.setState({ lit: Array<boolean>(PAD_COUNT).fill(false) });
    vi.clearAllMocks();
  });

  it("lights a pad and triggers audio on press", () => {
    const { result } = renderHook(() => usePadGrid());

    act(() => result.current.press(3));

    expect(result.current.pads[3].lit).toBe(true);
    expect(triggerPad).toHaveBeenCalledWith(3);
  });

  it("clears the pad and releases audio on release", () => {
    const { result } = renderHook(() => usePadGrid());

    act(() => result.current.press(3));
    act(() => result.current.release(3));

    expect(result.current.pads[3].lit).toBe(false);
    expect(releasePad).toHaveBeenCalledWith(3);
  });
});
