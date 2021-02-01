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
        println!("┌────────────────────────────────────────────┐");
        println!("│Starting web backend @ http://0.0.0.0:37633 │");
        println!("└────────────────────────────────────────────┘");
        let api = web::routes();
        let server = tokio::spawn(async move {
          warp::serve(api).run(([0, 0, 0, 0], 37633)).await;
        });
        if opts.gui {
          let mut webview = web_view::builder()
            .title("⛰ Erosion")
            .content(Content::Url("http://0.0.0.0:37633"))
            .size(800, 1200)
            .resizable(true)
            .debug(true)
            .user_data(())
            .invoke_handler(|_webview, _arg| Ok(()))
            .build()
            .unwrap();
          webview.set_color((53, 27, 105));
          let res = webview.run();
          std::process::exit(match res {
            Ok(()) => 0,
            Err(err) => {
              eprintln!("\x1b[38;5;81m{:?}\x1b[0m", err);
              1
            }
          });
        } else {
          server.await.unwrap();
        }
      }
      cli::Backend::Unix => {
        println!("Unix backend");
      }
    },
    None => {}
  }
}
