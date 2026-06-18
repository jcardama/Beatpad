import type { Bank } from "@/model/domain/pad";
import { useT } from "@/presenters/useT";
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
  const t = useT();
  return (
    <RoundControl
      title={t((m) => m.board.switchBankTitle(bank))}
      label={t((m) => m.board.switchBankLabel(bank))}
      onClick={onToggle}
    >
      <BankIcon bank={bank} />
    </RoundControl>
  );
}
