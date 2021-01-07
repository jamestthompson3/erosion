use crate::{cards::{create_card, delete_card, update_card, CardFragment}, data_structures::Id};
use crate::data_structures::{Card, CardBase};
use crate::filesystem::{read_data_file};
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
        cards: Vec::new()
    };
        inbox
    }
    pub fn create_card(&mut self, data: CardFragment) -> Card {
        let card = create_card(data);
        self.cards.push(card.clone());
        card
    }
    // TODO think about checking if the card is owned by the inbox here.
    pub fn delete_card(&mut self, id: &str) {
        delete_card(id);
        self.cards = self
            .cards
            .iter()
            .filter(|&card| *card.id == String::from(id))
            .cloned()
            .collect();
    }
    pub fn add_to_cards(&mut self, card: Card) {
        self.cards.push(card);
    }
    // TODO think about checking if the card is owned by the inbox here.
    pub fn update_card(data: CardBase) -> String {
        let id = update_card(data);
        id
    }
    pub fn move_card(&mut self, card: Card, target_inbox_id: &str) {
        let mut target_inbox: Inbox =
            serde_json::from_str(&read_data_file(target_inbox_id).unwrap()).unwrap();
        target_inbox.add_to_cards(card.clone());
        self.cards = self
            .cards
            .iter()
            .filter(|&c| *c.id == card.id)
            .cloned()
            .collect();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    // FIXME
    // #[test]
    // fn adds_card_to_inbox() {
    //     let mut test_inbox = Inbox {
    //         id: String::from("123"),
    //         name: String::from("personal"),
    //         card_ids: Vec::new(),
    //     };
    //     test_inbox.add_to_card_ids("123");
    //     assert_eq!(test_inbox.cards, vec!(String::from("123")));
    // }
}
