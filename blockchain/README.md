# _Blockchain_ package

This package defines, tests and deploys the _Solidity_ Smart Contracts of the KBC Coffee Trading Project.

It uses the [Hardhat](https://hardhat.org/) framework as a development environment and testing network.

## Getting Started

1. Move inside the `blockchain` with `cd blockchain`
2. Rename the `.npmrc.template` file to `.npmrc` and fill in the missing information
3. Run `npm i --force` to install the required dependencies
4. Rename the `.env.template` file to `.env` and fill in the missing information
5. Compile smart contracts with `npm run compile`
6. In a new terminal, run `npm run node` for starting the local Hardhat blockchain
7. Deploy the smart contracts with `npm run deploy -- --network localhost`

### `npmrc` Configuration

| Registry name              | Description                                                                                                                                                                                                       |
|----------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `@blockchain-lib:registry` | Needed for **installing** dependencies. It's an access token with read access to the ['common' private npm registry](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all) |

### Environment Variables Configuration

| Variable                          | Description                                                                                                                                        |
|-----------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `FEE_RECIPIENT_ADDRESS`           | An ethereum address to which escrow fees will be sent                                                                                              |
| `ESCROW_BASE_FEE`                 | A natural number representing the fee that will be paid everytime tokens are withdrawn from `escrow.sol` smart contract                            |
| `ESCROW_COMMISSIONER_FEE`         | A natural number between 0 and 100 representing a percentage fee that will be paid everytime tokens are withdrawn from `escrow.sol` smart contract |
| `RPC_URL`                         | The URL of the RPC node to which the smart contracts will be deployed                                                                              |
| `DEPLOYER_PRIVATE_KEY`            | The private key of the account that will deploy the smart contracts                                                                                |
| `TOKEN_OWNER_PRIVATE_KEY`         | The private key of the account where tokens will be sent                                                                                           |
| `ENTITY_MANAGER_CANISTER_ADDRESS` | The address of the entity manager canister                                                                                                         |
| `TOKEN_ADDRESS`                   | The address of the token contract                                                                                                                  |
| `ESCROW_ADDRESS`                  | The address of the escrow contract                                                                                                                 |
| `SUPPLIER_ADDRESS`                | The address of the supplier                                                                                                                        |
| `COMMISSIONER_ADDRESS`            | The address of the commissioner                                                                                                                    |
| `DEFAULT_DEPLOY_NETWORK`          | The network where the smart contracts will be deployed. Check options in `hardhat.config.ts`                                                       |


## Testing

Tests are performed using [Hardhat](https://hardhat.org/) local network and [Chai](https://www.chaijs.com/) and consist of unit tests. You can run test on this package using the following commands:

-   `npm run test`: run tests on all smart contracts
