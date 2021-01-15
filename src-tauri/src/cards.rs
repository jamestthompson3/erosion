use crate::data_structures::{Card, CardStatus};
use crate::envrionment::get_user;
use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CardFragment {
    pub scheduled: Option<String>,
    pub status: CardStatus,
    pub tags: Option<Vec<String>>,
    pub text: Option<String>,
    pub title: String,
    pub time_allotted: u16,
}

impl Card {
    pub fn create(data: CardFragment) -> Card {
        let uuid = Uuid::new_v4();
        let user = get_user();
        let now = Local::now().to_rfc3339();
        Card {
            id: uuid.to_string(),
            modified: now.clone(),
            created: now,
            modifier: user,
            status: data.status,
            tags: data.tags,
            text: data.text,
            title: data.title,
            scheduled: data.scheduled,
            completed: None,
            time_allotted: data.time_allotted,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::envrionment::get_user;
    #[test]
    fn creates_card() {
        let test_data = CardFragment {
            scheduled: Some("2020-12-31T14:08:18.162530941+02:00".to_string()),
            status: CardStatus::Todo,
            tags: None,
            text: None,
            title: String::from("start unit tests"),
            time_allotted: 0,
        };
        let card = Card::create(test_data);
        assert_eq!(card.modifier, get_user());
    }
}
