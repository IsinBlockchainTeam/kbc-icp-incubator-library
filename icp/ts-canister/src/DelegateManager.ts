import {call, IDL, init, update} from 'azle';
import {ic, Principal} from 'azle/experimental';
import {ethers} from "ethers";
import {RoleProof} from "./models/Proof";
import {RequestResult, RpcService} from "./models/Rpc";
import revocationRegistryAbi from "../eth-abi/RevocationRegistry.json";
import {Address, GetAddressResponse} from "./models/Address";

class DelegateManager {
    revocationRegistryAddress: Address = "0x";
    rpcUrl: string = "";
    owner: Address = "0x";
    evmRpcCanisterId: string = getEVMRpcCanisterId();
    siweProviderCanisterId: string = getSiweProviderCanisterId();
    incrementalRoles = ["Viewer", "Editor", "Signer"];


    @init([IDL.Text, IDL.Text])
    async init(revocationRegistryAddress: string, rpcUrl: string): Promise<void> {
        this.revocationRegistryAddress = revocationRegistryAddress as Address;
        this.rpcUrl = rpcUrl;
    }

    @update([RoleProof, IDL.Principal, IDL.Text], IDL.Bool)
    async hasValidRole(proof: RoleProof, caller: Principal, minimumRole: string): Promise<boolean> {
        const unixTime = Number(ic.time().toString().substring(0, 13));
        const { signedProof, signer: expectedSigner, ...data} = proof;
        const delegateCredentialExpiryDate = Number(data.delegateCredentialExpiryDate);
        const stringifiedData = JSON.stringify({
            delegateAddress: data.delegateAddress,
            role: data.role,
            delegateCredentialIdHash: data.delegateCredentialIdHash,
            delegateCredentialExpiryDate: delegateCredentialExpiryDate,
        });
        const signer = ethers.verifyMessage(stringifiedData, signedProof);

        // If the caller is not the delegate address, the proof is invalid
        if(await this.getAddress(caller) !== data.delegateAddress) return false;
        // If signedProof is different from the reconstructed proof, the two signers are different
        if(signer !== expectedSigner) return false;
        // If the delegate credential has been revoked, the delegate is not valid
        if(await this.isRevoked(signer, data.delegateCredentialIdHash)) return false;
        // If the delegate credential has expired, the delegate is not valid
        if(data.delegateCredentialExpiryDate < unixTime) return false;
        // If the delegate is not at least the minimum role, the delegate is not valid
        if(!this.isAtLeast(data.role, minimumRole)) return false;

        return true;
    }

    async getAddress(principal: Principal): Promise<Address> {
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
                    "to": this.revocationRegistryAddress,
                    "data": data
                },
                "latest"
            ],
            "id": 1
        }
        const JsonRpcSource = {
            Custom: {
                url: this.rpcUrl,
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
        console.log(decodedResult[0]);
        return decodedResult[0] !== 0n;
    }
}
function getSiweProviderCanisterId(): string {
    if (process.env.CANISTER_ID_IC_SIWE_PROVIDER !== undefined) {
        return process.env.CANISTER_ID_IC_SIWE_PROVIDER;
    }

    throw new Error(`process.env.CANISTER_ID_IC_SIWE_PROVIDER is not defined`);
}
function getEVMRpcCanisterId(): string {
    if (process.env.CANISTER_ID_EVM_RPC !== undefined) {
        return process.env.CANISTER_ID_EVM_RPC;
    }

    throw new Error(`process.env.CANISTER_ID_EVM_RPC is not defined`);
}

export default DelegateManager;
