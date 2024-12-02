import { checkAndGetEnvironmentVariable } from '../utils/env';

export class Canister {
    public static get IC_SIWE_PROVIDER_ID(): string {
        return checkAndGetEnvironmentVariable(process.env.CANISTER_ID_IC_SIWE_PROVIDER, 'IC SIWE provider canister ID must be defined');
    }

    public static get EVM_RPC_ID(): string {
        return checkAndGetEnvironmentVariable(process.env.CANISTER_ID_EVM_RPC, 'EVM RPC canister ID must be defined');
    }
}
