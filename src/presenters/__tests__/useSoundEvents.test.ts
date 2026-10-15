import { expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { PAD_COUNT } from "@/model/domain/pad";
import { onSoundChanged } from "@/model/ipc/commands";
import { useTransportStore } from "@/model/store/transportStore";
import { useSoundEvents } from "@/presenters/useSoundEvents";

vi.mock("@/model/ipc/commands", () => ({
  onSoundChanged: vi.fn().mockResolvedValue(() => {}),
}));

it("applies a sound-change batch in one store update", () => {
  useTransportStore.setState({ loaded: Array<boolean>(PAD_COUNT).fill(false) });
  const { unmount } = renderHook(() => useSoundEvents());
  const handler = vi.mocked(onSoundChanged).mock.calls[0][0];
  const changed = vi.fn();
  const unsubscribe = useTransportStore.subscribe(changed);

  try {
    act(() => handler([{ pad: 3, loaded: true }, { pad: 17, loaded: true }]));

    expect(useTransportStore.getState().loaded[3]).toBe(true);
    expect(useTransportStore.getState().loaded[17]).toBe(true);
    expect(changed).toHaveBeenCalledTimes(1);
  } finally {
    unsubscribe();
    unmount();
  }
});
