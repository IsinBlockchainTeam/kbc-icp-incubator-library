# Blockchain Smart Contracts 

This project contains the logic of the Smart Contracts and it enables them to be deployed and tested.

## Install dependencies
In order to install the required dependencies:
- create/edit the `.npmrc` file with the missing information specified in `.npmrc.template`
- `npm i --force`

## Deploy Smart Contracts
First you need to create/edit the `.env` file with the missing information specified in `.env.template`.\
You can now deploy new instances of smart contracts, by using: 
- `npm run compile`
- `npm run deploy`

## Ethernal
You can use [Ethernal](https://app.tryethernal.com/transactions), to verify the deployed smart contracts.
To reset the Ethernal cache, you can use: `npm run ethernal:reset`


## Test
You can run tests, by using: \
- `npm run test`: run tests
- `npm run coverage`: run tests with coverage
- `npm run gasReport`: run test with a view of the gas consumption
