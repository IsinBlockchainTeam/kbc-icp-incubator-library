# 📦 Coffee trading management lib
NodeJS library providing TypeScript classes for blockchain interaction, built using an Entity-Driver-Service architecture for scalability and maintainability.

---

## 🔍 Prerequisites
- `blockchain` module properly configured
- `icp` module properly configured

## ⚙️ Getting Started
1. Navigate to the library directory:
    ```bash
    cd src
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Copy Azle types:
    ```bash
    npm run get-azle-types
    ```
4. Copy ICP declarations:
    ```bash
    npm run get-declarations
    ```
5. Copy and configure environment:
    ```bash
    cp .env.template .env
    ```
6. Build the package:
    ```bash
    npm run build
    ```

---

## 🧪 Testing
The package uses [Jest](https://jestjs.io/) for both unit and integration testing. To run tests:

```bash
  npm run test
```
