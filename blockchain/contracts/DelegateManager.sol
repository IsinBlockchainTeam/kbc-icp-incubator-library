// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./RevocationRegistry.sol";
import "hardhat/console.sol";


// memberAddress -> can be omitted
// memberCredentialIdHash
// delegatorCredentialExpiryDate
// issuerAddress
//
// membershipSignedProof

// delegateAddress -> can be omitted
// role -> can be omitted
// delegateCredentialIdHash
// delegateCredentialExpiryDate
// delegatorAddress
//
// roleDelegationSignedProof

struct MembershipProof {
    bytes signedProof;
    bytes32 delegatorCredentialIdHash;
    uint256 delegatorCredentialExpiryDate;
    address issuer;
}

struct RoleProof {
    bytes signedProof;
    bytes32 delegateCredentialIdHash;
    uint256 delegateCredentialExpiryDate;
    address delegator;
    MembershipProof membershipProof;
}

contract DelegateManager {
    using ECDSA for bytes32;

    // EIP-712 domain separator
    bytes32 public immutable domainSeparator;

    // The EIP-712 type hash for the IssuingDelegation struct
    bytes32 public constant MEMBERSHIP_TYPE_HASH = keccak256("Membership(address delegatorAddress,bytes32 delegatorCredentialIdHash,uint256 delegatorCredentialExpiryDate)");

    // The EIP-712 type hash for the RoleDelegation struct
    bytes32 public constant ROLE_DELEGATION_TYPE_HASH = keccak256("RoleDelegation(address delegateAddress,string role,bytes32 delegateCredentialIdHash,uint256 delegateCredentialExpiryDate)");

    RevocationRegistry private _revocationRegistry;

    mapping(address => address[]) private _delegates;

    address private _owner;

    constructor(string memory name, string memory version, uint256 chainId, address revocationRegistryAddress) {
        require(revocationRegistryAddress != address(0), "DelegateManager: RevocationRegistry address is the zero address");

        _owner = msg.sender;
        domainSeparator = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(name)),
                keccak256(bytes(version)),
                chainId,
                address(this)
            )
        );

        _revocationRegistry = RevocationRegistry(revocationRegistryAddress);
    }

    function getRevocationRegistry() public view returns (RevocationRegistry) {
        return _revocationRegistry;
    }

    function hasValidRole(RoleProof memory roleProof, string memory role) public view returns (bool) {
        address delegate = tx.origin;

        bytes32 roleDelegationStructHash = keccak256(abi.encode(ROLE_DELEGATION_TYPE_HASH, delegate, keccak256(bytes(role)), roleProof.delegateCredentialIdHash, roleProof.delegateCredentialExpiryDate));
        bytes32 roleDelegationHash = keccak256(abi.encodePacked("\x19\x01", domainSeparator, roleDelegationStructHash));
        address roleDelegationSigner = roleDelegationHash.recover(roleProof.signedProof);
        // If signedProof is different from the reconstructed proof, the two signers are different
        if(roleDelegationSigner != roleProof.delegator) {
            return false;
        }
        // If the delegate credential has been revoked, the delegate is not valid
        if(_revocationRegistry.revoked(roleDelegationSigner, roleProof.delegateCredentialIdHash) != 0) {
            return false;
        }
        // If the delegate credential has expired, the delegate is not valid
        if(roleProof.delegateCredentialExpiryDate < block.timestamp) {
            return false;
        }

        MembershipProof memory membershipProof = roleProof.membershipProof;
        bytes32 membershipStructHash = keccak256(abi.encode(MEMBERSHIP_TYPE_HASH, roleProof.delegator, membershipProof.delegatorCredentialIdHash, membershipProof.delegatorCredentialExpiryDate));
        bytes32 membershipHash = keccak256(abi.encodePacked("\x19\x01", domainSeparator, membershipStructHash));
        address membershipSigner = membershipHash.recover(membershipProof.signedProof);
        // If signedProof is different from the reconstructed proof, the two signers are different
        if(membershipSigner != membershipProof.issuer) {
            return false;
        }
        // If the delegator credential has been revoked, the delegator is not valid and therefore the delegate too
        if(_revocationRegistry.revoked(membershipSigner, membershipProof.delegatorCredentialIdHash) != 0) {
            return false;
        }
        // If the delegator credential has expired, the delegator is not valid and therefore the delegate
        if(membershipProof.delegatorCredentialExpiryDate < block.timestamp) {
            return false;
        }
        // If the issuer is not the owner, the delegate is not authorized
        if(membershipProof.issuer != _owner) {
            return false;
        }

        return true;
    }
}
