use clap::arg_enum;
use structopt::StructOpt;

arg_enum! {
    #[derive(Debug)]
    pub enum Backend {
        Web,
        Unix,
    }
}

#[derive(Debug, StructOpt)]
#[structopt(name = "erosion", about = "Tackle even the biggest tasks with ease.")]
pub struct Command {
  /// Specify the backend for the UI
  #[structopt(possible_values = &Backend::variants(), case_insensitive = true)]
  pub backend: Option<Backend>,
  /// if set, it will start built-in gui. You can also just use your own browser.
  #[structopt(short, long)]
  pub gui: bool,
  /// whether to enable debug logging or not
  #[structopt(short, long)]
  pub debug: bool,
}
