use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize)]
pub struct RecurringTask {
  name: String,
  record: HashMap<NaiveDate, u16>,
  target: u16,
}

impl RecurringTask {
  pub fn new(name: String, target: u16) -> Self {
    RecurringTask {
      target,
      name,
      record: HashMap::new(),
    }
  }
}

impl Habit for RecurringTask {
  fn move_goalposts(&mut self, new_target: u16) {
    self.target = new_target;
  }
  fn record_activity(&mut self, date: NaiveDate, value: u16) {
    *self.record.entry(date).or_insert(value) = value;
  }
  fn target(&self) -> u16 {
    self.target
  }
  fn name(&self) -> String {
    self.name.clone()
  }
  fn remaining(&self, date: NaiveDate) -> u16 {
    let current_achieved = self.record.get(&date);
    match current_achieved {
      Some(achieved) => {
        if achieved <= &self.target {
          self.target - achieved
        } else {
          return 0;
        }
      }
      None => self.target,
    }
  }
  fn reached_goal(&self, date: NaiveDate) -> bool {
    if let Some(achieved) = self.record.get(&date) {
      return achieved >= &self.target;
    }
    false
  }
  fn set_name(&mut self, name: impl AsRef<str>) {
    self.name = name.as_ref().to_owned();
  }
  fn get_by_date(&self, date: NaiveDate) -> Option<&u16> {
    self.record.get(&date)
  }
}

pub trait Habit {
  fn get_by_date(&self, date: NaiveDate) -> Option<&u16>;
  fn target(&self) -> u16;
  fn record_activity(&mut self, date: NaiveDate, val: u16);
  fn name(&self) -> String;
  fn reached_goal(&self, date: NaiveDate) -> bool;
  fn remaining(&self, date: NaiveDate) -> u16;
  fn move_goalposts(&mut self, new_target: u16);
  fn set_name(&mut self, name: impl AsRef<str>);
}


#[cfg(test)]
mod tests {
  use super::*;
  #[test]
    fn getters_and_setters() {
        let mut new_task = RecurringTask::new(String::from("test task"), 43);
        let test_date = NaiveDate::from_ymd(2015, 6, 3);
        assert_eq!(new_task.target(), 43);
        assert_eq!(new_task.name, String::from("test task"));
        assert_eq!(new_task.remaining(test_date), 43);
        new_task.record_activity(test_date, 22);
        assert_eq!(new_task.remaining(test_date), 21);
        assert_eq!(new_task.reached_goal(test_date), false);
        assert_eq!(new_task.get_by_date(NaiveDate::from_ymd(2020,4,4)), None);
        new_task.move_goalposts(5);
        assert_eq!(new_task.target(), 5);
        assert_eq!(new_task.reached_goal(test_date), true);
        assert_eq!(new_task.remaining(test_date),0);
    }
}
