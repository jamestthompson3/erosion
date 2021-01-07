#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]
#![allow(dead_code)]

mod bootstrap;
mod cards;
mod cmd;
mod data_structures;
mod envrionment;
mod filesystem;
mod inboxes;
mod projects;
mod events;
mod lenses;

fn main() {
  bootstrap::bootstrap();
  tauri::AppBuilder::new()
    .setup(|webview, _| {
        events::register_listeners(webview.as_mut());
    })
    .build()
    .run();
}
