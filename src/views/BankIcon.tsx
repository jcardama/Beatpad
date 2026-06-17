import type { Bank } from "@/model/domain/pad";

/**
 * Two stacked rounded rectangles in the lucide line-icon style (stroke
 * `currentColor`, width 2, rounded). The active grid half is filled; the
 * inactive half is outlined only.
 */
export function BankIcon({ bank }: { bank: Bank }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[45%]"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="7"
        rx="2"
        fill={bank === "top" ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
      />
      <rect
        x="3"
        y="14"
        width="18"
        height="7"
        rx="2"
        fill={bank === "bottom" ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
      />
    </svg>
  );
}
