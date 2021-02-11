pub mod due_today;

use crate::data_structures::Card;

use std::{
  sync::mpsc,
  time::Duration,
  thread
};

pub use self::due_today::*;

struct Service {
  thread: Option<thread::JoinHandle<()>>,
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

pub enum ThreadEvent {
  DueToday(Vec<Card>),
}


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
