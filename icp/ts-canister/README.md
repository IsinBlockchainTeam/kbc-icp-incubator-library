# ICP Canisters
This repository contains the source code for the ICP Canisters used inside the KBC project. The canisters are written using Azle CKD and are deployed on the Internet Computer.

## Getting started
1. Enter the following folder using `cd icp/ts-canister`
2. Rename the `.env.template` file to `.env`
3. Rename the `.env.custom.template` file to `.env.custom` and fill in the required values
4. Install the dependencies using `npm install`
5. In a separate terminal, start the local Internet Computer environment using `dfx start --clean`
6. Deploy the canisters using `npm run deploy`
7. Generate the canister declarations using `npm run generate`
8. Build the package types using `npm run build-types`

### Environment Variables Configuration
| Variable                          | Description                                                                                             |
|-----------------------------------|---------------------------------------------------------------------------------------------------------|
| `EVM_RPC_URL`                     | The URL of the RPC node to where smart contracts have been deployed                                     |
| `EVM_CHAIN_ID`                    | The chain ID of the EVM network where smart contracts have been deployed                                |
| `EVM_ESCROW_MANAGER_ADDRESS`      | The address of the escrow manager contract                                                              |
| `EVM_REVOCATION_REGISTRY_ADDRESS` | The address of the revocation registry contract                                                         |
| `EVM_MEMBERSHIP_ISSUER_ADDRESS`   | The address of the issuer of the membership VC                                                          |
| `EVM_TRANSACTION_TYPE`            | The type of the EVM transaction to be used (v1/v2)                                                      |
| `LOGIN_DURATION`                  | The duration of the login session in milliseconds                                                       |

