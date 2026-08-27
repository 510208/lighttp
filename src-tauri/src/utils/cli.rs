use std::fs;
use std::path::Path;
use std::process;
use tauri::App;
use tauri_plugin_cli::CliExt;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};

pub fn handle_cli_args(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    // 取得 CLI 匹配結果，若無 CLI 引數或解析失敗則靜默放行，讓 GUI 正常啟動
    let matches = match app.cli().matches() {
        Ok(m) => m,
        Err(_) => return Ok(()),
    };

    // 提取 file 參數路徑
    let file_path = match matches.args.get("file").and_then(|arg| arg.value.as_str()) {
        Some(path) if !path.is_empty() => path,
        _ => return Ok(()), // 無傳入檔案則正常進入 GUI 介面
    };

    let path = Path::new(file_path);

    // 驗證檔案是否存在
    if !path.exists() {
        eprintln!("Error: Specified file does not exist: {}", file_path);
        process::exit(1);
    }

    // 讀取檔案內容並進行基本驗證
    let file_content = fs::read_to_string(path)?;

    // 檢查是否有 Proxy 設定
    let contains_proxy = file_content.contains("\"proxy\"")
        || file_content.contains("\"host\"")
        || file_content.contains("\"port\"");

    // 含有 Proxy 設定時跳出 Dialog 警示
    if contains_proxy {
        let should_enable = show_proxy_warning_dialog(app);
        if !should_enable {
            println!("User canceled or rejected untrusted proxy settings via CLI file launch.");
            // 這裡可以選擇：1) 直接退出，或 2) 清除 Proxy 內容後再寫入 State 給前端
        }
    }

    println!("LigHTTP successfully loaded CLI file: {}", file_path);

    // 將檔案內容存入 Tauri Managed State 供前端透過 Command 安全讀取
    // app.manage(CliLoadedFile(file_content));

    Ok(())
}

// 抽離警示 Dialog 邏輯，避免主流程混亂
fn show_proxy_warning_dialog(app: &App) -> bool {
    let warning_msg = "Proxy settings are found in the file to be loaded. \
Wait, if you load these settings and send a request, it may cause data leakage, man-in-the-middle attack, etc.\n\n\
Do you trust and need these proxy settings?";

    app.dialog()
        .message(warning_msg)
        .title("Warning")
        .buttons(MessageDialogButtons::OkCancel)
        .blocking_show()
}
