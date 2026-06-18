import { useTransportStore } from "@/model/store/transportStore";

/** Presentation logic for the active grid half (top/bottom), toggled by TAB. */
export function useBank() {
  const bank = useTransportStore((s) => s.bank);
  const toggleBank = useTransportStore((s) => s.toggleBank);
  return { bank, toggleBank };
}
