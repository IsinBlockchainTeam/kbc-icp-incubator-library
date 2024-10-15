import {call, IDL, update} from 'azle';
import {ic, Principal} from 'azle/experimental';
import {ethers} from "ethers";
import {RoleProof} from "./models/Proof";
import {RequestResult, RpcService} from "./models/Rpc";
import revocationRegistryAbi from "../eth-abi/RevocationRegistry.json";
import {GetAddressResponse} from "./models/Address";
import {ROLES} from "./models/Role";
import {
    getEvmMembershipIssuerAddress,
    getEvmRevocationRegistryAddress,
    getEvmRpcCanisterId, getEvmRpcUrl,
    getSiweProviderCanisterId
} from "./utils/env";

class DelegateManager {
    evmRpcCanisterId: string = getEvmRpcCanisterId();
    siweProviderCanisterId: string = getSiweProviderCanisterId();
    evmRpcUrl: string = getEvmRpcUrl();
    evmRevocationRegistryAddress: string = getEvmRevocationRegistryAddress();
    evmMembershipIssuerAddress: string = getEvmMembershipIssuerAddress();
    incrementalRoles = [ROLES.VIEWER, ROLES.EDITOR, ROLES.SIGNER];

    @update([RoleProof, IDL.Principal, IDL.Text], IDL.Bool)
    async hasValidRole(proof: RoleProof, caller: Principal, minimumRole: string): Promise<boolean> {
        const unixTime = Number(ic.time().toString().substring(0, 13));
        const { signedProof, signer: expectedSigner, ...data} = proof;

        const delegateCredentialExpiryDate = Number(data.delegateCredentialExpiryDate);
        const roleProofStringifiedData = JSON.stringify({
            delegateAddress: data.delegateAddress,
            role: data.role,
            delegateCredentialIdHash: data.delegateCredentialIdHash,
            delegateCredentialExpiryDate: delegateCredentialExpiryDate,
        });
        const roleProofSigner = ethers.verifyMessage(roleProofStringifiedData, signedProof);
        // If signedProof is different from the reconstructed proof, the two signers are different
        if(roleProofSigner !== expectedSigner) return false;
        // If the delegate is not at least the minimum role, the delegate is not valid
        if(!this.isAtLeast(data.role, minimumRole)) return false;
        // If the delegate credential has expired, the delegate is not valid
        if(data.delegateCredentialExpiryDate < unixTime) return false;
        // If the caller is not the delegate address, the proof is invalid
        if(await this.getAddress(caller) !== data.delegateAddress) return false;
        // If the delegate credential has been revoked, the delegate is not valid
        if(await this.isRevoked(roleProofSigner, data.delegateCredentialIdHash)) return false;

        const { membershipProof } = data;
        const delegatorCredentialExpiryDate = Number(membershipProof.delegatorCredentialExpiryDate);
        const membershipProofStringifiedData = JSON.stringify({
            delegatorCredentialIdHash: membershipProof.delegatorCredentialIdHash,
            delegatorCredentialExpiryDate: delegatorCredentialExpiryDate,
            delegatorAddress: membershipProof.delegatorAddress,
        });
        const membershipProofSigner = ethers.verifyMessage(membershipProofStringifiedData, membershipProof.signedProof);
        // If the membership proof signer is different from the delegate signer, the proof is invalid
        if(membershipProofSigner !== membershipProof.issuer) return false;
        // If the proof signer is not the owner, the proof is invalid
        if(membershipProofSigner !== this.evmMembershipIssuerAddress) return false;
        // If the delegator is not the signer of the role proof, the proof is invalid
        if(membershipProof.delegatorAddress !== roleProofSigner) return false;
        // If the membership credential has expired, the proof is invalid
        if(membershipProof.delegatorCredentialExpiryDate < unixTime) return false;
        // If the membership credential has been revoked, the proof is invalid
        return !await this.isRevoked(membershipProofSigner, membershipProof.delegatorCredentialIdHash);
    }

    async getAddress(principal: Principal): Promise<string> {
        const resp = await call(
            this.siweProviderCanisterId,
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

    isAtLeast(actualRole: string, minimumRole: string): boolean {
        return this.incrementalRoles.indexOf(actualRole) >= this.incrementalRoles.indexOf(minimumRole);
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
                    "to": this.evmRevocationRegistryAddress,
                    "data": data
                },
                "latest"
            ],
            "id": 1
        }
        const JsonRpcSource = {
            Custom: {
                url: this.evmRpcUrl,
                headers: []
            }
        }
        const resp = await call(
            this.evmRpcCanisterId,
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
        return decodedResult[0] !== 0n;
    }
}
export default DelegateManager;
