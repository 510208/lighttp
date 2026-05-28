use reqwest::header::HeaderMap;
use std::collections::HashMap;

// 展開錯誤內容
pub fn get_deep_error(e: &reqwest::Error) -> String {
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
pub fn to_hashmap(header_map: &HeaderMap) -> HashMap<String, String> {
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

pub fn get_content_type(headers: &HeaderMap) -> String {
    headers
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("text/plain")
        .to_string()
}
