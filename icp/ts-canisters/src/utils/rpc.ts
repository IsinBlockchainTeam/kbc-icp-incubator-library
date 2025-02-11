import { call, IDL } from 'azle';
import { ethers } from 'ethers';
import { ic, Principal } from 'azle/experimental';
import {
    IDLGetTransactionCountArgs,
    IDLMultiGetTransactionCountResult,
    IDLMultiSendRawTransactionResult,
    IDLRequestResult,
    IDLRpcConfig,
    IDLRpcService,
    IDLRpcServices,
    IDLGetAddressResponse
} from '../models/idls';
import { calculateRsvForTEcdsa, ecdsaPublicKey, signWithEcdsa } from './ecdsa';
import { Evm } from '../constants/evm';
import { Canister } from '../constants/canister';

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
            chainId: Evm.CHAIN_ID,
            services: [
                {
                    url: Evm.RPC_URL,
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
            chainId: Evm.CHAIN_ID,
            services: [
                {
                    url: Evm.RPC_URL,
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
        gasLimit: 10_000_000,
        // gasPrice: 0,
        type: 0,
        data,
        chainId: Evm.CHAIN_ID,
        nonce
    });
}

async function buildV2Transaction(contractAddress: string, data: string, nonce: number) {
    const provider = new ethers.JsonRpcProvider(Evm.RPC_URL);
    const feeData = await provider.getFeeData();

    return ethers.Transaction.from({
        to: contractAddress,
        value: 0,
        gasLimit: 5_000_000,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        maxFeePerGas: feeData.maxFeePerGas,
        gasPrice: feeData.gasPrice,
        data,
        chainId: Evm.CHAIN_ID,
        nonce
    });
}

export async function ethSendContractTransaction(contractAddress: string, contractAbi: ethers.InterfaceAbi, methodName: string, methodArgs: any[]): Promise<any> {
    const canisterAddress = ethers.computeAddress(ethers.hexlify(await ecdsaPublicKey([ic.id().toUint8Array()])));
    console.log('contractAddress', contractAddress);
    console.log('canisterAddress', canisterAddress);
    console.log('methodArgs', methodArgs);
    const abiInterface = new ethers.Interface(contractAbi);
    const data = abiInterface.encodeFunctionData(methodName, methodArgs);

    const nonce = await ethGetTransactionCount(canisterAddress);
    console.log('nonce', nonce);
    let tx = Evm.TRANSACTION_TYPE === 'v1' ? buildV1Transaction(contractAddress, data, nonce) : await buildV2Transaction(contractAddress, data, nonce);
    console.log('tx', tx);
    const unsignedSerializedTx = tx.unsignedSerialized;
    const unsignedSerializedTxHash = ethers.keccak256(unsignedSerializedTx);
    const signedSerializedTxHash = await signWithEcdsa([ic.id().toUint8Array()], ethers.getBytes(unsignedSerializedTxHash));
    const { r, s, v } = calculateRsvForTEcdsa(Evm.CHAIN_ID, canisterAddress, unsignedSerializedTxHash, signedSerializedTxHash);
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
            url: Evm.RPC_URL,
            headers: []
        }
    };
    const resp = await call(Canister.EVM_RPC_ID, 'request', {
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
    const resp = await call(Canister.IC_SIWE_PROVIDER_ID, 'get_address', {
        paramIdlTypes: [IDL.Vec(IDL.Nat8)],
        returnIdlType: IDLGetAddressResponse,
        args: [principal.toUint8Array()]
    });
    if (resp.Err) throw new Error('Unable to fetch address');
    return resp.Ok;
}
