use crate::models::{RequestPayload, ResponsePayload};
use crate::services::http::execute_request;
use futures_util::future::{AbortHandle, Abortable};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::State;

#[derive(Default)]
pub struct RequestExecutions(Mutex<HashMap<String, AbortHandle>>);

#[tauri::command]
pub async fn handle_request(
    payload: RequestPayload,
    request_id: String,
    executions: State<'_, RequestExecutions>,
) -> Result<ResponsePayload, String> {
    let (handle, registration) = AbortHandle::new_pair();
    executions
        .0
        .lock()
        .map_err(|error| error.to_string())?
        .insert(request_id.clone(), handle);

    // Dropping execute_request also drops its client, stream, and connection.
    let result = Abortable::new(execute_request(payload), registration).await;
    executions
        .0
        .lock()
        .map_err(|error| error.to_string())?
        .remove(&request_id);
    result.map_err(|_| "Request cancelled".to_string())
}

#[tauri::command]
pub fn cancel_request(
    request_id: String,
    executions: State<'_, RequestExecutions>,
) -> Result<(), String> {
    if let Some(handle) = executions
        .0
        .lock()
        .map_err(|error| error.to_string())?
        .remove(&request_id)
    {
        handle.abort();
    }
    Ok(())
}
