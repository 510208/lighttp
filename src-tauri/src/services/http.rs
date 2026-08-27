use crate::models::{RequestPayload, ResponsePayload};
use crate::utils::auth::handle_auth;
use crate::utils::other::{get_content_type, get_deep_error, to_hashmap};
use crate::utils::proxy::{check_proxy, handle_proxy};
use base64::{engine::general_purpose, Engine as _};
use futures_util::StreamExt;
use reqwest::{Client, Method};
use std::collections::HashMap;
use std::time::Duration;
use tokio::time::timeout;
use tracing::{debug, error, info};

const DEFAULT_REQUEST_TIMEOUT: Duration = Duration::from_secs(30);
const MAX_RESPONSE_SIZE: usize = 10 * 1024 * 1024;

pub async fn execute_request(payload: RequestPayload) -> ResponsePayload {
    info!("[execute_request] 收到請求: {:?}", payload);

    // DONE: 建立一個Client實例
    let mut client_builder = Client::builder()
        .timeout(DEFAULT_REQUEST_TIMEOUT)
        .connect_timeout(Duration::from_secs(10));

    // DONE: 處理代理設定 (如果有的話)
    if let Some(proxy_config) = payload.proxy.as_ref() {
        // info!("[execute_request] 檢查代理設定: {:?}", proxy_config);

        // 檢查是否需要先測試代理連線
        if proxy_config.check_before_send {
            info!("[execute_request] 代理設定要求測試連線，正在測試...");
            match check_proxy(proxy_config).await {
                Ok(()) => info!("[execute_request] 代理連線測試成功"),
                Err(e) => {
                    let detailed_error = e;
                    error!("[execute_request] 代理連線測試出錯: {}", detailed_error);

                    // 將錯誤轉為小寫後進行多重關鍵字與 407 狀態碼比對
                    let err_lowercase = detailed_error.to_lowercase();
                    let is_proxy_auth_error = err_lowercase
                        .contains("proxy authorization required")
                        || err_lowercase.contains("proxy authentication required")
                        || err_lowercase.contains("407");

                    if is_proxy_auth_error {
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
            info!("[execute_request] 代理設定不要求測試連線，直接使用設定的代理");
        }

        match handle_proxy(proxy_config).await {
            Ok(Some(proxy)) => {
                // 成功建立代理物件，掛載到 client
                client_builder = client_builder.proxy(proxy);
            }
            Ok(None) => {
                // 代理未啟用，不做任何事，繼續執行普通請求
                info!("[execute_request] 代理已關閉，使用直連模式");
            }
            Err(e) => {
                // 代理格式真的有錯誤
                error!("[execute_request] 代理設定出錯: {}", e);
                return build_error_response(400, e);
            }
        }
    } else {
        info!("[execute_request] 無代理設定，使用直連模式");
    }

    // DONE: 建立Client實例，並處理可能的錯誤
    let client = match client_builder.build() {
        Ok(client) => client,
        Err(e) => {
            let full_error = format!("{}", e);
            error!("[execute_request] 建立 Client 失敗: {}", full_error);
            return build_error_response(500, full_error);
        }
    };

    let method = match Method::from_bytes(payload.method.to_uppercase().as_bytes()) {
        Ok(m) => m,
        Err(_) => {
            return build_error_response(
                400,
                format!("[execute_request] 無效的 HTTP 方法: {}", payload.method),
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
                debug!("[execute_request] 無正文內容");
            }
            "Raw" => {
                debug!("[execute_request] 處理 Raw Body: {}", body.content);
                request_builder = request_builder.body(body.content);
            }
            // 其他類型的處理可以在這裡添加
            _ => {
                error!("[execute_request] 不支援的 Body 類型: {}", body.body_type);
                return build_error_response(
                    400,
                    format!("不支援的 Body 類型: {}", body.body_type),
                );
            }
        }
    }

    // DONE: 送請求
    // info!("[execute_request] request_builder: {:?}", request_builder);
    let response = timeout(DEFAULT_REQUEST_TIMEOUT, request_builder.send()).await;

    // DONE: 檢查請求是否成功
    match response {
        Ok(Ok(response_obj)) => parse_success_response(response_obj).await,
        Ok(Err(e)) => {
            let detailed_error = get_deep_error(&e); // 這裡會拿到更深層的資訊
            error!("[execute_request] 請求發送失敗: {}", detailed_error);
            build_error_response(500, detailed_error)
        }
        Err(_) => {
            error!(
                "[execute_request] 請求執行超時（超過 {} 秒）",
                DEFAULT_REQUEST_TIMEOUT.as_secs()
            );
            build_error_response(
                504,
                format!(
                    "請求連線或回應超時（已超過 {} 秒）",
                    DEFAULT_REQUEST_TIMEOUT.as_secs()
                ),
            )
        }
    }
}

// 處理成功的結果
async fn parse_success_response(response: reqwest::Response) -> ResponsePayload {
    // 1. 先取出所有需要從 response 讀取的純數據（唯讀/複製）
    let status = response.status().as_u16();
    let content_length = response.content_length();
    let headers_map = to_hashmap(response.headers()); // 直接將 headers 轉為 HashMap，不再保留 &HeaderMap
    let content_type = get_content_type(response.headers());

    // 2. 預先檢查 Content-Length
    if let Some(length) = content_length {
        if length > MAX_RESPONSE_SIZE as u64 {
            return build_error_response(
                413,
                format!(
                    "回應內容過大（超過上限 {} MB）",
                    MAX_RESPONSE_SIZE / (1024 * 1024)
                ),
            );
        }
    }

    // 3. 【最後一步】轉移 response 所有權給 bytes_stream()
    // 此行之後「絕不能」再出現任何 `response.xxx` 的程式碼
    let mut stream = response.bytes_stream();
    let mut body_bytes = Vec::new();

    while let Some(chunk_result) = stream.next().await {
        let chunk = match chunk_result {
            Ok(c) => c,
            Err(e) => return build_error_response(500, format!("讀取回應內容失敗: {}", e)),
        };

        if body_bytes.len() + chunk.len() > MAX_RESPONSE_SIZE as usize {
            return build_error_response(
                413,
                format!(
                    "回應內容超出允許上限（{} MB）",
                    MAX_RESPONSE_SIZE / (1024 * 1024)
                ),
            );
        }

        body_bytes.extend_from_slice(&chunk);
    }

    // 4. 使用最前面已經擷取好的變數（headers_map, content_type）建構 ResponsePayload
    let is_media = is_media_content_type(&content_type);
    let base64_encoded = general_purpose::STANDARD.encode(&body_bytes);

    let (text_body, b64_field) = if is_media {
        (base64_encoded, None)
    } else {
        let text = String::from_utf8(body_bytes.clone())
            .unwrap_or_else(|_| "[非 UTF-8 二進位文字，請切換至二進位檢視]".to_string());
        (text, None)
    };

    ResponsePayload {
        status,
        headers: headers_map, // 直接使用第 1 步預先轉好的 HashMap
        body_type: content_type,
        body: text_body,
        body_binary: body_bytes,
        body_binary_b64: b64_field,
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
        body_binary: Vec::new(), // 錯誤情況下，二進位資料為空
        body_binary_b64: None,
    }
}

fn is_media_content_type(content_type: &str) -> bool {
    let content_type = content_type.to_lowercase();

    content_type.starts_with("image/")
        || content_type.starts_with("video/")
        || content_type.starts_with("audio/")
        || content_type == "application/octet-stream"
}
