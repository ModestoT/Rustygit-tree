// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use git2::{BranchType, Repository};
use serde::Serialize;

#[derive(Serialize, Debug)]
struct RepoBranch {
    name: String,
    branch_type: RepoBranchType,
    is_checked_out: bool,
}

#[derive(Serialize, Debug)]
enum RepoBranchType {
    Local,
    Remote,
}

impl RepoBranchType {
    fn from(branch_type: BranchType) -> RepoBranchType {
        match branch_type {
            BranchType::Local => RepoBranchType::Local,
            BranchType::Remote => RepoBranchType::Remote,
        }
    }
}
// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn open_repo(path: &str) -> Result<Vec<RepoBranch>, ()> {
    let repo = match Repository::open(path) {
        Ok(repo) => repo,
        Err(e) => panic!("Failed to open repo: {}", e),
    };

    let branches = repo.branches(Some(BranchType::Local)).unwrap();
    let mut repo_branches = Vec::new();

    for ele in branches {
        let branch = ele.unwrap();
        let branch_name = branch.0.name().unwrap().unwrap();
        let repo_branch = RepoBranch {
            name: branch_name.to_string(),
            branch_type: RepoBranchType::from(branch.1),
            is_checked_out: branch.0.is_head(),
        };
        repo_branches.push(repo_branch);
    }

    return Ok(repo_branches);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![open_repo])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
