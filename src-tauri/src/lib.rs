use portrait_shuffler::shuffled_indices;
use serde::{Deserialize, Serialize};
use std::sync::{Mutex, MutexGuard};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunState {
    pub run_id: u64,
    pub queue: Vec<String>,
    pub completed: Vec<String>,
    pub failed: bool,
    pub started_at_ms: Option<u128>,
    pub updated_at_ms: Option<u128>,
}

impl Default for RunState {
    fn default() -> Self {
        Self {
            run_id: 0,
            queue: Vec::new(),
            completed: Vec::new(),
            failed: false,
            started_at_ms: None,
            updated_at_ms: None,
        }
    }
}

#[derive(Default)]
struct SharedRunState {
    inner: Mutex<RunState>,
}

impl SharedRunState {
    fn lock(&self) -> MutexGuard<'_, RunState> {
        self.inner.lock().expect("run state mutex poisoned")
    }
}

fn now_millis() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or_default()
}

fn random_seed() -> u32 {
    (now_millis() & (u32::MAX as u128)) as u32
}

#[tauri::command]
fn shuffle_characters(len: u32, seed: Option<u32>) -> Vec<u32> {
    let actual_seed = seed.unwrap_or_else(random_seed);
    shuffled_indices(len, actual_seed)
}

#[tauri::command]
fn start_run(characters: Vec<String>, seed: Option<u32>, state: State<SharedRunState>) -> RunState {
    if characters.is_empty() {
        return state.lock().clone();
    }

    let actual_seed = seed.unwrap_or_else(random_seed);
    let order = shuffled_indices(characters.len() as u32, actual_seed);
    let mut queue: Vec<String> = Vec::with_capacity(characters.len());

    for idx in order {
        if let Some(name) = characters.get(idx as usize) {
            queue.push(name.clone());
        }
    }

    let timestamp = now_millis();
    let mut guard = state.lock();
    let next_id = guard.run_id.wrapping_add(1).max(1);

    *guard = RunState {
        run_id: next_id,
        queue,
        completed: Vec::new(),
        failed: false,
        started_at_ms: Some(timestamp),
        updated_at_ms: Some(timestamp),
    };

    guard.clone()
}

#[tauri::command]
fn complete_character(character: Option<String>, state: State<SharedRunState>) -> RunState {
    let mut guard = state.lock();

    if guard.queue.is_empty() {
        return guard.clone();
    }

    let index = match character {
        Some(target) => guard.queue.iter().position(|c| c == &target),
        None => Some(0),
    };

    if let Some(idx) = index {
        if idx < guard.queue.len() {
            let finished = guard.queue.remove(idx);
            guard.completed.push(finished);
            guard.failed = false;
            guard.updated_at_ms = Some(now_millis());
        }
    }

    guard.clone()
}

#[tauri::command]
fn fail_run(state: State<SharedRunState>) -> RunState {
    let mut guard = state.lock();

    if guard.started_at_ms.is_some() {
        guard.failed = true;
        guard.updated_at_ms = Some(now_millis());
    }

    guard.clone()
}

#[tauri::command]
fn reset_run(state: State<SharedRunState>) -> RunState {
    let mut guard = state.lock();
    *guard = RunState::default();
    guard.clone()
}

#[tauri::command]
fn get_run_state(state: State<SharedRunState>) -> RunState {
    state.lock().clone()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SharedRunState::default())
        .invoke_handler(tauri::generate_handler![
            shuffle_characters,
            start_run,
            complete_character,
            fail_run,
            reset_run,
            get_run_state
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
