// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "hardhat/console.sol";

contract Escrow is AccessControl {
    using Address for address payable;
    using Counters for Counters.Counter;
    Counters.Counter private _counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum State {
        Active,
        Refunding,
        Closed
    }

    event Deposited(uint256 amount);
    event Closed();
    event RefundEnabled();
    event Withdrawn(uint256 amount);
    event Refunded(uint256 amount);


    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Escrow: caller is not the admin");
        _;
    }

    modifier onlyPayee() {
        require(_payee == _msgSender(), "Escrow: caller is not the payee");
        _;
    }

    modifier onlyPayer() {
        require(_payer == _msgSender(), "Escrow: caller is not the payer");
        _;
    }


    address payable private _payee;
    address payable private _payer;
    uint256 private _deployedAt;
    uint256 private _duration;
    State private _state;
    uint256 private _depositAmount;

    // escrow id => escrow
    mapping(uint256 => Escrow) private escrows;


    constructor(address[] memory admins, address payable payee, address payable payer, uint256 duration) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        _payee = payee;
        _payer = payer;
        _deployedAt = block.timestamp;
        _duration = duration;
        _state = State.Active;
        _depositAmount = 0;
    }

    function getPayee() public view returns (address payable) {
        return _payee;
    }

    function getPayer() public view returns (address payable) {
        return _payer;
    }

    function getDeployedAt() public view returns (uint256) {
        return _deployedAt;
    }

    function getDuration() public view returns (uint256) {
        return _duration;
    }

    function getState() public view returns (State) {
        return _state;
    }

    function getDepositAmount() public view returns (uint256) {
        return _depositAmount;
    }

    function getDeadline() public view returns (uint256) {
        return _deployedAt + _duration;
    }

    function hasExpired() public view returns (bool) {
        return block.timestamp >= _deployedAt +_duration;
    }

    function withdrawalAllowed() public view returns (bool) {
        return _state == State.Closed;
    }

    function refundAllowed() public view returns (bool) {
        return _state == State.Refunding || hasExpired();
    }

    function deposit() public payable onlyPayer() {
        require(_state == State.Active, "Escrow: can only deposit while active");
        _depositAmount += msg.value;
        emit Deposited(msg.value);
    }

    function close() public onlyAdmin {
        require(_state == State.Active, "Escrow: can only close while active");
        _state = State.Closed;
        emit Closed();
    }

    function _enableRefund() private {
        require(_state == State.Active, "Escrow: can only enable refunds while active");
        _state = State.Refunding;
        emit RefundEnabled();
    }

    function enableRefund() public onlyAdmin {
        _enableRefund();
    }

    function enableRefundForExpiredEscrow() public {
        require(hasExpired(), "Escrow: can only externally enable refund when escrow has expired");
        _enableRefund();
    }

    function withdraw() public onlyPayee() {
        require(_state == State.Closed, "Escrow: can only withdraw while closed");
        uint256 payment = _depositAmount;
        _depositAmount = 0;
        _payee.sendValue(payment);
        emit Withdrawn(payment);
    }

    function refund() public onlyPayer() {
        require(refundAllowed(), "Escrow: can only refund when allowed");
        uint256 payment = _depositAmount;
        _depositAmount = 0;
        _payer.sendValue(payment);
        emit Refunded(payment);
    }
}