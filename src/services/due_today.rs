use crate::{
  data_structures::{Card, CardStatus},
  filesystem::{read_data_file, read_state_file, write_data_file},
};
use chrono::prelude::*;
use chrono::{DateTime, Local};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{collections::VecDeque, sync::{Arc, Condvar, Mutex}, thread::{JoinHandle, spawn}, time::Instant};

use super::ThreadEvent;

enum DayChangeEvent {
  SameDay,
  NewDay,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DueTodayState {
  updated: String,
  cards: Vec<Card>,
}

pub fn sweep_on_date_change() -> Option<Vec<Card>> {
  let due_today_state: DueTodayState =
    serde_json::from_str(&read_data_file("due_today").unwrap()).unwrap();
  let date = due_today_state.updated.parse::<DateTime<Local>>().unwrap();
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
  write_if_changed(&cards);
  cards
}

fn write_if_changed(cards: &Vec<Card>) {
  let today = Local::now();
  let current_state: DueTodayState  = serde_json::from_str(&read_data_file("due_today").unwrap()).unwrap();
  if *cards != current_state.cards {
      let data = json!({
          "cards": cards,
          "updated": today.to_rfc3339()
      });
      write_data_file("due_today", &data.to_string()).unwrap();
  }
}

pub fn emit_on_change() -> ThreadEvent {
  match sweep_on_date_change() {
    Some(cards) => ThreadEvent::DueToday(cards),
    None => ThreadEvent::NoChange,
  }
}


pub struct WriterQueue {
    jobs: Mutex<Option<VecDeque<u8>>>,
    cvar: Condvar,
}

impl WriterQueue {
    pub fn new() -> Self {
        WriterQueue {
            jobs: Mutex::new(Some(VecDeque::new())),
            cvar: Condvar::new()
        }
    }
    pub fn queue_writes(&self, writes: u8) {
        let mut jobs = self.jobs.lock().unwrap();
        if let Some(queue) = jobs.as_mut() {
            queue.push_back(writes);
            self.cvar.notify_all();
        }
    }
    pub fn wait_for_job(&self) -> Option<u8> {
        let mut jobs = self.jobs.lock().unwrap();
        loop {
            match jobs.as_mut()?.pop_front() {
                Some(job) => return Some(job),
                None => {
                    jobs = self.cvar.wait(jobs).unwrap()
                }
            }
        }
    }
    pub fn end(&self) {
        let mut jobs = self.jobs.lock().unwrap();
        *jobs = None;
        self.cvar.notify_all();
    }
}

pub struct WriterCoordinator {
    handle: JoinHandle<()>,
    queue: Arc<WriterQueue>
}

impl WriterCoordinator {
    pub fn new() -> Self {
        let queue = Arc::new(WriterQueue::new());
        let handle = spawn({
            let write_queue = queue.clone();
            move || {
                while let Some(_write) = write_queue.wait_for_job() {
                    get_due_today();
                }
            }

        });
        WriterCoordinator {
            queue,
            handle
        }
    }
    pub fn add(&self, writer: u8) {
        self.queue.queue_writes(writer);
        self.queue.end();
    }
}
