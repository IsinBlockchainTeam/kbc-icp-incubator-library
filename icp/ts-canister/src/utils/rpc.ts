import { call, IDL } from 'azle';
import { ethers } from 'ethers';
import { ic, Principal } from 'azle/experimental';
import {
    IDLFeeHistoryArgs,
    IDLGetTransactionCountArgs,
    IDLMultiFeeHistoryResult,
    IDLMultiGetTransactionCountResult,
    IDLMultiSendRawTransactionResult,
    IDLRequestResult,
    IDLRpcConfig,
    IDLRpcService,
    IDLRpcServices,
    IDLGetAddressResponse
} from '../models/idls';
import { calculateRsvForTEcdsa, ecdsaPublicKey, signWithEcdsa } from './ecdsa';
import { EVM } from '../constants/evm';
import { CANISTER } from '../constants/canister';

export async function jsonRpcRequest(body: Record<string, any>): Promise<any> {
    if (process.env.CANISTER_ID_EVM_RPC === undefined) {
        throw new Error('process.env.CANISTER_ID_EVM_RPC is not defined');
    }
    const evmRpcCanisterId = process.env.CANISTER_ID_EVM_RPC;
    const jsonRpcSource = {
        Custom: {
            url: EVM.RPC_URL(),
            headers: []
        }
    };
    return await call(evmRpcCanisterId, 'request', {
        paramIdlTypes: [IDLRpcService, IDL.Text, IDL.Nat64],
        returnIdlType: IDLRequestResult,
        args: [jsonRpcSource, JSON.stringify(body), 10_000],
        payment: 1_000_000_000n
    });
}
export async function ethMaxPriorityFeePerGas(): Promise<bigint> {
    const response = await jsonRpcRequest({
        jsonrpc: '2.0',
        method: 'eth_maxPriorityFeePerGas',
        params: [],
        id: 1
    });

    console.log('ethMaxPriorityFeePerGas response:', response);
    // TODO improve error handling
    return BigInt(JSON.parse(response.Ok).result);
}
export async function ethFeeHistory(): Promise<any> {
    if (process.env.CANISTER_ID_EVM_RPC === undefined) {
        throw new Error('process.env.CANISTER_ID_EVM_RPC is not defined');
    }
    const evmRpcCanisterId = process.env.CANISTER_ID_EVM_RPC;

    const jsonRpcArgs = {
        // blockCount: 1,
        blockCount: 3,
        newestBlock: {
            Latest: null
        },
        rewardPercentiles: []
    };
    const rpcSource = {
        Custom: {
            chainId: EVM.CHAIN_ID(),
            services: [
                {
                    url: EVM.RPC_URL(),
                    headers: []
                }
            ]
        }
    };
    console.log('ethFeeHistory rpcSource:', rpcSource);

    const result = await call(evmRpcCanisterId, 'eth_feeHistory', {
        paramIdlTypes: [IDLRpcServices, IDL.Opt(IDLRpcConfig), IDLFeeHistoryArgs],
        returnIdlType: IDLMultiFeeHistoryResult,
        args: [rpcSource, [], jsonRpcArgs],
        payment: 1_000_000_000n
    });
    console.log('ethFeeHistory result:', result);
    return result;
    // // TODO improve error handling
    // return await call(
    //     evmRpcCanisterId,
    //     'eth_feeHistory',
    //     {
    //         paramIdlTypes: [IDLRpcServices, IDL.Opt(IDLRpcConfig), IDLFeeHistoryArgs],
    //         returnIdlType: IDLMultiFeeHistoryResult,
    //         args: [rpcSource, [], jsonRpcArgs],
    //         payment: 1_000_000_000n
    //     }
    // );
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
            chainId: EVM.CHAIN_ID(),
            services: [
                {
                    url: EVM.RPC_URL(),
                    headers: []
                }
            ]
        }
    };

    const response = await call(evmRpcCanisterId, 'eth_getTransactionCount', {
        paramIdlTypes: [IDLRpcServices, IDL.Opt(IDLRpcConfig), IDLGetTransactionCountArgs],
        returnIdlType: IDLMultiGetTransactionCountResult,
        args: [rpcSource, [], jsonRpcArgs],
        payment: 1_000_000_000n
    });
    return Number(response.Consistent.Ok);
}

export async function ethSendRawTransaction(rawTransaction: string): Promise<any> {
    if (process.env.CANISTER_ID_EVM_RPC === undefined) {
        throw new Error('process.env.CANISTER_ID_EVM_RPC is not defined');
    }
    const evmRpcCanisterId = process.env.CANISTER_ID_EVM_RPC;
    const rpcSource = {
        Custom: {
            chainId: EVM.CHAIN_ID(),
            services: [
                {
                    url: EVM.RPC_URL(),
                    headers: []
                }
            ]
        }
    };
    return await call(evmRpcCanisterId, 'eth_sendRawTransaction', {
        paramIdlTypes: [IDLRpcServices, IDL.Opt(IDLRpcConfig), IDL.Text],
        returnIdlType: IDLMultiSendRawTransactionResult,
        args: [rpcSource, [], rawTransaction],
        payment: 1_000_000_000n
    });
}

function buildV1Transaction(contractAddress: string, data: string, nonce: number): ethers.Transaction {
    return ethers.Transaction.from({
        to: contractAddress,
        // value: 0,
        gasLimit: 1_000_000,
        // gasPrice: 0,
        type: 0,
        data,
        chainId: EVM.CHAIN_ID(),
        nonce
    });
}

