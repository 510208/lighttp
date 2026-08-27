use crate::AppCliState;
use tauri::State;

#[tauri::command]
pub fn get_cli_state(state: State<'_, AppCliState>) -> Result<crate::CliData, String> {
    state
        .0
        .lock()
        .map_err(|e| format!("Locking error: {}", e))
        .map(|data| data.clone())
}
