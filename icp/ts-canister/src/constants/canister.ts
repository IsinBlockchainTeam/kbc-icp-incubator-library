import { checkAndGetEnvironmentVariable } from '../utils/env';

export const CANISTER = {
    PRODUCT_CATEGORY_MANAGER_ID: () =>
        checkAndGetEnvironmentVariable(process.env.CANISTER_ID_PRODUCT_CATEGORY_MANAGER, 'Product category manager canister ID must be defined'),
    DELEGATE_MANAGER_ID: () =>
        checkAndGetEnvironmentVariable(process.env.CANISTER_ID_DELEGATE_MANAGER, 'Delegate manager canister ID must be defined'),
    IC_SIWE_PROVIDER_ID: () =>
        checkAndGetEnvironmentVariable(process.env.CANISTER_ID_IC_SIWE_PROVIDER, 'IC SIWE provider canister ID must be defined'),
    EVM_RPC_ID: () => checkAndGetEnvironmentVariable(process.env.CANISTER_ID_EVM_RPC, 'EVM RPC canister ID must be defined'),
    PROCESS_TYPE_ID: () => checkAndGetEnvironmentVariable(process.env.CANISTER_ID_PROCESS_TYPE_REGISTRY, 'Process type canister ID must be defined'),
    ASSESSMENT_STANDARD_ID: () =>
        checkAndGetEnvironmentVariable(process.env.CANISTER_ID_ASSESSMENT_STANDARD_REGISTRY, 'Assessment standard canister ID must be defined'),
    ASSESSMENT_ASSURANCE_LEVEL_ID: () =>
        checkAndGetEnvironmentVariable(
            process.env.CANISTER_ID_ASSESSMENT_ASSURANCE_LEVEL_REGISTRY,
            'Assessment assurance level canister ID must be defined'
        )
};
