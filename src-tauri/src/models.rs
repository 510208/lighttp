use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fmt;

#[derive(Deserialize, Debug)]
pub struct Header {
    pub key: String,
    pub value: String,
}

#[derive(Deserialize, Debug)]
#[allow(dead_code)]
pub struct Param {
    pub key: String,
    pub value: String,
}

// ------ 驗證
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
#[allow(dead_code)]
pub enum AuthMethod {
    None,
    Basic,
    Bearer,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "auth_type", content = "content", rename_all = "lowercase")]
pub enum AuthStore {
    /// 對應 NoneAuthContent (通常為空物件或 null)
    None(serde_json::Value),

    /// 對應 BasicAuthContent
    Basic(BasicAuthContent),

    /// 對應 BearerAuthContent
    Bearer(BearerAuthContent),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BasicAuthContent {
    pub username: Option<String>,
    pub password: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BearerAuthContent {
    pub token: Option<String>,
}

// ------ 正文
#[derive(Debug, Serialize, Deserialize)]
pub struct BodyContent {
    #[serde(rename = "type")]
    pub body_type: String,

    pub content: String,
}

// ------ 代理
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Hash)]
#[serde(rename_all = "lowercase")]
pub enum ProxyProtocol {
    Http,
    Https,
    Socks4,
    Socks5,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Hash)]
pub struct ProxyAuth {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProxyConfig {
    pub enabled: bool,

    #[serde(rename = "checkBeforeSend")]
    pub check_before_send: bool,

    pub protocol: crate::models::ProxyProtocol,
    pub host: String,
    pub port: u16,
    pub auth: Option<ProxyAuth>, // 這裡使用 Option 來表示
}

// ------ 前端

// #[derive(Deserialize)]代表這個結構可以從 JSON 反序列化而來，這對於從前端接收資料非常有用。
// {      url: url.value,
//       method: method.value,
//       params: params.value.filter((p) => p.enabled),
//       headers: headers.value.filter((h) => h.enabled),
//       auth: auth.value,}

#[derive(Deserialize)]
pub struct RequestPayload {
    pub url: String,
    pub method: String,

    #[allow(dead_code)]
    pub params: Vec<Param>,

    pub headers: Vec<Header>,
    pub auth: AuthStore,
    pub body: Option<BodyContent>,
    pub proxy: Option<ProxyConfig>,
}

impl fmt::Debug for RequestPayload {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        let auth_type = match &self.auth {
            AuthStore::None(_) => "None",
            AuthStore::Basic(_) => "Basic",
            AuthStore::Bearer(_) => "Bearer",
        };

        // 提取 Option<BodyContent> 的資訊
        let body_type = self
            .body
            .as_ref()
            .map(|b| b.body_type.as_str())
            .unwrap_or("None");
        let body_size = self.body.as_ref().map(|b| b.content.len()).unwrap_or(0);

        f.debug_struct("RequestPayload")
            .field("method", &self.method)
            .field("url", &self.url)
            .field("auth_type", &auth_type)
            .field("body_type", &body_type)
            .field("body_size", &body_size)
            .finish()
    }
}

// ------

#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ResponsePayload {
    pub status: u16,                           // HTTP 狀態碼
    pub headers: HashMap<String, Vec<String>>, // HTTP 標頭，支援重複 Key
    pub body_type: String, // 內容類型（MIME type），例如 "text/html"、"application/json"、"image/png" 等
    pub body: String,      // 文字內容，若是二進位資料則為 base64 編碼後的字串
    pub body_binary: Vec<u8>, // 原始二進位資料，若是文字內容則為 UTF-8 編碼的 bytes
    pub body_binary_b64: Option<String>, // 若是二進位資料則為 base64 編碼後的字串，若是文字內容則為 None
}
