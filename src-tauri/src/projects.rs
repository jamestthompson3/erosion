use crate::inboxes::Inbox;
use serde::{Deserialize, Serialize};
use crate::filesystem::write_data_file;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct Project {
    pub id: String,
    pub name: String,
    pub inboxes: Vec<Inbox>,
}

impl Project {
    pub fn create(name: &str) -> Project {
        let uuid = Uuid::new_v4();
        let project = Project {
            id: uuid.to_string(),
            name: String::from(name),
            inboxes: Vec::new()
        };

        write_data_file(&project.id, &serde_json::to_string(&project).unwrap()).unwrap();
        project
    }
    pub fn create_inbox(&mut self, name: &str) -> Inbox {
        let inbox = Inbox::create(name);
        self.inboxes.push(inbox.clone());
        self.save();
        inbox
    }
    pub fn add_inbox(&mut self, inbox: Inbox) {
        self.inboxes.push(inbox.clone());
        self.save();
    }
    pub fn save(&self) {
        write_data_file(&self.id, &serde_json::to_string(&self).unwrap()).unwrap();
    }
    pub fn remove_inbox(&mut self, inbox_id: &str) {
        self.inboxes = self
            .inboxes
            .iter()
            .filter(|&inbox| *inbox.id == String::from(inbox_id))
            .cloned()
            .collect();
        self.save();
    }
}
