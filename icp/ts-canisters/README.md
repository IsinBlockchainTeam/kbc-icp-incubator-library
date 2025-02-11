# 🔧 ICP Canisters
This repository houses the ICP canister implementations required for the KBC project. The canisters are developed using Azle CKD framework and are designed to run on the Internet Computer infrastructure.

---

## ⚙️ Prerequisites
- Canisters in `../rust-canisters` must be built with generated declarations

---

## 🛠️ Getting Started
1. Navigate to the TypeScript canisters directory:
   ```bash
    cd icp/ts-canister
    ```
2. Copy and configure the environment:
   ```bash
    cp .env.custom.template .env.custom
    ```
3. Install dependencies:
   ```bash
    npm install
    ```
4. Start local Internet Computer (in a separate terminal):
   ```bash
    dfx start --clean
    ```
5. Deploy and build:
   ```bash
    npm run deploy
    npm run generate
    npm run build-types
    ```

---

## 📝 Environment Variables

| Variable                           | Description                               |
|------------------------------------|-------------------------------------------|
| `EVM_RPC_URL`                      | RPC node URL for deployed smart contracts |
| `EVM_CHAIN_ID`                     | Chain ID of the EVM network               |
| `EVM_DOWN_PAYMENT_MANAGER_ADDRESS` | Down payment manager contract address     |
| `EVM_REVOCATION_REGISTRY_ADDRESS`  | Revocation registry contract address      |
| `EVM_MEMBERSHIP_ISSUER_ADDRESS`    | Membership VC issuer address              |
| `EVM_TRANSACTION_TYPE`             | EVM transaction type (v1/v2)              |
| `LOGIN_DURATION`                   | Login session duration in milliseconds    |
| `COURIER_API_KEY`                  | Courier notification provider API key     |

---


Internal component of the KBC project. For questions, contact the development team.
