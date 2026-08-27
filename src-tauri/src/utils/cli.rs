use serde::Serialize;
use std::fs;
use std::path::Path;
use std::sync::Mutex;
use tauri::{App, Manager};
use tauri_plugin_cli::CliExt;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};

#[derive(Debug, Clone, Serialize, Default)]
#[serde(rename_all = "camelCase")] // 前端 JS/TS 轉為 camelCase 風格
pub struct CliData {
    pub file_path: Option<String>,
    pub file_content: Option<String>,
    pub error_message: Option<String>,
}

// 外層包覆 Mutex 實現跨線程可變性，供 Tauri manage 使用
pub struct AppCliState(pub Mutex<CliData>);

pub fn handle_cli_args(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let cli_state = app.state::<AppCliState>();

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

        if let Ok(mut state) = cli_state.0.lock() {
            state.error_message = Some(format!("Specified file does not exist: {}", file_path));
        }

        // 傳送錯誤訊息給前端，讓前端跳出對話框，這個問題不應該造成整個介面退出
        return Ok(());
    }

    let canonical_path = match path.canonicalize() {
        Ok(p) => p,
        Err(e) => {
            let err_msg = format!("Failed to resolve path [{}]: {}", file_path, e);
            if let Ok(mut state) = cli_state.0.lock() {
                state.error_message = Some(err_msg);
            }
            return Ok(());
        }
    };

    // 讀取檔案內容並進行基本驗證
    let file_content = match fs::read_to_string(&canonical_path) {
        Ok(content) => content,
        Err(e) => {
            let err_msg = format!("Failed to read file [{}]: {}", file_path, e);
            if let Ok(mut state) = cli_state.0.lock() {
                state.error_message = Some(err_msg);
            }
            return Ok(());
        }
    };

    // 檢查是否有 Proxy 設定
    let contains_proxy = file_content.contains("\"proxy\"")
        || file_content.contains("\"host\"")
        || file_content.contains("\"port\"");

    // 含有 Proxy 設定時跳出 Dialog 警示
    if contains_proxy {
        let should_enable = show_proxy_warning_dialog(app);
        if !should_enable {
            println!("[CLI] User canceled or rejected untrusted proxy settings.");
            if let Ok(mut state) = cli_state.0.lock() {
                state.error_message = Some("User rejected untrusted proxy settings".to_string());
            }
            return Ok(());
        }
    }

    println!("LigHTTP successfully loaded CLI file: {}", file_path);

    if let Ok(mut state) = cli_state.0.lock() {
        state.file_path = Some(canonical_path.to_string_lossy().to_string());
        state.file_content = Some(file_content);
        state.error_message = None; // 清除先前的錯誤
    }

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