async function buildV2Transaction(contractAddress: string, data: string, nonce: number) {
    const maxPriorityFeePerGas = await ethMaxPriorityFeePerGas();
    console.log('maxPriorityFeePerGas', maxPriorityFeePerGas);
    // TODO: eth_maxPriorityFeePerGas not available in hardhat
    // const resp = await ethFeeHistory();
    // const baseFeePerGas = BigInt(
    //    resp.Consistent?.Ok[0].baseFeePerGas[0]
    // );
    // console.log('baseFeePerGas', baseFeePerGas);
    // const maxFeePerGas = baseFeePerGas * 2n + maxPriorityFeePerGas;

    const provider = new ethers.JsonRpcProvider(EVM.RPC_URL());
    const feeData = await provider.getFeeData();
    const mfpg = feeData.maxFeePerGas?.toString();
    console.log('mfpg', mfpg);

    // console.log('maxFeePerGas', maxFeePerGas);
    if (!mfpg) throw new Error('maxFeePerGas not found');

    return ethers.Transaction.from({
        to: contractAddress,
        value: 0,
        gasLimit: 500_000,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        maxFeePerGas: feeData.maxFeePerGas,
        gasPrice: feeData.gasPrice,
        data,
        chainId: EVM.CHAIN_ID(),
        nonce
    });
}

export async function ethSendContractTransaction(
    contractAddress: string,
    contractAbi: ethers.InterfaceAbi,
    methodName: string,
    methodArgs: any[]
): Promise<any> {
    const canisterAddress = ethers.computeAddress(ethers.hexlify(await ecdsaPublicKey([ic.id().toUint8Array()])));
    // TODO: remove this
    contractAddress = '0xAf1256fE3296112A12eeBa7D4c21719bde5E3945';
    console.log('contractAddress', contractAddress);
    console.log('canisterAddress', canisterAddress);
    console.log('methodArgs', methodArgs);
    const abiInterface = new ethers.Interface(contractAbi);
    const data = abiInterface.encodeFunctionData(methodName, methodArgs);
    // TODO: eth_maxPriorityFeePerGas not available in hardhat

    // const maxPriorityFeePerGas = await ethMaxPriorityFeePerGas();
    // const maxPriorityFeePerGas = 0n;
    // console.log('maxPriorityFeePerGas', maxPriorityFeePerGas);
    // TODO: eth_maxPriorityFeePerGas not available in hardhat
    // const baseFeePerGas = BigInt(
    //     (await ethFeeHistory()).Consistent?.Ok[0].baseFeePerGas[0]
    // );
    // const baseFeePerGas = 0n;
    // console.log('baseFeePerGas', baseFeePerGas);
    // const maxFeePerGas = baseFeePerGas * 2n + maxPriorityFeePerGas;

    // const provider = new ethers.JsonRpcProvider(EVM.RPC_URL());
    // const contract = new ethers.Contract(contractAddress, contractAbi, provider);
    // const populatedTransaction = await contract[methodName].populateTransaction(...methodArgs);
    // console.log('populatedTransaction', populatedTransaction);

    const nonce = await ethGetTransactionCount(canisterAddress);
    console.log('nonce', nonce);
    const tx =
        EVM.TRANSACTION_TYPE() === 'v1' ? buildV1Transaction(contractAddress, data, nonce) : await buildV2Transaction(contractAddress, data, nonce);
    // const tx = ethers.Transaction.from(populatedTransaction);
    // tx.type = 0;
    console.log('tx', tx);
    const unsignedSerializedTx = tx.unsignedSerialized;
    const unsignedSerializedTxHash = ethers.keccak256(unsignedSerializedTx);
    const signedSerializedTxHash = await signWithEcdsa([ic.id().toUint8Array()], ethers.getBytes(unsignedSerializedTxHash));
    const { r, s, v } = calculateRsvForTEcdsa(EVM.CHAIN_ID(), canisterAddress, unsignedSerializedTxHash, signedSerializedTxHash);
    tx.signature = { r, s, v };
    const rawTransaction = tx.serialized;
    const resp = await ethSendRawTransaction(rawTransaction);
    if (resp.Consistent.Err) {
        console.log('Response', resp.Consistent.Err);
        throw new Error('Received error when sending transaction.');
    }
    return resp;
}

export async function ethCallContract(contractAddress: string, contractAbi: ethers.InterfaceAbi, methodName: string, methodArgs: any[]) {
    const abiInterface = new ethers.Interface(contractAbi);
    const data = abiInterface.encodeFunctionData(methodName, methodArgs);

    const jsonRpcPayload = {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [
            {
                to: contractAddress,
                data
            },
            'latest'
        ],
        id: 1
    };
    const JsonRpcSource = {
        Custom: {
            url: EVM.RPC_URL(),
            headers: []
        }
    };
    const resp = await call(CANISTER.EVM_RPC_ID(), 'request', {
        paramIdlTypes: [IDLRpcService, IDL.Text, IDL.Nat64],
        returnIdlType: IDLRequestResult,
        args: [JsonRpcSource, JSON.stringify(jsonRpcPayload), 2048],
        payment: 2_000_000_000n
    });

    if (resp.Err) throw new Error('Unable to fetch revocation registry');

    const decodedResult = abiInterface.decodeFunctionResult(methodName, JSON.parse(resp.Ok).result);
    console.log(decodedResult);
    return decodedResult[0];
}

export async function getAddress(principal: Principal): Promise<string> {
    const resp = await call(CANISTER.IC_SIWE_PROVIDER_ID(), 'get_address', {
        paramIdlTypes: [IDL.Vec(IDL.Nat8)],
        returnIdlType: IDLGetAddressResponse,
        args: [principal.toUint8Array()]
    });
    if (resp.Err) throw new Error('Unable to fetch address');
    return resp.Ok;
}
