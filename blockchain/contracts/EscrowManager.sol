// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Escrow.sol";

import "hardhat/console.sol";

contract EscrowManager is AccessControl {
    using Address for address payable;
    using Counters for Counters.Counter;
    Counters.Counter private _counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event EscrowRegistered(uint256 indexed id, address payable payee, address payable purchaser, uint256 agreedAmount, address tokenAddress, address commissionAddress);
    event CommissionerUpdated(address commissionAddress);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "EscrowManager: caller is not the admin");
        _;
    }

    address[] private _admins;
    address private _commissioner;
    mapping(uint256 => Escrow) private _escrows;
    //mapping(payer => Escrow_id[])
    mapping(address => uint256[]) private _escrowsOfPurchaser;

    constructor(address[] memory admins, address commissioner) {
        require(commissioner != address(0), "EscrowManager: commissioner is the zero address");

        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }
        _admins = admins;
        _commissioner = commissioner;
    }

    function registerEscrow(address payable payee, address payable purchaser, uint256 agreedAmount, uint256 duration, address tokenAddress, uint256 baseFee, uint256 percentageFee) public  {
        require(payee != address(0), "EscrowManager: payee is the zero address");
        require(purchaser != address(0), "EscrowManager: purchaser is the zero address");
        require(tokenAddress != address(0), "EscrowManager: token address is the zero address");
        require(percentageFee <= 100, "EscrowManager: percentage fee cannot be greater than 100");
        uint256 id = _counter.current();
        _counter.increment();

        address[] memory adminArray = new address[](_admins.length + 1);
        for (uint256 i = 0; i < _admins.length; ++i) {
            adminArray[i] = _admins[i];
        }
        adminArray[_admins.length] = address(this);

        Escrow newEscrow = new Escrow(adminArray, payee, purchaser, agreedAmount, duration, tokenAddress, _commissioner, baseFee, percentageFee);
        _escrows[id] = newEscrow;
        _escrowsOfPurchaser[purchaser].push(id);
        emit EscrowRegistered(id, payee, purchaser, agreedAmount, tokenAddress, _commissioner);
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

    function getEscrow(uint256 id) public view returns (Escrow) {
        return _escrows[id];
    }

    function getEscrowsId(address purchaser) public view returns (uint256[] memory) {
        return _escrowsOfPurchaser[purchaser];
    }
}