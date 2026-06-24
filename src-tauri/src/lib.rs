mod commands;
mod input;
mod state;
mod update_check;

use state::{AppState, SampleStore};
use tauri::menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::{AppHandle, Emitter, Manager, Wry};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;

const URL_GITHUB: &str = "https://github.com/jcardama/Beatpad";
const URL_CHANGELOG: &str = "https://github.com/jcardama/Beatpad/blob/main/CHANGELOG.md";
const URL_LICENSE: &str = "https://github.com/jcardama/Beatpad/blob/main/LICENSE";
const URL_FACEBOOK: &str = "https://www.facebook.com/beatxpad";

/// Menu items whose enabled state changes at runtime (greyed when the board is
/// empty).
struct MenuItems {
    close: MenuItem<Wry>,
    clear: MenuItem<Wry>,
    save: MenuItem<Wry>,
    save_as: MenuItem<Wry>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .targets([
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Stdout),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("beatpad".into()),
                    }),
                    tauri_plugin_log::Target::new(tauri_plugin_log::TargetKind::Webview),
                ])
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(SampleStore::default())
        .setup(|app| {
            app.manage(AppState::spawn(app.handle().clone()));
            update_check::spawn_update_checker(app.handle().clone());
            fit_window_square(app);
            app.set_menu(build_menu(app)?)?;
            if let Some(window) = app.get_webview_window("main") {
                // Apply the bundled icon to the live window. Windows/macOS read
                // it from the executable, but Linux/WSLg otherwise shows a
                // generic placeholder in the taskbar.
                if let Some(icon) = app.default_window_icon() {
                    let _ = window.set_icon(icon.clone());
                }
                // Hide the in-window menu bar initially; the UI restores the
                // persisted visibility (see `set_menu_visible`) and Alt toggles
                // it. macOS uses the global menu bar, so skip it there.
                #[cfg(not(target_os = "macos"))]
                let _ = window.hide_menu();
            }
            Ok(())
        })
        .on_menu_event(handle_menu_event)
        .invoke_handler(tauri::generate_handler![
            commands::trigger_pad,
            commands::release_pad,
            commands::set_pad_mode,
            commands::load_pad_sound,
            commands::load_beat_pack,
            commands::clear_pad,
            commands::stop_all,
            commands::save_beat,
            commands::set_menu_visible,
            set_board_enabled,
            check_for_updates,
            install_update,
            system_username
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn build_menu(app: &tauri::App) -> tauri::Result<Menu<Wry>> {
    let app_menu = Submenu::with_items(
        app,
        "BeatPad",
        true,
        &[
            &MenuItem::with_id(app, "about", "About BeatPad", true, None::<&str>)?,
            &MenuItem::with_id(
                app,
                "check_updates",
                "Check for Updates…",
                true,
                None::<&str>,
            )?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(
                app,
                "preferences",
                "Preferences…",
                true,
                Some("CmdOrCtrl+,"),
            )?,
            &PredefinedMenuItem::separator(app)?,
            &PredefinedMenuItem::quit(app, Some("Quit BeatPad"))?,
        ],
    )?;

    // Save/Close/Clear are disabled until the board has content (see
    // `set_board_enabled`).
    let save = MenuItem::with_id(app, "save", "Save", false, Some("CmdOrCtrl+S"))?;
    let save_as = MenuItem::with_id(app, "save_as", "Save As…", false, Some("CmdOrCtrl+Shift+S"))?;
    let close = MenuItem::with_id(app, "close_pack", "Close", false, Some("CmdOrCtrl+W"))?;
    let file = Submenu::with_items(
        app,
        "File",
        true,
        &[
            &MenuItem::with_id(app, "open_pack", "Open…", true, Some("CmdOrCtrl+O"))?,
            &save,
            &save_as,
            &PredefinedMenuItem::separator(app)?,
            &close,
        ],
    )?;

    let clear = MenuItem::with_id(
        app,
        "clear_board",
        "Clear",
        false,
        Some("CmdOrCtrl+Backspace"),
    )?;
    let edit = Submenu::with_items(app, "Edit", true, &[&clear])?;

    app.manage(MenuItems {
        close,
        clear,
        save,
        save_as,
    });

    let theme = Submenu::with_items(
        app,
        "Theme",
        true,
        &[
            &MenuItem::with_id(app, "theme_system", "System", true, None::<&str>)?,
            &MenuItem::with_id(app, "theme_dark", "Dark", true, None::<&str>)?,
            &MenuItem::with_id(app, "theme_light", "Light", true, None::<&str>)?,
        ],
    )?;
    let view = Submenu::with_items(
        app,
        "View",
        true,
        &[
            &theme,
            &CheckMenuItem::with_id(
                app,
                "always_on_top",
                "Always on Top",
                true,
                false,
                None::<&str>,
            )?,
        ],
    )?;

    let window = Submenu::with_items(
        app,
        "Window",
        true,
        &[
            &MenuItem::with_id(app, "win_minimize", "Minimize", true, None::<&str>)?,
            &MenuItem::with_id(app, "win_zoom", "Zoom", true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(
                app,
                "win_close",
                "Close Window",
                true,
                Some("CmdOrCtrl+Shift+W"),
            )?,
        ],
    )?;

    let help = Submenu::with_items(
        app,
        "Help",
        true,
        &[
            &MenuItem::with_id(app, "help_changelog", "Changelog", true, None::<&str>)?,
            &MenuItem::with_id(app, "help_github", "GitHub", true, None::<&str>)?,
            &MenuItem::with_id(app, "help_facebook", "Facebook", true, None::<&str>)?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "help_licenses", "Licenses", true, None::<&str>)?,
        ],
    )?;

    Menu::with_items(app, &[&app_menu, &file, &edit, &view, &window, &help])
}

fn handle_menu_event(app: &AppHandle, event: tauri::menu::MenuEvent) {
    match event.id().as_ref() {
        "about" => {
            app.dialog()
                .message(format!(
                    "BeatPad {}\nA Launchpad-style beat pad.",
                    update_check::current_version()
                ))
                .title("About BeatPad")
                .show(|_| {});
        }
        // The frontend runs the check and surfaces the (localized) result.
        "check_updates" => {
            let _ = app.emit("menu:check-updates", ());
        }
        "preferences" => {
            let _ = app.emit("menu:preferences", ());
        }
        "open_pack" => {
            let _ = app.emit("menu:open-pack", ());
        }
        "save" => {
            let _ = app.emit("menu:save", ());
        }
        "save_as" => {
            let _ = app.emit("menu:save-as", ());
        }
        "close_pack" | "clear_board" => {
            let _ = app.emit("menu:clear-board", ());
        }
        "theme_system" => {
            let _ = app.emit("menu:theme", "system");
        }
        "theme_dark" => {
            let _ = app.emit("menu:theme", "dark");
        }
        "theme_light" => {
            let _ = app.emit("menu:theme", "light");
        }
        "always_on_top" => {
            // The CheckMenuItem owns the toggle state; mirror it onto the window.
            if let Some(window) = app.get_webview_window("main") {
                let on = window.is_always_on_top().unwrap_or(false);
                let _ = window.set_always_on_top(!on);
            }
        }
        "win_minimize" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.minimize();
            }
        }
        "win_zoom" => {
            if let Some(window) = app.get_webview_window("main") {
                let maximized = window.is_maximized().unwrap_or(false);
                let _ = if maximized {
                    window.unmaximize()
                } else {
                    window.maximize()
                };
            }
        }
        "win_close" => {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.close();
            }
        }
        "help_changelog" => open_url(app, URL_CHANGELOG),
        "help_github" => open_url(app, URL_GITHUB),
        "help_facebook" => open_url(app, URL_FACEBOOK),
        "help_licenses" => open_url(app, URL_LICENSE),
        _ => {}
    }
}

