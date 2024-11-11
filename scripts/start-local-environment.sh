#!/bin/bash

function new_iterm_tab() {
    local command=$1
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

    PWD=$(pwd)
    var_name="EVM_RPC_URL"
    env_file="$PWD/icp/ts-canister/.env.custom"

    sed -i '' "s|^EVM_RPC_URL=.*|EVM_RPC_URL=$ngrok_url|" "$env_file"
}

echo "Starting local environment..."

PWD=$(pwd)

echo "Starting hardhat node..."
new_iterm_tab "cd '$PWD/blockchain' && npx hardhat node"

echo "Waiting for hardhat node to start..."
wait_for_connection "localhost:8545"

echo "Deploying smart contracts on hardhat node..."
new_iterm_tab "cd '$PWD/blockchain' && npm run deploy -- --network localhost"

echo "Starting ngrok..."
new_iterm_tab "ngrok http 8545"

echo "Waiting for ngrok to start..."
wait_for_connection "localhost:4040"
store_ngrok_url

echo "Starting dfx..."
new_iterm_tab "cd '$PWD/icp/ts-canister' && npm run start-network"

echo "Waiting for dfx to start..."
wait_for_dfx

echo "Deploying canisters on dfx..."
new_iterm_tab "cd '$PWD/icp/ts-canister' && npm run deploy"

echo "Starting local environment... Done"