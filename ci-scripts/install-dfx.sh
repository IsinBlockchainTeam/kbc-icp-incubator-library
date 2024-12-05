#!/bin/bash

export DFXVM_INIT_YES=true
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
export PATH=$PATH:$(dirname "$(which dfx)")
dfx --version