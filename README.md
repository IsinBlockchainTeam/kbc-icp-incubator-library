<a name="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

<br />
<div align="center">
  <a href="https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library">
    <img src="https://1e6b12a201.clvaw-cdnwnd.com/75d621de465cb8e4ab4adc116021dc36/200000018-d0baed0bb0/logo-2.jpeg?ph=1e6b12a201" alt="Logo" width="260">
  </a>
  <h3 align="center">KBC ICP Incubator Library</h3>

  <p align="center">
    A comprehensive library for managing on-chain coffee trading operations, combining Solidity smart contracts, ICP canisters, and NodeJS integration.
    <br />
    <a href="##getting-started">Quick Start</a>
    ·
    <a href="https://gitlab-core.supsi.ch/issues">Report Bug</a>
    ·
    <a href="https://gitlab-core.supsi.ch/issues">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#development">Development</a></li>
    <li><a href="#testing">Testing</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About The Project

The KBC ICP Incubator Library defines the logic responsible for managing the on-chain operations of the KBC Coffee Trading Project. It provides a comprehensive solution that combines blockchain smart contracts, Internet Computer Protocol (ICP) canisters, and a user-friendly NodeJS wrapper library.

### Built With

* [![Solidity][Solidity-shield]][Solidity-url]
* [![Rust][Rust-shield]][Rust-url]
* [![ICP][ICP-shield]][ICP-url]
* [![Node.js][Node.js-shield]][Node.js-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Nodejs](https://nodejs.org/en) (v.20.x recommended)
- [Rust](https://www.rust-lang.org/tools/install) (v.1.26.0 recommended)
- [DFX](https://sdk.dfinity.org/docs/quickstart/local-quickstart.html) (v.0.23.0 recommended)

### Installation

1. Clone the repository
   ```sh
   git clone https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library.git
   ```
2. Enter the project directory
   ```sh
   cd kbc-icp-incubator-library
   ```
3. Follow component-specific setup:
    - [Blockchain Setup](blockchain/README.md)
    - [ICP Setup](icp/README.md)
    - [Source Setup](src/README.md)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Project Structure

```
.
├── blockchain/        # Ethereum smart contracts and tests
├── icp/              # Internet Computer Protocol canisters
│   ├── rust-canisters/   # Rust-based canisters
│   └── ts-canisters/     # TypeScript-based canisters
├── src/              # Main source code
│   ├── drivers/      # Service drivers
│   ├── entities/     # Business entities
│   ├── services/     # Business logic
│   └── types/        # Type definitions
└── scripts/          # Utility scripts
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Development

### Starting Local Environment
```sh
./scripts/start-local-environment.sh
```

This script sets up your complete development environment by:
- Starting a local Hardhat node (Ethereum blockchain)
- Configuring Ngrok for external access
- Launching the ICP DFX environment
- Deploying and configuring smart contracts
- Setting up initial funds and data

Each service is launched in a separate terminal tab for easy monitoring.

### Building Canisters
```sh
cd icp && ./scripts/build-canisters.sh
```

### Deploying
```sh
# Local deployment
./icp/scripts/deploy-local.sh

# IC deployment
./icp/scripts/deploy-ic.sh
```

## Testing

Each component includes its own test suite:

```sh
# Blockchain tests
cd blockchain && npm test

# ICP tests
cd icp/ts-canisters && npm test

# Source code tests
cd src && npm test
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Write/update tests
4. Submit a merge request to `main`

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Contact

* [Tommaso Agnola](https://www.linkedin.com/in/tommaso-agnola-882146261/) - tommaso.agnola@supsi.ch
* [Mattia Dell'Oca](https://www.linkedin.com/in/mattia-dell-oca-824782214/) - mattia.delloca@supsi.ch
* [Luca Giussani](https://www.linkedin.com/in/luca-giussani-073396115/) - luca.giussani@supsi.ch
* [Lorenzo Ronzani](https://www.linkedin.com/in/lorenzo-ronzani-658311186/) - lorenzo.ronzani@supsi.ch

Project
Link: [kbc-icp-incubator-library](https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library)

Organization Link: [IsinBlockchainTeam](https://github.com/IsinBlockchainTeam)
<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/IsinBlockchainTeam/kbc-icp-incubator-library.svg?style=github
[contributors-url]: https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/IsinBlockchainTeam/kbc-icp-incubator-library.svg?style=github
[forks-url]: https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library/network/members
[stars-shield]: https://img.shields.io/github/stars/IsinBlockchainTeam/kbc-icp-incubator-library.svg?style=github
[stars-url]: https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library/stargazers
[issues-shield]: https://img.shields.io/github/issues/IsinBlockchainTeam/kbc-icp-incubator-library.svg?style=github
[issues-url]: https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library/issues
[license-shield]: https://img.shields.io/github/license/IsinBlockchainTeam/kbc-icp-incubator-library.svg?style=github
[license-url]: https://github.com/IsinBlockchainTeam/kbc-icp-incubator-library/blob/main/LICENSE.txt
[Solidity-shield]: https://img.shields.io/badge/Solidity-%23363636.svg?style=github&logo=solidity&logoColor=white
[Solidity-url]: https://docs.soliditylang.org/
[ICP-shield]: https://img.shields.io/badge/ICP-000000?style=github&logo=dfinity&logoColor=white
[ICP-url]: https://internetcomputer.org/
[Node.js-shield]: https://img.shields.io/badge/node.js-6DA55F?style=github&logo=node.js&logoColor=white
[Node.js-url]: https://nodejs.org/
[Rust-shield]: https://img.shields.io/badge/rust-%23000000.svg?style=github&logo=rust&logoColor=white
[Rust-url]: https://www.rust-lang.org/
