use crate::models;

use base64::{engine::general_purpose, Engine as _};
use models::AuthStore;

pub fn encode_base64(input: &str) -> String {
    general_purpose::STANDARD.encode(input)
}

// 處理驗證
pub async fn handle_auth(auth: &AuthStore) -> Option<reqwest::header::HeaderValue> {
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
