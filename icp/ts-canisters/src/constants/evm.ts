import { checkAndGetEnvironmentVariable } from '../utils/env';

export class Evm {
    public static get RPC_URL(): string {
        return checkAndGetEnvironmentVariable(process.env.EVM_RPC_URL, 'EVM RPC URL must be defined');
    }

    public static get ESCROW_MANAGER_ADDRESS(): string {
        return checkAndGetEnvironmentVariable(process.env.EVM_ESCROW_MANAGER_ADDRESS, 'EVM DownPayment.sol Manager Address must be defined');
    }

    public static get CHAIN_ID(): number {
        return Number(checkAndGetEnvironmentVariable(process.env.EVM_CHAIN_ID, 'EVM Chain ID must be defined'));
    }

    public static get REVOCATION_REGISTRY_ADDRESS(): string {
        return checkAndGetEnvironmentVariable(process.env.EVM_REVOCATION_REGISTRY_ADDRESS, 'EVM Revocation Registry Address must be defined');
    }

    public static get MEMBERSHIP_ISSUER_ADDRESS(): string {
        return checkAndGetEnvironmentVariable(process.env.EVM_MEMBERSHIP_ISSUER_ADDRESS, 'EVM Membership Issuer Address must be defined');
    }

    public static get TRANSACTION_TYPE(): string {
        return checkAndGetEnvironmentVariable(process.env.EVM_TRANSACTION_TYPE, 'EVM Transaction Type must be defined');
    }
}
