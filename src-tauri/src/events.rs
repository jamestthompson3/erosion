use crate::{
    cards::CardFragment,
    data_structures::Card,
    filesystem::{get_data_dir, read_state_file},
    lenses::{create_card, update_card},
};
use serde::{Deserialize, Serialize};
use std::fmt;

pub fn register_listeners(mut handle: tauri::WebviewMut) {
    let mut data_dir = get_data_dir();
    data_dir.push("state.json");
    tauri::event::emit(
        &mut handle,
        Events::WorkspaceInit.to_string(),
        Some(data_dir.to_str()),
    )
    .unwrap();
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
    tauri::event::listen(Events::CreateCard.to_string(), |data| match data {
        Some(data) => {
            let event_data: CardCreateEvent = serde_json::from_str(&data).unwrap();
            println!("{}", serde_json::to_string_pretty(&event_data).unwrap());
            create_card(
                &read_state_file(),
                event_data.project,
                event_data.inbox,
                event_data.card,
            );
        }
        None => {}
    });
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
    card_id: String,
    inbox: String,
    project: String,
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub enum Events {
    CreateCard,
    WorkspaceInit,
    DeleteCard,
    UpdateCard,
    MoveCard,
    CreateInbox,
    DeleteInbox,
}

impl fmt::Display for Events {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}
