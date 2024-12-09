#!/bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
echo "BASE_DIR: $BASE_DIR"

# Read pem file
echo $CI_CD_ICP_IDENTITY_PEM
echo echo "${!$CI_CD_ICP_IDENTITY_PEM}" > "$BASE_DIR/icp/identity.pem"
cat "$BASE_DIR/icp/identity.pem"

# Import identity
dfx identity import ci-cd "$BASE_DIR/icp/identity.pem"
dfx identity list
dfx identity use ci-cd

# Set wallet
dfx identity set-wallet $CI_CD_ICP_WALLET --ic
dfx wallet balance --ic
dfx wallet controllers --ic