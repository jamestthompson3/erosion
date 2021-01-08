use crate::data_structures::Card;
use crate::data_structures::Id;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Inbox {
    pub id: String,
    pub name: String,
    pub cards: Vec<Card>,
}

impl Id for Inbox {
    fn id(&self) -> String {
        self.id.clone()
    }
}

impl Inbox {
    pub fn create(name: &str) -> Inbox {
        let uuid = Uuid::new_v4();
        let inbox = Inbox {
            id: uuid.to_string(),
            name: String::from(name),
            cards: Vec::new(),
        };
        inbox
    }
    // pub fn move_card(&mut self, card: Card, target_inbox_id: &str) {
    //     let mut target_inbox: Inbox =
    //         serde_json::from_str(&read_data_file(target_inbox_id).unwrap()).unwrap();
    //     target_inbox.add_to_cards(card.clone());
    //     self.cards = self
    //         .cards
    //         .iter()
    //         .filter(|&c| *c.id == card.id)
    //         .cloned()
    //         .collect();
    // }
}
