pub mod due_today;

use crate::data_structures::Card;

use std::{
  sync::mpsc::{channel, Receiver, Sender},
  thread::{sleep, spawn, JoinHandle},
  time::Duration,
};

pub use self::due_today::*;

pub trait PeriodicTask {
  fn register(
    &self,
    sender: Sender<ThreadEvent>,
    job: Job,
    run_every: Duration,
    id: String,
  ) -> Runner<()>;
}

/// These are for running side effects and communicating back to the coordinator
struct Service {
  thread: Option<JoinHandle<()>>,
}

pub struct Runner<T>
where
  T: Send + 'static,
{
  id: String,
  thread: Option<JoinHandle<T>>,
}

// TODO repurpose this for more metadata stuff like querying status, etc
// Keep all execution / registration logic inside the runner
impl Service {
  pub fn new() -> Self {
    Service { thread: None }
  }
}

impl PeriodicTask for Service {
  fn register(
    &self,
    sender: Sender<ThreadEvent>,
    job: Job,
    run_every: Duration,
    id: String,
  ) -> Runner<()> {
    let thread = spawn(move || loop {
      sleep(run_every);
      let event = job();
      sender.send(event).unwrap();
    });
    Runner {
      id,
      thread: Some(thread),
    }
  }
}

type Job = Box<dyn Fn() -> ThreadEvent + Send + 'static>;
type Serviceable = dyn PeriodicTask + 'static;

pub enum ThreadEvent {
  DueToday(Vec<Card>),
  NoChange,
}

pub struct ServicePool {
  services: Vec<Runner<()>>,
  receiver: Receiver<ThreadEvent>,
  sender: Sender<ThreadEvent>,
}

impl ServicePool {
  pub fn new() -> ServicePool {
    let (sender, receiver) = channel();
    let runners = Vec::new();

    ServicePool {
      services: runners,
      sender,
      receiver,
    }
  }
  pub fn register(&mut self, job: Job, run_every: Duration, id: String) {
    let service = Service::new();
    self
      .services
      .push(service.register(self.sender.clone(), Box::new(job), run_every, id));
  }
}

impl Drop for ServicePool {
  fn drop(&mut self) {
    for service in &mut self.services {
      println!("Shutting down service {}", service.id);

      if let Some(thread) = service.thread.take() {
        thread.join().unwrap();
      }
    }
  }
}
