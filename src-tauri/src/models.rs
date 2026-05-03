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

// ------ 驗證
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
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

// ------ 前端

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
    pub body: Option<BodyContent>,
}

// ------

#[derive(Serialize, Debug)]
pub struct ResponsePayload {
    pub status: u16,                // HTTP 狀態碼 (例如 200, 404)
    pub body: String,               // 回應的主體內容
    pub headers: HashMap<String, String>, // 回應標頭
}