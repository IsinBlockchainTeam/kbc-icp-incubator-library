# ICP Common

This project creates a decentralized network based on [_ICP_](https://internetcomputer.org/) technology. It creates _canister_ for storing data in a decentralized way.

This package is written in Rust.

## Prerequisites

- [Git](https://git-scm.com/)
- [Rust](https://www.rust-lang.org/tools/install)
- [dfx](https://internetcomputer.org/docs/current/developer-docs/developer-tools/cli-tools/cli-reference/dfx-parent) (latest version strongly suggested)
- `wasm32-unknown-unknown` target, you can add it by running `rustup target add wasm32-unknown-unknown`

## Getting Started - Local replica

1. Make sure you have installed [dfx](https://internetcomputer.org/docs/current/developer-docs/developer-tools/cli-tools/cli-reference/dfx-parent) and updated the latest version
2. Clone this repository
3. Enter the newly created folder
4. Enter the ICP folder using `cd icp`
5. Download the declarations for the needed canisters by running `./scripts/fetch-canisters.sh`
6. Run `dfx generate` to generate the candid types
