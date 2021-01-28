use crate::{filesystem::write_data_file, projects::Project};
use serde::{Deserialize, Serialize};
use std::ops::Index;

macro_rules! extends_base {
    (struct $name:ident { $( $field:ident: $ty:ty ),* $(,)* }) => {
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
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
  impl Id for $name {
      fn id(&self) -> String {
          self.id.clone()
      }
  }
 };
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

extends_base!(
  struct Card {
    scheduled: Option<String>,
    status: CardStatus,
    tags: Option<Vec<String>>,
    text: Option<String>,
    time_allotted: u16,
    completed: Option<String>,
  }
);

#[derive(Serialize, Deserialize, Debug)]
pub struct Settings {
  pub user: String,
  pub id: String,
  pub show_complete: bool,
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
