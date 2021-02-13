use crate::{data_structures::{Card, CardStatus}, filesystem::{read_data_file, read_state_file, write_data_file}};
use chrono::prelude::*;
use chrono::{DateTime, Local};
use std::{sync::{Arc, Mutex, mpsc::Sender}, thread::{sleep, spawn}, time::{Duration, Instant}};

use super::{PeriodicTask, Runner, ThreadEvent};

enum DayChangeEvent {
  SameDay,
  NewDay,
}

pub fn sweep_on_date_change(date: DateTime<Local>) -> Option<Vec<Card>> {
  let today = Local::now();
  if today.year() != date.year() || today.month() != date.month() || today.day() != date.day() {
    Some(get_due_today())
  } else {
        None
  }
}

pub fn get_due_today() -> Vec<Card> {
  let state = read_state_file();
  let mut cards: Vec<Card> = Vec::new();
  let today = Local::now();
  let now = Instant::now();
  for project in state.projects {
    for inbox in project.inboxes {
      for card in inbox.cards {
        match card.scheduled {
          Some(ref date_string) => {
            let parsed_date = date_string.parse::<DateTime<Local>>().unwrap();
            if parsed_date.year() == today.year()
              && parsed_date.month() == today.month()
              && parsed_date.day() == today.day()
              && (card.status == CardStatus::Todo || card.status == CardStatus::InProgress)
            {
              cards.push(card);
            }
          }
          _ => {}
        }
      }
    }
  }
  println!(
    "searching through cards took: {}ms",
    now.elapsed().as_millis()
  );
  println!("{:?}", cards);
  cards
}

pub fn write_if_changed(cards: Vec<Card>) {
    let existing_cards: Vec<Card> = serde_json::from_str(&read_data_file("due_today").unwrap()).unwrap();
    if cards != existing_cards {
        write_data_file("due_today", &serde_json::to_string(&cards).unwrap()).unwrap();
    }
}

pub struct DueToday {
    spawn_time: Arc<Mutex<DateTime<Local>>>,
}

impl PeriodicTask for DueToday {
    fn register(&'static mut self, sender: Sender<ThreadEvent>, run_every: Duration) -> Runner {
        let thread = spawn(move || loop {
            sleep(run_every);
            let mut spawn_time = self.spawn_time.lock().unwrap();
            let cards = sweep_on_date_change(*spawn_time);
            match cards {
                Some(cards) => {
                    *spawn_time = Local::now();
                    sender.send(ThreadEvent::DueToday(cards)).unwrap();
                },
                None => {}
            };

        });
        Runner {
            id: String::from("DueToday"),
            thread: Some(thread)
        }
    }
}
