# ICP Canisters
This repository contains the source code for the ICP Canisters used inside the KBC project. The canisters are written using Azle CKD and are deployed on the Internet Computer.

## Prerequisites
- Canisters in `rust-canisters` need to have been built and their declarations generated

## Getting started
```bash
DFX_VERSION=0.22.0 sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```
1. Enter the following folder using `cd icp/ts-canister`
2. Rename the `.env.custom.template` file to `.env.custom` and fill in the required values.
3. Install the dependencies using `npm install`
4. In a separate terminal, start the local Internet Computer environment using `dfx start --clean`
5. Deploy the canisters using `npm run deploy`
6. Generate the canister declarations using `npm run generate`
7. Build the package types using `npm run build-types`

### Getting started - by script
1. Move inside the `ts-canister` folder, where there are Typescript files that defines the canisters' logic
2. Run `npm i` to install the required dependencies
3. Run the script `./canisters_lifecycle.sh`. It will:
    - Start the local ICP network
    - Create a `.env` file with the required environment variables
    - Deploy the canisters
    - Populate the canisters with some initial data
    - Build the canisters and generate the `declarations` folder in which there is the Typescript code that can be used to interact with the canisters
4. After the script has finished there are 3 options:
    - Press `u` will update the canisters in case of changes in logic, without losing any data
    - Press `t` will re-create a local network and re-deploy the canisters. This will delete all the data stored in the canisters and start with a clean state
    - Press `q` will quit the script

The point **3** will work also if the console doesn't show the options, you can press the keys and the script will react accordingly.


### Environment Variables Configuration
| Variable                           | Description                                                                                                                                  |
|------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------|
| `EVM_RPC_URL`                      | The URL of the RPC node to where smart contracts have been deployed                                                                          |
| `EVM_CHAIN_ID`                     | The chain ID of the EVM network where smart contracts have been deployed                                                                     |
| `EVM_DOWN_PAYMENT_MANAGER_ADDRESS` | The address of the down payment manager contract                                                                                             |
| `EVM_REVOCATION_REGISTRY_ADDRESS`  | The address of the revocation registry contract                                                                                              |
| `EVM_MEMBERSHIP_ISSUER_ADDRESS`    | The address of the issuer of the membership VC                                                                                               |
| `EVM_TRANSACTION_TYPE`             | The type of the EVM transaction to be used (v1/v2)                                                                                           |
| `LOGIN_DURATION`                   | The duration of the login session in milliseconds                                                                                            |
| `GITLAB_TOKEN`                     | The token for the ['common' private repository](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all) |

