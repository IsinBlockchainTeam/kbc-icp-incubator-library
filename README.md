# Coffee Trading Management Lib

This project defines the logic responsible for managing the on-chain operations of the KBC Coffee Trading Project.

The module is composed of _Solidity_ smart contracts, _ICP_ canisters and a _NodeJs_ library that wraps the decentralized logic, offering the user a set of user-friendly methods.
The packages make use of a common library that contains logic shared between similar projects. This library is hosted on a private _npm_ registry.

## Prerequisites

- [Git](https://git-scm.com/)
- [Nodejs](https://nodejs.org/en) (v.20.x recommended)
- [Rust](https://www.rust-lang.org/tools/install)
- [DFX](https://sdk.dfinity.org/docs/quickstart/local-quickstart.html)
- An access token for the ['common' private npm registry](https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one_lib_to_rule_them_all)

## Getting Started

1. Clone this repository using command `git clone https://gitlab-core.supsi.ch/dti-isin/giuliano.gremlich/blockchain/one-lib-to-rule-them-all/coffee-trading-management-lib.git`
2. Enter the newly created folder using `cd coffee-trading-management-lib`
3. Change branch to `dev` using command `git checkout dev`
4. Navigate to `blockchain` and follow the instructions in the [`README.md`](blockchain/README.md) file
5. Navigate to `icp` and follow the instructions in the [`README.md`](icp/README.md) file
6. Navigate to `src` folder and follow the instructions in the [`README.md`](src/README.md) file
7. Navigate to `integration-tests` folder and follow the instructions in the [`README.md`](integration-tests/README.md) file
