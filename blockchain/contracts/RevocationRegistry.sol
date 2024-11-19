// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract RevocationRegistry {
    event Revoked(address issuer, bytes32 digest);

    mapping(bytes32 => mapping(address => uint)) private revocations;

    function revoke(bytes32 digest) public {
        require (revocations[digest][msg.sender] == 0);
        revocations[digest][msg.sender] = block.number;
        emit Revoked(msg.sender, digest);
    }

    function revoked(address issuer, bytes32 digest) public view returns (uint) {
        return revocations[digest][issuer];
    }
}
