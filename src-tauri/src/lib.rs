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
use models::{RequestPayload, ResponsePayload};
use reqwest::{Client, Method};
use std::collections::HashMap;

pub mod utils;
use utils::auth::handle_auth;
use utils::other::{get_content_type, get_deep_error, to_hashmap};
use utils::proxy::{check_proxy, handle_proxy};

use base64::{engine::general_purpose, Engine as _};

// 建立處理後端邏輯的函式，這裡我們將接收前端傳來的資料並進行處理
#[tauri::command]
async fn handle_request(payload: RequestPayload) -> ResponsePayload {
    info!("[handle_request] 收到請求: {:?}", payload);

    // DONE: 建立一個Client實例
    let mut client_builder = Client::builder();

    // DONE: 處理代理設定 (如果有的話)
    if let Some(proxy_config) = payload.proxy.as_ref() {
        info!("[handle_request] 檢查代理設定: {:?}", proxy_config);

        // 檢查是否需要先測試代理連線
        if proxy_config.check_before_send {
            info!("[handle_request] 代理設定要求測試連線，正在測試...");
            match check_proxy(proxy_config).await {
                Ok(()) => info!("[handle_request] 代理連線測試成功"),
                Err(e) => {
                    let detailed_error = e;
                    error!("[handle_request] 代理連線測試出錯: {}", detailed_error);

                    if detailed_error.contains("proxy authorization required") {
                        return build_error_response(
                            403,
                            format!("登入憑證錯誤、未提供或代理認證失敗: {}", detailed_error),
                        );
                    } else {
                        return build_error_response(
                            500,
                            format!("代理連線測試出錯: {}", detailed_error),
                        );
                    }
                }
            }
        } else {
            info!("[handle_request] 代理設定不要求測試連線，直接使用設定的代理");
        }

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
    let status = response.status().as_u16();
    let headers = response.headers().clone();
    let content_type = get_content_type(&headers);

    if is_media_content_type(&content_type) {
        let body_bytes = response.bytes().await.unwrap_or_default();
        ResponsePayload {
            status,
            headers: to_hashmap(&headers),
            body_type: content_type,
            body: general_purpose::STANDARD.encode(body_bytes),
        }
    } else {
        ResponsePayload {
            status,
            headers: to_hashmap(&headers),
            body_type: content_type,
            body: response.text().await.unwrap_or_default(),
        }
    }
}

// 處理錯誤的結果
fn build_error_response(status: u16, message: String) -> ResponsePayload {
    error!("[build_error_response] Error: {}", message);

    ResponsePayload {
        status,
        headers: HashMap::new(),
        body_type: "text".into(), // 錯誤情況下，body_type 可以設為 "text"
        body: message,
    }
}

fn is_media_content_type(content_type: &str) -> bool {
    let content_type = content_type.to_lowercase();

    content_type.starts_with("image/")
        || content_type.starts_with("video/")
        || content_type.starts_with("audio/")
        || content_type == "application/octet-stream"
}
