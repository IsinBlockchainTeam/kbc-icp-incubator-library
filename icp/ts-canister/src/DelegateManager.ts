import {IDL, StableBTreeMap, update, init} from 'azle';
import { ic, None } from 'azle/experimental';
import { managementCanister } from 'azle/experimental/canisters/management';
import { toUtf8Bytes, keccak256, AbiCoder } from "ethers";

class DelegateManager {
    domainSeparator: string = "";

    MEMBERSHIP_TYPE_HASH: string = "";

    ROLE_DELEGATION_TYPE_HASH: string = "";

    owner: string = "";

    @init([IDL.Text, IDL.Text, IDL.Nat, IDL.Text])
    init(name: string, version: string, chainId: number, revocationRegistryAddress: string) {
        this.domainSeparator = "TODO: replace me"
        this.MEMBERSHIP_TYPE_HASH = keccak256(toUtf8Bytes("Membership(address delegatorAddress,bytes32 delegatorCredentialIdHash,uint256 delegatorCredentialExpiryDate)"));
        this.ROLE_DELEGATION_TYPE_HASH = keccak256(toUtf8Bytes("RoleDelegation(address delegateAddress,string role,bytes32 delegateCredentialIdHash,uint256 delegateCredentialExpiryDate)"));
        this.owner = "TODO: replace me";

        // // Define the EIP712 domain structure string
        // const eip712Domain = "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)";
        //
        // // Compute the hash of the EIP712Domain structure
        // const domainTypeHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(eip712Domain));
        //
        // // Compute the hash of `name` and `version`
        // const nameHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(name));
        // const versionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(version));
        //
        // // ABI encode the data as required by the Solidity `abi.encode` function
        // const encodedDomain = ethers.utils.defaultAbiCoder.encode(
        //     ["bytes32", "bytes32", "bytes32", "uint256", "address"],
        //     [domainTypeHash, nameHash, versionHash, chainId, verifyingContract]
        // );
        //
        // // Compute the keccak256 hash of the encoded domain (the final domainSeparator)
        // const domainSeparator = ethers.utils.keccak256(encodedDomain);
        //
        //
        //
        // const encoder = new AbiCoder();
        // const encodedDomain = encoder.encode(
        //     ["bytes32", "bytes32", "bytes32", "uint256", "address"],
        //     [domainTypeHash, nameHash, versionHash, chainId, verifyingContract]
        // );

        // const caller = ic.caller().toUint8Array();
        // let publicKeyResult;
        // (async () => {
        //     publicKeyResult = await ic.call(
        //         managementCanister.ecdsa_public_key,
        //         {
        //             args: [
        //                 {
        //                     canister_id: None,
        //                     derivation_path: [caller],
        //                     key_id: {
        //                         curve: { secp256k1: null },
        //                         name: 'dfx_test_key'
        //                     }
        //                 }
        //             ]
        //         }
        //     );
        //     console.log(publicKeyResult);
        // })();

        console.log('DelegateManager initialized')
    }

}

export default DelegateManager;
