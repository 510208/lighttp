use tracing::{debug, error, info};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, handle_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// ------

// use serde::Deserialize;
// use std::collections::HashMap;

mod models;
use base64::{engine::general_purpose, Engine as _};
use models::{AuthStore, RequestPayload, ResponsePayload};
use reqwest::header::HeaderMap;
use reqwest::{Client, Method};
use std::collections::HashMap;

use crate::models::ProxyConfig;

// 展開錯誤內容
fn get_deep_error(e: &reqwest::Error) -> String {
    use std::error::Error;
    let mut messages = vec![format!("{}", e)];
    
    // 遞迴取得底層錯誤原因 (例如 hyper 或 native-tls 的錯誤)
    let mut source = e.source();
    while let Some(cause) = source {
        messages.push(format!("{}", cause));
        source = cause.source();
    }
    
    messages.join(" -> ")
}

// 將 HeaderMap 轉換為 HashMap<String, String>，以便前端使用
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

fn encode_base64(input: &str) -> String {
    general_purpose::STANDARD.encode(input)
}

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
        AuthStore::Bearer(content) => content
            .token
            .as_ref()
            .and_then(|t| reqwest::header::HeaderValue::from_str(&format!("Bearer {}", t)).ok()),
        AuthStore::None(_) => None,
    }
}

// 處理代理
async fn handle_proxy(proxy: &ProxyConfig) -> Result<Option<reqwest::Proxy>, String> {
    // 如果未啟用，直接回傳 Ok(None)，表示這不是錯誤，只是不需要代理
    if !proxy.enabled {
        return Ok(None);
    }

    // 使用 serde 的特性或直接轉小寫處理協議
    let proto = format!("{:?}", proxy.protocol).to_lowercase();
    let proxy_url = format!("{}://{}:{}", proto, proxy.host, proxy.port);
    
    let mut reqwest_proxy = reqwest::Proxy::all(&proxy_url)
        .map_err(|e| format!("無效的代理 URL: {}", e))?;

    // 處理驗證邏輯
    if let Some(auth) = &proxy.auth {
        // 只有在真的有提供帳號密碼時才掛載驗證
        if !auth.username.is_empty() || !auth.password.is_empty() {
            reqwest_proxy = reqwest_proxy.basic_auth(&auth.username, &auth.password);
        }
    }

    Ok(Some(reqwest_proxy))
}

// 建立處理後端邏輯的函式，這裡我們將接收前端傳來的資料並進行處理
#[tauri::command]
async fn handle_request(payload: RequestPayload) -> ResponsePayload {
    info!("[handle_request] 收到請求: {:?}", payload);

    // DONE: 建立一個Client實例
    let mut client_builder = Client::builder();

    // DONE: 處理代理設定 (如果有的話)
    if let Some(proxy_config) = payload.proxy.as_ref() {
        info!("[handle_request] 檢查代理設定: {:?}", proxy_config);
        
        match handle_proxy(proxy_config).await {
            Ok(Some(proxy)) => {
                // 成功建立代理物件，掛載到 client
                client_builder = client_builder.proxy(proxy);
            }
            Ok(None) => {
                // 代理未啟用，不做任何事，繼續執行普通請求
                info!("[handle_request] 代理已關閉，使用直連模式");
            }
            Err(e) => {
                // 代理格式真的有錯誤
                error!("[handle_request] 代理設定出錯: {}", e);
                return build_error_response(400, e);
            }
        }
    } else {
        info!("[handle_request] 無代理設定，使用直連模式");
    }

    // DONE: 建立Client實例，並處理可能的錯誤
    let client = match client_builder.build() {
        Ok(client) => client,
        Err(e) => {
            let full_error = format!("{}", e);
            error!("[handle_request] 建立 Client 失敗: {}", full_error);
            return build_error_response(500, full_error);
        }
    };

    let method = match Method::from_bytes(payload.method.to_uppercase().as_bytes()) {
        Ok(m) => m,
        Err(_) => {
            return build_error_response(
                400,
                format!("[handle_request] 無效的 HTTP 方法: {}", payload.method),
            )
        }
    };

    let mut request_builder = client.request(method, &payload.url);

    // DONE: 添加標頭
    for header in payload.headers {
        request_builder = request_builder.header(&header.key, &header.value);
    }

    // DONE: 添加認證處理 (根據 payload.auth 的內容)
    if let Some(auth_header) = handle_auth(&payload.auth).await {
        // Some(auth_header) 表示有有效的認證資訊
        request_builder = request_builder.header(reqwest::header::AUTHORIZATION, auth_header);
    }

    // DONE: 處理正文內容
    if let Some(body) = payload.body {
        match body.body_type.as_str() {
            "None" => {
                debug!("[handle_request] 無正文內容");
            }
            "Raw" => {
                debug!("[handle_request] 處理 Raw Body: {}", body.content);
                request_builder = request_builder.body(body.content);
            }
            // 其他類型的處理可以在這裡添加
            _ => {
                error!("[handle_request] 不支援的 Body 類型: {}", body.body_type);
                return build_error_response(
                    400,
                    format!("不支援的 Body 類型: {}", body.body_type),
                );
            }
        }
    }

    // DONE: 送請求
    info!("[handle_request] request_builder: {:?}", request_builder);
    let response = request_builder.send().await;

    // DONE: 檢查請求是否成功
    match response {
        Ok(response) => parse_success_response(response).await,
        Err(e) => {
            let detailed_error = get_deep_error(&e); // 這裡會拿到更深層的資訊
            error!("[handle_request] 請求發送失敗: {}", detailed_error);
            build_error_response(500, detailed_error)
        }
    }
}

// 處理成功的結果
async fn parse_success_response(response: reqwest::Response) -> ResponsePayload {
    ResponsePayload {
        status: response.status().as_u16(),
        headers: to_hashmap(response.headers()),
        body: response.text().await.unwrap_or_default(), // response.text() 會取走擁有權，所以headers要放在上面
    }
}

// 處理錯誤的結果
fn build_error_response(status: u16, message: String) -> ResponsePayload {
    error!("[build_error_response] Error: {}", message);

    ResponsePayload {
        status,
        headers: HashMap::new(),
        body: message,
    }
}
