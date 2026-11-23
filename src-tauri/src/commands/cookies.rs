use crate::services::cookies::{CookieInput, CookieManager, CookieSummary};
use std::collections::HashSet;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub fn list_cookies(
    url: Option<String>,
    manager: State<'_, Arc<CookieManager>>,
) -> Result<Vec<CookieSummary>, String> {
    manager.list(url.as_deref())
}

#[tauri::command]
pub fn save_cookie(
    cookie: CookieInput,
    manager: State<'_, Arc<CookieManager>>,
) -> Result<(), String> {
    manager.upsert(cookie)
}

#[tauri::command]
pub fn set_cookie_persistence(
    id: String,
    persistent: bool,
    manager: State<'_, Arc<CookieManager>>,
) -> Result<(), String> {
    manager.set_persistent(&id, persistent)
}

#[tauri::command]
pub fn delete_cookie(id: String, manager: State<'_, Arc<CookieManager>>) -> Result<(), String> {
    manager.delete(&id)
}

#[tauri::command]
pub fn clear_cookies(manager: State<'_, Arc<CookieManager>>) -> Result<(), String> {
    manager.clear()
}

#[tauri::command]
pub fn get_cookie_header(
    ids: Vec<String>,
    url: String,
    manager: State<'_, Arc<CookieManager>>,
) -> Result<Option<String>, String> {
    let url = reqwest::Url::parse(&url).map_err(|error| error.to_string())?;
    let ids: HashSet<_> = ids.into_iter().collect();
    manager
        .header(&ids, &url)?
        .map(|header| {
            header
                .to_str()
                .map(str::to_string)
                .map_err(|error| error.to_string())
        })
        .transpose()
}
