# Library
Common library used for various **SUPSI ISIN DTI blockchain team** projects.
## Build
The library currently depends on smart contract-related types from the `Unece` and `Event Boost` projects, which are created dynamically from the specific ABIs.\
To build the library, it is therefore necessary:
1. Run `npm install`, to install the library dependencies.
2. Compile and generate (typechain) types fot `Supply chain Management` (`Unece`) and `Event Managament` (`Event Boost`) smart contracts running `npm run compile-all`.
3. At this point the ABIs and types of the individual projects should have been created in the `/blockchain-lib/packages/{PACKAGE_NAME}/smart-contracts` folder. 
4. Run `npm run build-all`, to finally build the library.

It is possible to study the use of the library by means of the files in `/blockchain-lib/packages/{PACKAGE_NAME}/__dev__`

## Tests
You can run tests for single packages using:
- `npm run test-supply-chain-mgmt`
- `npm run test-event-mgmt`

## Deploy Smart Contracts
First you need to create/edit the `/blockchain-lib.env`, file with the missing information specified in `/blockchain-lib.env,template`.\
You can now deploy new instances of smart contracts using:
- `npm run deploy-contracts-supply-chain-mgmt`
- `npm run deploy-contracts-event-mgmt`

## Doc
You can generate the documentation (markdown and html) using `npm run generate-doc`.


## Gitlab write token
In the `credentials` folder, present in the project root, a file named `gitlab_write_token` must be created with the content available in the secret channel on discord. Only the `registry-write-token` value is needed.