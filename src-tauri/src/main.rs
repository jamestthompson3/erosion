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
mod events;
mod filesystem;
mod inboxes;
mod lenses;
mod projects;

fn main() {
    bootstrap::bootstrap();
    tauri::AppBuilder::new()
        .setup(|webview, _| {
            events::register_init(webview.as_mut());
            events::register_card_update();
            events::register_card_delete();
            events::register_card_create(webview.as_mut());
            events::register_inbox_update();
            events::register_project_update();
            events::register_project_create(webview.as_mut());
        })
        .build()
        .run();
}
