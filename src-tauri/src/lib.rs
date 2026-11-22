mod commands;
mod models;
mod services;
pub mod utils;

use std::sync::Mutex;
#[cfg(desktop)]
use tauri::Manager;
use utils::cli::handle_cli_args;
use utils::cli::AppCliState;
use utils::cli::CliData;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default();
    #[cfg(desktop)]
    let builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.unminimize();
            let _ = window.show();
            let _ = window.set_focus();
        }
    }));

    builder
        .manage(commands::RequestExecutions::default())
        .manage(AppCliState(Mutex::new(CliData::default())))
        .plugin(tauri_plugin_cli::init())
        .setup(|app| {
            // 調用抽離出去的 CLI 處理函式
            handle_cli_args(app)?;

            Ok(())
        })
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_store::init())
        .plugin(tauri_plugin_pinia::init())
        .invoke_handler(tauri::generate_handler![
            commands::handle_request,
            commands::cancel_request,
            commands::get_cli_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
