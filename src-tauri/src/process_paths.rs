use dashmap::DashSet;
use rayon::prelude::*;

use std::fs;
use std::path::PathBuf;
use std::sync::Arc;

fn normalize_path_string(path: &PathBuf) -> String {
    let result = path.to_string_lossy().to_string();
    if cfg!(windows) {
        if let Some(rest) = result.strip_prefix("\\\\?\\") {
            return rest.to_string();
        }
    }
    result
}

/// Recursively walk a directory with cycle detection and collect mp3/mp4 files.
fn dfs_collect_parallel(path: PathBuf, visited: Arc<DashSet<PathBuf>>) -> Vec<String> {
    let mut results = Vec::new();

    if let Ok(canonical_path) = fs::canonicalize(&path) {
        if !visited.insert(canonical_path.clone()) {
            return results; // already visited
        }

        if canonical_path.is_dir() {
            if let Ok(entries) = fs::read_dir(&canonical_path) {
                let children: Vec<String> = entries
                    .flatten()
                    .par_bridge()
                    .flat_map(|entry| dfs_collect_parallel(entry.path(), Arc::clone(&visited)))
                    .collect();
                results.extend(children);
            }
        } else if canonical_path.is_file() {
            if let Some(ext) = canonical_path.extension().and_then(|s| s.to_str()) {
                let ext = ext.to_ascii_lowercase();
                if ext == "mp3" || ext == "mp4" {
                    results.push(normalize_path_string(&canonical_path));
                }
            }
        }
    }

    results
}

#[tauri::command]
pub fn process_paths(paths: Vec<String>) -> Result<Vec<String>, String> {
    let visited = Arc::new(DashSet::new());

    let pathbufs: Vec<PathBuf> = paths.into_iter().map(PathBuf::from).collect();

    println!("Rust: {:?}", pathbufs);

    let results: Vec<String> = pathbufs
        .par_iter()
        .flat_map(|pathbuf| dfs_collect_parallel(pathbuf.clone(), Arc::clone(&visited)))
        .collect();

    if results.is_empty() {
        return Err("No valid files".to_string());
    }

    Ok(results)
}
