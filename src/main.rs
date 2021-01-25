#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
#![allow(dead_code)]

mod bootstrap;
mod cards;
mod cli;
mod cmd;
mod data_structures;
mod envrionment;
mod events;
mod filesystem;
mod inboxes;
mod lenses;
mod projects;
mod web;

use structopt::StructOpt;
use web_view::*;

#[tokio::main]
async fn main() {
  bootstrap::bootstrap();
  let opts = cli::Command::from_args();
  match opts.backend {
    Some(backend) => match backend {
      cli::Backend::Web => {
        println!("┌────────────────────────────────────────────┐\n│Starting web backend @ http://0.0.0.0:37633 │\n└────────────────────────────────────────────┘");
        let api = web::routes();
        if opts.gui {
          std::thread::spawn(|| {
            web_view::builder()
              .title("Erosion")
              .content(Content::Url("http://0.0.0.0:37633"))
              .size(800, 600)
              .resizable(true)
              .debug(true)
              .user_data(())
              .invoke_handler(|_webview, _arg| Ok(()))
              .run()
              .unwrap();
          });
        }
        warp::serve(api).run(([0, 0, 0, 0], 37633)).await;
      }
      cli::Backend::Unix => {
        println!("Unix backend");
      }
    },
    None => {}
  }
}
