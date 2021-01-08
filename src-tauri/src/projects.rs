use crate::{data_structures::Id, inboxes::Inbox};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub inboxes: Vec<Inbox>,
}

impl Id for Project {
    fn id(&self) -> String {
        self.id.clone()
    }
}

impl Project {
    pub fn create(name: &str) -> Project {
        let uuid = Uuid::new_v4();
        let project = Project {
            id: uuid.to_string(),
            name: String::from(name),
            inboxes: Vec::new(),
        };

        project
    }
}
