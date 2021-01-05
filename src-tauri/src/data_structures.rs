use serde::{Deserialize, Serialize};
use crate::projects::Project;
use std::ops::Index;

macro_rules! extends_base {
    (struct $name:ident { $( $field:ident: $ty:ty ),* $(,)* }) => {
#[derive(Serialize, Deserialize, Debug, Clone)]
  pub struct $name {
    pub id: String,
    pub created: String,
    pub title: String,
    pub modified: String,
    pub modifier: String,
            $( pub $field: $ty ),*
        }

impl Index<&'_ str> for $name {
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
 };
}

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone)]
pub enum CardStatus {
    Done,
    InProgress,
    Todo,
}

extends_base!(
    struct Card {
        scheduled: Option<String>,
        status: CardStatus,
        tag: Option<Vec<String>>,
        text: Option<String>,
        time_allotted: u16,
    }
);

extends_base!(
    struct Settings {
        user: String,
    }
);

#[derive(Serialize, Deserialize, Debug)]
pub enum CardBase {
    Settings(Settings),
    Card(Card),
}
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct State {
    pub user:  String,
    pub id: String,
    pub version: String,
    pub projects: Vec<Project>,
}
