import { ethers } from 'ethers';
import { call } from 'azle';
import {EcdsaPublicKeyArgs, EcdsaPublicKeyResult, SignWithEcdsaArgs, SignWithEcdsaResult} from 'azle/canisters/management';
import { getDfxNetwork } from './env';
const MANAGEMENT_CANISTER_ID = 'aaaaa-aa';
export async function signWithEcdsa(
    derivationPath: Uint8Array[],
    messageHash: Uint8Array
): Promise<Uint8Array> {
    const signatureResult = await call(
        MANAGEMENT_CANISTER_ID,
        'sign_with_ecdsa',
        {
            paramIdlTypes: [SignWithEcdsaArgs],
            returnIdlType: SignWithEcdsaResult,
            args: [
                {
                    message_hash: messageHash,
                    derivation_path: derivationPath,
                    key_id: {
                        curve: { secp256k1: null },
                        name: getDfxNetwork() === 'local' ? 'dfx_test_key' : 'key1',
                    }
                }
            ],
            payment: 30_000_000_000n
        }
    );

    return signatureResult.signature;
}

export function calculateRsvForTEcdsa(
    chainId: number,
    address: string,
    digest: string,
    signature: Uint8Array
): { r: string; s: string; v: number } {
    const r = ethers.hexlify(signature.slice(0, 32));
    const s = ethers.hexlify(signature.slice(32, 64));

    const vPartial = chainId * 2 + 35;
    const v0 = vPartial;
    const v1 = vPartial + 1;

    const rsv0 = {
        r,
        s,
        v: v0
    };

    if (
        address.toLowerCase() ===
        ethers.recoverAddress(digest, rsv0).toLowerCase()
    ) {
        return rsv0;
    }

    const rsv1 = {
        r,
        s,
        v: v1
    };

    if (
        address.toLowerCase() ===
        ethers.recoverAddress(digest, rsv1).toLowerCase()
    ) {
        return rsv1;
    }

    throw new Error(`v could not be calculated correctly`);
}
export async function ecdsaPublicKey(
    derivationPath: Uint8Array[]
): Promise<Uint8Array> {
    const response = await call(
        MANAGEMENT_CANISTER_ID,
        'ecdsa_public_key',
        {
            paramIdlTypes: [EcdsaPublicKeyArgs],
            returnIdlType: EcdsaPublicKeyResult,
            args: [
                {
                    canister_id: [],
                    derivation_path: derivationPath,
                    key_id: {
                        curve: { secp256k1: null },
                        name: getDfxNetwork() === 'local' ? 'dfx_test_key' : 'key1',
                    }
                }
            ]
        }
    );
    return response.public_key;
}
