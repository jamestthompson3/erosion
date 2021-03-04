use serde::{Deserialize, Serialize};
use chrono::NaiveDate;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct RecurringTask {
    name: String,
    record: HashMap<NaiveDate, u16>,
    target: u16
}

impl RecurringTask {
    pub fn new(name: String, target: u16) -> Self {
        RecurringTask {
            name,
            target,
            record: HashMap::new()
        }
    }
}
