//! Auto-update via Tauri's updater plugin, against signed GitHub releases.
//! Checks on startup and once a day, surfacing a newer version in-app
//! (`update:available`); the user installs it in place — download + relaunch.

use std::time::Duration;

use serde::Serialize;
use tauri::{AppHandle, Emitter};
use tauri_plugin_updater::UpdaterExt;

const STARTUP_DELAY: Duration = Duration::from_secs(30);
const POLL_INTERVAL: Duration = Duration::from_secs(60 * 60 * 24);

/// Outcome of an update check, reported to the UI.
#[derive(Serialize, Clone)]
#[serde(tag = "kind", rename_all = "camelCase")]
pub enum UpdateStatus {
    Available { latest: String },
    UpToDate { current: String },
    Failed,
}

/// The version this build reports as current.
pub fn current_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

/// Ask the configured endpoint whether a newer signed release exists.
pub async fn check_now(app: &AppHandle) -> UpdateStatus {
    let updater = match app.updater() {
        Ok(updater) => updater,
        Err(e) => {
            log::warn!("updater unavailable: {e}");
            return UpdateStatus::Failed;
        }
    };
    match updater.check().await {
        Ok(Some(update)) => UpdateStatus::Available {
            latest: update.version,
        },
        Ok(None) => UpdateStatus::UpToDate {
            current: current_version().to_string(),
        },
        Err(e) => {
            log::warn!("update check failed: {e}");
            UpdateStatus::Failed
        }
    }
}

/// Download and install the pending update, then relaunch. Returns only on
/// error or when there's nothing to install — success restarts the process.
pub async fn install(app: &AppHandle) -> tauri_plugin_updater::Result<()> {
    if let Some(update) = app.updater()?.check().await? {
        update.download_and_install(|_, _| {}, || {}).await?;
        app.restart();
    }
    Ok(())
}

/// Background checker: one check shortly after launch, then daily. Emits
/// `update:available` (payload: the new version) when one appears.
pub fn spawn_update_checker(app: AppHandle) {
    std::thread::Builder::new()
        .name("beatpad-update-check".into())
        .spawn(move || {
            std::thread::sleep(STARTUP_DELAY);
            loop {
                if let UpdateStatus::Available { latest } =
                    tauri::async_runtime::block_on(check_now(&app))
                {
                    log::info!("update available: {latest} (current {})", current_version());
                    let _ = app.emit("update:available", latest);
                }
                std::thread::sleep(POLL_INTERVAL);
            }
        })
        .map(|_| ())
        .unwrap_or_else(|e| log::warn!("failed to spawn update checker: {e}"));
}
