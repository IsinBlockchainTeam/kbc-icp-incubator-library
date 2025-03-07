#!/bin/bash

# Default value for populate demo
POPULATE_DEMO=true

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -demo)
            POPULATE_DEMO=$2
            shift 2
            ;;
        *)
            shift
            ;;
    esac
done

OS_TYPE=$(uname)

BASE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"
echo "BASE_DIR: $BASE_DIR"

function new_terminal_tab() {
  local command=$1

  if [[ "$OS_TYPE" == "Linux" ]]; then
    # Open a new tab in the existing gnome-terminal window
    gnome-terminal --tab -- bash -c "$command; exec bash"
  else
    local silent=true
    local delay=1

    # Add space prefix for silent execution
    if [ "$silent" = true ] && [ ! -z "$command" ]; then
        command=" $command"
    fi

    osascript <<EOF
tell application "iTerm"
    -- Create new tab
    tell current window
        create tab with default profile
        tell current session of current tab
            write text "${command}"
        end tell
    end tell

    activate
    delay "$delay"
end tell
EOF

  fi
}

function wait_for_connection() {
    local url="$1"
    local timeout="${2:-2}"  # Default sleep timeout is 2 seconds

    echo "Waiting for connection to $url..."
    until curl --output /dev/null --silent --head --fail "http://$url"; do
        printf '.'
        sleep "$timeout"
    done
    echo -e "\nConnection established!"
}

function wait_for_dfx() {
    local timeout="${1:-2}"  # Default sleep timeout is 2 seconds

    echo "Waiting for DFX network..."
    until dfx ping >/dev/null 2>&1; do
        printf '.'
        sleep "$timeout"
    done
    echo -e "\nDFX network is ready!"
}

function store_ngrok_url() {
    local ngrok_url=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'http[^"]*' | head -1)

    while [ -z "$ngrok_url" ]; do
        sleep 2
        ngrok_url=$(curl -s http://127.0.0.1:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'http[^"]*' | head -1)
    done

    local var_name="EVM_RPC_URL"
    local env_file="$BASE_DIR/icp/ts-canisters/.env.custom"

    if [[ "$OS_TYPE" == "Linux" ]]; then
        sed -i "s|^$var_name=.*|$var_name=$ngrok_url|" "$env_file"
    else
      sed -i '' "s|^$var_name=.*|$var_name=$ngrok_url|" "$env_file"
    fi
}

function wait_for_canister_address() {
   local timeout=5
   local entity_manager_id="bkyz2-fmaaa-aaaaa-qaaaq-cai"

    until output=$(dfx canister call $entity_manager_id getCanisterAddress 2>&1) &&
                   [[ ! "$output" =~ "Cannot find canister id" ]] &&
                   entity_manager_canister_eth_address=$(echo "$output" | sed 's/[()]//g' | sed 's/"//g'); do
        printf '.'
        sleep "$timeout"
    done

    echo -e "\nEntity Manager Canister Ethereum Address: $entity_manager_canister_eth_address"
}

function store_canister_address() {
    local var_name="ENTITY_MANAGER_CANISTER_ADDRESS"
    local env_file="$BASE_DIR/blockchain/.env"

    if [[ "$OS_TYPE" == "Linux" ]]; then
        sed -i "s|^$var_name=.*|$var_name=$entity_manager_canister_eth_address|" "$env_file"
    else
      sed -i '' "s|^$var_name=.*|$var_name=$entity_manager_canister_eth_address|" "$env_file"
    fi
}

echo "Starting local environment..."

echo "Starting hardhat node..."
new_terminal_tab "cd '$BASE_DIR/blockchain' && npx hardhat node"

echo "Waiting for hardhat node to start..."
wait_for_connection "localhost:8545"

echo "Starting ngrok..."
new_terminal_tab "ngrok http 8545"

echo "Waiting for ngrok to start..."
wait_for_connection "localhost:4040/api/tunnels" 3
store_ngrok_url

echo "Starting dfx..."
new_terminal_tab "cd '$BASE_DIR/icp/ts-canisters' && npm run start-network"

echo "Waiting for dfx to start..."
wait_for_dfx

echo "Deploying canisters on dfx..."
new_terminal_tab "cd '$BASE_DIR/icp/scripts' && ./deploy-local.sh"
#new_terminal_tab "cd '$BASE_DIR/icp/ts-canisters' && npm run deploy"

echo "Getting entity_manager canister ethereum address..."
entity_manager_canister_eth_address=""
wait_for_canister_address
store_canister_address

echo "Deploying smart contracts on hardhat node..."
new_terminal_tab "cd '$BASE_DIR/blockchain' && npm run deploy -- --network localhost"

echo "Sending initial funds to entity_manager canister..."
new_terminal_tab "cd '$BASE_DIR/blockchain' && npm run send-eth && npm run send-tokens && npm run approve-token-transfer"

echo "Populating canisters with initial data..."
new_terminal_tab "cd '$BASE_DIR/icp/scripts' && ./populate.sh local"

# Only run populate demo if POPULATE_DEMO is true
if [ "$POPULATE_DEMO" = true ]; then
    echo "Populating with demo data..."
    new_iterm_tab "cd '$BASE_DIR/src' && npm run populate-demo"
fi

echo "Starting local environment... Done"
