export const checkAndGetEnvironmentVariable = (variable: string | undefined, errorMessage?: string): string => {
    if (!variable) throw new Error(errorMessage || `Environment variable is not defined`);
    return variable;
};
export function getSiweProviderCanisterId(): string {
    if (process.env.CANISTER_ID_IC_SIWE_PROVIDER !== undefined) {
        return process.env.CANISTER_ID_IC_SIWE_PROVIDER;
    }

    throw new Error(`process.env.CANISTER_ID_IC_SIWE_PROVIDER is not defined`);
}
export function getProductCategoryManagerCanisterId(): string {
    if (process.env.CANISTER_ID_PRODUCT_CATEGORY_MANAGER !== undefined) {
        return process.env.CANISTER_ID_PRODUCT_CATEGORY_MANAGER;
    }

    throw new Error(`process.env.CANISTER_ID_PRODUCT_CATEGORY_MANAGER is not defined`);
}
export function getEvmRpcCanisterId(): string {
    if (process.env.CANISTER_ID_EVM_RPC !== undefined) {
        return process.env.CANISTER_ID_EVM_RPC;
    }

    throw new Error(`process.env.CANISTER_ID_EVM_RPC is not defined`);
}
export function getShipmentManagerCanisterId(): string {
    if (process.env.CANISTER_ID_SHIPMENT_MANAGER !== undefined) {
        return process.env.CANISTER_ID_SHIPMENT_MANAGER;
    }

    throw new Error(`process.env.CANISTER_ID_SHIPMENT_MANAGER is not defined`);
}
export function getOrderManagerCanisterId(): string {
    if (process.env.CANISTER_ID_ORDER_MANAGER !== undefined) {
        return process.env.CANISTER_ID_ORDER_MANAGER;
    }

    throw new Error(`process.env.CANISTER_ID_ORDER_MANAGER is not defined`);
}
export function getEvmRpcUrl(): string {
    if (process.env.EVM_RPC_URL !== undefined) {
        return process.env.EVM_RPC_URL;
    }

    throw new Error(`process.env.EVM_RPC_URL is not defined`);
}
export function getEvmEscrowManagerAddress(): string {
    if (process.env.EVM_ESCROW_MANAGER_ADDRESS !== undefined) {
        return process.env.EVM_ESCROW_MANAGER_ADDRESS;
    }

    throw new Error(`process.env.EVM_ESCROW_MANAGER_ADDRESS is not defined`);
}
export function getEvmChainId(): number {
    if (process.env.EVM_CHAIN_ID !== undefined) {
        return Number(process.env.EVM_CHAIN_ID);
    }

    throw new Error(`process.env.EVM_CHAIN_ID is not defined`);
}
export function getEvmRevocationRegistryAddress(): string {
    if (process.env.EVM_REVOCATION_REGISTRY_ADDRESS !== undefined) {
        return process.env.EVM_REVOCATION_REGISTRY_ADDRESS;
    }

    throw new Error(`process.env.EVM_REVOCATION_REGISTRY_ADDRESS is not defined`);
}
export function getEvmMembershipIssuerAddress(): string {
    if (process.env.EVM_MEMBERSHIP_ISSUER_ADDRESS !== undefined) {
        return process.env.EVM_MEMBERSHIP_ISSUER_ADDRESS;
    }

    throw new Error(`process.env.EVM_MEMBERSHIP_ISSUER_ADDRESS is not defined`);
}
export function getLoginDuration(): string {
    if (process.env.LOGIN_DURATION !== undefined) {
        return process.env.LOGIN_DURATION;
    }

    throw new Error(`process.env.LOGIN_DURATION is not defined`);
}
export function getDfxNetwork(): string {
    if (process.env.DFX_NETWORK !== undefined) {
        return process.env.DFX_NETWORK;
    }

    throw new Error(`process.env.DFX_NETWORK is not defined`);
}
export function getEvmTransactionType(): string {
    if (process.env.EVM_TRANSACTION_TYPE !== undefined) {
        return process.env.EVM_TRANSACTION_TYPE;
    }

    throw new Error(`process.env.EVM_TRANSACTION_TYPE is not defined`);
}
