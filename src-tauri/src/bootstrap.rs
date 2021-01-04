use crate::envrionment::{get_user, get_version};
use crate::filesystem::{get_data_dir, write_data_file};
use crate::inboxes::Inbox;
use chrono::prelude::*;
use std::fs::DirBuilder;

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
    let default_inbox_id = create_initial_inbox();
    let state_data = format!(
        r#"{{
           "user": "{}",
           "id": "state",
           "version": "{}"
           "inboxes": ["{}"]
    }}"#,
        default_inbox_id,
        get_user(),
        get_version()
    );
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

fn create_initial_inbox() -> String {
   let inbox = Inbox::create("default");
   inbox.id
}
