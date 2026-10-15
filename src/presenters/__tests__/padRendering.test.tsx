import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";

import { PAD_COUNT } from "@/model/domain/pad";
import { MESSAGES } from "@/model/i18n/locale";
import { useLocaleStore } from "@/model/store/localeStore";
import { useTransportStore } from "@/model/store/transportStore";
import { usePadActions } from "@/presenters/usePadActions";
import { usePadGrid } from "@/presenters/usePadGrid";
import { PadView } from "@/views/PadView";

vi.mock("@/model/ipc/commands", () => ({
  triggerPad: vi.fn(),
  releasePad: vi.fn(),
  clearPad: vi.fn(),
  loadBeatPack: vi.fn(),
  loadPadSound: vi.fn(),
  setPadMode: vi.fn(),
}));

vi.mock("@/model/ipc/dialog", () => ({
  pickBeatPack: vi.fn(),
  pickSoundFile: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("renders only the changed pad on press and release", () => {
  useLocaleStore.setState({ locale: "en" });
  useTransportStore.setState({
    lit: Array<boolean>(PAD_COUNT).fill(false),
    loaded: Array<boolean>(PAD_COUNT).fill(true),
  });
  const labels = vi.spyOn(MESSAGES.en.board, "padLabel");
  let grid: ReturnType<typeof usePadGrid>;

  function Grid() {
    grid = usePadGrid();
    const actions = usePadActions();
    return grid.pads.map((pad) => (
      <PadView
        key={pad.id}
        pad={pad}
        active
        onPress={grid.press}
        onRelease={grid.release}
        onSetMode={actions.setMode}
        onAssign={actions.assignSound}
        onClear={actions.clearSound}
      />
    ));
  }

  render(<Grid />);
  expect(labels).toHaveBeenCalledTimes(PAD_COUNT);
  labels.mockClear();

  act(() => grid.press(3));
  expect(labels.mock.calls).toEqual([[4]]);
  labels.mockClear();

  act(() => grid.release(3));
  expect(labels.mock.calls).toEqual([[4]]);
});
