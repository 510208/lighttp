use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct Header {
    pub key: String,
    pub value: String,
}

#[derive(Deserialize, Debug)]
pub struct Param {
    pub key: String,
    pub value: String,
}

#[derive(Deserialize, Debug)]
pub struct AuthStore {
    pub auth_type: String,
    pub username: Option<String>,
    pub password: Option<String>,
    pub token: Option<String>,
}

// 定義前端資料結構

// #[derive(Deserialize)]代表這個結構可以從 JSON 反序列化而來，這對於從前端接收資料非常有用。
// {      url: url.value,
//       method: method.value,
//       params: params.value.filter((p) => p.enabled),
//       headers: headers.value.filter((h) => h.enabled),
//       auth: auth.value,}

#[derive(Deserialize, Debug)]
pub struct RequestPayload {
    pub url: String,
    pub method: String,
    pub params: Vec<Param>,
    pub headers: Vec<Header>,
    pub auth: AuthStore,
}

// ------

#[derive(Serialize, Debug)]
pub struct ResponsePayload {
    pub status: u16,                // HTTP 狀態碼 (例如 200, 404)
    pub body: String,               // 回應的主體內容
    pub headers: HashMap<String, String>, // 回應標頭
}