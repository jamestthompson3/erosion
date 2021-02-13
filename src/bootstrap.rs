use crate::{
  cards::CardFragment,
  data_structures::{Card, CardStatus, State},
  envrionment::{get_user, get_version},
  filesystem::{get_data_dir, write_data_file},
  inboxes::Inbox,
  projects::Project,
};
use serde_json::json;
use std::fs::DirBuilder;

pub fn bootstrap() {
  let mut data_dir = get_data_dir();
  data_dir.push("state.json");
  if !data_dir.exists() {
    create_initial_files().unwrap();
  } else {
    // TODO add the "migrate" check here, to apply lenses
    println!("{:?}", data_dir);
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

pub fn bootstrap_tests() -> Result<State, std::io::Error> {
  create_initial_files()?;
  let default_project = create_initial_project();
  let state_data = json!({
         "user": get_user(),
         "id": "state",
         "version": get_version(),
         "projects": [default_project]
  });

  let state: State = serde_json::from_value(state_data).unwrap();
  Ok(state)
}

fn create_initial_state() -> Result<(), std::io::Error> {
  let default_project = create_initial_project();
  let state_data = json!({
         "user": get_user(),
         "id": "state",
         "version": get_version(),
         "projects": [default_project]
  });
  write_data_file("state", &state_data.to_string())
}

fn create_initial_settings() -> Result<(), std::io::Error> {
  let initial_config = format!(
    r#"{{
      "id": "settings",
      "user": "{}",
      "show_complete": false,
      "run_as_daemon": false,
      "backend": "Web"
    }}"#,
    get_user()
  );
  write_data_file("settings", &initial_config.to_string())
}

fn create_initial_project() -> Project {
  let mut project = Project::create("Tasks");
  let mut inbox = Inbox::create("Default Inbox");
  let initial_card = Card::create(CardFragment {
    scheduled: None,
    status: CardStatus::Todo,
    tags: Some(vec![String::from("explore")]),
    text: Some(String::from("welcome to erosion")),
    title: String::from("get started"),
    time_allotted: 5,
  });
  inbox.cards.push(initial_card);
  project.inboxes.push(inbox);
  project
}
