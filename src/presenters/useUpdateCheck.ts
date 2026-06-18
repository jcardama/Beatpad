import { useEffect } from "react";

import {
  checkForUpdates,
  onMenuCheckUpdates,
  onUpdateAvailable,
  openReleasesPage,
} from "@/model/ipc/commands";
import { useToastStore } from "@/model/store/toastStore";
import { useT } from "@/presenters/useT";

const bareVersion = (tag: string) => tag.replace(/^v/, "");

/**
 * Surfaces update results in-app as toasts instead of native OS dialogs: a
 * manual check (menu → Check for Updates) reports the outcome, and the
 * background checker raises an actionable toast when a newer release appears.
 * Opening the releases page only happens if the user clicks Download.
 */
export function useUpdateCheck(): void {
  const t = useT();
  const show = useToastStore((s) => s.show);

  useEffect(() => {
    const announce = (latest: string) =>
      show({
        variant: "update",
        message: t((m) => m.update.available(bareVersion(latest))),
        action: {
          label: t((m) => m.update.download),
          onClick: () => void openReleasesPage(),
        },
      });

    const offMenu = onMenuCheckUpdates(async () => {
      const status = await checkForUpdates();
      if (status.kind === "available") announce(status.latest);
      else if (status.kind === "upToDate")
        show({ variant: "info", message: t((m) => m.update.upToDate(status.current)) });
      else show({ variant: "error", message: t((m) => m.update.checkFailed) });
    });
    const offAvailable = onUpdateAvailable((latest) => announce(latest));

    return () => {
      void offMenu.then((off) => off());
      void offAvailable.then((off) => off());
    };
  }, [t, show]);
}
