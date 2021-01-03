use crate::cards::{create_card, delete_card, update_card, CardFragment};
use crate::data_structures::{Card, CardBase};
use crate::filesystem::read_data_file;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct Inbox {
    id: String,
    name: String,
    card_ids: Vec<String>,
}

impl Inbox {
    pub fn expand_all_cards(&self) -> String {
        let mut expanded = Vec::new();
        for card in &self.card_ids {
            expanded.push(read_data_file(&card).unwrap());
        }
        let expanded_card_inbox = Inbox {
            id: String::from(&self.id),
            name: String::from(&self.name),
            card_ids: expanded,
        };
        serde_json::to_string(&expanded_card_inbox).unwrap()
    }
    pub fn create_card(&mut self, data: CardFragment) -> Card {
        let card = create_card(data);
        self.card_ids.push(String::from(&card.id));
        card
    }
    // TODO think about checking if the card is owned by the inbox here.
    pub fn delete_card(&mut self, id: &str) {
        delete_card(id);
        self.card_ids = self
            .card_ids
            .iter()
            .filter(|&card_id| *card_id == String::from(id))
            .cloned()
            .collect();
    }
    pub fn add_to_card_ids(&mut self, id: &str) {
        self.card_ids.push(String::from(id));
    }
    // TODO think about checking if the card is owned by the inbox here.
    pub fn update_card(data: CardBase) -> String {
        let id = update_card(data);
        id
    }
    pub fn move_card(&mut self, card_id: &str, target_inbox_id: &str) {
        let mut target_inbox: Inbox =
            serde_json::from_str(&read_data_file(target_inbox_id).unwrap()).unwrap();
        target_inbox.add_to_card_ids(card_id);
        self.card_ids = self
            .card_ids
            .iter()
            .filter(|&id| *id == String::from(card_id))
            .cloned()
            .collect();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn adds_card_to_inbox() {
        let mut test_inbox = Inbox {
            id: String::from("123"),
            name: String::from("personal"),
            card_ids: Vec::new(),
        };
        test_inbox.add_to_card_ids("123");
        assert_eq!(test_inbox.card_ids, vec!(String::from("123")));
    }
}
