# _Blockchain_ package
This package defines, tests and deploys the _Solidity_ Smart Contracts of the KBC Coffee Trading Project.

It uses the [Hardhat](https://hardhat.org/) framework as a development environment and testing network.

## Getting Started
- Move inside the `blockchain` with `cd blockchain`
- Rename the `.npmrc.template` file to `.npmrc` and fill in the missing information
- Run `npm i --force` to install the required dependencies
- Rename the `.env.template` file to `.env` and fill in the missing information
- Compile smart contracts with `npm run compile`
- In a new terminal, run `npm run node` for starting the local Hardhat blockchain
- Deploy the smart contracts with `npm run deploy`

### `npmrc` Configuration
| Variable                      | Description                                                                                                                                                                                                       |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@coffe-trading-lib:registry` | Needed only for **contributing** to this repo. It's an access token with write access to this package's private npm registry                                                                                      |
| `@blockchain-lib:registry`    | Needed for **installing** dependencies. It's an access token with read access to the ['common' private npm registry](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all) |


### Environment Variable Configuration
| Variable                  | Description                                                                                                                                        |
|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `SUPPLIER_ADMIN`          | An ethereum address that will be used to reference the supplier inside smart contracts                                                             |
| `ESCROW_BASE_FEE`         | A natural number representing the fee that will be paid everytime tokens are withdrawn from `escrow.sol` smart contract                            |
| `ESCROW_COMMISSIONER_FEE` | A natural number between 0 and 100 representing a percentage fee that will be paid everytime tokens are withdrawn from `escrow.sol` smart contract |


## Testing
Tests are performed using [Hardhat](https://hardhat.org/) local network and [Chai](https://www.chaijs.com/) and consist of unit tests. You can run test on this package using the following commands:
- `npm run test`: run tests on all smart contracts
- `npm run coverage`: run tests on all smart contracts detecting the coverage
- `npm run gasReport`: run tests on all smart contracts detecting the gas consumption