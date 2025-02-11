# 🔗 Blockchain Package
This package contains the Solidity smart contracts for the KBC Coffee Trading Project. It leverages [Hardhat](https://hardhat.org/)  for development, testing, and local blockchain simulation.

---

## ⚙️ Getting Started
1. Navigate to the blockchain directory:
    ```bash
    cd blockchain
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Copy and configure environment:
    ```bash
    cp .env.template .env
    ```
4. Compile contracts:
    ```bash
    npm run compile
    ```
5. Start local blockchain (in a new terminal):
    ```bash
    npm run node
    ```
6. Deploy contracts:
    ```bash
    npm run deploy -- --network localhost
    ```

---

## 📝 Environment Variables

| Variable                          | Description                                                                                                                          |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `FEE_RECIPIENT_ADDRESS`           | Ethereum address for down payment fees                                                                                               |
| `DOWN_PAYMENT_BASE_FEE`           | Base fee for withdrawals from `DownPayment.sol`                                                                                      |
| `DOWN_PAYMENT_COMMISSIONER_FEE`   | Percentage fee (0-100) for withdrawals                                                                                               |
| `RPC_URL`                         | RPC node URL for contract deployment                                                                                                 |
| `DEPLOYER_PRIVATE_KEY`            | Private key of the deploying account                                                                                                 |
| `TOKEN_OWNER_PRIVATE_KEY`         | Private key for token recipient account                                                                                              |
| `ENTITY_MANAGER_CANISTER_ADDRESS` | Entity manager canister address                                                                                                      |
| `TOKEN_ADDRESS`                   | Token contract address                                                                                                               |
| `DOWN_PAYMENT_ADDRESS`            | Down payment contract address                                                                                                        |
| `SUPPLIER_ADDRESS`                | Supplier address                                                                                                                     |
| `COMMISSIONER_ADDRESS`            | Commissioner address                                                                                                                 |
| `COMMISSIONER_PRIVATE_KEY`        | Commissioner's private key                                                                                                           |
| `DEFAULT_DEPLOY_NETWORK`          | Target deployment network (see `hardhat.config.ts`)                                                                                  |

---

## 🧪 Testing

The package uses [Hardhat's](https://hardhat.org/) local network with [Chai](https://www.chaijs.com/)  for unit testing. To run tests:

```bash
  npm run test
```
