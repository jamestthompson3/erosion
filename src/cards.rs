use crate::data_structures::Card;
use crate::envrionment::get_user;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

pub fn create_card(data: Card) {
    let uuid = Uuid::new_v4();
    let user = get_user();
}
