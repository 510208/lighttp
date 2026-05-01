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

// use serde::Deserialize;
// use std::collections::HashMap;
use reqwest::Client;

mod models;
use models::{RequestPayload};

// 建立處理後端邏輯的函式，這裡我們將接收前端傳來的資料並進行處理
#[tauri::command]
async fn handle_request(payload: RequestPayload) {
    // 建立一個Client實例
    let client = Client::new();

    match payload.method.as_str() {
        // GET request
        "GET" => {
            let mut request_builder = client.get(&payload.url);

            // 添加標頭
            for header in payload.headers {
                request_builder = request_builder.header(&header.key, &header.value);
            }

            // 驗證方式處理

            // 發送請求並處理回應
            match request_builder.send().await {
                Ok(response) => {
                    println!("Response Status: {}", response.status());
                    // 輸出回應內容
                    match response.text().await {
                        Ok(text) => println!("Response Body: {}", text),
                        Err(e) => eprintln!("Failed to read response body: {}", e),
                    }
                }
                Err(e) => {
                    eprintln!("Request failed: {}", e);
                }
            }
        }
        // 這裡可以添加對其他 HTTP 方法的處理，例如 POST、PUT、DELETE 等
        _ => {
            eprintln!("Unsupported HTTP method: {}", payload.method);
        }
    }
}