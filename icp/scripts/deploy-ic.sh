#!/bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
echo "BASE_DIR: $BASE_DIR"

# Ping dfx network
dfx ping ic

# Source .env.ci
cd "$BASE_DIR/ts-canisters"
set -o allexport
source .env.ci
set +o allexport

# Deploy canisters
cd "$BASE_DIR/ts-canisters"
dfx deploy entity_manager --ic --yes

# Canister status
dfx canister status entity_manager --ic
