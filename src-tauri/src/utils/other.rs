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
pub fn to_hashmap(header_map: &HeaderMap) -> HashMap<String, Vec<String>> {
    let mut map: HashMap<String, Vec<String>> = HashMap::new();

    for (k, v) in header_map {
        let key = k.as_str().to_string();

        // 使用 String::from_utf8_lossy 處理非 UTF-8 二進位標頭，避免字串靜默變空
        let value = String::from_utf8_lossy(v.as_bytes()).into_owned();

        // 支援重複 Key（如多個 Set-Cookie），以 Vec 累積所有數值
        map.entry(key).or_default().push(value);
    }

    map
}

pub fn get_content_type(headers: &HeaderMap) -> String {
    headers
        .get(reqwest::header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("text/plain")
        .to_string()
}
