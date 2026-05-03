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
use models::{RequestPayload, ResponsePayload, AuthStore};
use reqwest::header::HeaderMap;
use std::{collections::HashMap};
use reqwest::{Client, Method};
use base64::{Engine as _, engine::general_purpose};

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

fn encode_base64(input: &str) -> String { general_purpose::STANDARD.encode(input) }

// 處理驗證
async fn handle_auth(auth: &AuthStore) -> Option<reqwest::header::HeaderValue> {
    match auth {
        AuthStore::Basic(content) => {
            if let (Some(u), Some(p)) = (&content.username, &content.password) {
                let credentials = format!("{}:{}", u, p);
                let encoded = encode_base64(&credentials);
                reqwest::header::HeaderValue::from_str(&format!("Basic {}", encoded)).ok()
            } else {
                None
            }
        }
        AuthStore::Bearer(content) => {
            content.token.as_ref().and_then(|t| {
                reqwest::header::HeaderValue::from_str(&format!("Bearer {}", t)).ok()
            })
        }
        AuthStore::None(_) => None,
    }
}

// 建立處理後端邏輯的函式，這裡我們將接收前端傳來的資料並進行處理
#[tauri::command]
async fn handle_request(payload: RequestPayload) -> ResponsePayload {
    // DONE: 建立一個Client實例
    let client = Client::new();

    let method = match Method::from_bytes(payload.method.to_uppercase().as_bytes()) {
        Ok(m) => m,
        Err(_) => return build_error_response(400, format!("[handle_request] 無效的 HTTP 方法: {}", payload.method)),
    };

    let mut request_builder = client.request(method, &payload.url);

    // DONE: 添加標頭
    for header in payload.headers {
        request_builder = request_builder.header(&header.key, &header.value);
    }

    // DONE: 添加認證處理 (根據 payload.auth 的內容)
    if let Some(auth_header) = handle_auth(&payload.auth).await {  // Some(auth_header) 表示有有效的認證資訊
        request_builder = request_builder.header(reqwest::header::AUTHORIZATION, auth_header);
    }
    
    // DONE: 處理正文內容
    if let Some(body) = payload.body {
        match body.body_type.as_str() {
            "Raw" => {
                println!("[handle_request] 處理 Raw Body: {}", body.content);
                request_builder = request_builder.body(body.content);
            }
            // 其他類型的處理可以在這裡添加
            _ => {
                eprintln!("[handle_request] 不支援的 Body 類型: {}", body.body_type);
                return build_error_response(400, format!("不支援的 Body 類型: {}", body.body_type));
            }
        }
    }
    
    // DONE: 送請求
    println!("[handle_request] request_builder: {:?}", request_builder);
    let response = request_builder.send().await;

    // DONE: 檢查請求是否成功
    match response {
        Ok(response) => parse_success_response(response).await,
        Err(e) => {
            let full_error = format!("{}", e);
            eprintln!("[handle_request] 請求發送失敗: {}", full_error);
            build_error_response(500, full_error)
        },
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