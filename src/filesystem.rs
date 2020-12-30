use directories::ProjectDirs;
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
    let cli_args = StartCommand::from_args();
    let env = cli_args.env;
    let project_dirs = ProjectDirs::from("com", "erosion app", "erosion").unwrap();
    let data_dir = project_dirs.data_dir();
    data_dir.join(env)
}

fn prep_data_file(name: &str) -> std::path::PathBuf {
    let mut data_dir = get_data_dir();
    data_dir.push(format!("{}.json", name));
    data_dir
}

pub fn write_data_file(name: &str, contents: &str) {
    let path = prep_data_file(name);
    fs::write(path, contents).unwrap();
}

pub fn read_data_file(name: &str) -> Result<String, std::io::Error> {
    let path = prep_data_file(name);
    fs::read_to_string(path)
}

// pub fn open_data_file(path: &str) -> Result<File> {
//     let path_string = get_app_root_path();
//     let file_path = format!("{}/{}", path_string, path);
//     File::open(file_path)
// }
