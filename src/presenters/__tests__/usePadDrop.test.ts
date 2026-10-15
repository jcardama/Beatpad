import { afterEach, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { onFileDrop, type FileDrop } from "@/model/ipc/fileDrop";
import { useToastStore } from "@/model/store/toastStore";
import { usePadDrop } from "@/presenters/usePadDrop";

vi.mock("@/model/ipc/fileDrop", () => ({
  onFileDrop: vi.fn().mockResolvedValue(() => {}),
}));

/** A board with two 50px pads side by side: pad 0 at x 0–50, pad 7 at x 50–100. */
function board(): HTMLElement {
  const root = document.createElement("div");
  [0, 7].forEach((id, i) => {
    const pad = document.createElement("button");
    pad.dataset.pad = String(id);
    pad.getBoundingClientRect = () => new DOMRect(i * 50, 0, 50, 50);
    root.append(pad);
  });
  return root;
}

function setup() {
  const loadSound = vi.fn().mockResolvedValue(undefined);
  const ref = { current: board() };
  const hook = renderHook(() => usePadDrop(ref, loadSound));
  const { calls } = vi.mocked(onFileDrop).mock;
  const emit = (e: FileDrop) => act(() => calls[calls.length - 1][0](e));
  return { hook, loadSound, emit };
}

afterEach(() => {
  useToastStore.setState({ toasts: [] });
  vi.mocked(onFileDrop).mockClear();
});

it("targets the pad under the drag and loads the dropped file onto it", () => {
  const { hook, loadSound, emit } = setup();

  emit({ kind: "hover", x: 70, y: 10, paths: ["/samples/kick.wav"] });
  expect(hook.result.current).toEqual({ pad: 7, name: "kick.wav" });

  emit({ kind: "drop", x: 70, y: 10, paths: ["/samples/kick.wav"] });
  expect(loadSound).toHaveBeenCalledWith(7, "/samples/kick.wav");
  expect(hook.result.current).toBeNull();
});

it("refuses a non-audio file with the load error toast", () => {
  const { loadSound, emit } = setup();

  emit({ kind: "drop", x: 10, y: 10, paths: ["/notes/readme.txt"] });

  expect(loadSound).not.toHaveBeenCalled();
  expect(useToastStore.getState().toasts).toMatchObject([
    { variant: "error", message: expect.stringContaining("readme.txt") },
  ]);
});
