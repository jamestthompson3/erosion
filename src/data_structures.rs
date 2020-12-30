use serde::{Deserialize, Serialize};
use std::ops::Index;

macro_rules! extends_base {
    (struct $name:ident { $( $field:ident: $ty:ty ),* $(,)* }) => {
#[derive(Serialize, Deserialize)]
  pub struct $name {
    id: String,
    created: String,
    title: String,
    modified: String,
    modifier: String,
            $( $field: $ty ),*
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

extends_base!(
    struct Card {
        scheduled: String,
    }
);

extends_base!(
    struct Settings {
        user: String,
    }
);

// impl Index<&'_ str> for Settings {
//     type Output = str;
//     fn index(&self, s: &str) -> &str {
//         match s {
//             "title" => &self.title,
//             "user" => &self.user,
//             _ => panic!("unknown field: {}", s),
//         }
//     }
// }
