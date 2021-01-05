use std::fmt;
use serde::{Deserialize, Serialize};

use crate::{data_structures::State, filesystem::{get_data_dir, read_data_file}};

pub fn register_listeners(mut handle: tauri::WebviewMut) {
    let controller = MessageController::init(handle);
    controller.register(&card_updater);
    tauri::event::listen(Events::CreateCard.to_string(), move |data| {});
}

fn card_updater(s: State) {
    tauri::event::listen(Events::UpdateCard.to_string(), move |data| {
        match data {
            Some(data) => {
                println!("{}",data);
                println!("{:?}", s.projects);
            },
            None => {}
        }
    })
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

pub struct MessageController {
    state: State,
    handle: tauri::WebviewMut,
}

impl MessageController {
    pub fn register(&self, listener: &dyn Fn(State) -> ()) {
        listener(self.state.clone());
    }
    pub fn init(mut handle: tauri::WebviewMut) -> MessageController {
        let mut data_dir = get_data_dir();
        data_dir.push("state.json");
        tauri::event::emit(&mut handle, Events::WorkspaceInit.to_string(), Some(data_dir.to_str())).unwrap();
        let state_str = read_data_file("state").unwrap();
        MessageController {
        state: serde_json::from_str(&state_str).unwrap(),
        handle
        }
    }
}
