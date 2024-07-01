#!/bin/bash

ROOT_DIR=$PWD
echo "Enable environment variables..."
source ./integration-test/.env

read -p "These tests will be handled by the IDE user interface? (Y/n): " TEST_IDE

smartContractsDeploy () {
  echo "----------------- Deploying smart contracts -----------------"
  cd ../blockchain/scripts
  echo "1) Checking local network..."
  echo "------------------------------------"
# I want to check if node is already running on port 8545
  if $(curl --output /dev/null --silent --head --fail localhost:8545)
  then
      echo "Port 8545 already in use"
      exit 1
  fi

  echo "2) Starting new local network..."
  echo "------------------------------------"
  #create local network
  NODE_ENV=test npx hardhat node &

  #wait until localnetwork is up
  until $(curl --output /dev/null --silent --head --fail localhost:8545); do
      sleep 5
  done

  echo "3) Deploying contracts on local network..."
  echo "------------------------------------"
  #deploy smart contract
  NODE_ENV=test npx hardhat run deploy.ts --network localhost
  cd "$ROOT_DIR"
}

icpCanistersDeploy() {
  echo "----------------- Deploying ICP canisters -----------------"
  if [ -z "$ICP_LIB_PATH" ]; then
    echo "ICP_LIB_PATH is not set"
    exit 1
  fi
  echo "1) Checking local network..."
  echo "------------------------------------"

#  I want to check if the dfx network is already running on port 4943
  if [ -n "$(lsof -t -i:4943)" ]; then
      echo "Port 4943 already in use"
      exit 1
  fi

  echo "2) Starting new local network..."
  echo "------------------------------------"
  # create local network
  nohup dfx start --clean > /dev/null &
  #wait until local network is up
  while true; do
    dfx ping > /dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "ICP network is now up and running!"
      break
    fi
    echo "Waiting..."
    sleep 10
  done
#  echo "Dashboard port: $(dfx info replica-port)"
#  echo "Network port: $(dfx info webserver-port)"

  echo "3) Deploying contracts on local network..."
  echo "------------------------------------"
  cd "$ICP_LIB_PATH"
#  dfx identity get-wallet
  sh ./scripts/deploy-local.sh
  cd "$ROOT_DIR"
}

killLocalNetworks () {
    echo "...Killing local Hardhat and ICP network..."
    echo "------------------------------------"
    PID_HARDHAT_NODE=$(lsof -t -i:8545)
    echo "PID Hardhat node: $PID_HARDHAT_NODE"
    if [ -n "$PID_HARDHAT_NODE" ]; then
      kill -9 "$PID_HARDHAT_NODE"
    fi

#    if [[ "$OSTYPE" == "darwin"* ]]; then
      # MAC OSx
#      kill -9 $(lsof -t -i:8545)
#    else
#      PID=$(netstat -nlp | awk -v port=8545 '$4 ~ port {print $7}' | awk -F"/" '{print $1}')
#      if [ -n "$PID" ]; then
#        kill -9 "$PID"
#      fi
#    fi
    dfx stop
}

killLocalNetworks
icpCanistersDeploy
smartContractsDeploy

if [ ! -z "$TEST_IDE" ] && [[ $TEST_IDE == "n" ]]; then
  cd "$ROOT_DIR"

  echo "4) Running integration tests..."
  echo "------------------------------------"
  NODE_ENV=test npx jest --config ./integration-test/jest.config.ts --runInBand

  IS_FAILED=$?
  killLocalNetworks

  if [ $IS_FAILED -ne 0 ]; then
    echo "At least one test has failed";
    exit 1;
  fi
else
  while :
  do
    echo ""
    read -p "Do you want to run again the tests? (Y/n): " TEST_RUN
    if [ ! -z "$TEST_RUN" ] && [[ $TEST_RUN == "n" ]]; then
      killLocalNetworks
      break
    fi
    killLocalNetworks
    icpCanistersDeploy
    smartContractsDeploy
  done
fi
