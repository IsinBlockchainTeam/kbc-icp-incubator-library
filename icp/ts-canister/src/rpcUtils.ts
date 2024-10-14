import {call, IDL} from "azle";
import {
    FeeHistoryArgs,
    GetTransactionCountArgs,
    MultiFeeHistoryResult,
    MultiGetTransactionCountResult,
    MultiSendRawTransactionResult,
    RequestResult,
    RpcConfig,
    RpcService,
    RpcServices
} from "./models/Rpc";

// const RPC_URL_KEY = 'https://testnet-3achain-rpc.noku.io/';
export const RPC_URL = 'https://d4b9-195-176-32-157.ngrok-free.app';
export const ESCROW_MANAGER_ADDRESS = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
export const CHAIN_ID = 31337;
const jsonRpcSource = {
    Custom: {
        url: RPC_URL,
        headers: []
    }
}
const rpcSource = {
    Custom: {
        chainId: CHAIN_ID,
        services: [{
            url: RPC_URL,
            headers: []
        }]
    }
}
export async function jsonRpcRequest(body: Record<string, any>): Promise<any> {
    if (process.env.CANISTER_ID_EVM_RPC === undefined) {
        throw new Error('process.env.CANISTER_ID_EVM_RPC is not defined');
    }
    const evmRpcCanisterId = process.env.CANISTER_ID_EVM_RPC;
    return await call(
        evmRpcCanisterId,
        'request',
        {
            paramIdlTypes: [RpcService, IDL.Text, IDL.Nat64],
            returnIdlType: RequestResult,
            args: [jsonRpcSource, JSON.stringify(body), 1_000],
            payment: 1_000_000_000n
        }
    );
}
export async function ethMaxPriorityFeePerGas(): Promise<bigint> {
    const response = await jsonRpcRequest({
        jsonrpc: '2.0',
        method: 'eth_maxPriorityFeePerGas',
        params: [],
        id: 1
    });

    console.log(response)
    //TODO improve error handling
    return BigInt(response.Ok.result);
}
export async function ethFeeHistory(): Promise<any> {
    if (process.env.CANISTER_ID_EVM_RPC === undefined) {
        throw new Error('process.env.CANISTER_ID_EVM_RPC is not defined');
    }
    const evmRpcCanisterId = process.env.CANISTER_ID_EVM_RPC;

    const jsonRpcArgs = {
        blockCount: 1,
        newestBlock: {
            Latest: null
        },
        rewardPercentiles: []
    };

    // TODO improve error handling
    return await call(
        evmRpcCanisterId,
        'eth_feeHistory',
        {
            paramIdlTypes: [RpcServices, IDL.Opt(RpcConfig), FeeHistoryArgs],
            returnIdlType: MultiFeeHistoryResult,
            args: [rpcSource, [], jsonRpcArgs],
            payment: 1_000_000_000n
        }
    );
}
export async function ethGetTransactionCount(address: string): Promise<number> {
    if (process.env.CANISTER_ID_EVM_RPC === undefined) {
        throw new Error('process.env.CANISTER_ID_EVM_RPC is not defined');
    }
    const evmRpcCanisterId = process.env.CANISTER_ID_EVM_RPC;
    const jsonRpcArgs = {
        address,
        block: {
            Latest: null
        }
    };

    const response = await call(
        evmRpcCanisterId,
        'eth_getTransactionCount',
        {
            paramIdlTypes: [RpcServices, IDL.Opt(RpcConfig), GetTransactionCountArgs],
            returnIdlType: MultiGetTransactionCountResult,
            args: [rpcSource, [], jsonRpcArgs],
            payment: 1_000_000_000n
        }
    );
    return Number(response.Consistent.Ok);
}

export async function ethSendRawTransaction(
    rawTransaction: string
): Promise<any> {
    if (process.env.CANISTER_ID_EVM_RPC === undefined) {
        throw new Error('process.env.CANISTER_ID_EVM_RPC is not defined');
    }
    const evmRpcCanisterId = process.env.CANISTER_ID_EVM_RPC;
    return await call(
        evmRpcCanisterId,
        'eth_sendRawTransaction',
        {
            paramIdlTypes: [RpcServices, IDL.Opt(RpcConfig), IDL.Text],
            returnIdlType: MultiSendRawTransactionResult,
            args: [rpcSource, [], rawTransaction],
            payment: 1_000_000_000n
        }
    );
}
