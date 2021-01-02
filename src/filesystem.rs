use directories::ProjectDirs;
use std::env::var;
use std::fs::{self};
use structopt::StructOpt;

#[derive(StructOpt, Debug)]
#[structopt(name = "erosion", about = "task management engine")]
struct StartCommand {
    #[structopt(name = "environment", short, default_value = "prod")]
    env: String,
}

/// Data dir is found in the following locations:
/// Linux:   /home/alice/.local/share/erosion
/// Windows: C:\Users\Alice\AppData\Roaming\erosion app\erosion\data
/// macOS:   /Users/Alice/Library/Application Support/erosion app
pub fn get_data_dir() -> std::path::PathBuf {
    // let cli_args = StartCommand::from_args();
    match var("EROSION_DIR") {
        Ok(dir) => return std::path::PathBuf::from(dir),
        Err(_) => {}
    }
    let env = var("EROSION_ENV").unwrap();
    let project_dirs = ProjectDirs::from("com", "erosion app", "erosion").unwrap();
    let data_dir = project_dirs.data_dir();
    data_dir.join(env)
}

pub fn prep_data_file(name: &str) -> std::path::PathBuf {
    let mut data_dir = get_data_dir();
    data_dir.push(format!("{}.json", name));
    data_dir
}

pub fn write_data_file(name: &str, contents: &str) -> Result<(), std::io::Error> {
    let path = prep_data_file(name);
    fs::write(path, contents)
}

pub fn read_data_file(name: &str) -> Result<String, std::io::Error> {
    let path = prep_data_file(name);
    fs::read_to_string(path)
}

pub fn delete_data_file(name: &str) -> Result<(), std::io::Error> {
    let path = prep_data_file(name);
    fs::remove_file(path)
}

// pub fn open_data_file(path: &str) -> Result<File> {
//     let path_string = get_app_root_path();
//     let file_path = format!("{}/{}", path_string, path);
//     File::open(file_path)
// }
#[cfg(test)]
mod tests {
    use super::*;
    use crate::bootstrap::bootstrap;
    // TODO make this less flaky
    // #[test]
    // fn preps_data() {
    //     bootstrap();
    //     let name = "test";
    //     let prepped = prep_data_file(name);
    //     let project_dir = ProjectDirs::from("com", "erosion app", "erosion").unwrap();
    //     let data_dir = project_dir.data_dir();
    //     let mut dir = data_dir.join("test");
    //     dir.push("test.json");
    //     assert_eq!(prepped, dir);
    // }
    #[test]
    fn writes_data() {
        write_data_file("test", r#"{{"test": 123 }}"#).unwrap();
        let mut data_dir = get_data_dir();
        assert_eq!(data_dir.exists(), true);
        data_dir.push(prep_data_file("test"));
        assert_eq!(data_dir.exists(), true);
    }
    #[test]
    fn reads_data() {
        bootstrap();
        let data_str = read_data_file("test").unwrap();
        assert_eq!(r#"{{"test": 123 }}"#, data_str);
    }
    #[test]
    fn deletes_data() {
        bootstrap();
        write_data_file("deletable", r#"{{"test": 123 }}"#).unwrap();
        delete_data_file("deletable").unwrap();
        let mut data_dir = get_data_dir();
        data_dir.push("deletable.json");
        assert_eq!(data_dir.exists(), false);
    }
}
