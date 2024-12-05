FROM --platform=linux/amd64 node:20

# Install system dependencies
RUN apt-get update && apt-get install -y curl

# Install dfx
RUN DFXVM_INIT_YES=true sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
