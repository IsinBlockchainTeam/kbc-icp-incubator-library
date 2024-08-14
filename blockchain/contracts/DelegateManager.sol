// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "hardhat/console.sol";

contract DelegateManager is Context {
    using ECDSA for bytes32;

    // EIP-712 domain separator
    bytes32 public immutable domainSeparator;

    // The EIP-712 type hash for the RoleDelegation struct
    bytes32 public constant ROLE_DELEGATION_TYPEHASH = keccak256("RoleDelegation(address delegateAddress,string role)");

    mapping(address => address[]) private _delegates;

    constructor(string memory name, string memory version, uint256 chainId) {
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

    function addDelegate(address delegate) public {
        _delegates[_msgSender()].push(delegate);
    }

    function removeDelegate(address delegate) public {
        address[] storage delegates = _delegates[_msgSender()];
        for (uint i = 0; i < delegates.length; i++) {
            if (delegates[i] == delegate) {
                delegates[i] = delegates[delegates.length - 1];
                delegates.pop();
                break;
            }
        }
    }

    function hasRole(bytes memory signedProof, string memory role, address delegator) public view returns (bool) {
        address delegate = _msgSender();
        bytes32 structHash = keccak256(abi.encode(ROLE_DELEGATION_TYPEHASH, delegate, keccak256(bytes(role))));
        bytes32 hash = keccak256(abi.encodePacked("\x19\x01", domainSeparator, structHash));
        address signer = hash.recover(signedProof);
        console.log("Signer: %s", signer);
        console.log("Caller: %s", delegate);
        if(signer != delegator) {
            return false;
        }
        address[] storage delegates = _delegates[signer];
        for (uint i = 0; i < delegates.length; i++) {
            if (delegates[i] == delegate) {
                return true;
            }
        }
        return false;
    }
}
