import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { DEFAULT_MODE, PAD_COUNT } from "@/model/domain/pad";
import { ipc } from "@/model/ipc/client";
import { loadSetting } from "@/model/ipc/configStore";
import { useTransportStore } from "@/model/store/transportStore";
import { usePersistBoard } from "@/presenters/usePersistBoard";

vi.mock("@/model/ipc/client", () => ({ ipc: { invoke: vi.fn() } }));
vi.mock("@/model/ipc/configStore", () => ({
  loadSetting: vi.fn(),
  saveSetting: vi.fn().mockResolvedValue(undefined),
}));

it("restores in one IPC call and records only paths returned by the backend", async () => {
  useTransportStore.setState({
    paths: Array<string | null>(PAD_COUNT).fill(null),
    modes: Array(PAD_COUNT).fill(DEFAULT_MODE),
  });
  vi.mocked(loadSetting).mockResolvedValue({
    paths: ["/read.wav", "/missing.wav", null, "/invalid-audio.wav"],
    modes: ["hold_loop", "toggle_loop", "toggle_loop", "one_shot"],
  });
  vi.mocked(ipc.invoke).mockResolvedValue([
    { pad: 0, path: "/read.wav", mode: "hold_loop" },
    { pad: 3, path: "/invalid-audio.wav", mode: "one_shot" },
  ]);

  const { unmount } = renderHook(() => usePersistBoard());
  try {
    await act(async () => {});

    expect(ipc.invoke).toHaveBeenCalledTimes(1);
    expect(ipc.invoke).toHaveBeenCalledWith("restore_board", {
      pads: [
        { pad: 0, path: "/read.wav", mode: "hold_loop" },
        { pad: 1, path: "/missing.wav", mode: "toggle_loop" },
        { pad: 3, path: "/invalid-audio.wav", mode: "one_shot" },
      ],
    });
    const { paths, modes } = useTransportStore.getState();
    expect(paths.slice(0, 4)).toEqual([
      "/read.wav", null, null, "/invalid-audio.wav",
    ]);
    expect(modes.slice(0, 4)).toEqual([
      "hold_loop", "toggle_loop", "toggle_loop", "one_shot",
    ]);
  } finally {
    unmount();
  }
});