fn open_url(app: &AppHandle, url: &str) {
    let _ = app.opener().open_url(url, None::<&str>);
}

/// Enable/disable the board-dependent menu items (File → Close, Edit → Clear),
/// greyed out when the board is empty.
#[tauri::command]
fn set_board_enabled(enabled: bool, items: tauri::State<MenuItems>) {
    let _ = items.close.set_enabled(enabled);
    let _ = items.clear.set_enabled(enabled);
    let _ = items.save.set_enabled(enabled);
    let _ = items.save_as.set_enabled(enabled);
}

/// Check for a newer signed release. The frontend decides how to surface it.
#[tauri::command]
async fn check_for_updates(app: AppHandle) -> update_check::UpdateStatus {
    update_check::check_now(&app).await
}

/// Download and install the pending update in place, then relaunch.
#[tauri::command]
async fn install_update(app: AppHandle) -> Result<(), String> {
    update_check::install(&app).await.map_err(|e| e.to_string())
}

/// The OS account login name — a non-identifying default for the pack author,
/// editable in Settings (never the real name, to avoid leaking PII on share).
/// Falls back to "Unknown" when it can't be determined.
#[tauri::command]
fn system_username() -> String {
    match whoami::fallible::username() {
        Ok(name) if !name.is_empty() => name,
        _ => "Unknown".into(),
    }
}

/// Size the window so the *content area* is square — the board fills it with no
/// side margins. Worked in physical pixels because `scale_factor()` is
/// unreliable during `setup()` (it can report 1.0 before the window lands on its
/// monitor), which otherwise leaves the window wide-but-short. Geometry is
/// intentionally not persisted — every launch recomputes the square.
fn fit_window_square(app: &tauri::App) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };
    let monitor = match window.current_monitor() {
        Ok(Some(m)) => m,
        _ => match window.primary_monitor() {
            Ok(Some(m)) => m,
            _ => return,
        },
    };
    // `set_size` sets the client (webview) size, so a square here fills the
    // board with no margins. Physical px sidesteps the unreliable setup-time
    // scale; the square fits the shorter screen dimension with headroom for the
    // taskbar and titlebar.
    let phys = monitor.size();
    let shorter = phys.width.min(phys.height) as f64;
    let side = (shorter * 0.82).clamp(480.0, 1100.0) as u32;
    let _ = window.set_size(tauri::PhysicalSize::new(side, side));
    let _ = window.center();
}
