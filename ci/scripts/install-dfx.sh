#!/bin/bash

# Install dfx
export DFXVM_INIT_YES=true
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Add dfx to PATH
export PATH=$PATH:/root/.local/share/dfx/bin

# Verify installation
dfx --version