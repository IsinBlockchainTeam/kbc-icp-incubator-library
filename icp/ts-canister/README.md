# _ICP_ package
This package defines and deploys the _Internet Computer_ canisters of the KBC Coffee Trading Project.  
It uses the [DFINITY](https://sdk.dfinity.org/docs/index.html) framework as a development environment and testing network.

## Typescript Canister (Azle)
### Getting Started
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

### Azle - starting guide

-   [Installation](#installation)
-   [Deployment](#deployment)

Azle helps you to build secure decentralized/replicated servers in TypeScript or JavaScript on [ICP](https://internetcomputer.org/). The current replication factor is [13-40 times](https://dashboard.internetcomputer.org/subnets).

Please remember that Azle is in beta and thus it may have unknown security vulnerabilities due to the following:

-   Azle is built with various software packages that have not yet reached maturity
-   Azle does not yet have multiple independent security reviews/audits
-   Azle does not yet have many live, successful, continuously operating applications deployed to ICP

## Installation

> Windows is only supported through a Linux virtual environment of some kind, such as [WSL](https://learn.microsoft.com/en-us/windows/wsl/install)

You will need [Node.js 20](#nodejs-20) and [dfx](#dfx) to develop ICP applications with Azle:

### Node.js 20

It's recommended to use nvm to install Node.js 20:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Restart your terminal and then run:

```bash
nvm install 20
```

Check that the installation went smoothly by looking for clean output from the following command:

```bash
node --version
```

### dfx

Install the dfx command line tools for managing ICP applications:

```bash
DFX_VERSION=0.22.0 sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"
```

Check that the installation went smoothly by looking for clean output from the following command:

```bash
dfx --version
```

## Env

To deploy the canister:

```bash
source .env && dfx deploy
```

## Note

Smart contracts ABIs are encoded in the project. If you want to update them, modify the `eth-abi` folder.
