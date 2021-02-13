use crate::events::{EventManager, Events};
use serde::{Deserialize, Serialize};
use warp::Filter;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Message {
  event: Events,
}

pub fn routes() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
  let manager = EventManager::new();
  index().or(todos(manager))
}

/// POST /todos with JSON body
fn todos(
  manager: EventManager,
) -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
  warp::path!("todos")
    .and(warp::post())
    .and(json_body())
    .and(with_db(manager))
    .and_then(handlers::read_message)
}

fn index() -> impl Filter<Extract = impl warp::Reply, Error = warp::Rejection> + Clone {
  warp::get().and(warp::fs::dir("front"))
}
fn with_db(
  manager: EventManager,
) -> impl Filter<Extract = (EventManager,), Error = std::convert::Infallible> + Clone {
  warp::any().map(move || manager.clone())
}

fn json_body() -> impl Filter<Extract = (Message,), Error = warp::Rejection> + Clone {
  // When accepting a body, we want a JSON body
  // (and to reject huge payloads)...
  warp::body::content_length_limit(1024 * 16).and(warp::body::json())
}

mod handlers {
  use super::Message;
  use crate::{data_structures::State, events::{EventManager, Events}};
  use serde_json::json;
  use std::{convert::Infallible, env::var};

  pub async fn read_message(
    msg: Message,
    mut manager: EventManager,
  ) -> Result<impl warp::Reply, Infallible> {
    if var("EROSION_DBG") == Ok(String::from("true")) {
      println!("{:?}", msg);
    }
    // TODO maybe send the actual State object instead of the string.
    // I will have change the JSON.parse call on index.js if that's the case
    let empty = String::from("{}");
    match msg.event {
      Events::WorkspaceInit => {
        let state: State = manager.init_workspace();
        let workspace = json!({
            "state": state,
            "settings": EventManager::send_settings()
        });
        Ok(warp::reply::json(&workspace))
      }
      Events::DeleteCard(event) => {
        manager.delete_card(event);
        Ok(warp::reply::json(&empty))
      }
      Events::CreateCard(event) => {
        let state: State = manager.create_card(event);
        Ok(warp::reply::json(&state))
      }
      Events::UpdateCard(event) => {
        manager.update_card(event);
        Ok(warp::reply::json(&empty))
      }
      Events::CreateInbox(event) => {
        let state: State = manager.create_inbox(event);
        Ok(warp::reply::json(&state))
      }
      Events::UpdateInbox(event) => {
        manager.update_inbox(event);
        Ok(warp::reply::json(&empty))
      }
      Events::DeleteInbox(event) => {
        manager.delete_inbox(event);
        Ok(warp::reply::json(&empty))
      }
      Events::CreateProject(event) => {
        let state: State = manager.create_project(event);
        Ok(warp::reply::json(&state))
      }
      Events::UpdateProject(event) => {
        manager.update_project(event);
        Ok(warp::reply::json(&empty))
      }
      Events::DeleteProject(event) => {
        manager.delete_project(event);
        Ok(warp::reply::json(&empty))
      }
      Events::UpdateSettings(event) => {
        EventManager::update_settings(event);
        Ok(warp::reply::json(&empty))
      }
      Events::MoveCard(event) => {
        manager.move_card(event);
        Ok(warp::reply::json(&empty))
      }
      _ => {
        return Ok(warp::reply::json(&empty));
      }
    }
  }
}
