use crate::{
    cards::CardFragment,
    data_structures::Card,
    filesystem::{get_data_dir, read_state_file},
    inboxes::Inbox,
    lenses::{
        create_card, create_inbox, create_project, delete_card, update_card, update_inbox,
        update_project,
    },
    projects::Project,
};
use serde::{Deserialize, Serialize};
use std::fmt;

pub fn register_init(mut handle: tauri::WebviewMut) {
    let mut data_dir = get_data_dir();
    data_dir.push("state.json");
    tauri::event::emit(
        &mut handle,
        Events::WorkspaceInit.to_string(),
        Some(data_dir.to_str()),
    )
    .unwrap();
}
pub fn register_card_update() {
    tauri::event::listen(Events::UpdateCard.to_string(), move |data| match data {
        Some(data) => {
            let event_data: CardUpdateEvent = serde_json::from_str(&data).unwrap();
            update_card(
                &read_state_file(),
                event_data.project,
                event_data.inbox,
                event_data.card,
            );
        }
        None => {}
    });
}
pub fn register_card_create(mut handle: tauri::WebviewMut) {
    tauri::event::listen(Events::CreateCard.to_string(), move |data| match data {
        Some(data) => {
            let event_data: CardCreateEvent = serde_json::from_str(&data).unwrap();
            let updated_state = create_card(
                &read_state_file(),
                event_data.project,
                event_data.inbox,
                event_data.card,
            );

            tauri::event::emit(
                &mut handle,
                Events::StateUpdated.to_string(),
                Some(serde_json::to_string(&updated_state).unwrap()),
            )
            .unwrap();
        }
        None => {}
    });
}
pub fn register_card_delete() {
    tauri::event::listen(Events::DeleteCard.to_string(), move |data| match data {
        Some(data) => {
            let event_data: CardDeleteEvent = serde_json::from_str(&data).unwrap();
            delete_card(
                &read_state_file(),
                event_data.project,
                event_data.inbox,
                event_data.card,
            );
        }
        None => {}
    });
}

pub fn register_inbox_create(mut handle: tauri::WebviewMut) {
    tauri::event::listen(Events::CreateInbox.to_string(), move |data| match data {
        Some(data) => {
            let event_data: InboxCreateEvent = serde_json::from_str(&data).unwrap();
            let updated_state =
                create_inbox(&read_state_file(), event_data.project, &event_data.name);
            tauri::event::emit(
                &mut handle,
                Events::StateUpdated.to_string(),
                Some(serde_json::to_string(&updated_state).unwrap()),
            )
            .unwrap();
        }
        None => {}
    });
}

pub fn register_inbox_update() {
    tauri::event::listen(Events::UpdateInbox.to_string(), move |data| match data {
        Some(data) => {
            let event_data: InboxUpdateEvent = serde_json::from_str(&data).unwrap();
            update_inbox(&read_state_file(), event_data.project, event_data.inbox);
        }
        None => {}
    });
}

pub fn register_project_update() {
    tauri::event::listen(Events::UpdateProject.to_string(), move |data| match data {
        Some(data) => {
            let event_data: ProjectUpdateEvent = serde_json::from_str(&data).unwrap();
            update_project(&read_state_file(), event_data.project);
        }
        None => {}
    });
}

pub fn register_project_create(mut handle: tauri::WebviewMut) {
    tauri::event::listen(Events::CreateProject.to_string(), move |data| match data {
        Some(data) => {
            let event_data: ProjectCreateEvent = serde_json::from_str(&data).unwrap();
            let updated_state = create_project(&read_state_file(), &event_data.name);
            tauri::event::emit(
                &mut handle,
                Events::StateUpdated.to_string(),
                Some(serde_json::to_string(&updated_state).unwrap()),
            )
            .unwrap();
        }
        None => {}
    });
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectCreateEvent {
    name: String,
}
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ProjectUpdateEvent {
    project: Project,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InboxUpdateEvent {
    project: String,
    inbox: Inbox,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct InboxCreateEvent {
    project: String,
    name: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CardUpdateEvent {
    card: Card,
    inbox: String,
    project: String,
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

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub enum Events {
    CreateCard,
    WorkspaceInit,
    DeleteCard,
    UpdateCard,
    MoveCard,
    StateUpdated,
    CreateInbox,
    DeleteInbox,
    UpdateInbox,
    UpdateProject,
    CreateProject,
}

impl fmt::Display for Events {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}
