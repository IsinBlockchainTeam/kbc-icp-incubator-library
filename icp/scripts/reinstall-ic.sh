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
dfx canister create entity_manager --network ic
dfx build entity_manager --network ic
dfx canister install entity_manager --mode reinstall --network ic --yes

# Canister status
dfx canister status entity_manager --network ic
