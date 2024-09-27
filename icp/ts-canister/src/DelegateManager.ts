import {IDL, StableBTreeMap, update, init, query, call} from 'azle';
import { ic, None } from 'azle/experimental';
import { managementCanister } from 'azle/experimental/canisters/management';
import {
    ethers,
    computeAddress,

} from "ethers";
import {Address, RequestResult, RoleProof, RpcService, Tanucchio} from "./types";

const abi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "issuer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "bytes32",
                "name": "digest",
                "type": "bytes32"
            }
        ],
        "name": "Revoked",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "digest",
                "type": "bytes32"
            }
        ],
        "name": "revoke",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "issuer",
                "type": "address"
            },
            {
                "internalType": "bytes32",
                "name": "digest",
                "type": "bytes32"
            }
        ],
        "name": "revoked",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

class DelegateManager {
    domainSeparator: string = "";
    chainId: number = 0;
    MEMBERSHIP_TYPE_HASH: string = "";
    ROLE_DELEGATION_TYPE_HASH: string = "";
    DOMAIN_TYPE_HASH: string = "";
    owner: Address = "0x";
    initialized = false;
    nameHash: string = "";
    versionHash: string = "";
    clearDomainSeparator: any;

    @init([IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text])
    async construct(name: string, version: string, chainId: number, revocationRegistryAddress: string, ownerAddress: Address) {
        // this.chainId = chainId;
        // this.MEMBERSHIP_TYPE_HASH = keccak256(toUtf8Bytes("Membership(address delegatorAddress,bytes32 delegatorCredentialIdHash,uint256 delegatorCredentialExpiryDate)"));
        // this.ROLE_DELEGATION_TYPE_HASH = keccak256(toUtf8Bytes("RoleDelegation(address delegateAddress,string role,bytes32 delegateCredentialIdHash,uint256 delegateCredentialExpiryDate)"));
        // this.DOMAIN_TYPE_HASH = keccak256(toUtf8Bytes("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"));
        // this.owner = ownerAddress;
        // this.nameHash = keccak256(toUtf8Bytes(name));
        // this.versionHash = keccak256(toUtf8Bytes(version));
        // this.clearDomainSeparator = {
        //     chainId,
        //     name,
        //     version
        // }
    }

    @query([IDL.Bool], IDL.Bool)
    canRead(b: boolean): boolean {
        return b;
    }

    @update([Tanucchio], IDL.Bool)
    async hasValidRole(proof: Tanucchio): Promise<boolean> {
        const unixTime = Number(ic.time().toString().substring(0, 13));
        const { signedProof, signer: expectedSigner, ...data} = proof;
        data.delegateCredentialExpiryDate = Number(data.delegateCredentialExpiryDate);
        const stringifiedData = JSON.stringify({
            delegateAddress: data.delegateAddress,
            role: data.role,
            delegateCredentialIdHash: data.delegateCredentialIdHash,
            delegateCredentialExpiryDate: data.delegateCredentialExpiryDate,
        });
        const signer = ethers.verifyMessage(stringifiedData, signedProof);

        // If signedProof is different from the reconstructed proof, the two signers are different
        if(signer !== expectedSigner) return false;
        // If the delegate credential has been revoked, the delegate is not valid
        if(await this.isRevoked(signer, data.delegateCredentialIdHash)) return false;
        // If the delegate credential has expired, the delegate is not valid
        if(data.delegateCredentialExpiryDate < unixTime) return false;



        return true;
    }

    async getAddress(principal: Uint8Array): Promise<Address> {
        const publicKeyResult = await ic.call(
            managementCanister.ecdsa_public_key,
            {
                args: [
                    {
                        canister_id: None,
                        derivation_path: [principal],
                        key_id: {
                            curve: { secp256k1: null },
                            name: 'dfx_test_key'
                        }
                    }
                ]
            }
        );
        return computeAddress("0x" + Buffer.from(publicKeyResult.public_key).toString("hex")) as Address;
    }

    async isRevoked(signer: string, credentialIdHash: string) {
        const methodName = "revoked";
        const contractAddress = "0x946F4Ded379cF96E94387129588B4478e279aFB9";
        const abiInterface = new ethers.Interface(abi);
        const data = abiInterface.encodeFunctionData(methodName, [signer, credentialIdHash]);
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
                url: "https://testnet-3achain-rpc.noku.io/",
                headers: []
            }
        }
        const resp = await call(
            'bd3sg-teaaa-aaaaa-qaaba-cai',
            'request',
            {
                paramIdlTypes: [RpcService, IDL.Text, IDL.Nat64],
                returnIdlType: RequestResult,
                args: [JsonRpcSource, JSON.stringify(jsonRpcPayload), 2048],
                payment: 2_000_000_000n
            }
        );
        console.log(resp);

        if(resp.Err) throw new Error('Unable to fetch revocation registry');

        const decodedResult = abiInterface.decodeFunctionResult(methodName, JSON.parse(resp.Ok).result);
        console.log(decodedResult[0]);
        return decodedResult[0] !== 0n;
    }
}

export default DelegateManager;
