mod commands;
mod input;
mod state;

use state::AppState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Stdout,
                ))
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("beatpad".into()),
                    },
                ))
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::Webview,
                ))
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(AppState::spawn(app.handle().clone()));
            fit_window_square(app);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::trigger_pad,
            commands::release_pad,
            commands::set_pad_mode
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
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
