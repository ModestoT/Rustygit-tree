// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use git2::{BranchType, Repository, Sort};
use serde::Serialize;
use std::sync::Mutex;
use tauri::State;

struct GitRepo {
    path: String,
    repo: Option<Repository>,
}

#[derive(Serialize, Debug)]
struct RepoBranch {
    name: String,
    branch_type: RepoBranchType,
    is_checked_out: bool,
}
#[derive(Serialize, Debug)]
struct BranchCommit {
    id: String,
    message: String,
    author: String,
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

impl GitRepo {
    pub fn new(repo_path: &str) -> Self {
        let repo = match Repository::open(repo_path) {
            Ok(repo) => repo,
            Err(e) => panic!("Failed to open repo: {}", e),
        };

        return Self {
            repo: Some(repo),
            path: repo_path.to_string(),
        };
    }

    pub fn get_branches(&self) -> Vec<RepoBranch> {
        let repo = self.repo.as_ref().unwrap();
        let branches = repo.branches(Some(BranchType::Local)).unwrap();

        let mut repo_branches = Vec::new();

        for ele in branches {
            let branch = ele.unwrap();
            let branch_name = branch.0.name().as_ref().unwrap().unwrap();
            let repo_branch = RepoBranch {
                name: branch_name.to_string(),
                branch_type: RepoBranchType::from(branch.1),
                is_checked_out: branch.0.is_head(),
            };
            repo_branches.push(repo_branch);
        }

        return repo_branches;
    }
    pub fn get_commit_history(&self) -> Vec<BranchCommit> {
        let repo = self.repo.as_ref().unwrap();
        let mut rev_walk = repo.revwalk().unwrap();
        let mut commit_history = Vec::new();

        let _ = rev_walk.set_sorting(Sort::TIME);
        let _ = rev_walk.push_head();

        for commit_id in rev_walk {
            let id = commit_id.unwrap();
            let commit = repo.find_commit(id).unwrap();

            commit_history.push(BranchCommit {
                id: id.to_string(),
                message: commit.message().unwrap().to_string(),
                author: commit.author().to_string(),
            });
        }

        return commit_history;
    }
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn open_repo(path: &str, state: State<Mutex<GitRepo>>) -> Result<Vec<RepoBranch>, ()> {
    let mut git_repo = state.lock().unwrap();
    *git_repo = GitRepo::new(path);

    let repo = git_repo.repo.as_ref().unwrap();
    let branches = git_repo.get_branches();

    return Ok(branches);
}

#[tauri::command]
fn get_commit_history(state: State<Mutex<GitRepo>>) -> Result<Vec<BranchCommit>, ()> {
    let git_repo = state.lock().unwrap();

    let commit_history = git_repo.get_commit_history();

    return Ok(commit_history);
}

fn main() {
    tauri::Builder::default()
        .manage(Mutex::new(GitRepo {
            path: "".into(),
            repo: None,
        }))
        .invoke_handler(tauri::generate_handler![open_repo, get_commit_history])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
