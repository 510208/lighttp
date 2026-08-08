use crate::models::{RequestPayload, ResponsePayload};
use crate::services::http::execute_request;

#[tauri::command]
pub async fn handle_request(payload: RequestPayload) -> ResponsePayload {
    execute_request(payload).await
}
