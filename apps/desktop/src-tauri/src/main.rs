#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;

use chrono::Utc;
use serde::Serialize;
use uuid::Uuid;

#[derive(Serialize, Debug, Clone)]
struct FsEntry {
    path: String,
    rel_path: String,
    name: String,
    is_dir: bool,
    created: Option<String>,
    modified: Option<String>,
}

#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct SpaceConfig {
    space_id: String,
    vault_path: String,
    label: Option<String>,
    owner: OwnerInfo,
    created_at: String,
    updated_at: String,
    version: u32,
}

#[derive(Serialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct OwnerInfo {
    first_name: String,
    last_name: String,
}

fn walk_dir(base: &Path, current: &Path, acc: &mut Vec<FsEntry>) -> Result<(), String> {
    for entry in fs::read_dir(current).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let meta = entry.metadata().map_err(|e| e.to_string())?;
        let path = entry.path();
        let is_dir = meta.is_dir();

        let rel_path = path
            .strip_prefix(base)
            .unwrap_or(&path)
            .to_string_lossy()
            .to_string();

        let name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        // Ignore internal folders
        if is_dir && name == ".notexia" || name == ".obsidian" {
            continue;
        }

        let modified = meta
            .modified()
            .ok()
            .and_then(|time: SystemTime| time.duration_since(SystemTime::UNIX_EPOCH).ok())
            .map(|dur| dur.as_secs().to_string());

        let created = meta
            .created()
            .or_else(|_| meta.modified())
            .ok()
            .and_then(|time: SystemTime| time.duration_since(SystemTime::UNIX_EPOCH).ok())
            .map(|dur| dur.as_secs().to_string());

        acc.push(FsEntry {
            path: path.to_string_lossy().to_string(),
            rel_path,
            name,
            is_dir,
            created,
            modified,
        });

        if is_dir {
            walk_dir(base, &path, acc)?;
        }
    }

    Ok(())
}

fn is_descendant(parent: &Path, child: &Path) -> bool {
    child.starts_with(parent)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            list_notes_in_vault,
            read_note,
            write_note,
            create_note,
            delete_note,
            rename_note,
            create_directory,
            delete_entry,
            move_entry,
            init_space_config
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn list_notes_in_vault(vaultPath: String) -> Result<Vec<FsEntry>, String> {
    let base = PathBuf::from(&vaultPath);

    if !base.is_dir() {
        return Err("Vault path is not a directory".into());
    }

    let mut entries = Vec::new();
    walk_dir(&base, &base, &mut entries)?;
    Ok(entries)
}

#[tauri::command]
fn read_note(path: String) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_note(path: String, content: String) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_note(vault_path: String) -> Result<String, String> {
    let base = PathBuf::from(&vault_path);
    if !base.is_dir() {
        return Err("Vault path is not a directory".into());
    }

    for idx in 1..10_000 {
        let filename = format!("Untitled {}.md", idx);
        let candidate = base.join(&filename);
        if !candidate.exists() {
            fs::write(&candidate, "").map_err(|e| e.to_string())?;
            return Ok(candidate.to_string_lossy().to_string());
        }
    }

    Err("Could not create note: too many existing untitled files".into())
}

#[tauri::command]
fn delete_note(path: String) -> Result<(), String> {
    let path_buf = PathBuf::from(&path);
    if !path_buf.exists() {
        return Err("Note not found".into());
    }

    fs::remove_file(path_buf).map_err(|e| e.to_string())
}

#[tauri::command]
fn rename_note(old_path: String, new_name: String) -> Result<String, String> {
    let old = PathBuf::from(&old_path);
    let parent = old
        .parent()
        .ok_or_else(|| "Cannot determine parent directory".to_string())?;

    let target = parent.join(&new_name);
    if target.exists() {
        return Err("A file with the target name already exists".into());
    }

    fs::rename(&old, &target).map_err(|e| e.to_string())?;

    Ok(target.to_string_lossy().to_string())
}

#[tauri::command]
fn create_directory(parentPath: String, name: String) -> Result<String, String> {
    let mut new_path = PathBuf::from(&parentPath);
    if !new_path.is_dir() {
        return Err("Parent path is not a directory".into());
    }

    if name.trim().is_empty() {
        return Err("Directory name cannot be empty".into());
    }

    new_path.push(name);

    let file_name = new_path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .to_string();

    if file_name == ".notexia" {
        return Err("Cannot create directory inside .notexia".into());
    }

    fs::create_dir_all(&new_path).map_err(|e| e.to_string())?;

    Ok(new_path.to_string_lossy().to_string())
}

#[tauri::command]
fn move_entry(
    old_path: String,
    new_parent_path: String,
    new_name: Option<String>,
) -> Result<String, String> {
    let old = PathBuf::from(&old_path);
    if !old.exists() {
        return Err("Source path does not exist".into());
    }

    let new_parent = PathBuf::from(&new_parent_path);
    if !new_parent.is_dir() {
        return Err("Target parent is not a directory".into());
    }

    let base_name = new_name.unwrap_or_else(|| {
        old.file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string()
    });

    if base_name.trim().is_empty() {
        return Err("Target name cannot be empty".into());
    }

    if base_name == ".notexia" || new_parent.ends_with(".notexia") {
        return Err("Operations inside .notexia are not allowed".into());
    }

    let new_path = new_parent.join(&base_name);

    if new_path == old {
        return Ok(new_path.to_string_lossy().to_string());
    }

    if is_descendant(&old, &new_path) {
        return Err("Cannot move a folder into itself or its descendant".into());
    }

    if new_path.exists() {
        return Err("Target already exists".into());
    }

    fs::rename(&old, &new_path).map_err(|e| e.to_string())?;

    Ok(new_path.to_string_lossy().to_string())
}

#[tauri::command]
fn delete_entry(path: String) -> Result<(), String> {
    let p = PathBuf::from(path);

    if p.is_dir() {
        fs::remove_dir_all(&p).map_err(|e| e.to_string())
    } else {
        fs::remove_file(&p).map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn init_space_config(
    vaultPath: String,
    firstName: String,
    lastName: String,
    label: Option<String>,
) -> Result<SpaceConfig, String> {
    let base = PathBuf::from(&vaultPath);
    if !base.is_dir() {
        return Err("Vault path is not a directory".into());
    }

    let meta_dir = base.join(".notexia");
    if !meta_dir.exists() {
        fs::create_dir_all(&meta_dir).map_err(|e| e.to_string())?;
    }

    let config_path = meta_dir.join("vault.json");
    let now = Utc::now().to_rfc3339();
    let vault_id = Uuid::new_v4().to_string();

    let cfg = SpaceConfig {
        space_id: vault_id,
        vault_path: vaultPath.clone(),
        label,
        owner: OwnerInfo {
            first_name: firstName,
            last_name: lastName,
        },
        created_at: now.clone(),
        updated_at: now,
        version: 1,
    };

    let json = serde_json::to_string_pretty(&cfg).map_err(|e| e.to_string())?;
    fs::write(&config_path, json).map_err(|e| e.to_string())?;

    Ok(cfg)
}
