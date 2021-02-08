use std::{sync::{Arc, Mutex, mpsc::channel}, time::Duration};
use chrono::prelude::*;
use chrono::{Local, DateTime};
use std::thread;
use crate::data_structures::Card;

pub struct DueTodayService {
    cards: Vec<Card>,
    moment: Arc<Mutex<String>>
}

#[derive(Clone)]
enum DayChangeEvent {
    SameDay,
    NewDay(String)
}

impl<'a> DueTodayService {
    fn spawn(&'static mut self) -> thread::JoinHandle<()> {
    let (chan_send, _chan_recv) = channel();
        let minute = Duration::new(60, 0);
        let handle = thread::spawn(move ||{
           let today = Local::now();
           let spawn_time = self.moment.lock().unwrap().parse::<DateTime<Local>>().unwrap();
           if today.day() > spawn_time.day() {
               chan_send.send(DayChangeEvent::NewDay(today.to_rfc3339())).unwrap();
           }
           thread::sleep(minute);
        });
        handle
    }
}
