import type { Bank } from "@/model/domain/pad";
import { BankIcon } from "./BankIcon";

interface Props {
  bank: Bank;
  onToggle: () => void;
}

/**
 * Single button toggling which grid half the keyboard plays. Shows the state
 * via [`BankIcon`]; click or Tab flips it.
 */
export function BankToggle({ bank, onToggle }: Props) {
  return (
    <button
      type="button"
      title={`${bank === "top" ? "Top" : "Bottom"} half active — Tab to switch`}
      onClick={onToggle}
      className="flex select-none items-center justify-center rounded-[14%] border border-border bg-muted/40 text-muted-foreground transition-colors hover:text-foreground"
    >
      <BankIcon bank={bank} />
    </button>
  );
}
