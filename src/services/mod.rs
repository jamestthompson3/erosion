pub mod due_today;

use crate::data_structures::Card;

use std::{
  sync::mpsc::{channel, Receiver, Sender},
  thread::{sleep, spawn, JoinHandle},
  time::Duration,
};

pub use self::due_today::*;

pub trait PeriodicTask: 'static {
  fn register(&'static mut self, sender: Sender<ThreadEvent>, run_every: Duration) -> Runner;
}

/// These are for running side effects and communicating back to the coordinator
struct Service {
  job: Job,
  thread: Option<JoinHandle<()>>,
}

pub struct Runner {
  id: String,
  thread: Option<JoinHandle<()>>,
}

impl Service {
  fn new(job: Job) -> Service {
    Service { job, thread: None }
  }
}

impl PeriodicTask for Service {
  fn register(&'static mut self, sender: Sender<ThreadEvent>, run_every: Duration) -> Runner {
    let thread = spawn(move || loop {
      sleep(run_every);
      let job = &self.job;
      let event = job();
      sender.send(event);
    });
    Runner {
      id: String::from("side-effect"),
      thread: Some(thread),
    }
  }
}

type Job = Box<dyn Fn() -> ThreadEvent + Send + 'static>;
type Serviceable = dyn PeriodicTask + 'static;

pub enum ThreadEvent {
  DueToday(Vec<Card>),
}

pub struct ServicePool {
  services: Vec<Runner>,
  receiver: Receiver<ThreadEvent>,
  sender: Sender<ThreadEvent>,
}

impl ServicePool {
  pub fn new<Serviceable: PeriodicTask>(services: Vec<(Serviceable, Duration)>) -> ServicePool {
    let (sender, receiver) = channel();
    let mut runners = Vec::with_capacity(services.len());
    for (mut service, duration) in services {
      runners.push(service.register(sender.clone(), duration));
    }

    ServicePool {
      services: runners,
      sender,
      receiver,
    }
  }
}

impl Drop for ServicePool {
  fn drop(&mut self) {
    for runner in &mut self.services {
      match &runner.thread {
        Some(handle) => {
          handle.join();
        }
        None => {}
      }
    }
  }
}
