# _src_ package
This package consists of a _NodeJs_ library that creates TypeScript classes for interacting with the blockchain.

It uses an _Entity-Driver-Service_ model for creating a scalable and maintainable codebase.

## Getting Started
- Follow the instructions in the `README.md` file inside the `blockchain` folder
- Move inside the `src` with `cd src`
- Rename the `.npmrc.template` file to `.npmrc` and fill in the missing information
- Run `npm i` to install the required dependencies
- Rename the `.env.template` file to `.env` and fill in the missing information

### `npmrc` Configuration
| Variable                      | Description                                                                                                                                                                                                       |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@coffe-trading-lib:registry` | Needed only for **contributing** to this repo. It's an access token with write access to this package's private npm registry                                                                                      |
| `@blockchain-lib:registry`    | Needed for **installing** dependencies. It's an access token with read access to the ['common' private npm registry](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all) |

## Local development
If you want to develop locally, you can build this package so you can reuse it in the dependent projects. You can do this by running command `npm run build`.

## Testing
Tests are performed using [Jest](https://jestjs.io/) and consist of unit tests and integration tests.

You can run unit tests using ```npm run test```.

### Integration Tests
Some testing scenarios have been developed for testing the behavior of smart contracts, starting from the _NodeJs_ library all the way to the blockchain.

For running integration tests, you have two ways:

##### First way - Run by shell:
- move inside the `src` folder
- run command: ```./integration-test/integrationTests.sh``` and press `n`

##### Second way - Run tests handled by IDE
Create a test configuration with Jest with:
- configuration file: absolute path to file `./integration-test/jest.config.ts`
- working directory: absolute path to `src` folder
- jest options: --runInBand
- environment variables: NODE_ENV=test

Now, you have two options for running the integration tests with the IDE test configuration:

**Option 1:**
- move inside the `src` folder
- use the command: ```./integration-test/integrationTests.sh``` and press `Y` or ENTER
- run the previously created test configuration

**Option 2:**
- take the IDE test configuration above
- add a `Before launch` script. Choose option `Run External tool`
- create a new toll by clicking on the `+` button
- use this configuration:
    - program: `/bin/bash`
    - arguments: `./integration-test/runByIDE.sh`
    - working directory: absolute path to `src` folder
    - under `Advanced Options` check the `Synchronize files after execution` and `Open console for tool output` options 

