use crate::{data_structures::Card, filesystem::read_state_file};
use chrono::prelude::*;
use chrono::{DateTime, Local};
use std::{
  sync::{mpsc, Arc, Mutex},
  time::Duration,
};
use std::{thread, time::Instant};

pub struct DueTodayService {
  cards: Vec<Card>,
  moment: Arc<Mutex<DateTime<Local>>>,
  handle: Option<thread::JoinHandle<()>>,
}

enum DayChangeEvent {
  SameDay,
  NewDay,
}

pub enum ThreadEvent {
  DueToday(Vec<Card>),
}

struct Service {
  thread: Option<thread::JoinHandle<()>>,
}

pub fn get_due_today() -> ThreadEvent {
  // let today = Local::now();
  // let spawn_time = self.moment.lock().unwrap();
  // if today.year() != spawn_time.year()
  //   || today.month() != spawn_time.month()
  //   || today.day() != spawn_time.day()
  // {
  //   chan_send.send(DayChangeEvent::NewDay).unwrap();
  // }
  // thread::sleep(minute);
  // }));
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
  ThreadEvent::DueToday(cards)
}

impl Service {
  fn new(sender: mpsc::Sender<ThreadEvent>, job: Job, run_every: Duration) -> Service {
    let thread = thread::spawn(move || loop {
      let result = job();
      sender.send(result).unwrap();
      thread::sleep(run_every);
    });

    Service {
      thread: Some(thread),
    }
  }
}

type Job = Box<dyn Fn() -> ThreadEvent + Send + 'static>;

pub struct ServicePool {
  services: Vec<Service>,
  receiver: mpsc::Receiver<ThreadEvent>,
  sender: mpsc::Sender<ThreadEvent>,
}

impl ServicePool {
  pub fn new() -> ServicePool {
    let (sender, receiver) = mpsc::channel();
    let services = Vec::with_capacity(1); // Increment when registering a new service
    ServicePool {
      services,
      sender,
      receiver,
    }
  }
  pub fn register(&mut self, job: Job, run_every: Duration) {
    let service = Service::new(self.sender.clone(), job, run_every);
    self.services.push(service);
  }
}

impl Drop for ServicePool {
  fn drop(&mut self) {
    for service in &mut self.services {
      if let Some(thread) = service.thread.take() {
        thread.join().unwrap();
      }
    }
  }
}
