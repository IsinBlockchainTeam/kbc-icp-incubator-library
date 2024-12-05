#!/bin/bash

export DFXVM_INIT_YES=true
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
echo 'export PATH=$PATH:/root/.local/share/dfx/bin' >> ~/.profile
source ~/.profile
dfx --version