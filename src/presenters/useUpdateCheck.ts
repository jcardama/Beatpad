import { useEffect } from "react";

import {
  checkForUpdates,
  onMenuCheckUpdates,
  onUpdateAvailable,
  openReleasesPage,
} from "@/model/ipc/commands";
import { confirm, showError, showInfo } from "@/model/ipc/dialog";
import { useT } from "@/presenters/useT";

const bareVersion = (tag: string) => tag.replace(/^v/, "");

/**
 * Surfaces update results in-app instead of redirecting to GitHub: a manual
 * check (menu → Check for Updates) reports the outcome, and the background
 * checker prompts when a newer release appears. Opening the releases page only
 * happens if the user confirms.
 */
export function useUpdateCheck(): void {
  const t = useT();

  useEffect(() => {
    const promptDownload = async (latest: string) => {
      if (await confirm(t((m) => m.update.available(bareVersion(latest))))) {
        await openReleasesPage();
      }
    };

    const offMenu = onMenuCheckUpdates(async () => {
      const status = await checkForUpdates();
      if (status.kind === "available") await promptDownload(status.latest);
      else if (status.kind === "upToDate")
        await showInfo(t((m) => m.update.upToDate(status.current)));
      else await showError(t((m) => m.update.checkFailed));
    });
    const offAvailable = onUpdateAvailable((latest) => void promptDownload(latest));

    return () => {
      void offMenu.then((off) => off());
      void offAvailable.then((off) => off());
    };
  }, [t]);
}
