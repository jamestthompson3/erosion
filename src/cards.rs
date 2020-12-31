use crate::data_structures::{Card, CardStatus};
use crate::envrionment::get_user;
use crate::filesystem::write_data_file;
use chrono::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::json;
use uuid::Uuid;

#[derive(Serialize, Deserialize, Debug)]
pub struct CardFragment {
    scheduled: Option<String>,
    status: CardStatus,
    tag: Option<Vec<String>>,
    text: Option<String>,
    title: String,
    time_allotted: u16,
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
    write_data_file(&uuid.to_string(), &card.to_string());
    let c: Card = serde_json::from_value(card).unwrap();
    c
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::bootstrap::bootstrap;
    use crate::envrionment::get_user;
    use crate::filesystem::{get_data_dir, prep_data_file};
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
}
