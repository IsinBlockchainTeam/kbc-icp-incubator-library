// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract DelegateManager is AccessControl {
    using ECDSA for bytes32;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant DELEGATOR_ROLE = keccak256("DELEGATOR_ROLE");

    // EIP-712 domain separator
    bytes32 public immutable domainSeparator;

    // The EIP-712 type hash for the RoleDelegation struct
    bytes32 public constant ROLE_DELEGATION_TYPEHASH = keccak256("RoleDelegation(address delegateAddress,string role)");

    mapping(address => address[]) private _delegates;

    constructor(string memory name, string memory version, uint256 chainId) {
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
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "DelegateManager: Caller is not the admin");
        _;
    }

    modifier onlyDelegator() {
        require(hasRole(DELEGATOR_ROLE, _msgSender()), "DelegateManager: Caller is not a delegator");
        _;
    }

    function addDelegator(address delegator) public onlyAdmin {
        grantRole(DELEGATOR_ROLE, delegator);
    }

    function removeDelegator(address delegator) public onlyAdmin {
        revokeRole(DELEGATOR_ROLE, delegator);
    }

    function addDelegate(address delegate) public onlyDelegator {
        _delegates[_msgSender()].push(delegate);
    }

    function removeDelegate(address delegate) public onlyDelegator {
        address[] storage delegates = _delegates[_msgSender()];
        for (uint i = 0; i < delegates.length; i++) {
            if (delegates[i] == delegate) {
                delegates[i] = delegates[delegates.length - 1];
                delegates.pop();
                break;
            }
        }
    }

    function hasValidRole(bytes memory signedProof, string memory role, address delegator) public view returns (bool) {
        // TODO: understand why this doesn't work
        // address delegate = _msgSender();
        address delegate = tx.origin;
        bytes32 structHash = keccak256(abi.encode(ROLE_DELEGATION_TYPEHASH, delegate, keccak256(bytes(role))));
        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        address signer = hash.recover(signedProof);

        // If signedProof is different from the reconstructed proof, the two signers are different
        if(signer != delegator) {
            return false;
        }
        // If the delegator has not the DELEGATOR_ROLE, they are not a valid delegator
        if(!hasRole(DELEGATOR_ROLE, delegator)) {
            return false;
        }
        address[] storage delegates = _delegates[signer];
        for (uint i = 0; i < delegates.length; i++) {
            if (delegates[i] == delegate) {
                return true;
            }
        }
        // If the delegate is not part of the delegator's delegates, they are not a valid delegate
        return false;
    }
}
