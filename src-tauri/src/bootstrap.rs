use crate::{cards::CardFragment, data_structures::CardStatus, envrionment::{get_user, get_version}, filesystem::{get_data_dir, write_data_file}, inboxes::Inbox, projects::Project};
use chrono::prelude::*;
use std::fs::DirBuilder;
use serde_json::json;

pub fn bootstrap() {
    let data_dir = get_data_dir();
    if !data_dir.exists() {
        create_initial_files().unwrap();
    } else {
        // TODO add the "migrate" check here, to apply lenses
        println!("exists");
    }
}

pub fn create_initial_files() -> Result<(), std::io::Error> {
    DirBuilder::new()
        .recursive(true)
        .create(get_data_dir())
        .unwrap();
    create_initial_state()?;
    create_initial_settings()?;
    Ok(())
}

fn create_initial_state() -> Result<(), std::io::Error>  {
    let default_project = create_initial_project();
    let state_data = json!({
           "user": get_user(),
           "id": "state",
           "version": get_version(),
           "projects": [default_project]
    });
    write_data_file("state", &state_data.to_string())
}

fn create_initial_settings() -> Result<(), std::io::Error>  {
    let now = Local::now().to_rfc3339();
    let initial_config = format!(
        r#"{{
      "id": "settings",
      "created": "{}",
      "modified": "{}",
      "user": "{}",
      "modifier": "System",
      "title": "settings",
      "viewTemplate": "configuration"
    }}"#,
    now,
    now,
    get_user()
    );
    write_data_file("settings", &initial_config.to_string())
}

fn create_initial_project() -> Project {
    let mut project = Project::create("Tasks");
    let mut inbox = Inbox::create("Default");
    let initial_card = CardFragment {
        scheduled: None,
        status: CardStatus::Todo,
        tag: Some(vec!(String::from("learning"))),
        text: Some(String::from("welcome to erosion")),
        title: String::from("get started"),
        time_allotted: 5,
    };
    inbox.create_card(initial_card);
    project.add_inbox(inbox);
    project
}