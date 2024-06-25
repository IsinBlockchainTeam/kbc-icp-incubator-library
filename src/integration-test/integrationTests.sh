#!/bin/bash

ROOT_DIR=$PWD
cd ../blockchain/scripts

read -p "These tests will be handled by the IDE user interface? (Y/n): " TEST_IDE

smartContractsCleanDeploy () {
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
  local_network_pid=$!

  #wait until localnetwork is up
  until $(curl --output /dev/null --silent --head --fail localhost:8545); do
      sleep 5
  done

  echo "3) Deploying contracts on local network..."
  echo "------------------------------------"
  #deploy smart contract
  NODE_ENV=test npx hardhat run deploy.ts --network localhost
}

icpCanistersDeploy() {
  echo "1) Checking local network..."
  echo "------------------------------------"


#  I want to check if the dfx network is already running on port 4943
  if $(curl --output /dev/null --silent --head --fail localhost:4943)
  then
      echo "Port 4943 already in use"
      exit 1
  fi


  echo "2) Starting new local network..."
  echo "------------------------------------"
  #create local network
  dfx start --clean &
  local_network_pid=$!

  #wait until localnetwork is up
  until $(curl --output /dev/null --silent --head --fail localhost:4943); do
      sleep 5
  done

  echo "3) Deploying contracts on local network..."
  echo "------------------------------------"
  #deploy smart contract
  dfx deploy --network local

}

killLocalNetworks () {
    echo "...Killing local Hardhat and ICP network..."
    echo "------------------------------------"
    #pkill -TERM -P $local_network_pid
    # kill -9 -$(ps -o pgid=$local_network_pid | grep -o '[0-9]*')
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # MAC OSx
      kill -9 $(lsof -t -i:8545)
    else
      PID=$(netstat -nlp | awk -v port=8545 '$4 ~ port {print $7}' | awk -F"/" '{print $1}')
      if [ -n "$PID" ]; then
        kill -9 "$PID"
      fi
    fi
    dfx stop
}

#killLocalNetworks
icpCanistersDeploy

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
    smartContractsCleanDeploy
  done
fi
