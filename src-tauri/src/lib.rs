// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, handle_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// ------

// use serde::Deserialize;
// use std::collections::HashMap;

mod models;
use models::{RequestPayload, ResponsePayload};
use reqwest::header::HeaderMap;
use std::collections::HashMap;
use reqwest::{Client, Method};

fn to_hashmap(header_map: &HeaderMap) -> HashMap<String, String> {
    header_map
        .iter()
        .map(|(k, v)| {
            (
                k.as_str().to_string(),
                v.to_str().unwrap_or_default().to_string(),
            )
        })
        .collect()
}

// 建立處理後端邏輯的函式，這裡我們將接收前端傳來的資料並進行處理
#[tauri::command]
async fn handle_request(payload: RequestPayload) -> ResponsePayload {
    // 建立一個Client實例
    let client = Client::new();

    let method = match Method::from_bytes(payload.method.to_uppercase().as_bytes()) {
        Ok(m) => m,
        Err(_) => return build_error_response(400, format!("[handle_request] 無效的 HTTP 方法: {}", payload.method)),
    };

    let mut request_builder = client.request(method, &payload.url);

    // 添加標頭
    for header in payload.headers {
        request_builder = request_builder.header(&header.key, &header.value);
    }

    // TODO: 添加認證處理 (根據 payload.auth 的內容)

    // TODO: 處理正文內容

    // 送請求
    let response = request_builder.send().await;

    // 檢查請求是否成功
    match response {
        Ok(response) => parse_success_response(response).await,
        Err(e) => build_error_response(500, format!("[handle_request] 請求失敗: {}", e)),
    }
}

// 處理成功的結果
async fn parse_success_response(response: reqwest::Response) -> ResponsePayload {
    ResponsePayload {
        status: response.status().as_u16(),
        headers: to_hashmap(response.headers()),
        body: response.text().await.unwrap_or_default(),  // response.text() 會取走擁有權，所以headers要放在上面
    }
}

// 處理錯誤的結果
fn build_error_response(status: u16, message: String) -> ResponsePayload {
    println!("[build_error_response] Error: {}", message);

    ResponsePayload {
        status,
        headers: HashMap::new(),
        body: message,
    }
}