# Decentralized Coffee Trading

This project defines the logic responsible for managing the on-chain operations of the KBC Coffee Trading Project.

The module is composed of _Solidity_ smart contracts and a _NodeJs_ library that wraps the blockchain logic, offering the user a set of user-friendly methods for interacting with the blockchain.
Both packages make use of a common library that contains logic shared between similar projects. This library is hosted on a private _npm_ registry.

## Prerequisites

- [Nodejs](https://nodejs.org/en) (v.18.x recommended)
- An access token for the ['common' private npm registry](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all)

## Getting Started

- Navigate to the `blockchain` and follow the instructions in the `README.md` file
- Navigate to the `src` folder and follow the instructions in the `README.md` file
















The project contains the logic to manage operation on-chain by using Smart Order.  
In order to interact with them, a NodeJs library has been developed. It is contained in _src_ folder.  

Both blockchain Smart Contracts and NodeJs library, share a common implementation of some functionalities. 
These are available by a _npm library_ hosted on a private registry. In order to be able to download and install it there are two ways:
1. use the following commands:
   - `npm config set @blockchain-lib:registry https://gitlab-core.supsi.ch/api/v4/projects/230/packages/npm/`
   - `npm config set -- '//gitlab-core.supsi.ch/api/v4/projects/230/packages/npm/:_authToken' "<access_token>"`
2. create/edit the `.npmrc` file with the missing information specified in `.npmrc.template`


## Blockchain folder
This project contains the logic of the Smart Contracts and it enables them to be deployed and tested.

### Install dependencies
In order to install the required dependencies:
- `npm i --force`

### Deploy Smart Contracts
First you need to create/edit the `.env` file with the missing information specified in `.env.template`.\
You can now deploy new instances of smart contracts, by using: 
- `npm run compile`
- `npm run deploy`

### Test
You can run tests, by using: \
- `npm run test`: run tests
- `npm run coverage`: run tests with coverage
- `npm run gasReport`: run test with a view of the gas consumption



## NodeJs library (src folder)

This package represents a NodeJs library that can be used to interact with the blockchain, by using user-friendly methods that are exposed by a service.  
The blockchain logic is handled by smart contracts that are injected into this library.

### Test

#### Unit tests
Every component is unit tested with Jest.  
In order to run, use the command: ```npm run test```

#### Integration tests
Every smart contract has some logic that is already unit tested. In order to test also the entire behaviour or some specific scenarios, integrations tests are made.
##### Run by shell:
- use the command: ```./integration-test/integrationTests.sh``` and press 'n'

##### Run tests handled by IDE
Create a test configuration with Jest with:
- configuration file: ./integration-test/jest.config.ts
- working directory: package root
- jest options: --runInBand
- environment variables: NODE_ENV=test

Option 1:
- use the command: ```./integration-test/integrationTests.sh``` and press 'Y' or ENTER
- run by IDE with the configuration above

Option 2:
- take the IDE test configuration above
- add a before launch script. Choose 'Run External Tool'
- use this configuration:
    - program: /bin/bash
    - arguments: ./integration-test/runByIDE.sh
    - working directory: package root
    - select 'Synchronized file after execution' 

