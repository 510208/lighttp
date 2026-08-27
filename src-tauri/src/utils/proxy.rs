use crate::models;
use models::ProxyConfig;
use std::time::Duration;

// 處理代理
pub async fn handle_proxy(proxy: &ProxyConfig) -> Result<Option<reqwest::Proxy>, String> {
    // 如果未啟用，直接回傳 Ok(None)，表示這不是錯誤，只是不需要代理
    if !proxy.enabled {
        return Ok(None);
    }

    // 使用 serde 的特性或直接轉小寫處理協議
    let proto = format!("{:?}", proxy.protocol).to_lowercase();
    let proxy_url = format!("{}://{}:{}", proto, proxy.host, proxy.port);

    let mut reqwest_proxy =
        reqwest::Proxy::all(&proxy_url).map_err(|e| format!("無效的代理 URL: {}", e))?;

    // 處理驗證邏輯
    if let Some(auth) = &proxy.auth {
        // 只有在真的有提供帳號密碼時才掛載驗證
        if !auth.username.is_empty() || !auth.password.is_empty() {
            reqwest_proxy = reqwest_proxy.basic_auth(&auth.username, &auth.password);
        }
    }

    Ok(Some(reqwest_proxy))
}

// 檢查代理可用性
pub async fn check_proxy(proxy: &ProxyConfig) -> Result<(), String> {
    // 建立代理物件
    let reqwest_proxy = match handle_proxy(proxy).await? {
        Some(p) => p,
        None => return Ok(()), // 代理未啟用，視為可用
    };

    // 建立 Client，必須加入超時機制（修復 M1 漏洞）
    let client = reqwest::Client::builder()
        .proxy(reqwest_proxy)
        .timeout(Duration::from_secs(5)) // 設定 5 秒超時，防止永久 Pending
        .build()
        .map_err(|e| format!("建立 Client 失敗: {}", e))?;

    // 使用極高高可用性的 HTTPS 端點（修復 H4 明文 HTTP 探針漏洞）
    // Cloudflare 1.1.1.1 trace 端點反應極快且傳輸全程加密
    let test_url = "https://1.1.1.1/cdn-cgi/trace";

    // 發送 HEAD 請求僅檢查連通性與 HTTP 狀態碼，減少不必要的傳輸流量
    client
        .head(test_url)
        .send()
        .await
        .map_err(|e| format!("代理連線失敗: {}", e))?;

    Ok(())
}
