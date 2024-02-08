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
        Locked,
        Refunding,
        Closed
    }

    event EscrowDelegateRegistered(address delegateAddress);
    event EscrowDelegateRemoved(address delegateAddress);
    event EscrowDeposited(address depositorAddress, uint256 amount);
    event EscrowClosed();
    event EscrowRefundEnabled();
    event EscrowWithdrawn(uint256 amount);
    event EscrowRefunded(address refundedAddress, uint256 amount);


    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Escrow: caller is not the admin");
        _;
    }

    modifier onlyPayee() {
        require(_payee == _msgSender(), "Escrow: caller is not the payee");
        _;
    }

    modifier onlyPurchaser() {
        require(_purchaser == _msgSender(), "Escrow: caller is not the purchaser");
        _;
    }

    modifier onlyPayers() {
        require(_isPayer(_msgSender()), "Escrow: caller is not a payer");
        _;
    }

    struct Payer {
        uint256 depositedAmount;
        bool isPresent;
    }

    address private _owner;

    address private _payee;
    address private _purchaser;
    mapping(address => Payer) private _payers;
    address[] private _payerList;
    uint256 private _agreedAmount;
    uint256 private _deployedAt;
    uint256 private _duration;
    State private _state;
    IERC20 private _token;
    address private _commissioner;
    uint256 private _baseFee;
    uint256 private _percentageFee;

    constructor(address admin, address payee, address purchaser, uint256 agreedAmount, uint256 duration, address tokenAddress, address commissioner, uint256 baseFee, uint256 percentageFee) {
        require(payee != address(0), "Escrow: payee is the zero address");
        require(purchaser != address(0), "Escrow: purchaser is the zero address");
        require(tokenAddress != address(0), "Escrow: token address is the zero address");
        require(commissioner != address(0), "Escrow: commissioner is the zero address");
        require(percentageFee <= 100, "Escrow: percentage fee cannot be greater than 100");

        _setupRole(ADMIN_ROLE, admin);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        _owner = payee;

        _payee = payee;
        _purchaser = purchaser;
        _payers[purchaser] = Payer(0, true);
        _payerList.push(purchaser);
        _agreedAmount = agreedAmount;
        _deployedAt = block.timestamp;
        _duration = duration;
        _state = State.Active;
        _commissioner = commissioner;
        _baseFee = baseFee;
        _percentageFee = percentageFee;

        _token = IERC20(tokenAddress);
    }

    function getOwner() public view returns (address) {
        return _owner;
    }

    function _isPayer(address payerAddress) private view returns (bool) {
        return _payers[payerAddress].isPresent;
    }

    function getPayee() public view returns (address) {
        return _payee;
    }

    function getPurchaser() public view returns (address) {
        return _purchaser;
    }

    function getPayers() public view returns (address[] memory) {
        return _payerList;
    }

    function getPayer(address payer) public view returns (Payer memory) {
        require(_isPayer(payer), "Escrow: caller is not a payer");
        return _payers[payer];
    }

    function getAgreedAmount() public view returns (uint256) {
        return _agreedAmount;
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
        return _token.balanceOf(address(this));
    }

    function getToken() public view returns (IERC20) {
        return _token;
    }

    function getTokenAddress() public view returns (address) {
        return address(_token);
    }

    function getCommissioner() public view returns (address) {
        return _commissioner;
    }

    function getBaseFee() public view returns (uint256) {
        return _baseFee;
    }

    function getPercentageFee() public view returns (uint256) {
        return _percentageFee;
    }

    function updateCommissioner(address commissioner) public onlyAdmin {
        require(commissioner != address(0), "Escrow: commissioner is the zero address");
        _commissioner = commissioner;
    }

    function updateBaseFee(uint256 baseFee) public onlyAdmin {
        _baseFee = baseFee;
    }

    function updatePercentageFee(uint256 percentageFee) public onlyAdmin {
        _percentageFee = percentageFee;
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
        return _state == State.Active || _state == State.Refunding || hasExpired();
    }

    function addDelegate(address delegateAddress) public onlyPurchaser {
        require(delegateAddress != address(0), "Escrow: delegate is the zero address");
        _payers[delegateAddress] = Payer(0, true);
        _payerList.push(delegateAddress);
        emit EscrowDelegateRegistered(delegateAddress);
    }

    function removeDelegate(address delegateAddress) public onlyPurchaser {
        require(delegateAddress != _purchaser, "Escrow: purchaser cannot be removed from payers list");
        require(_isPayer(delegateAddress), "Escrow: delegate not present");

        _payers[delegateAddress].depositedAmount = 0;
        _payers[delegateAddress].isPresent = false;

        for (uint256 i = 1; i < _payerList.length; i++) {
            if (_payerList[i] == delegateAddress) {
                _payerList[i] = _payerList[_payerList.length - 1];
                _payerList.pop();
                break;
            }
        }
    }

    function deposit(uint256 amount) public onlyPayers() {
        require(_state == State.Active, "Escrow: can only deposit while active");
        require(amount > 0, "Escrow: can only deposit positive amount");

        _token.safeTransferFrom(_msgSender(), address(this), amount);
        _payers[_msgSender()].depositedAmount += amount;

        emit EscrowDeposited(_msgSender(), amount);
    }

    function lock() public onlyAdmin {
        require(_state == State.Active, "Escrow: can only lock while active");
        _state = State.Locked;
    }

    function close() public onlyAdmin {
        require(_state == State.Active || _state == State.Locked, "Escrow: can only close while active or locked");
        _state = State.Closed;
        emit EscrowClosed();
    }

    function _enableRefund() private {
        require(_state == State.Active || _state == State.Locked, "Escrow: can only enable refunds while active or locked");
        _state = State.Refunding;
        emit EscrowRefundEnabled();
    }

    function enableRefund() public onlyAdmin {
        _enableRefund();
    }

    function enableRefundForExpiredEscrow() public {
        require(hasExpired(), "Escrow: can only externally enable refund when escrow has expired");
        _enableRefund();
    }

    function _payFees(uint256 withdrawal) private returns (uint256) {
        uint256 fees = withdrawal > _baseFee ? _baseFee : withdrawal;
        uint256 expectedPercentageFee = (withdrawal - fees) * _percentageFee / 100;
        fees = expectedPercentageFee > withdrawal - fees ? withdrawal : fees + expectedPercentageFee;

        _token.approve(address(this), fees);
        _token.safeTransferFrom(address(this), _commissioner, fees);
        return fees;
    }

    function withdraw() public onlyPayee() {
        require(_state == State.Closed, "Escrow: can only withdraw while closed");
        uint256 payment = getDepositAmount();


        payment -= _payFees(payment);

        _token.approve(address(this), payment);
        _token.safeTransferFrom(address(this), _payee, payment);

        emit EscrowWithdrawn(payment);
    }

    function refund() public onlyPayers() {
        require(refundAllowed(), "Escrow: can only refund when allowed");

        uint256 payment = _payers[_msgSender()].depositedAmount;
        if(_state == State.Refunding)
            payment -= _payFees(payment);

        _token.approve(address(this), payment);
        _token.safeTransferFrom(address(this), _msgSender(), payment);
        emit EscrowRefunded(_msgSender(), payment);
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
