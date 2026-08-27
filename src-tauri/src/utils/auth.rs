use crate::models;

use base64::{engine::general_purpose, Engine as _};
use models::AuthStore;
use reqwest::header::HeaderValue;
use thiserror::Error;

pub fn encode_base64(input: &str) -> String {
    general_purpose::STANDARD.encode(input)
}

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("Invalid character in authorization header: {0}")]
    InvalidHeaderValue(#[from] reqwest::header::InvalidHeaderValue),
}

// 處理驗證
pub async fn handle_auth(auth: &AuthStore) -> Result<Option<HeaderValue>, AuthError> {
    match auth {
        AuthStore::Basic(content) => {
            if let (Some(u), Some(p)) = (&content.username, &content.password) {
                let credentials = format!("{}:{}", u, p);
                let encoded = encode_base64(&credentials);
                let header_str = format!("Basic {}", encoded);

                // 顯式使用 ? 運算子，不使用 .ok() 掩蓋錯誤
                let header_val = HeaderValue::from_str(&header_str)?;
                Ok(Some(header_val))
            } else {
                Ok(None)
            }
        }
        AuthStore::Bearer(content) => {
            if let Some(t) = &content.token {
                if t.trim().is_empty() {
                    return Ok(None);
                }
                let header_str = format!("Bearer {}", t);
                let header_val = HeaderValue::from_str(&header_str)?;
                Ok(Some(header_val))
            } else {
                Ok(None)
            }
        }
        AuthStore::None(_) => Ok(None),
    }
}
