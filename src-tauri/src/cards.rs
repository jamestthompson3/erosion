use crate::data_structures::{Card, CardBase, CardStatus};
use crate::envrionment::get_user;
use crate::filesystem::{delete_data_file, write_data_file};
use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct CardFragment {
    pub scheduled: Option<String>,
    pub status: CardStatus,
    pub tag: Option<Vec<String>>,
    pub text: Option<String>,
    pub title: String,
    pub time_allotted: u16,
}

pub fn create_card(data: CardFragment) -> Card {
    let uuid = Uuid::new_v4();
    let user = get_user();
    let now = Local::now().to_rfc3339();
    let card = json!({
        "id": uuid,
        "modified": now,
        "created": now,
        "modifier": user,
        "status": data.status,
        "tag": data.tag,
        "text": data.text,
        "title": data.title,
        "scheduled": data.scheduled,
        "time_allotted": data.time_allotted
    });
    write_data_file(&uuid.to_string(), &card.to_string()).unwrap();
    let c: Card = serde_json::from_value(card).unwrap();
    c
}

pub fn update_card(data: CardBase) -> String {
    match data {
        CardBase::Settings(settings) => {
            write_data_file("settings", &serde_json::to_string(&settings).unwrap()).unwrap();
            return settings.id;
        }
        CardBase::Card(card) => {
            write_data_file(&card.id, &serde_json::to_string(&card).unwrap()).unwrap();
            return card.id;
        }
    }
}

pub fn delete_card(id: &str) {
    delete_data_file(id).unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bootstrap::bootstrap;
    use crate::envrionment::get_user;
    use crate::filesystem::{get_data_dir, prep_data_file, read_data_file, write_data_file};
    #[test]
    fn creates_card() {
        bootstrap();
        let test_data = CardFragment {
            scheduled: Some("2020-12-31T14:08:18.162530941+02:00".to_string()),
            status: CardStatus::Todo,
            tag: None,
            text: None,
            title: String::from("start unit tests"),
            time_allotted: 0,
        };
        let card = create_card(test_data);
        assert_eq!(card.modifier, get_user());
        let mut data_dir = get_data_dir();
        assert_eq!(data_dir.exists(), true);
        data_dir.push(prep_data_file(&card.id));
        assert_eq!(data_dir.exists(), true);
    }
    #[test]
    fn updates_card() {
        let initial_card = Card {
            id: "123".to_string(),
            scheduled: Some("2020-12-31T18:08:18.162530941+02:00".to_string()),
            modified: "2020-12-31T15:08:18.162530941+02:00".to_string(),
            created: "2020-12-31T14:08:18.162530941+02:00".to_string(),
            modifier: "taylor".to_string(),
            status: CardStatus::Todo,
            tag: None,
            text: None,
            title: String::from("start unit tests"),
            time_allotted: 0,
        };
        write_data_file("123", &serde_json::to_string(&initial_card).unwrap()).unwrap();

        let test_data = Card {
            id: "123".to_string(),
            scheduled: Some("2020-12-31T14:08:18.162530941+02:00".to_string()),
            modified: "2020-12-31T14:08:18.162530941+02:00".to_string(),
            created: "2020-12-31T14:08:18.162530941+02:00".to_string(),
            modifier: "taylor".to_string(),
            status: CardStatus::InProgress,
            tag: None,
            text: None,
            title: String::from("start unit tests"),
            time_allotted: 0,
        };
        let updated_id = update_card(CardBase::Card(test_data));
        assert_eq!(updated_id, "123".to_string());
        let updated_data = read_data_file("123").unwrap();
        let card: Card = serde_json::from_str(&updated_data).unwrap();
        assert_eq!(card.status, CardStatus::InProgress);
        assert_eq!(card.modifier, "taylor".to_string());
        assert_eq!(
            card.modified,
            "2020-12-31T14:08:18.162530941+02:00".to_string()
        );
    }
}
