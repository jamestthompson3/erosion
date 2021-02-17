use crate::{filesystem::write_data_file, projects::Project};
use serde::{Deserialize, Serialize};
use std::ops::Index;


#[derive(Serialize, Deserialize, Debug, Clone)]
pub enum Backend {
    Web,
    Unix,
}

pub trait Id {
    fn id(&self) -> String;
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub enum CardStatus {
    Done,
    InProgress,
    Todo,
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Card {
    pub id: String,
    pub created: String,
    pub title: String,
    pub modified: String,
    pub modifier: String,
    pub scheduled: Option<String>,
    pub status: CardStatus,
    pub tags: Option<Vec<String>>,
    pub text: Option<String>,
    pub time_allotted: u16,
    pub completed: Option<String>,
}

impl Index<&'_ str> for Card {
    type Output = str;
    fn index(&self, s: &str) -> &str {
        let field = || -> Result<&str, ()> {
            Ok(&self[s])
        };
        if let Err(_err) = field() {
            panic!("unknown field {}", s);
        } else {
            return field().unwrap()
        }
    }
}
impl Id for Card {
    fn id(&self) -> String {
        self.id.clone()
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Settings {
    pub user: String,
    pub id: String,
    pub show_complete: bool,
    pub run_as_daemon: bool,
    pub backend: Backend
}

#[derive(Serialize, Deserialize, Debug)]
pub enum CardBase {
    Card(Card),
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct State {
    pub user: String,
    pub id: String,
    pub version: String,
    pub projects: Vec<Project>,
}

impl State {
    pub fn write(&self) {
        write_data_file(&self.id, &serde_json::to_string(&self).unwrap()).unwrap();
    }
}
