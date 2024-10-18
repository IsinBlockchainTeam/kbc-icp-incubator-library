#!/bin/bash

ROOT_DIR=$(pwd)

start_icp_network() {
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
}

# deploy canisters and generate declarations
deploy_canisters() {
    cd $ROOT_DIR
    echo "Deploying canisters..."
    touch .env
    npm run deploy

    if [ $? -eq 0 ]; then
        if [ "$1" = "populate" ]; then
            echo "Populate element canisters with data..."
            echo "Process types loading..."
            dfx canister call entity_manager addEnumerationValue '(variant {PROCESS_TYPE}, "33 - Collecting")'
            dfx canister call entity_manager addEnumerationValue '(variant {PROCESS_TYPE}, "38 - Harvesting")'
            echo "Assessment standards loading..."
            dfx canister call entity_manager addEnumerationValue '(variant {ASSESSMENT_STANDARD}, "Chemical use assessment")'
            dfx canister call entity_manager addEnumerationValue '(variant {ASSESSMENT_STANDARD}, "Environment assessment")'
            dfx canister call entity_manager addEnumerationValue '(variant {ASSESSMENT_STANDARD}, "Origin assessment")'
            dfx canister call entity_manager addEnumerationValue '(variant {ASSESSMENT_STANDARD}, "Quality assessment")'
            dfx canister call entity_manager addEnumerationValue '(variant {ASSESSMENT_STANDARD}, "Swiss Decode")'
            echo "Assessment assurance level loading..."
            dfx canister call entity_manager addEnumerationValue '(variant {ASSESSMENT_ASSURANCE_LEVEL}, "Reviewed by peer members")'
            dfx canister call entity_manager addEnumerationValue '(variant {ASSESSMENT_ASSURANCE_LEVEL}, "Self assessed")'
            dfx canister call entity_manager addEnumerationValue '(variant {ASSESSMENT_ASSURANCE_LEVEL}, "Self declaration / Not verified")'
            dfx canister call entity_manager addEnumerationValue '(variant {ASSESSMENT_ASSURANCE_LEVEL}, "Verified by second party")'
            dfx canister call entity_manager addEnumerationValue '(variant {ASSESSMENT_ASSURANCE_LEVEL}, "Certified (Third Party)")'
        fi
        echo "Generating declarations..."
        dfx generate
        cp .env ../../src/
        cd ../../src
        npm run icp-build
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
start_icp_network
deploy_canisters populate

# Watch for the "u" key press to uninstall and redeploy canisters
while true; do
    echo -n "Press 'u' to update canisters, 't' to re-deploy the entire ICP network, or 'q' to quit: "
    read -n 1 key
    echo ""

    if [[ "$key" == "t" ]]; then
        stop_network
        start_icp_network
        deploy_canisters populate
    elif [[ "$key" == "u" ]]; then
        deploy_canisters
    elif [[ "$key" == "q" ]]; then
        break
    else
        echo "Invalid key. Please try again."
    fi
done

echo "Exiting script. Goodbye!"
