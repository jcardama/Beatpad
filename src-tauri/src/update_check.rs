//! GitHub Releases version checker (mirrors LeopardWM's approach). Polls the
//! GitHub API on startup and once a day, comparing the latest release tag
//! against the built-in version. Nothing is downloaded and the user is never
//! redirected — the result is surfaced in-app via a `update:available` event,
//! and a manual check returns an [`UpdateStatus`] to the caller.

use std::time::Duration;

use serde::Serialize;
use tauri::{AppHandle, Emitter};

const RELEASES_API: &str = "https://api.github.com/repos/jcardama/Beatpad/releases/latest";
const REQUEST_TIMEOUT: Duration = Duration::from_secs(10);
const STARTUP_DELAY: Duration = Duration::from_secs(30);
const POLL_INTERVAL: Duration = Duration::from_secs(60 * 60 * 24);

/// Public release page, opened only if the user chooses to from the prompt.
pub const RELEASES_PAGE_URL: &str = "https://github.com/jcardama/Beatpad/releases";

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

/// Run one check synchronously (blocks on the network).
pub fn check_now() -> UpdateStatus {
    match fetch_latest_release_tag() {
        Some(tag) => {
            let current = current_version();
            if is_newer(&tag, current) {
                UpdateStatus::Available { latest: tag }
            } else {
                UpdateStatus::UpToDate {
                    current: current.to_string(),
                }
            }
        }
        None => UpdateStatus::Failed,
    }
}

/// Spawn the background checker: one check shortly after launch, then daily.
/// Emits `update:available` (payload: the new tag) when a newer release shows.
pub fn spawn_update_checker(app: AppHandle) {
    std::thread::Builder::new()
        .name("beatpad-update-check".into())
        .spawn(move || {
            std::thread::sleep(STARTUP_DELAY);
            loop {
                if let UpdateStatus::Available { latest } = check_now() {
                    log::info!("update available: {latest} (current {})", current_version());
                    let _ = app.emit("update:available", latest);
                }
                std::thread::sleep(POLL_INTERVAL);
            }
        })
        .map(|_| ())
        .unwrap_or_else(|e| log::warn!("failed to spawn update checker: {e}"));
}

/// Fetch the `tag_name` of the latest GitHub release. `None` on any network or
/// parse failure — the caller treats that as "unknown, try again later."
fn fetch_latest_release_tag() -> Option<String> {
    let agent = ureq::AgentBuilder::new().timeout(REQUEST_TIMEOUT).build();
    let body = agent
        .get(RELEASES_API)
        .set("User-Agent", concat!("BeatPad/", env!("CARGO_PKG_VERSION")))
        .set("Accept", "application/vnd.github+json")
        .call()
        .ok()?
        .into_string()
        .ok()?;
    let json: serde_json::Value = serde_json::from_str(&body).ok()?;
    json.get("tag_name")?.as_str().map(String::from)
}

/// Compare `latest` (e.g. `v0.2.0`) against `current` (e.g. `0.1.0`), ignoring
/// a leading `v`. Fails closed (`false`) when either side isn't valid semver.
pub fn is_newer(latest: &str, current: &str) -> bool {
    match (
        semver::Version::parse(latest.trim_start_matches('v')),
        semver::Version::parse(current.trim_start_matches('v')),
    ) {
        (Ok(l), Ok(c)) => l > c,
        _ => false,
    }
}

#[cfg(test)]
mod tests {
    use super::is_newer;

    #[test]
    fn newer_when_latest_is_ahead() {
        assert!(is_newer("v0.2.0", "0.1.0"));
        assert!(is_newer("1.0.0", "v0.9.9"));
    }

    #[test]
    fn not_newer_when_same_or_older() {
        assert!(!is_newer("v0.1.0", "0.1.0"));
        assert!(!is_newer("0.1.0", "v0.2.0"));
    }

    #[test]
    fn fails_closed_on_garbage() {
        assert!(!is_newer("nightly", "0.1.0"));
        assert!(!is_newer("v0.1.0", "unknown"));
    }
}
