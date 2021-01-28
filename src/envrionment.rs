use crate::data_structures::Settings;
use crate::filesystem::read_data_file;
use std::env::var;

pub fn get_user() -> String {
    // makes running tests a bit nicer
    if var("EROSION_ENV") == Ok(String::from("test")) {
        return String::from("test");
    }
    let from_settings = read_data_file(&"settings");
    match from_settings {
        Ok(settings_str) => {
            let settings: Settings = serde_json::from_str(&settings_str).unwrap();
            return settings.user;
        }
        Err(_) => match var("NAME") {
            Ok(user) => return user,
            Err(_) => match var("USER") {
                Ok(user) => return user,
                Err(_) => match var("USERNAME") {
                    Ok(user) => return user,
                    Err(_) => return String::from("user"),
                },
            },
        },
    }
}

pub fn get_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}
