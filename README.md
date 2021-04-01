# Erosion

## Installing

You need `cargo` and `yarn` in your `$PATH`. After cloning this repository, run `yarn` in the `front` directory to install the JS bundler and linter. After installing these, you should run `yarn build` to build the JS bundles.

After bundling the JS files, use `cargo build --release` to build the release binary, or if you want to install it in your `$PATH`, `cargo install --path .`.

## Developing

After installing the bundler in the previous step, you will need to run `yarn watch` to start it. In order to avoid polluting your main workspace with test data, you can source the `./env.sh` file, giving it an argument of either `dev` or `test`.
To run the tests, please source the `./env.sh` file with the argument, `test`. Start the main process with `cargo run -- web`, or, if you want to use the desktop GUI instead of your browser, edit the settings file setting `run_as_daemon: true`.
