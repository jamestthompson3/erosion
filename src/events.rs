use crate::{
  cards::CardFragment,
  data_structures::{Card, State},
  filesystem::{read_data_file, read_state_file},
  inboxes::Inbox,
  lenses::{
    create_card, create_inbox, create_project, delete_card, delete_inbox, delete_project,
    update_card, update_inbox, update_project,
  },
  projects::Project,
};
use serde::{Deserialize, Serialize};
use std::{
  fmt,
  sync::{Arc, Mutex},
};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectCreateEvent {
  pub name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectDeleteEvent {
  pub project_id: String,
}
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectUpdateEvent {
  pub project: Project,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InboxUpdateEvent {
  pub project: String,
  pub inbox: Inbox,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InboxDeleteEvent {
  pub project: String,
  pub inbox: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InboxCreateEvent {
  pub project: String,
  pub name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CardUpdateEvent {
  pub card: Card,
  pub inbox: String,
  pub project: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CardCreateEvent {
  card: CardFragment,
  inbox: String,
  project: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CardDeleteEvent {
  project: String,
  inbox: String,
  card: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Events {
  CreateCard(CardCreateEvent),
  WorkspaceInit,
  SettingsInit,
  UpdateSettings(SettingsUpdateEvent),
  DeleteCard(CardDeleteEvent),
  UpdateCard(CardUpdateEvent),
  MoveCard,
  StateUpdated,
  CreateInbox(InboxCreateEvent),
  DeleteInbox(InboxDeleteEvent),
  UpdateInbox(InboxUpdateEvent),
  UpdateProject(ProjectUpdateEvent),
  CreateProject(ProjectCreateEvent),
  DeleteProject(ProjectDeleteEvent),
}

impl fmt::Display for Events {
  fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
    write!(f, "{:?}", self)
  }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct SettingsUpdateEvent {
  user: String,
  show_complete: bool,
}

#[derive(Clone)]
pub struct EventManager {
  state: Arc<Mutex<State>>,
}

impl EventManager {
  pub fn new() -> EventManager {
    let state = read_state_file();
    EventManager {
      state: Arc::new(Mutex::new(state)),
    }
  }
  pub fn update_card(&mut self, e: CardUpdateEvent) {
    let mut current_state = self.state.lock().unwrap();
    *current_state = update_card(&current_state, e.project, e.inbox, e.card);
  }
  pub fn delete_card(&mut self, e: CardDeleteEvent) {
    let mut current_state = self.state.lock().unwrap();
    *current_state = delete_card(&current_state, e.project, e.inbox, e.card)
  }
  pub fn create_card(&mut self, e: CardCreateEvent) -> String {
    let mut current_state = self.state.lock().unwrap();
    *current_state = create_card(&current_state, e.project, e.inbox, e.card);
    serde_json::to_string(&*current_state).unwrap()
  }
  pub fn create_inbox(&mut self, e: InboxCreateEvent) -> String {
    let mut current_state = self.state.lock().unwrap();
    *current_state = create_inbox(&current_state, e.project, &e.name);
    serde_json::to_string(&*current_state).unwrap()
  }
  pub fn update_inbox(&mut self, e: InboxUpdateEvent) {
    let mut current_state = self.state.lock().unwrap();
    *current_state = update_inbox(&current_state, e.project, e.inbox);
  }
  pub fn delete_inbox(&mut self, e: InboxDeleteEvent) {
    let mut current_state = self.state.lock().unwrap();
    *current_state = delete_inbox(&current_state, e.project, e.inbox);
  }
  pub fn create_project(&mut self, e: ProjectCreateEvent) -> String {
    let mut current_state = self.state.lock().unwrap();
    *current_state = create_project(&current_state, &e.name);
    serde_json::to_string(&*current_state).unwrap()
  }
  pub fn update_project(&mut self, e: ProjectUpdateEvent) {
    let mut current_state = self.state.lock().unwrap();
    *current_state = update_project(&current_state, e.project);
  }
  pub fn delete_project(&mut self, e: ProjectDeleteEvent) {
    let mut current_state = self.state.lock().unwrap();
    *current_state = delete_project(&current_state, e.project_id);
  }
  pub fn init_workspace(&self) -> String {
    let current_state = self.state.lock().unwrap();
    serde_json::to_string(&*current_state).unwrap()
  }
  pub fn send_settings() -> String {
    read_data_file("settings").unwrap()
  }
  pub fn update_settings(e: SettingsUpdateEvent) {
    todo!();
  }
  pub fn print(&self) {
    println!(
      "{:?}",
      serde_json::to_string_pretty(&*self.state.lock().unwrap())
    )
  }
}