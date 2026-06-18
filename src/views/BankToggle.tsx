import type { Bank } from "@/model/domain/pad";
import { BankIcon } from "./BankIcon";
import { RoundControl } from "./RoundControl";

interface Props {
  bank: Bank;
  onToggle: () => void;
}

/**
 * Single button toggling which grid half the keyboard plays. Shows the state
 * via [`BankIcon`]; click or Tab flips it.
 */
export function BankToggle({ bank, onToggle }: Props) {
  const half = bank === "top" ? "Top" : "Bottom";
  return (
    <RoundControl
      title={`${half} half active — Tab to switch`}
      label={`Switch bank (${half} half active)`}
      onClick={onToggle}
    >
      <BankIcon bank={bank} />
    </RoundControl>
  );
}
