use super::execute_request;
use crate::models::{HttpClientConfig, RequestPayload, ResponsePayload};
use serde_json::json;
use std::io::{Read, Write};
use std::net::TcpListener;
use std::thread;
use std::time::{Duration, Instant};

const REDIRECT: &str =
    "HTTP/1.1 302 Found\r\nLocation: /next\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
const OK: &str = "HTTP/1.1 200 OK\r\nContent-Length: 2\r\nConnection: close\r\n\r\n";

struct MockResponse {
    headers: &'static str,
    body: &'static str,
    delay_headers: bool,
}

impl MockResponse {
    fn redirect() -> Self {
        Self {
            headers: REDIRECT,
            body: "",
            delay_headers: false,
        }
    }

    fn ok() -> Self {
        Self {
            headers: OK,
            body: "ok",
            delay_headers: false,
        }
    }
}

fn mock_server(
    responses: Vec<MockResponse>,
    delay: Duration,
) -> (String, thread::JoinHandle<Vec<String>>) {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let url = format!("http://{}", listener.local_addr().unwrap());
    listener.set_nonblocking(true).unwrap();
    let handle = thread::spawn(move || {
        let mut requests = Vec::new();
        for response in responses {
            // 設定測試伺服器期限，避免重新導向行為出錯時測試永久等待。
            let deadline = Instant::now() + Duration::from_secs(5);
            let mut stream = loop {
                match listener.accept() {
                    Ok((stream, _)) => break stream,
                    Err(error) if error.kind() == std::io::ErrorKind::WouldBlock => {
                        assert!(Instant::now() < deadline, "Timed out waiting for a request");
                        thread::sleep(Duration::from_millis(5));
                    }
                    Err(error) => panic!("Failed to accept request: {}", error),
                }
            };
            stream
                .set_read_timeout(Some(Duration::from_secs(2)))
                .unwrap();
            let mut request = Vec::new();
            let mut buffer = [0; 1024];
            while !request.ends_with(b"\r\n\r\n") {
                let length = stream.read(&mut buffer).unwrap();
                assert!(length > 0);
                request.extend_from_slice(&buffer[..length]);
            }
            requests.push(String::from_utf8(request).unwrap());
            if response.delay_headers {
                thread::sleep(delay);
            }
            let _ = stream.write_all(response.headers.as_bytes());
            if !response.delay_headers {
                thread::sleep(delay);
            }
            // 逾時測試中客戶端可能已關閉連線，寫入失敗是預期情況。
            let _ = stream.write_all(response.body.as_bytes());
        }
        requests
    });
    (url, handle)
}

async fn send(url: &str, config: HttpClientConfig) -> ResponsePayload {
    let mut payload: RequestPayload = serde_json::from_value(json!({
        "url": url,
        "method": "GET",
        "params": [],
        "headers": [],
        "auth": { "auth_type": "none", "content": null }
    }))
    .unwrap();
    payload.http_client_config = config;
    execute_request(payload, None).await
}

#[tokio::test]
async fn disabled_redirects_return_original_response() {
    let (url, server) = mock_server(vec![MockResponse::redirect()], Duration::ZERO);
    let response = send(
        &url,
        HttpClientConfig {
            follow_redirects: false,
            ..Default::default()
        },
    )
    .await;
    assert_eq!(response.status, 302);
    assert_eq!(
        response.headers.get("location").unwrap(),
        &vec!["/next".to_string()]
    );
    assert_eq!(server.join().unwrap().len(), 1);
}

#[tokio::test]
async fn redirects_follow_configured_limit_and_referer() {
    for referer in [true, false] {
        let (url, server) = mock_server(
            vec![MockResponse::redirect(), MockResponse::ok()],
            Duration::ZERO,
        );
        let response = send(
            &url,
            HttpClientConfig {
                max_redirects: 1,
                referer,
                ..Default::default()
            },
        )
        .await;
        assert_eq!(response.status, 200);
        assert_eq!(response.body, "ok");
        let requests = server.join().unwrap();
        assert_eq!(requests.len(), 2);
        assert!(requests[1].starts_with("GET /next HTTP/1.1"));
        assert_eq!(requests[1].to_lowercase().contains("\r\nreferer:"), referer);
    }
}

#[tokio::test]
async fn exceeding_redirect_limit_returns_error() {
    let (url, server) = mock_server(
        vec![MockResponse::redirect(), MockResponse::redirect()],
        Duration::ZERO,
    );
    let response = send(
        &url,
        HttpClientConfig {
            max_redirects: 1,
            ..Default::default()
        },
    )
    .await;
    assert_eq!(response.status, 500);
    assert!(response.body.to_lowercase().contains("redirect"));
    assert_eq!(server.join().unwrap().len(), 2);
}

#[tokio::test]
async fn zero_disables_all_timeout_limits() {
    let (url, server) = mock_server(vec![MockResponse::ok()], Duration::from_millis(50));
    let response = send(
        &url,
        HttpClientConfig {
            timeout: 0,
            connect_timeout: 0,
            read_timeout: 0,
            ..Default::default()
        },
    )
    .await;
    assert_eq!(response.status, 200);
    assert_eq!(response.body, "ok");
    server.join().unwrap();
}

#[tokio::test]
async fn total_timeout_applies_to_response_headers_and_body() {
    for delay_headers in [true, false] {
        let mut mock = MockResponse::ok();
        mock.delay_headers = delay_headers;
        let (url, server) = mock_server(vec![mock], Duration::from_millis(1200));
        let response = send(
            &url,
            HttpClientConfig {
                timeout: 1,
                ..Default::default()
            },
        )
        .await;
        assert_eq!(response.status, 504);
        server.join().unwrap();
    }
}

#[tokio::test]
async fn read_timeout_applies_when_total_timeout_is_disabled() {
    let (url, server) = mock_server(vec![MockResponse::ok()], Duration::from_millis(1200));
    let response = send(
        &url,
        HttpClientConfig {
            timeout: 0,
            read_timeout: 1,
            ..Default::default()
        },
    )
    .await;
    assert_eq!(response.status, 504);
    server.join().unwrap();
}

#[tokio::test]
async fn https_only_rejects_http_requests() {
    let response = send(
        "http://127.0.0.1:1",
        HttpClientConfig {
            https_only: true,
            ..Default::default()
        },
    )
    .await;
    assert_eq!(response.status, 500);
    assert!(response.body.to_lowercase().contains("scheme"));
}

#[tokio::test]
async fn invalid_settings_return_bad_request_before_connecting() {
    let response = send(
        "http://127.0.0.1:1",
        HttpClientConfig {
            timeout: 86401,
            ..Default::default()
        },
    )
    .await;
    assert_eq!(response.status, 400);
    assert!(response.body.contains("timeout"));
}
