pub fn register_listeners(mut handle: tauri::WebviewMut) { }

pub enum Events {
    CREATE_CARD,
    DELETE_CARD,
    UPDATE_CARD,
    MOVE_CARD,
    CREATE_INBOX,
    DELETE_INBOX,
}
