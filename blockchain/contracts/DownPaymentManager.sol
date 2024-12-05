// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./DownPayment.sol";

contract DownPaymentManager is AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event DownPaymentRegistered(uint256 indexed id, address downPaymentAddress, address payee, address tokenAddress, address feeRecipientAddress);
    event FeeRecipientUpdated(address feeRecipient);
    event BaseFeeUpdated(uint256 baseFee);
    event PercentageFeeUpdated(uint256 percentageFee);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "DownPaymentManager: caller is not the admin");
        _;
    }

    address private _admin;
    address private _feeRecipient;
    uint256 private _baseFee;
    uint256 private _percentageFee;
    mapping(uint256 => DownPayment) private _downPayments;
    // ShipmentId => DownPayment.sol
    mapping(uint256 => DownPayment) private _downPaymentsByShipmentId;

    constructor(address admin, address feeRecipient, uint256 baseFee, uint256 percentageFee) {
        require(admin != address(0), "DownPaymentManager: admin is the zero address");
        require(feeRecipient != address(0), "DownPaymentManager: fee recipient is the zero address");
        require(percentageFee <= 100, "DownPaymentManager: percentage fee cannot be greater than 100");

        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _admin = _msgSender();
        addAdmin(admin);

        _feeRecipient = feeRecipient;
        _baseFee = baseFee;
        _percentageFee = percentageFee;
    }

    function getDownPaymentCounter() public view returns (uint256) {
        return _counter.current();
    }

    function registerDownPayment(
        uint256 shipmentId,
        address payee,
        uint256 duration,
        address tokenAddress
    ) public onlyAdmin returns (DownPayment) {
        require(payee != address(0), "DownPaymentManager: payee is the zero address");
        require(duration != 0, "DownPaymentManager: duration is zero");
        require(tokenAddress != address(0), "DownPaymentManager: token address is the zero address");

        uint256 id = _counter.current() + 1;
        _counter.increment();

        DownPayment newDownPayment = new DownPayment(address(this), payee, duration, tokenAddress, _feeRecipient, _baseFee, _percentageFee);
        _downPayments[id] = newDownPayment;
        _downPaymentsByShipmentId[shipmentId] = newDownPayment;
        newDownPayment.addAdmin(_msgSender());
        newDownPayment.addAdmin(_admin);

        emit DownPaymentRegistered(id, address(newDownPayment), payee, tokenAddress, _feeRecipient);
        return newDownPayment;
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
    function getDownPayment(uint256 id) public view returns (DownPayment) {
        return _downPayments[id];
    }
    function getDownPaymentByShipmentId(uint256 shipmentId) public view returns (DownPayment) {
        return _downPaymentsByShipmentId[shipmentId];
    }

    // Updates
    function updateFeeRecipient(address feeRecipient) public onlyAdmin {
        require(feeRecipient != address(0), "DownPaymentManager: commission address is the zero address");
        require(feeRecipient != _feeRecipient, "DownPaymentManager: new commission address is the same of the current one");
        _feeRecipient = feeRecipient;
        for(uint256 i = 1; i <= _counter.current(); i++) {
            if(_downPayments[i].getLockedAmount() == 0) {
                _downPayments[i].updateFeeRecipient(feeRecipient);
            }
        }
        emit FeeRecipientUpdated(feeRecipient);
    }
    function updateBaseFee(uint256 baseFee) public onlyAdmin {
        require(baseFee != _baseFee, "DownPaymentManager: new base fee is the same of the current one");
        _baseFee = baseFee;
        for(uint256 i = 0; i < _counter.current(); i++) {
            if(_downPayments[i].getLockedAmount() == 0) {
                _downPayments[i].updateBaseFee(baseFee);
            }
        }
        emit BaseFeeUpdated(baseFee);
    }
    function updatePercentageFee(uint256 percentageFee) public onlyAdmin {
        require(percentageFee != _percentageFee, "DownPaymentManager: new percentage fee is the same of the current one");
        require(percentageFee <= 100, "DownPaymentManager: percentage fee cannot be greater than 100");
        _percentageFee = percentageFee;
        for(uint256 i = 0; i < _counter.current(); i++) {
            if(_downPayments[i].getLockedAmount() == 0) {
                _downPayments[i].updatePercentageFee(percentageFee);
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
