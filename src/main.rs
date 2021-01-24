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

#[tokio::main]
async fn main() {
  bootstrap::bootstrap();
  let opts = cli::Command::from_args();
  match opts.backend {
    Some(backend) => match backend {
      cli::Backend::Web => {
        println!("\n│\n└────> Starting web backend");
        let api = web::routes();
        warp::serve(api).run(([127, 0, 0, 1], 3030)).await;
      }
      cli::Backend::Unix => {
        println!("Unix backend");
      }
    },
    None => {}
  }
}
