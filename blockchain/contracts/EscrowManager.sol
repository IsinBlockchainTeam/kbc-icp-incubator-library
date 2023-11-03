// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/escrow/RefundEscrow.sol";

import "hardhat/console.sol";

contract EscrowManager is RefundEscrow, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    uint256 private _deployedAt;
    uint256 private _escrowDuration;

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    constructor(address payable beneficiary_, uint256 escrowDuration_) RefundEscrow(beneficiary_) {
        _deployedAt = block.timestamp;
        _escrowDuration = escrowDuration_;
    }

    function hasExpired() public view returns (bool) {
        return block.timestamp >= _deployedAt + _escrowDuration;
    }

    function withdrawalAllowed2(address payer) public view returns (bool) {
        return hasExpired() || super.withdrawalAllowed(payer);
    }
}