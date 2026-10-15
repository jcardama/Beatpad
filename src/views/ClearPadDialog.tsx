import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PadVm } from "@/presenters/padVm";
import { useT } from "@/presenters/useT";

interface Props {
  /** The pad awaiting confirmation; null keeps the dialog closed. */
  pad: PadVm | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Asks before a pad loses its sound. */
export function ClearPadDialog({ pad, onConfirm, onCancel }: Props) {
  const t = useT();
  return (
    <Dialog open={pad !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t((m) => m.pad.clearTitle)}</DialogTitle>
          <DialogDescription>
            {pad && t((m) => m.pad.clearBody(pad.id + 1, pad.label))}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            {t((m) => m.common.cancel)}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {t((m) => m.pad.clearSound)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
