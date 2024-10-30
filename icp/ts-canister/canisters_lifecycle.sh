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
    echo "Updating types..."
    npm run build-types
    echo "Deploying canisters..."
    touch .env
    npm run deploy

    if [ $? -eq 0 ]; then
        if [ "$1" = "populate" ]; then
            echo "Populate element canisters with data..."
            echo "Process types loading..."
            dfx canister call entity_manager addProcessType '("33 - Collecting")'
            dfx canister call entity_manager addProcessType '("38 - Harvesting")'
            echo "Assessment standards loading..."
            dfx canister call entity_manager addAssessmentStandard '("Chemical use assessment")'
            dfx canister call entity_manager addAssessmentStandard '("Environment assessment")'
            dfx canister call entity_manager addAssessmentStandard '("Origin assessment")'
            dfx canister call entity_manager addAssessmentStandard '("Quality assessment")'
            dfx canister call entity_manager addAssessmentStandard '("Swiss Decode")'
            echo "Assessment assurance level loading..."
            dfx canister call entity_manager addAssessmentAssuranceLevel '("Reviewed by peer members")'
            dfx canister call entity_manager addAssessmentAssuranceLevel '("Self assessed")'
            dfx canister call entity_manager addAssessmentAssuranceLevel '("Self declaration / Not verified")'
            dfx canister call entity_manager addAssessmentAssuranceLevel '("Verified by second party")'
            dfx canister call entity_manager addAssessmentAssuranceLevel '("Certified (Third Party)")'
            echo "Fiats loading..."
            dfx canister call entity_manager addFiat '("CHF")'
            dfx canister call entity_manager addFiat '("EUR")'
            dfx canister call entity_manager addFiat '("USD")'
            echo "Units loading..."
            dfx canister call entity_manager addUnit '("BG - Bags")'
            dfx canister call entity_manager addUnit '("KGM - Kilograms")'
            dfx canister call entity_manager addUnit '("H87 - Pieces")'
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
