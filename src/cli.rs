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
  #[structopt(possible_values = &Backend::variants(), case_insensitive = true)]
  pub backend: Option<Backend>,
}
