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
    using Counters for Counters.Counter;
    using SafeERC20 for IERC20;
    Counters.Counter private _counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum State {
        Active,
        Refunding,
        Closed
    }

    event DelegateRegistered(address delegateAddress);
    event DelegateRemoved(address delegateAddress);
    event Deposited(address depositorAddress, uint256 amount);
    event Closed();
    event RefundEnabled();
    event Withdrawn(uint256 amount);
    event Refunded(address refundedAddress, uint256 amount);


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

    struct Payers {
        address payerAddress;
        uint256 depositedAmount;
    }

    address private _payee;
    address private _purchaser;
    Payers[] private _payers;
    uint256 private _agreedAmount;
    uint256 private _deployedAt;
    uint256 private _duration;
    State private _state;
    IERC20 private _token;

    constructor(address[] memory admins, address payee, address purchaser, uint256 agreedAmount,uint256 duration, address tokenAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        _payee = payee;
        _purchaser = purchaser;
        _payers.push(Payers(purchaser, 0));
        _agreedAmount = agreedAmount;
        _deployedAt = block.timestamp;
        _duration = duration;
        _state = State.Active;

        _token = IERC20(tokenAddress);
    }

    function _isPayer(address payerAddress) private view returns (bool) {
        for (uint256 i = 0; i < _payers.length; ++i) {
            if (_payers[i].payerAddress == payerAddress) {
                return true;
            }
        }
        return false;
    }

    function getPayee() public view returns (address) {
        return _payee;
    }

    function getPurchaser() public view returns (address) {
        return _purchaser;
    }

    function getPayers() public view returns (Payers[] memory) {
        return _payers;
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

    function addDelegate(address delegateAddress) public onlyPurchaser {
        require(delegateAddress != address(0), "Escrow: delegate is the zero address");
        _payers.push(Payers(delegateAddress, 0));
        emit DelegateRegistered(delegateAddress);
    }

    function removeDelegate(address delegateAddress) public onlyPurchaser {
        require(delegateAddress != _purchaser, "Escrow: purchaser cannot be removed from payers list");
        require(_isPayer(delegateAddress), "Escrow: delegate not present");

        for(uint256 i = 0; i < _payers.length; i++) {
            if (_payers[i].payerAddress == delegateAddress) {
                delete _payers[i];
                emit DelegateRemoved(delegateAddress);
                break;
            }
        }
    }

    function deposit(uint256 amount) public onlyPayers() {
        require(_state == State.Active, "Escrow: can only deposit while active");
        require(amount > 0, "Escrow: can only deposit positive amount");
        _token.safeTransferFrom(_msgSender(), address(this), amount);

        for(uint256 i = 0; i < _payers.length; i++) {
            if (_payers[i].payerAddress == msg.sender) {
                _payers[i].depositedAmount += amount;
                break;
            }
        }

        emit Deposited(msg.sender, amount);
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
        uint256 payment = getDepositAmount();
        _token.approve(address(this), payment);
        _token.safeTransferFrom(address(this), _payee, payment);
        emit Withdrawn(payment);
    }

    function refund() public onlyPayers() {
        require(refundAllowed(), "Escrow: can only refund when allowed");

        uint256 payment;
        for(uint256 i = 0; i < _payers.length; i++) {
            if (_payers[i].payerAddress == msg.sender) {
                payment = _payers[i].depositedAmount;
                break;
            }
        }

        _token.approve(address(this), payment);
        _token.safeTransferFrom(address(this), msg.sender, payment);
        emit Refunded(msg.sender, payment);
    }
}