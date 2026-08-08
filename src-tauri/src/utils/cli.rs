// src-tauri/src/cli.rs
use std::path::Path;
use std::process;
use tauri::App;
use tauri_plugin_cli::CliExt;

pub fn handle_cli_args(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let matches = match app.cli().matches() {
        Ok(m) => m,
        Err(_) => {
            println!("LigHTTP is a GUI application, please open it directly");
            process::exit(0);
        }
    };

    // 檢查是否有傳入 file 參數
    if let Some(file_arg) = matches.args.get("file") {
        if let Some(file_path) = file_arg.value.as_str() {
            if !file_path.is_empty() {
                // 判斷是否為合法檔案或 .lghttp.json
                if file_path.ends_with(".lghttp.json") || Path::new(file_path).exists() {
                    println!("LigHTTP 正在開啟檔案: {}", file_path);
                    // 這裡可以將路徑存入 Tauri State 供前端讀取，或在此進行事前處理
                    return Ok(());
                } else {
                    println!("LigHTTP is a GUI application, please open it directly");
                    process::exit(0);
                }
            }
        }
    }

    // 若有傳入其他未定義的指令/參數
    // if !matches.args.is_empty() {
    //     println!("LigHTTP is a GUI application, please open it directly");
    //     process::exit(0);
    // }

    Ok(())
}
