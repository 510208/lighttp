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
use reqwest::Client;

mod models;
use models::{RequestPayload, ResponsePayload};
use reqwest::header::HeaderMap;
use std::collections::HashMap;

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
                    // 回傳結果
                    return parse_success_response(response).await;
                }
                Err(e) => {
                    eprintln!("Request failed: {}", e);
                    // 回傳錯誤結果
                    return ResponsePayload {
                        status: 500,
                        headers: HashMap::new(),
                        body: format!("Request failed: {}", e),
                    };
                }
            }
        }
        // 這裡可以添加對其他 HTTP 方法的處理，例如 POST、PUT、DELETE 等
        _ => {
            eprintln!("Unsupported HTTP method: {}", payload.method);
            return ResponsePayload {
                status: 400,
                headers: HashMap::new(),
                body: format!("Unsupported HTTP method: {}", payload.method),
            };
        }
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