// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Escrow.sol";

contract EscrowManager is AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event EscrowRegistered(uint256 indexed id, address escrowAddress, address payee, address tokenAddress, address feeRecipientAddress);
    event FeeRecipientUpdated(address feeRecipient);
    event BaseFeeUpdated(uint256 baseFee);
    event PercentageFeeUpdated(uint256 percentageFee);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "EscrowManager: caller is not the admin");
        _;
    }

    address private _admin;
    address private _feeRecipient;
    uint256 private _baseFee;
    uint256 private _percentageFee;
    mapping(uint256 => Escrow) private _escrows;
    // ShipmentId => Escrow
    mapping(uint256 => Escrow) private _escrowsByShipmentId;

    constructor(address feeRecipient, uint256 baseFee, uint256 percentageFee) {
        require(feeRecipient != address(0), "EscrowManager: fee recipient is the zero address");
        require(percentageFee <= 100, "EscrowManager: percentage fee cannot be greater than 100");

        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _admin = _msgSender();

        _feeRecipient = feeRecipient;
        _baseFee = baseFee;
        _percentageFee = percentageFee;
    }

    function getEscrowCounter() public view returns (uint256) {
        return _counter.current();
    }

    function registerEscrow(
        uint256 shipmentId,
        address payee,
        uint256 duration,
        address tokenAddress
    ) public onlyAdmin returns (Escrow) {
        require(payee != address(0), "EscrowManager: payee is the zero address");
        require(duration != 0, "EscrowManager: duration is zero");
        require(tokenAddress != address(0), "EscrowManager: token address is the zero address");

        uint256 id = _counter.current() + 1;
        _counter.increment();

        Escrow newEscrow = new Escrow(address(this), payee, duration, tokenAddress, _feeRecipient, _baseFee, _percentageFee);
        _escrows[id] = newEscrow;
        _escrowsByShipmentId[shipmentId] = newEscrow;
        newEscrow.addAdmin(_msgSender());
        newEscrow.addAdmin(_admin);

        emit EscrowRegistered(id, address(newEscrow), payee, tokenAddress, _feeRecipient);
        return newEscrow;
    }

    function getFeeRecipient() public view returns (address) {
        return _feeRecipient;
    }
    function getBaseFee() public view returns (uint256) {
        return _baseFee;
    }
    function getPercentageFee() public view returns (uint256) {
        return _percentageFee;
    }
    function getEscrow(uint256 id) public view returns (Escrow) {
        return _escrows[id];
    }
    function getEscrowByShipmentId(uint256 shipmentId) public view returns (Escrow) {
        return _escrowsByShipmentId[shipmentId];
    }

    // Updates
    function updateFeeRecipient(address feeRecipient) public onlyAdmin {
        require(feeRecipient != address(0), "EscrowManager: commission address is the zero address");
        require(feeRecipient != _feeRecipient, "EscrowManager: new commission address is the same of the current one");
        _feeRecipient = feeRecipient;
        for(uint256 i = 1; i <= _counter.current(); i++) {
            if(_escrows[i].getLockedAmount() == 0) {
                _escrows[i].updateFeeRecipient(feeRecipient);
            }
        }
        emit FeeRecipientUpdated(feeRecipient);
    }
    function updateBaseFee(uint256 baseFee) public onlyAdmin {
        require(baseFee != _baseFee, "EscrowManager: new base fee is the same of the current one");
        _baseFee = baseFee;
        for(uint256 i = 0; i < _counter.current(); i++) {
            if(_escrows[i].getLockedAmount() == 0) {
                _escrows[i].updateBaseFee(baseFee);
            }
        }
        emit BaseFeeUpdated(baseFee);
    }
    function updatePercentageFee(uint256 percentageFee) public onlyAdmin {
        require(percentageFee != _percentageFee, "EscrowManager: new percentage fee is the same of the current one");
        require(percentageFee <= 100, "EscrowManager: percentage fee cannot be greater than 100");
        _percentageFee = percentageFee;
        for(uint256 i = 0; i < _counter.current(); i++) {
            if(_escrows[i].getLockedAmount() == 0) {
                _escrows[i].updatePercentageFee(percentageFee);
            }
        }
        emit PercentageFeeUpdated(percentageFee);
    }


    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }
    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
