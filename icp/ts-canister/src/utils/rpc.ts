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
} from "../models/Rpc";
import {ethers} from "ethers";
import {calculateRsvForTEcdsa, ecdsaPublicKey, signWithEcdsa} from "./ecdsa";
import {ic, Principal} from 'azle/experimental';
import {getEvmChainId, getEvmRpcCanisterId, getEvmRpcUrl, getSiweProviderCanisterId} from './env';
import {GetAddressResponse} from '../models/Address';

export async function jsonRpcRequest(body: Record<string, any>): Promise<any> {
    if (process.env.CANISTER_ID_EVM_RPC === undefined) {
        throw new Error('process.env.CANISTER_ID_EVM_RPC is not defined');
    }
    const evmRpcCanisterId = process.env.CANISTER_ID_EVM_RPC;
    const jsonRpcSource = {
        Custom: {
            url: getEvmRpcUrl(),
            headers: []
        }
    }
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
    const rpcSource = {
        Custom: {
            chainId: getEvmChainId(),
            services: [{
                url: getEvmRpcUrl(),
                headers: []
            }]
        }
    }

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
    const rpcSource = {
        Custom: {
            chainId: getEvmChainId(),
            services: [{
                url: getEvmRpcUrl(),
                headers: []
            }]
        }
    }

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
    const rpcSource = {
        Custom: {
            chainId: getEvmChainId(),
            services: [{
                url: getEvmRpcUrl(),
                headers: []
            }]
        }
    }
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

export async function ethSendContractTransaction(
    contractAddress: string,
    contractAbi: ethers.InterfaceAbi,
    methodName: string,
    methodArgs: any[]
): Promise<any> {
    const canisterAddress = ethers.computeAddress(
        ethers.hexlify(
            await ecdsaPublicKey([ic.id().toUint8Array()])
        )
    );
    console.log('canisterAddress', canisterAddress);
    const abiInterface = new ethers.Interface(contractAbi);
    const data = abiInterface.encodeFunctionData(methodName, methodArgs);
    //TODO: eth_maxPriorityFeePerGas not available in hardhat
    // const maxPriorityFeePerGas = await ethMaxPriorityFeePerGas();
    const maxPriorityFeePerGas = BigInt(1);
    console.log('maxPriorityFeePerGas', maxPriorityFeePerGas);
    //TODO: eth_maxPriorityFeePerGas not available in hardhat
    // const baseFeePerGas = BigInt(
    //     (await ethFeeHistory()).Consistent?.Ok[0].baseFeePerGas[0]
    // );
    const baseFeePerGas = 300_000_000n;
    console.log('baseFeePerGas', baseFeePerGas);
    const maxFeePerGas = baseFeePerGas * 2n + maxPriorityFeePerGas;
    const gasLimit = 30_000_000n;
    const nonce = await ethGetTransactionCount(canisterAddress);
    console.log('nonce', nonce);
    let tx = ethers.Transaction.from({
        to: contractAddress,
        data,
        value: 0,
        maxPriorityFeePerGas,
        maxFeePerGas,
        gasLimit,
        nonce,
        chainId: getEvmChainId()
    });
    const unsignedSerializedTx = tx.unsignedSerialized;
    const unsignedSerializedTxHash = ethers.keccak256(unsignedSerializedTx);
    console.log('unsignedSerializedTxHash', unsignedSerializedTxHash);
    const signedSerializedTxHash = await signWithEcdsa(
        [ic.id().toUint8Array()],
        ethers.getBytes(unsignedSerializedTxHash)
    );
    const { r, s, v } = calculateRsvForTEcdsa(
        getEvmChainId(),
        canisterAddress,
        unsignedSerializedTxHash,
        signedSerializedTxHash
    );
    tx.signature = {r, s, v};
    const rawTransaction = tx.serialized;
    const resp = await ethSendRawTransaction(rawTransaction);
    if(resp.Consistent.Err){
        console.log('Response', resp.Consistent.Err);
        throw new Error('Received error when sending transaction.');
    }
    return resp;
}

export async function ethCallContract(
    contractAddress: string,
    contractAbi: ethers.InterfaceAbi,
    methodName: string,
    methodArgs: any[],
) {
    const abiInterface = new ethers.Interface(contractAbi);
    const data = abiInterface.encodeFunctionData(methodName, methodArgs);

    const jsonRpcPayload = {
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [
            {
                "to": contractAddress,
                "data": data
            },
            "latest"
        ],
        "id": 1
    }
    const JsonRpcSource = {
        Custom: {
            url: getEvmRpcUrl(),
            headers: []
        }
    }
    const resp = await call(
        getEvmRpcCanisterId(),
        'request',
        {
            paramIdlTypes: [RpcService, IDL.Text, IDL.Nat64],
            returnIdlType: RequestResult,
            args: [JsonRpcSource, JSON.stringify(jsonRpcPayload), 2048],
            payment: 2_000_000_000n
        }
    );

    if(resp.Err) throw new Error('Unable to fetch revocation registry');

    const decodedResult = abiInterface.decodeFunctionResult(methodName, JSON.parse(resp.Ok).result);
    console.log(decodedResult);
    return decodedResult[0];
}

export async function getAddress(principal: Principal): Promise<string> {
    const resp = await call(
        getSiweProviderCanisterId(),
        'get_address',
        {
            paramIdlTypes: [IDL.Vec(IDL.Nat8)],
            returnIdlType: GetAddressResponse,
            args: [principal.toUint8Array()],
        }
    );
    if(resp.Err) throw new Error('Unable to fetch address');
    return resp.Ok;
}
