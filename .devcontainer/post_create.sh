#!/bin/sh

# cleanup
rm -rf node_modules || true
rm -rf blockchain/artifacts || true
rm -rf blockchain/cache || true
rm -rf blockchain/event-mgmt/types || true
rm -rf blockchain/supply-chain-mgmt/types || true

npm config set @blockchain-lib:registry https://gitlab-core.supsi.ch/api/v4/projects/230/packages/npm/
npm config set -- '//gitlab-core.supsi.ch/api/v4/projects/230/packages/npm/:_authToken' "$(cat ./credentials/gitlab_write_token)"

# install dependencies
npm i

# compile contracts
npm run compile-smart-contracts

# generating contracts types
npm run event-mgmt-genenerate-contracts-types
npm run supply-chain-mgmt-genenerate-contracts-types

# removes the JS files from the contracts folder
# find /blockchain-lib/src/contracts -name "*.js" -type f -delete

