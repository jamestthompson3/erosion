// pub fn workspace_init(mut handle: tauri::WebviewMut) {
//     tauri::event::emit(
//         &mut handle,
//         Events::WorkspaceInit.to_string(),
//         Some(read_data_file("state").unwrap()),
//     )
//     .unwrap();
// }
// pub fn register_card_update() {
//     tauri::event::listen(Events::UpdateCard.to_string(), move |data| match data {
//         Some(data) => {
//             let event_data: CardUpdateEvent = serde_json::from_str(&data).unwrap();
//             update_card(
//                 &read_state_file(),
//                 event_data.project,
//                 event_data.inbox,
//                 event_data.card,
//             );
//         }
//         None => {}
//     });
// }
// pub fn register_card_create(mut handle: tauri::WebviewMut) {
//     tauri::event::listen(Events::CreateCard.to_string(), move |data| match data {
//         Some(data) => {
//             let event_data: CardCreateEvent = serde_json::from_str(&data).unwrap();
//             let updated_state = create_card(
//                 &read_state_file(),
//                 event_data.project,
//                 event_data.inbox,
//                 event_data.card,
//             );

//             tauri::event::emit(
//                 &mut handle,
//                 Events::StateUpdated.to_string(),
//                 Some(serde_json::to_string(&updated_state).unwrap()),
//             )
//             .unwrap();
//         }
//         None => {}
//     });
// }
// pub fn register_card_delete() {
//     tauri::event::listen(Events::DeleteCard.to_string(), move |data| match data {
//         Some(data) => {
//             let event_data: CardDeleteEvent = serde_json::from_str(&data).unwrap();
//             delete_card(
//                 &read_state_file(),
//                 event_data.project,
//                 event_data.inbox,
//                 event_data.card,
//             );
//         }
//         None => {}
//     });
// }

// pub fn register_inbox_create(mut handle: tauri::WebviewMut) {
//     tauri::event::listen(Events::CreateInbox.to_string(), move |data| match data {
//         Some(data) => {
//             let event_data: InboxCreateEvent = serde_json::from_str(&data).unwrap();
//             let updated_state =
//                 create_inbox(&read_state_file(), event_data.project, &event_data.name);
//             tauri::event::emit(
//                 &mut handle,
//                 Events::StateUpdated.to_string(),
//                 Some(serde_json::to_string(&updated_state).unwrap()),
//             )
//             .unwrap();
//         }
//         None => {}
//     });
// }

// pub fn register_inbox_update() {
//     tauri::event::listen(Events::UpdateInbox.to_string(), move |data| match data {
//         Some(data) => {
//             let event_data: InboxUpdateEvent = serde_json::from_str(&data).unwrap();
//             update_inbox(&read_state_file(), event_data.project, event_data.inbox);
//         }
//         None => {}
//     });
// }

// pub fn register_inbox_delete() {
//     tauri::event::listen(Events::DeleteInbox.to_string(), move |data| match data {
//         Some(data) => {
//             let event_data: InboxDeleteEvent = serde_json::from_str(&data).unwrap();
//             delete_inbox(&read_state_file(), event_data.project, event_data.inbox);
//         }
//         None => {}
//     });
// }

// pub fn register_project_update() {
//     tauri::event::listen(Events::UpdateProject.to_string(), move |data| match data {
//         Some(data) => {
//             let event_data: ProjectUpdateEvent = serde_json::from_str(&data).unwrap();
//             update_project(&read_state_file(), event_data.project);
//         }
//         None => {}
//     });
// }

// pub fn register_project_delete() {
//     tauri::event::listen(Events::DeleteProject.to_string(), move |data| match data {
//         Some(data) => {
//             let event_data: ProjectDeleteEvent = serde_json::from_str(&data).unwrap();
//             delete_project(&read_state_file(), event_data.project_id);
//         }
//         None => {}
//     });
// }

// pub fn register_project_create(mut handle: tauri::WebviewMut) {
//     tauri::event::listen(Events::CreateProject.to_string(), move |data| match data {
//         Some(data) => {
//             let event_data: ProjectCreateEvent = serde_json::from_str(&data).unwrap();
//             let updated_state = create_project(&read_state_file(), &event_data.name);
//             tauri::event::emit(
//                 &mut handle,
//                 Events::StateUpdated.to_string(),
//                 Some(serde_json::to_string(&updated_state).unwrap()),
//             )
//             .unwrap();
//         }
//         None => {}
//     });
// }
