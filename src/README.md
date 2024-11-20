# _src_ package

This package consists of a _NodeJs_ library that creates TypeScript classes for interacting with the blockchain.

It uses an _Entity-Driver-Service_ model for creating a scalable and maintainable codebase.

## Getting Started

1. Follow the instructions in the `README.md` file inside the `blockchain` folder
2. Move inside the `src` with `cd src`
3. Rename the `.npmrc.template` file to `.npmrc` and fill in the missing information. Check the [npmrc Configuration](#npmrc-configuration) section for more information
4. Run `npm install` to install the required dependencies
5. Make sure to copy the declarations from the `icp` project by running `npm run get-declarations`
6. Rename the `.env.template` file to `.env` and fill in the missing information
7. Run `npm run build` to build the package

### `npmrc` Configuration

If you only need to install packages from the `@isinblockchainteam` scope, create an `.npmrc` file with this content:
```
@isinblockchainteam:registry=https://npm.pkg.github.com/
```

If you also need to push packages to the `@isinblockchainteam` scope, use the format described in the `.npmrc.template` file and fill in the missing information.

## Local development

If you want to develop locally, you can build this package so you can reuse it in the dependent projects. You can do this by running command `npm run build`.

## Testing

Tests are performed using [Jest](https://jestjs.io/) and consist of unit tests and integration tests.

You can run unit tests using `npm run test`.
