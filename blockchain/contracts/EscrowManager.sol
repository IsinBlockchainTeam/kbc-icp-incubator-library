// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "hardhat/console.sol";

contract EscrowManager is AccessControl {
    using Address for address payable;
    using Counters for Counters.Counter;
    Counters.Counter private _counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum State {
        Active,
        Refunding,
        Closed
    }

    event EscrowRegistered(uint256 indexed id, address payable beneficiary, address payable payer);
    event Deposited(uint256 id, uint256 amount);
    event Closed(uint256 id);
    event RefundEnabled(uint256 id);
    event Withdrawn(uint256 id, uint256 amount);
    event Refunded(uint256 id, uint256 amount);


    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "EscrowManager: caller is not the admin");
        _;
    }

    modifier onlyBeneficiary(uint256 id) {
        require(escrows[id].beneficiary == _msgSender(), "EscrowManager: caller is not the beneficiary");
        _;
    }

    modifier onlyPayer(uint256 id) {
        require(escrows[id].payer == _msgSender(), "EscrowManager: caller is not the payer");
        _;
    }

    modifier onlyExistingEscrows(uint256 id) {
        require(escrowExists(id), "EscrowManager: escrow does not exist");
        _;
    }

    struct Escrow {
        State state;
        address payable beneficiary;
        address payable payer;
        uint256 depositAmount;
        uint256 deployedAt;
        uint256 duration;
    }

    // escrow id => escrow
    mapping(uint256 => Escrow) private escrows;

    constructor(address[] memory admins) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }
    }
    function _registerEscrow(uint256 id, address payable _beneficiary, address payable _payer, uint256 _duration) private {
        Escrow memory newEscrow = Escrow({
            state: State.Active,
            beneficiary: _beneficiary,
            payer: _payer,
            depositAmount: 0,
            deployedAt: block.timestamp,
            duration: _duration
        });

        escrows[id] = newEscrow;
        emit EscrowRegistered(id, _beneficiary, _payer);
    }

    function registerEscrow(address payable _beneficiary, address payable _payer, uint256 _duration) public returns (uint256) {
        require(_beneficiary != address(0), "EscrowManager: beneficiary is the zero address");
        require(_payer != address(0), "EscrowManager: payer is the zero address");
        uint256 id = _counter.current();
        _counter.increment();
        _registerEscrow(id, _beneficiary, _payer, _duration);
        return id;
    }

    function getEscrow(uint256 id) public view returns (Escrow memory) {
        return escrows[id];
    }

    function getState(uint256 id) public view returns (State) {
        return escrows[id].state;
    }

    function getBeneficiary(uint256 id) public view returns (address payable) {
        return escrows[id].beneficiary;
    }

    function getPayer(uint256 id) public view returns (address payable) {
        return escrows[id].payer;
    }

    function getDepositAmount(uint256 id) public view returns (uint256) {
        return escrows[id].depositAmount;
    }

    function hasExpired(uint256 id) public view returns (bool) {
        return block.timestamp >= escrows[id].deployedAt + escrows[id].duration;
    }

    function withdrawalAllowed(uint256 id) public view returns (bool) {
        return escrows[id].state == State.Closed;
    }

    function refundAllowed(uint256 id) public view returns (bool) {
        return escrows[id].state == State.Refunding || hasExpired(id);
    }

    function escrowExists(uint256 id) public view returns (bool) {
        return (
            escrows[id].beneficiary != address(0) ||
            escrows[id].payer != address(0) ||
            escrows[id].depositAmount != 0 ||
            escrows[id].deployedAt != 0 ||
            escrows[id].duration != 0
        );
    }

    function deposit(uint256 id) public payable onlyExistingEscrows(id) onlyPayer(id) {
        require(escrows[id].state == State.Active, "EscrowManager: can only deposit while active");
        escrows[id].depositAmount += msg.value;
        emit Deposited(id, msg.value);
    }

    function withdraw(uint256 id) public onlyBeneficiary(id) onlyExistingEscrows(id) {
        require(escrows[id].state == State.Closed, "EscrowManager: can only withdraw while closed");
        uint256 payment = escrows[id].depositAmount;
        escrows[id].depositAmount = 0;
        escrows[id].beneficiary.sendValue(payment);
        emit Withdrawn(id, payment);
    }

    function refund(uint256 id) public onlyPayer(id) onlyExistingEscrows(id) {
        require(refundAllowed(id), "EscrowManager: can only refund when allowed");
        uint256 payment = escrows[id].depositAmount;
        escrows[id].depositAmount = 0;
        escrows[id].payer.sendValue(payment);
        emit Refunded(id, payment);
    }

    function close(uint256 id) public onlyAdmin onlyExistingEscrows(id) {
        require(escrows[id].state == State.Active, "EscrowManager: can only close while active");
        escrows[id].state = State.Closed;
        emit Closed(id);
    }

    function enableRefund(uint256 id) public onlyAdmin onlyExistingEscrows(id) {
        require(escrows[id].state == State.Active, "EscrowManager: can only enable refunds while active");
        escrows[id].state = State.Refunding;
        emit RefundEnabled(id);
    }
}