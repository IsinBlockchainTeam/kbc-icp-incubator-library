import { checkAndGetEnvironmentVariable } from '../utils/env';

export const CANISTER = {
    IC_SIWE_PROVIDER_ID: () =>
        checkAndGetEnvironmentVariable(process.env.CANISTER_ID_IC_SIWE_PROVIDER, 'IC SIWE provider canister ID must be defined'),
    EVM_RPC_ID: () => checkAndGetEnvironmentVariable(process.env.CANISTER_ID_EVM_RPC, 'EVM RPC canister ID must be defined')
};
