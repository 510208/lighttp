use crate::models::{RequestPayload, ResponsePayload};
use crate::services::cookies::{CookieManager, RequestCookieJar};
use crate::services::http::execute_request;
use futures_util::future::{AbortHandle, Abortable};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::State;

#[derive(Default)]
pub struct RequestExecutions(Mutex<HashMap<String, AbortHandle>>);

#[tauri::command]
pub async fn handle_request(
    payload: RequestPayload,
    request_id: String,
    executions: State<'_, RequestExecutions>,
    cookies: State<'_, Arc<CookieManager>>,
) -> Result<ResponsePayload, String> {
    let (handle, registration) = AbortHandle::new_pair();
    executions
        .0
        .lock()
        .map_err(|error| error.to_string())?
        .insert(request_id.clone(), handle);

    // Dropping execute_request also drops its client, stream, and connection.
    let jar = Arc::new(RequestCookieJar::new(
        Arc::clone(cookies.inner()),
        &payload.cookie_ids,
    ));
    let result = Abortable::new(
        execute_request(payload, Some(Arc::clone(&jar))),
        registration,
    )
    .await;
    executions
        .0
        .lock()
        .map_err(|error| error.to_string())?
        .remove(&request_id);
    let response = result.map_err(|_| "Request cancelled".to_string())?;
    if let Some(error) = jar.take_error() {
        return Err(error);
    }
    Ok(response)
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
