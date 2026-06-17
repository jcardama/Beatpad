mod commands;
mod input;
mod state;

use std::sync::Mutex;

use state::AppState;
use tauri::menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::{AppHandle, Emitter, Manager, Wry};
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_opener::OpenerExt;

const URL_GITHUB: &str = "https://github.com/jcardama/Beatpad";
const URL_CHANGELOG: &str = "https://github.com/jcardama/Beatpad/blob/main/CHANGELOG.md";
const URL_LICENSE: &str = "https://github.com/jcardama/Beatpad/blob/main/LICENSE";
const URL_RELEASES: &str = "https://github.com/jcardama/Beatpad/releases";
const URL_FACEBOOK: &str = "https://www.facebook.com/beatxpad";

/// Tracks the "Always on Top" toggle (kept in sync with the menu's checkbox).
struct AlwaysOnTop(Mutex<bool>);

/// Menu items whose enabled state changes at runtime (greyed when the board is
/// empty).
struct MenuItems {
    close: MenuItem<Wry>,
    clear: MenuItem<Wry>,
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
        .manage(AlwaysOnTop(Mutex::new(false)))
        .setup(|app| {
            app.manage(AppState::spawn(app.handle().clone()));
            fit_window_square(app);
            app.set_menu(build_menu(app)?)?;
            // Auto-hide the in-window menu bar; Alt toggles it (see `toggle_menu`).
            // macOS uses the always-present global menu bar, so skip it there.
            #[cfg(not(target_os = "macos"))]
            if let Some(window) = app.get_webview_window("main") {
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
            commands::toggle_menu,
            set_board_enabled
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

    // Close/Clear are disabled until a pack/sound is loaded (see `set_board_enabled`).
    let close = MenuItem::with_id(app, "close_pack", "Close", false, Some("CmdOrCtrl+W"))?;
    let file = Submenu::with_items(
        app,
        "File",
        true,
        &[
            &MenuItem::with_id(app, "open_pack", "Open…", true, Some("CmdOrCtrl+O"))?,
            &close,
        ],
    )?;

    let clear = MenuItem::with_id(app, "clear_board", "Clear", false, None::<&str>)?;
    let edit = Submenu::with_items(app, "Edit", true, &[&clear])?;

    app.manage(MenuItems { close, clear });

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
                .message("BeatPad 0.1.0\nA Launchpad-style beat pad.")
                .title("About BeatPad")
                .show(|_| {});
        }
        "check_updates" => open_url(app, URL_RELEASES),
        "preferences" => {
            let _ = app.emit("menu:preferences", ());
        }
        "open_pack" => {
            let _ = app.emit("menu:open-pack", ());
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
            let state = app.state::<AlwaysOnTop>();
            let mut on = state.0.lock().unwrap();
            *on = !*on;
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_always_on_top(*on);
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
}

/// Size the window to a square that fits the display (capped to an arbitrary
/// max), so the board never clips and stays square on small screens.
fn fit_window_square(app: &tauri::App) {
    let Some(window) = app.get_webview_window("main") else {
        return;
    };
    let Ok(Some(monitor)) = window.current_monitor() else {
        return;
    };
    let size = monitor.size().to_logical::<f64>(monitor.scale_factor());
    let side = (size.width.min(size.height) * 0.85).clamp(480.0, 860.0);
    let _ = window.set_size(tauri::LogicalSize::new(side, side));
    let _ = window.center();
}
