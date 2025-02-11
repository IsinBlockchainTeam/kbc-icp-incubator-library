# 🔧 ICP Component
This module contains the core ICP canister implementations required for the project's blockchain functionality. The canisters are written in both Rust (for performance-critical operations) and TypeScript (for frontend integration).

---

## ⚙️ Getting Started
1. Navigate to the ICP directory:
    ```bash
    cd icp
    ```
2. Copy and configure environment:
    ```bash
    cp ts-canisters/.env.template ts-canisters/.env
    ```
3. Start local ICP replica:
    ```bash
    dfx start --clean
    ```
4. Build and deploy:
    ```bash
    ./scripts/deploy-local.sh
    ```

---

## 📁 Project Structure
```
icp/
├── rust-canisters/    # Rust implementation
├── ts-canisters/      # TypeScript implementation
└── scripts/           # Usefull scripts
```

---

## 🔨 Development Notes
- Rust canisters handle storage business logic
- TypeScript canisters manage all icp integration
- The .env file contains necessary configuration for TypeScript canisters
- Use deploy-local.sh script for building, generating declarations, and deploying canisters

---

Internal component of the main project. For questions, contact the development team.
