use std::collections::HashMap;
use crate::data_structures::{Card};
use serde_json;
use serde::{Deserialize, Serialize};

pub struct Switchboard {
    states: HashMap<String, dyn Fn() -> ()>,
}


#[derive(Serialize, Deserialize, Debug)]
pub enum Message {
    CreateCard(Card),

}

impl Switchboard {
    pub fn send(&self, msg: &str) {

        match self.states.get(msg) {
            Some(review) => println!("{}", msg),
            None => panic!("{} is not a valid state", msg)
        }
    }
    pub fn describe(&mut self, state: &str, action: fn) {
        self.states.insert(String::from(state), action);
    }
}
