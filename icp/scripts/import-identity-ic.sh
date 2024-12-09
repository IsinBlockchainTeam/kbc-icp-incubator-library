#!/bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
echo "BASE_DIR: $BASE_DIR"

PEM_FILE_PATH="$BASE_DIR/identity.pem"

# Read pem file
cat $CI_CD_ICP_IDENTITY_PEM
cat $CI_CD_ICP_IDENTITY_PEM > "$PEM_FILE_PATH"
chmod 600 "$PEM_FILE_PATH"

# Import identity
dfx identity import ci-cd "$PEM_FILE_PATH"
dfx identity list
dfx identity use ci-cd

# Set wallet
dfx identity set-wallet $CI_CD_ICP_WALLET --ic
dfx wallet balance --ic
dfx wallet controllers --ic