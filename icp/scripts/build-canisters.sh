#!/bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
echo "BASE_DIR: $BASE_DIR"

function generate_declarations() {
  dfx deploy
  dfx generate
}

# Start dfx network
dfx start --clean --background

# Build Rust canisters
cd "$BASE_DIR/rust-canisters"
generate_declarations

# Build ts canisters
cd "$BASE_DIR/ts-canisters"
set -o allexport
source .env.ci
set +o allexport
generate_declarations
npm run build-types

# Stop dfx network
dfx stop
