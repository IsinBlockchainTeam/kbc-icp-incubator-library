#!/bin/bash

ROOT_DIR=$PWD
cd ../blockchain/scripts


smartContractsCleanDeploy () {
  echo "1) Checking local network..."
  echo "------------------------------------"
  if $(curl --output /dev/null --silent --head --fail localhost:8545)
  then
      echo "Port 8545 already in use"
      exit 1
  fi

  echo "2) Starting new local network..."
  echo "------------------------------------"
  #create local network
  NODE_ENV=test nohup npx hardhat node > /dev/null &
  local_network_pid=$!

  #wait until localnetwork is up
  until $(curl --output /dev/null --silent --head --fail localhost:8545); do
      sleep 1
  done

  echo "3) Deploying contracts on local network..."
  echo "------------------------------------"
  #deploy smart contract
  NODE_ENV=test npx hardhat run deploy.ts --network localhost
}

killLocalNetwork () {
    echo "...Killing local network on port 8545..."
    echo "------------------------------------"
    #pkill -TERM -P $local_network_pid
    kill -9 $(lsof -t -i:8545)
    # kill -9 -$(ps -o pgid=$local_network_pid | grep -o '[0-9]*')
}

killLocalNetwork
smartContractsCleanDeploy


