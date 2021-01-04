#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

mod bootstrap;
mod cards;
mod cmd;
mod data_structures;
mod envrionment;
mod filesystem;
mod inboxes;
mod projects;
mod events;

fn main() {
  bootstrap::bootstrap();
  tauri::AppBuilder::new()
    .invoke_handler(|webview, _| {
        events::register_listeners(webview.as_mut());
        Ok(())
    })
    .build()
    .run();
}
