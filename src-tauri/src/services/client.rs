use crate::models::HttpClientConfig;
use reqwest::{redirect::Policy, Client, ClientBuilder};
use std::time::Duration;

pub(super) fn create_client_builder(config: &HttpClientConfig) -> Result<ClientBuilder, String> {
    config.validate()?;

    let redirect_policy = if config.follow_redirects {
        Policy::limited(config.max_redirects)
    } else {
        Policy::none()
    };
    let mut builder = Client::builder()
        .redirect(redirect_policy)
        .referer(config.referer)
        .https_only(config.https_only);

    // 0 代表停用該逾時限制；reqwest 的零秒 Duration 會立即逾時，因此需省略設定。
    if config.timeout > 0 {
        builder = builder.timeout(Duration::from_secs(config.timeout));
    }
    if config.connect_timeout > 0 {
        builder = builder.connect_timeout(Duration::from_secs(config.connect_timeout));
    }
    if config.read_timeout > 0 {
        builder = builder.read_timeout(Duration::from_secs(config.read_timeout));
    }

    Ok(builder)
}
