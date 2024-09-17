// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Escrow is AccessControl {
    using Address for address;
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event EscrowDeposited(address depositorAddress, uint256 amount);
    event EscrowWithdrawn(address withDrawerAddress, uint256 amount);
    event EscrowRefunded(address refundedAddress, uint256 amount);

    address private _owner;
    address private _payee;
    address[] private _payers;
    uint256 private _deployedAt;
    uint256 private _duration;
    IERC20 private _token;
    address private _feeRecipient;
    uint256 private _baseFee;
    uint256 private _percentageFee;

    uint256 private _totalDepositedAmount;
    mapping(address => uint256) private _depositedAmount;
    uint256 private _lockedAmount;

    uint256 private _releasableAmount;
    uint256 private _releasedAmount;

    uint256 private _totalRefundableAmount;
    mapping(address => uint256) private _refundedAmount;
    uint256 private _totalRefundedAmount;

    constructor(address admin, address payee, uint256 duration, address tokenAddress, address feeRecipient, uint256 baseFee, uint256 percentageFee) {
        require(admin != address(0), "Escrow: admin is the zero address");
        require(payee != address(0), "Escrow: payee is the zero address");
        require(duration != 0, "Escrow: duration is zero");
        require(tokenAddress != address(0), "Escrow: token address is the zero address");
        require(feeRecipient != address(0), "Escrow: fee recipient is the zero address");
        require(percentageFee <= 100, "Escrow: percentage fee cannot be greater than 100");

        _setupRole(ADMIN_ROLE, admin);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _owner = payee;
        _payee = payee;
        _deployedAt = block.timestamp;
        _duration = duration;
        _token = IERC20(tokenAddress);
        _feeRecipient = feeRecipient;
        _baseFee = baseFee;
        _percentageFee = percentageFee;

        _totalDepositedAmount = 0;
        _lockedAmount = 0;
        _releasableAmount = 0;
        _releasedAmount = 0;
        _totalRefundableAmount = 0;
        _totalRefundedAmount = 0;
    }

    // Modifiers
    modifier editable() {
        require(_lockedAmount == 0, "Escrow: can only edit while no funds are locked");
        _;
    }
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Escrow: caller is not the admin");
        _;
    }

    // Getters
    function getOwner() public view returns (address) {
        return _owner;
    }
    function getPayee() public view returns (address) {
        return _payee;
    }
    function getPayers() public view returns (address[] memory) {
        return _payers;
    }
    function getDeployedAt() public view returns (uint256) {
        return _deployedAt;
    }
    function getDuration() public view returns (uint256) {
        return _duration;
    }
    function getDeadline() public view returns (uint256) {
        return _deployedAt + _duration;
    }
    function getTokenAddress() public view returns (address) {
        return address(_token);
    }
    function getToken() public view returns (IERC20) {
        return _token;
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
    function getFees(uint256 amount) public view returns (uint256) {
        uint256 fees = amount > _baseFee ? _baseFee : amount;
        uint256 expectedPercentageFee = (amount - fees) * _percentageFee / 100;
        return expectedPercentageFee > amount - fees ? amount : fees + expectedPercentageFee;
    }

    function getTotalDepositedAmount() public view returns (uint256) {
        return _totalDepositedAmount;
    }
    function getDepositedAmount(address payer) public view returns (uint256) {
        return _depositedAmount[payer];
    }
    function getLockedAmount() public view returns (uint256) {
        return _lockedAmount;
    }
    function getReleasableAmount() public view returns (uint256) {
        return _releasableAmount;
    }
    function getReleasedAmount() public view returns (uint256) {
        return _releasedAmount;
    }
    function getTotalRefundableAmount() public view returns (uint256) {
        return _totalRefundableAmount;
    }
    function getRefundedAmount(address payer) public view returns (uint256) {
        return _refundedAmount[payer];
    }
    function getTotalRefundedAmount() public view returns (uint256) {
        return _totalRefundedAmount;
    }
    function getBalance() public view returns (uint256) {
        return _totalDepositedAmount - _releasedAmount - _totalRefundedAmount;
    }

    function getWithdrawableAmount(address payer) public view returns (uint256) {
        uint256 balance = getBalance() - _lockedAmount;
        if (balance == 0) {
            return 0;
        }
        // calculate the proportion of the payer's deposited amount to the total payers deposited amount
        uint256 proportion = (_depositedAmount[payer] * 100) / _totalDepositedAmount;
        // calculate the withdrawable amount based on the proportion
        uint256 withdrawableAmount = (balance * proportion) / 100;
        return withdrawableAmount;
    }
    function getRefundableAmount(uint256 amount, address payer) public view returns (uint256) {
        if (amount == 0 || _totalDepositedAmount == 0) {
            return 0;
        }
        // calculate the proportion of the payer's deposited amount to the total payers deposited amount
        uint256 proportion = (_depositedAmount[payer] * 100) / _totalDepositedAmount;
        // calculate the refundable amount based on the proportion
        uint256 refundableAmount = (amount * proportion) / 100;
        return refundableAmount;
    }

    // Updates
    function updateFeeRecipient(address feeRecipient) public onlyAdmin editable {
        require(feeRecipient != address(0), "Escrow: fee recipient is the zero address");
        require(feeRecipient != _feeRecipient, "Escrow: new fee recipient is the same of the current one");
        _feeRecipient = feeRecipient;
    }
    function updateBaseFee(uint256 baseFee) public onlyAdmin editable {
        _baseFee = baseFee;
    }
    function updatePercentageFee(uint256 percentageFee) public onlyAdmin editable {
        require(percentageFee <= 100, "Escrow: percentage fee cannot be greater than 100");
        _percentageFee = percentageFee;
    }

    // Checks
    function isExpired() public view returns (bool) {
        return block.timestamp >= _deployedAt +_duration;
    }

    // Actions
    function lockFunds(uint256 amount) public onlyAdmin {
        require(amount > 0, "Escrow: can only lock positive amount");
        require(_lockedAmount + amount <= getBalance(), "Escrow: can only lock up to the balance");

        _lockedAmount += amount;
    }
    function releaseFunds(uint256 amount) public onlyAdmin {
        require(amount > 0, "Escrow: can only release positive amount");
        require(amount <= _lockedAmount, "Escrow: can only release up to the locked amount");

        uint256 fees = getFees(amount);
        uint256 payment = amount - fees;

        _token.approve(address(this), amount);
        _token.safeTransferFrom(address(this), _feeRecipient, fees);
        _token.safeTransferFrom(address(this), _payee, payment);

        _lockedAmount -= amount;
        _releasedAmount += amount;
        emit EscrowWithdrawn(_payee, payment);
    }
    function refundFunds(uint256 amount) public onlyAdmin {
        require(amount > 0, "Escrow: can only refund positive amount");
        require(amount <= _lockedAmount, "Escrow: can only refund up to the locked amount");
        // for each payer, calculate the refundable amount and refund it
        for (uint256 i = 0; i < _payers.length; i++) {
            address payer = _payers[i];
            uint256 refundableAmount = getRefundableAmount(amount, payer);
            if (refundableAmount > 0) {
                uint256 fees = getFees(refundableAmount);
                uint256 payment = refundableAmount - fees;

                _token.approve(address(this), refundableAmount);
                _token.safeTransferFrom(address(this), _feeRecipient, fees);
                _token.safeTransferFrom(address(this), payer, payment);

                _refundedAmount[payer] += refundableAmount;
                _totalRefundedAmount += refundableAmount;
                _lockedAmount -= refundableAmount;
                emit EscrowRefunded(payer, payment);
            }
        }
    }
    function deposit(uint256 amount, address payer) public onlyAdmin {
        require(amount > 0, "Escrow: can only deposit positive amount");

        _token.safeTransferFrom(payer, address(this), amount);

        // check if not already a payer
        if(_depositedAmount[payer] == 0)
            _payers.push(payer);

        _depositedAmount[payer] += amount;
        _totalDepositedAmount += amount;
        emit EscrowDeposited(payer, amount);
    }
    function withdraw(uint256 amount) public {
        require(amount > 0, "Escrow: can only withdraw positive amount");
        require(amount <= getWithdrawableAmount(_msgSender()), "Escrow: can only withdraw up to the withdrawable amount");

        _token.approve(address(this), amount);
        _token.safeTransferFrom(address(this), _msgSender(), amount);

        _depositedAmount[_msgSender()] -= amount;
        // remove payer from _payers if no more deposited amount
        if(_depositedAmount[_msgSender()] == 0) {
            for (uint256 i = 0; i < _payers.length; i++) {
                if (_payers[i] == _msgSender()) {
                    _payers[i] = _payers[_payers.length - 1];
                    _payers.pop();
                    break;
                }
            }
        }

        _totalDepositedAmount -= amount;
        emit EscrowWithdrawn(_msgSender(), amount);
    }

    // Roles
    function addAdmin(address admin) public onlyAdmin {
        require(admin != address(0), "Escrow: admin is the zero address");
        grantRole(ADMIN_ROLE, admin);
    }
    function removeAdmin(address admin) public onlyAdmin {
        require(admin != address(0), "Escrow: admin is the zero address");
        revokeRole(ADMIN_ROLE, admin);
    }
}
