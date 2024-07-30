// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Address.sol";

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Escrow is AccessControl {
    using Address for address;
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum State {
        Active,
        Withdrawing,
        Refunding
    }

    event EscrowStatusUpdated(State status, uint256 withdrawablePercentage, uint256 refundablePercentage);
    event EscrowDeposited(address depositorAddress, uint256 amount);
    event EscrowWithdrawn(address withDrawerAddress, uint256 amount);
    event EscrowRefunded(address refundedAddress, uint256 amount);

    address private _owner;
    address private _payee;
    uint256 private _deployedAt;
    uint256 private _duration;
    State private _state;
    IERC20 private _token;
    address private _feeRecipient;
    uint256 private _baseFee;
    uint256 private _percentageFee;

    mapping(address => uint256) private _depositedAmount;
    uint256 private _totalDepositedAmount;

    mapping(address => uint256) private _refundedAmount;
    uint256 private _totalRefundedAmount;
    uint256 private _totalWithdrawnAmount;

    uint256 private _refundablePercentage;
    uint256 private _withdrawablePercentage;

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
        _state = State.Active;
        _feeRecipient = feeRecipient;
        _baseFee = baseFee;
        _percentageFee = percentageFee;
        _totalRefundedAmount = 0;
        _totalWithdrawnAmount = 0;
        _refundablePercentage = 0;
        _withdrawablePercentage = 0;
        emit EscrowStatusUpdated(_state, _withdrawablePercentage, _refundablePercentage);
    }

    // Modifiers
    modifier editable() {
        require(_state == State.Active, "Escrow: can only edit while active");
        _;
    }
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Escrow: caller is not the admin");
        _;
    }
    modifier depositable() {
        require(_state == State.Active, "Escrow: can only deposit while active");
        _;
    }
    modifier payerWithdrawable() {
        require(_state == State.Active, "Escrow: can only withdraw while active");
        _;
    }
    modifier payeeWithdrawable() {
        require(_state == State.Withdrawing, "Escrow: can only withdraw while withdrawing");
        _;
    }
    modifier refundable() {
        require(_state == State.Refunding, "Escrow: can only refund while refunding");
        _;
    }

    // Getters
    function getOwner() public view returns (address) {
        return _owner;
    }
    function getPayee() public view returns (address) {
        return _payee;
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
    function getState() public view returns (State) {
        return _state;
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

    function getDepositedAmount() public view returns (uint256) {
        return _depositedAmount[_msgSender()];
    }
    function getTotalDepositedAmount() public view returns (uint256) {
        return _totalDepositedAmount;
    }
    function getRefundedAmount() public view returns (uint256) {
        return _refundedAmount[_msgSender()];
    }
    function getTotalRefundedAmount() public view returns (uint256) {
        return _totalRefundedAmount;
    }
    function getTotalWithdrawnAmount() public view returns (uint256) {
        return _totalWithdrawnAmount;
    }

    function getRefundablePercentage() public view returns (uint256) {
        return _refundablePercentage;
    }
    function getWithdrawablePercentage() public view returns (uint256) {
        return _withdrawablePercentage;
    }
    function getWithdrawableAmount() public view returns (uint256) {
        uint256 balance = _totalDepositedAmount - _totalWithdrawnAmount - _totalRefundedAmount;
        uint256 withdrawableAmount = balance * _withdrawablePercentage / 100;
        return withdrawableAmount;
    }
    function getRefundableAmount(address payer) public view returns (uint256) {
        uint256 balance = _totalDepositedAmount - _totalWithdrawnAmount - _totalRefundedAmount;
        uint256 payerDepositedAmount = _depositedAmount[payer];
        if (balance == 0) {
            return 0;
        }
        uint256 proportion = (payerDepositedAmount * 100) / balance;
        uint256 refundableAmount = (balance * proportion) / 100;
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

    // State updates
    function enableWithdrawal(uint256 withdrawablePercentage) public onlyAdmin {
        require(withdrawablePercentage <= 100, "Escrow: withdrawable percentage cannot be greater than 100");
        _state = State.Withdrawing;
        _withdrawablePercentage = withdrawablePercentage;
        _refundablePercentage = 0;
        emit EscrowStatusUpdated(_state, _withdrawablePercentage, _refundablePercentage);
    }
    function enableRefund(uint256 refundablePercentage) public {
        require(hasRole(ADMIN_ROLE, _msgSender()) || isExpired(), "Escrow: refund could be enable only if you are the admin or the escrow is expired");
        require(refundablePercentage <= 100, "Escrow: refundable percentage cannot be greater than 100");
        _state = State.Refunding;
        _withdrawablePercentage = 0;
        _refundablePercentage = refundablePercentage;
        emit EscrowStatusUpdated(_state, _withdrawablePercentage, _refundablePercentage);
    }

    // Actions
    function deposit(uint256 amount) public depositable {
        require(amount > 0, "Escrow: can only deposit positive amount");

        _token.approve(address(this), amount);
        _token.safeTransferFrom(_msgSender(), address(this), amount);

        _depositedAmount[_msgSender()] += amount;
        _totalDepositedAmount += amount;
        emit EscrowDeposited(_msgSender(), amount);
    }
    function payerWithdraw(uint256 amount) public payerWithdrawable {
        require(amount > 0, "Escrow: can only withdraw positive amount");
        require(amount < _depositedAmount[_msgSender()], "Escrow: can only withdraw up to the deposited amount");

        _token.approve(address(this), amount);
        _token.safeTransferFrom(address(this), _msgSender(), amount);

        _depositedAmount[_msgSender()] -= amount;
        _totalDepositedAmount -= amount;
        emit EscrowWithdrawn(_msgSender(), amount);
    }
    function payeeWithdraw() public payeeWithdrawable {
        uint256 withdrawableAmount = getWithdrawableAmount();
        require(withdrawableAmount > 0, "Escrow: can only withdraw when there is something to withdraw");

        uint256 fees = getFees(withdrawableAmount);
        uint256 payment = withdrawableAmount - fees;
        console.log("payment", payment);

        _token.approve(address(this), withdrawableAmount);
        _token.safeTransferFrom(address(this), _feeRecipient, fees);
        _token.safeTransferFrom(address(this), _payee, payment);

        _totalWithdrawnAmount += withdrawableAmount;
        emit EscrowWithdrawn(_payee, payment);
    }
    function payerRefund() public refundable {
        uint256 refundableAmount = getRefundableAmount(_msgSender());
        require(refundableAmount > 0, "Escrow: can only refund when there is something to refund");

        uint256 fees = getFees(refundableAmount);
        uint256 payment = refundableAmount - fees;

        _token.approve(address(this), refundableAmount);
        _token.safeTransferFrom(address(this), _feeRecipient, fees);
        _token.safeTransferFrom(address(this), _msgSender(), payment);

        _refundedAmount[_msgSender()] += refundableAmount;
        _totalRefundedAmount += refundableAmount;
        emit EscrowRefunded(_msgSender(), payment);
    }

    // Roles
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }
    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
