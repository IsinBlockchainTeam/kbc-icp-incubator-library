// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./RevocationRegistry.sol";

struct RoleProof {
    bytes signedProof;
    address delegator;
    bytes32 delegateCredentialIdHash;
}

contract DelegateManager is AccessControl {
    using ECDSA for bytes32;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DELEGATOR_ROLE = keccak256("DELEGATOR_ROLE");

    // EIP-712 domain separator
    bytes32 public immutable domainSeparator;

    // The EIP-712 type hash for the RoleDelegation struct
    bytes32 public constant ROLE_DELEGATION_TYPEHASH = keccak256("RoleDelegation(address delegateAddress,string role,bytes32 delegateCredentialIdHash)");

    RevocationRegistry private _revocationRegistry;

    mapping(address => address[]) private _delegates;

    constructor(string memory name, string memory version, uint256 chainId, address revocationRegistryAddress) {
        require(revocationRegistryAddress != address(0), "DelegateManager: RevocationRegistry address is the zero address");

        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(DELEGATOR_ROLE, ADMIN_ROLE);

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

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "DelegateManager: Caller is not the admin");
        _;
    }

    modifier onlyDelegator() {
        require(hasRole(DELEGATOR_ROLE, _msgSender()), "DelegateManager: Caller is not a delegator");
        _;
    }

    function getRevocationRegistry() public view returns (RevocationRegistry) {
        return _revocationRegistry;
    }

    function addDelegator(address delegator) public onlyAdmin {
        grantRole(DELEGATOR_ROLE, delegator);
    }

    function removeDelegator(address delegator) public onlyAdmin {
        revokeRole(DELEGATOR_ROLE, delegator);
    }

    function isDelegator(address delegator) public onlyAdmin view returns (bool) {
        return hasRole(DELEGATOR_ROLE, delegator);
    }

    function hasValidRole(RoleProof memory roleProof, string memory role) public view returns (bool) {
        address delegate = tx.origin;
        bytes32 structHash = keccak256(abi.encode(ROLE_DELEGATION_TYPEHASH, delegate, keccak256(bytes(role)), roleProof.delegateCredentialIdHash));
        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        address signer = hash.recover(roleProof.signedProof);

        // If signedProof is different from the reconstructed proof, the two signers are different
        if(signer != roleProof.delegator) {
            return false;
        }
        // If the delegator has not the DELEGATOR_ROLE, they are not a valid delegator
        if(!hasRole(DELEGATOR_ROLE, roleProof.delegator)) {
            return false;
        }

        // If the credential has been revoked, the delegate is not valid
        if(_revocationRegistry.revoked(signer, roleProof.delegateCredentialIdHash) != 0) {
            return false;
        }

        return true;
    }
}
