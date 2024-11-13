import {
    getEvmMembershipIssuerAddress,
    getEvmRevocationRegistryAddress,
    getEvmRpcCanisterId,
    getEvmRpcUrl,
    getSiweProviderCanisterId
} from "../utils/env";
import {
    RoleProof,
} from "../models/types";
import {ic, Principal} from "azle/experimental";
import {ethers} from "ethers";
import {call, IDL} from "azle";
import {
    IDLGetAddressResponse,
    IDLRequestResult, IDLRpcService
} from "../models/idls";
import revocationRegistryAbi from "../../eth-abi/RevocationRegistry.json";

class DelegationService {
    private static _instance: DelegationService;
    private _evmRpcCanisterId: string = getEvmRpcCanisterId();
    private _siweProviderCanisterId: string = getSiweProviderCanisterId();
    private _evmRpcUrl: string = getEvmRpcUrl();
    private _evmRevocationRegistryAddress: string = getEvmRevocationRegistryAddress();
    private _evmMembershipIssuerAddress: string = getEvmMembershipIssuerAddress();

    private constructor() {}
    static get instance() {
        if (!DelegationService._instance) {
            DelegationService._instance = new DelegationService();
        }
        return DelegationService._instance;
    }

    async hasValidRoleProof(proof: RoleProof, caller: Principal): Promise<boolean> {
        const unixTime = Math.floor(Number(ic.time().toString().substring(0, 13)) / 1000);
        const { signedProof, signer: expectedSigner, ...data} = proof;

        console.log('validating role proof', proof);

        const delegateCredentialExpiryDate = Number(data.delegateCredentialExpiryDate);
        console.log('delegateCredentialExpiryDate', delegateCredentialExpiryDate);
        const roleProofStringifiedData = JSON.stringify({
            delegateAddress: data.delegateAddress,
            role: data.role,
            delegateCredentialIdHash: data.delegateCredentialIdHash,
            delegateCredentialExpiryDate: delegateCredentialExpiryDate,
        });
        // delegateAddress,
        //     role,
        //     delegateCredentialIdHash,
        //     delegateCredentialExpiryDate: expiryDate
        console.log('roleProofStringifiedData', roleProofStringifiedData);
        const roleProofSigner = ethers.verifyMessage(roleProofStringifiedData, signedProof);
        console.log('roleProofSigner !== expectedSigner', roleProofSigner !== expectedSigner);
        // If signedProof is different from the reconstructed proof, the two signers are different
        if(roleProofSigner !== expectedSigner) return false;
        console.log('after role proof signer check');
        console.log('data.delegateCredentialExpiryDate < unixTime', data.delegateCredentialExpiryDate < unixTime);
        console.log('delegateCredentialExpiryDate < unixTime', delegateCredentialExpiryDate < unixTime);
        console.log('unixTime', unixTime);
        // If the delegate credential has expired, the delegate is not valid
        if(data.delegateCredentialExpiryDate < unixTime) return false;
        console.log('after delegate credential expiry date check');
        // If the caller is not the delegate address, the proof is invalid
        if(await this.getAddress(caller) !== data.delegateAddress) return false;
        // If the delegate credential has been revoked, the delegate is not valid
        if(await this.isRevoked(roleProofSigner, data.delegateCredentialIdHash)) return false;

        console.log('after role checks');

        const { membershipProof } = data;
        console.log('going to cast...');
        const delegatorCredentialExpiryDate = Number(membershipProof.delegatorCredentialExpiryDate);
        console.log('delegatorCredentialExpiryDate', delegatorCredentialExpiryDate);
        const membershipProofStringifiedData = JSON.stringify({
            delegatorCredentialIdHash: membershipProof.delegatorCredentialIdHash,
            delegatorCredentialExpiryDate: delegatorCredentialExpiryDate,
            delegatorAddress: membershipProof.delegatorAddress,
        });
        console.log('membershipProofStringifiedData', membershipProofStringifiedData);
        const membershipProofSigner = ethers.verifyMessage(membershipProofStringifiedData, membershipProof.signedProof);
        console.log('membershipProofSigner !== membershipProof.issuer', membershipProofSigner !== membershipProof.issuer);
        // If the membership proof signer is different from the delegate signer, the proof is invalid
        if(membershipProofSigner !== membershipProof.issuer) return false;
        console.log('after membership proof signer check');
        console.log('membershipProofSigner !== this._evmMembershipIssuerAddress', membershipProofSigner !== this._evmMembershipIssuerAddress);
        // If the proof signer is not the owner, the proof is invalid
        if(membershipProofSigner !== this._evmMembershipIssuerAddress) return false;
        // If the delegator is not the signer of the role proof, the proof is invalid
        if(membershipProof.delegatorAddress !== roleProofSigner) return false;
        // If the membership credential has expired, the proof is invalid
        if(membershipProof.delegatorCredentialExpiryDate < unixTime) return false;
        console.log('after membership checks');
        // If the membership credential has been revoked, the proof is invalid
        return !await this.isRevoked(membershipProofSigner, membershipProof.delegatorCredentialIdHash);
    }

    async getAddress(principal: Principal): Promise<string> {
        const resp = await call(
            this._siweProviderCanisterId,
            'get_address',
            {
                paramIdlTypes: [IDL.Vec(IDL.Nat8)],
                returnIdlType: IDLGetAddressResponse,
                args: [principal.toUint8Array()],
            }
        );
        if(resp.Err) throw new Error('Unable to fetch address');
        return resp.Ok;
    }

    async isRevoked(signer: string, credentialIdHash: string): Promise<boolean> {
        const methodName = "revoked";
        const abiInterface = new ethers.Interface(revocationRegistryAbi.abi);
        const data = abiInterface.encodeFunctionData(methodName, [signer, credentialIdHash]);

        const jsonRpcPayload = {
            "jsonrpc": "2.0",
            "method": "eth_call",
            "params": [
                {
                    "to": this._evmRevocationRegistryAddress,
                    "data": data
                },
                "latest"
            ],
            "id": 1
        }
        const JsonRpcSource = {
            Custom: {
                url: this._evmRpcUrl,
                headers: []
            }
        }
        const resp = await call(
            this._evmRpcCanisterId,
            'request',
            {
                paramIdlTypes: [IDLRpcService, IDL.Text, IDL.Nat64],
                returnIdlType: IDLRequestResult,
                args: [JsonRpcSource, JSON.stringify(jsonRpcPayload), 2048],
                payment: 2_000_000_000n
            }
        );
        if(resp.Err) throw new Error('Unable to fetch revocation registry');

        const decodedResult = abiInterface.decodeFunctionResult(methodName, JSON.parse(resp.Ok).result);
        return decodedResult[0] !== 0n;
    }
}
export default DelegationService;
