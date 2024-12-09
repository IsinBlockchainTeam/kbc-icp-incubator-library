#!/bin/bash

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
echo "BASE_DIR: $BASE_DIR"

# Read pem file
CI_CD_ICP_IDENTITY_PEM="${!FILE_VARIABLE_NAME}"

# Import identity
dfx identity import ci-cd $CI_CD_ICP_IDENTITY_PEM
dfx identity list
dfx identity use ci-cd

# Set wallet
dfx identity set-wallet $CI_CD_ICP_WALLET --ic
dfx wallet balance --ic
dfx wallet controllers --ic