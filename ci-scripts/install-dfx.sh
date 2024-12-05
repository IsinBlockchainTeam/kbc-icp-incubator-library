#!/bin/bash

export DFXVM_INIT_YES=true
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
which dfx
export PATH=$PATH:/root/.local/share/dfx/bin
dfx --version