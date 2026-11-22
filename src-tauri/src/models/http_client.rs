use serde::Deserialize;

#[derive(Debug, Deserialize)]
#[serde(default, rename_all = "camelCase")]
pub struct HttpClientConfig {
    pub timeout: u64,
    pub connect_timeout: u64,
    pub read_timeout: u64,
    pub follow_redirects: bool,
    pub max_redirects: usize,
    pub referer: bool,
    pub https_only: bool,
}

impl Default for HttpClientConfig {
    fn default() -> Self {
        Self {
            timeout: 30,
            connect_timeout: 10,
            read_timeout: 0,
            follow_redirects: true,
            max_redirects: 10,
            referer: true,
            https_only: false,
        }
    }
}

impl HttpClientConfig {
    pub fn validate(&self) -> Result<(), String> {
        for (name, value) in [
            ("timeout", self.timeout),
            ("connectTimeout", self.connect_timeout),
            ("readTimeout", self.read_timeout),
        ] {
            if value > 86400 {
                return Err(format!("{} 必須介於 0 到 86400 秒之間", name));
            }
        }

        if !(1..=100).contains(&self.max_redirects) {
            return Err("maxRedirects 必須介於 1 到 100 之間".into());
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::HttpClientConfig;
    use crate::models::RequestPayload;
    use serde_json::json;

    #[test]
    fn missing_and_partial_settings_keep_defaults() {
        let payload: RequestPayload = serde_json::from_value(json!({
            "url": "http://localhost",
            "method": "GET",
            "params": [],
            "headers": [],
            "auth": { "auth_type": "none", "content": null }
        }))
        .unwrap();
        assert_eq!(payload.http_client_config.timeout, 30);
        assert_eq!(payload.http_client_config.connect_timeout, 10);
        assert_eq!(payload.http_client_config.read_timeout, 0);
        assert!(payload.http_client_config.follow_redirects);
        assert_eq!(payload.http_client_config.max_redirects, 10);
        assert!(payload.http_client_config.referer);
        assert!(!payload.http_client_config.https_only);

        let partial: HttpClientConfig =
            serde_json::from_value(json!({ "followRedirects": false })).unwrap();
        assert!(!partial.follow_redirects);
        assert_eq!(partial.timeout, 30);
        assert_eq!(partial.max_redirects, 10);
    }

    #[test]
    fn camel_case_settings_are_deserialized() {
        let config: HttpClientConfig = serde_json::from_value(json!({
            "timeout": 60,
            "connectTimeout": 20,
            "readTimeout": 5,
            "followRedirects": false,
            "maxRedirects": 3,
            "referer": false,
            "httpsOnly": true
        }))
        .unwrap();
        assert_eq!(config.timeout, 60);
        assert_eq!(config.connect_timeout, 20);
        assert_eq!(config.read_timeout, 5);
        assert!(!config.follow_redirects);
        assert_eq!(config.max_redirects, 3);
        assert!(!config.referer);
        assert!(config.https_only);
    }

    #[test]
    fn invalid_numbers_are_rejected() {
        for field in ["timeout", "connectTimeout", "readTimeout", "maxRedirects"] {
            for invalid in [json!(-1), json!(1.5), json!("30")] {
                let mut value = json!({});
                value[field] = invalid;
                assert!(serde_json::from_value::<HttpClientConfig>(value).is_err());
            }
        }

        for value in [
            json!({ "timeout": 86401 }),
            json!({ "connectTimeout": 86401 }),
            json!({ "readTimeout": 86401 }),
            json!({ "maxRedirects": 0 }),
            json!({ "maxRedirects": 101 }),
        ] {
            let config: HttpClientConfig = serde_json::from_value(value).unwrap();
            assert!(config.validate().is_err());
        }
    }
}
