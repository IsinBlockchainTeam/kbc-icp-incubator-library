#!/bin/bash

# Function to start the network, deploy canisters, and generate declarations
deploy_canisters() {
    echo "Starting local Internet Computer network..."
    dfx start --clean &
    while true; do
        dfx ping > /dev/null 2>&1
        if [ $? -eq 0 ]; then
          echo "ICP network is now up and running!"
          break
        fi
        echo "Waiting..."
        sleep 5
      done

    echo "Deploying canisters..."
    npm run deploy

    if [ $? -eq 0 ]; then
        echo "Generating declarations..."
        dfx generate
    else
        echo "Error deploying canisters. Exiting script."
        exit 1
    fi

}

# Function to uninstall canisters
uninstall_canisters() {
    echo "Uninstalling all canisters..."
    dfx canister uninstall-code --all
}

# Function to stop the network
stop_network() {
    echo "Stopping the local Internet Computer network..."
    dfx stop
}

# Trap the script to ensure network stops when the script is exited
trap stop_network EXIT

# Initial deployment
stop_network
deploy_canisters

# Watch for the "u" key press to uninstall and redeploy canisters
while true; do
    echo -n "Press 'u' to update the canisters, or 'q' to quit: "
    read -n 1 key
    echo ""

    if [[ "$key" == "u" ]]; then
        stop_network
        deploy_canisters
    elif [[ "$key" == "q" ]]; then
        break
    fi
done

echo "Exiting script. Goodbye!"
