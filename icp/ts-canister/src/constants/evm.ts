import { checkAndGetEnvironmentVariable } from '../utils/env';

export const EVM = {
    RPC_URL: () => checkAndGetEnvironmentVariable(process.env.EVM_RPC_URL, 'EVM RPC URL must be defined'),
    ESCROW_MANAGER_ADDRESS: () =>
        checkAndGetEnvironmentVariable(process.env.EVM_ESCROW_MANAGER_ADDRESS, 'EVM Escrow Manager Address must be defined'),
    CHAIN_ID: () => Number(checkAndGetEnvironmentVariable(process.env.EVM_CHAIN_ID, 'EVM Chain ID must be defined')),
    REVOCATION_REGISTRY_ADDRESS: () =>
        checkAndGetEnvironmentVariable(process.env.EVM_REVOCATION_REGISTRY_ADDRESS, 'EVM Revocation Registry Address must be defined'),
    MEMBERSHIP_ISSUER_ADDRESS: () =>
        checkAndGetEnvironmentVariable(process.env.EVM_MEMBERSHIP_ISSUER_ADDRESS, 'EVM Membership Issuer Address must be defined')
};
