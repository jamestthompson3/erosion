use crate::envrionment::{get_user, get_version};
use crate::filesystem::{get_data_dir, write_data_file};
use chrono::prelude::*;
use std::fs::DirBuilder;

pub fn bootstrap() {
    let data_dir = get_data_dir();
    if !data_dir.exists() {
        create_initial_files();
    } else {
        // TODO add the "migrate" check here, to apply lenses
        println!("exists");
    }
}

pub fn create_initial_files() {
    DirBuilder::new()
        .recursive(true)
        .create(get_data_dir())
        .unwrap();
    let state_data = format!(
        r#"{{
           "user": "{}"J,
           "id": "state",
           "version": "{}"
    }}"#,
        get_user(),
        get_version()
    );
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
    write_data_file("state", &state_data.to_string());
    write_data_file("settings", &initial_config.to_string());
}
