mod commands;
mod models;
mod services;
pub mod utils;

use utils::cli::handle_cli_args;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
        .invoke_handler(tauri::generate_handler![commands::handle_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
