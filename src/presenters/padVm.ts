import type { Bank, PadId, PadMode } from "@/model/domain/pad";

/** View-model for a single pad: the presentation contract between the pad-grid
 *  presenter and the views that render it. */
export interface PadVm {
  id: PadId;
  label: string;
  bank: Bank;
  lit: boolean;
  looping: boolean;
  loaded: boolean;
  mode: PadMode;
}
