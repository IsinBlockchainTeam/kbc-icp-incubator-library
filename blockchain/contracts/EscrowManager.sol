// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Escrow.sol";

import "hardhat/console.sol";

contract EscrowManager is AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event EscrowRegistered(uint256 indexed id, address escrowAddress, address payee, address purchaser, uint256 agreedAmount, address tokenAddress, address commissionAddress);
    event CommissionerUpdated(address commissionAddress);
    event BaseFeeUpdated(uint256 baseFee);
    event PercentageFeeUpdated(uint256 percentageFee);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "EscrowManager: caller is not the admin");
        _;
    }

    address private _admin;
    address private _commissioner;
    uint256 private _baseFee;
    uint256 private _percentageFee;
    mapping(uint256 => Escrow) private _escrows;
    // mapping(payer => Escrow_id[])
    mapping(address => uint256[]) private _escrowsOfPurchaser;

    constructor(address commissioner, uint256 baseFee, uint256 percentageFee) {
        require(commissioner != address(0), "EscrowManager: commissioner is the zero address");
        require(percentageFee <= 100, "EscrowManager: percentage fee cannot be greater than 100");

        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _admin = _msgSender();

        _commissioner = commissioner;
        _baseFee = baseFee;
        _percentageFee = percentageFee;
    }

    function getEscrowCounter() public view returns (uint256) {
        return _counter.current();
    }

    function registerEscrow(address payee, address purchaser, uint256 agreedAmount, uint256 duration, address tokenAddress) public returns(Escrow)  {
        require(payee != address(0), "EscrowManager: payee is the zero address");
        require(purchaser != address(0), "EscrowManager: purchaser is the zero address");
        require(tokenAddress != address(0), "EscrowManager: token address is the zero address");

        uint256 id = _counter.current() + 1;
        _counter.increment();

        Escrow newEscrow = new Escrow(address(this), payee, purchaser, agreedAmount, duration, tokenAddress, _commissioner, _baseFee, _percentageFee);
        _escrows[id] = newEscrow;
        _escrowsOfPurchaser[purchaser].push(id);
        newEscrow.addAdmin(_admin);

        emit EscrowRegistered(id, address(newEscrow), payee, purchaser, agreedAmount, tokenAddress, _commissioner);
        return newEscrow;
    }

    function getCommissioner() public view returns (address) {
        return _commissioner;
    }

    function updateCommissioner(address commissioner) public onlyAdmin {
        require(commissioner != address(0), "EscrowManager: commission address is the zero address");
        require(commissioner != _commissioner, "EscrowManager: new commission address is the same of the current one");
        _commissioner = commissioner;
        for(uint256 i = 0; i < _counter.current(); i++) {
            if(_escrows[i].getState() == Escrow.State.Active || _escrows[i].getDepositAmount() > 0) {
                _escrows[i].updateCommissioner(commissioner);
            }
        }
        emit CommissionerUpdated(commissioner);
    }

    function getBaseFee() public view returns (uint256) {
        return _baseFee;
    }

    function updateBaseFee(uint256 baseFee) public onlyAdmin {
        require(baseFee != _baseFee, "EscrowManager: new base fee is the same of the current one");
        _baseFee = baseFee;
        for(uint256 i = 0; i < _counter.current(); i++) {
            if(_escrows[i].getState() == Escrow.State.Active || _escrows[i].getDepositAmount() > 0) {
                _escrows[i].updateBaseFee(baseFee);
            }
        }
        emit BaseFeeUpdated(baseFee);
    }

    function getPercentageFee() public view returns (uint256) {
        return _percentageFee;
    }

    function updatePercentageFee(uint256 percentageFee) public onlyAdmin {
        require(percentageFee != _percentageFee, "EscrowManager: new percentage fee is the same of the current one");
        require(percentageFee <= 100, "EscrowManager: percentage fee cannot be greater than 100");
        _percentageFee = percentageFee;
        for(uint256 i = 0; i < _counter.current(); i++) {
            if(_escrows[i].getState() == Escrow.State.Active || _escrows[i].getDepositAmount() > 0) {
                _escrows[i].updatePercentageFee(percentageFee);
            }
        }
        emit PercentageFeeUpdated(percentageFee);
    }

    function getEscrow(uint256 id) public view returns (Escrow) {
        return _escrows[id];
    }

    function getEscrowIdsOfPurchaser(address purchaser) public view returns (uint256[] memory) {
        return _escrowsOfPurchaser[purchaser];
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
