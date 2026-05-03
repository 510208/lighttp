// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // 初始化日誌
    tracing_subscriber::fmt::init();

    lighttp_lib::run()
}
