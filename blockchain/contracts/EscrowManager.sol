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

    event EscrowRegistered(uint256 indexed id, address payable payee, address payable payer);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "EscrowManager: caller is not the admin");
        _;
    }

    mapping(uint256 => Escrow) private escrows;

    //mapping(payer => [payees])
    mapping(address => address[]) private payeesOfPayer;

    constructor(address[] memory admins) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }
    }

    function getEscrow(uint256 id) public view returns (Escrow) {
        return escrows[id];
    }

    function getPayees(address payer) public view returns (address[] memory) {
        return payeesOfPayer[payer];
    }

    function registerEscrow(address payable _payee, address payable _payer, uint256 _duration) public returns (uint256) {
        require(_payee != address(0), "EscrowManager: payee is the zero address");
        require(_payer != address(0), "EscrowManager: payer is the zero address");
        uint256 id = _counter.current();
        _counter.increment();

        address[] memory adminArray = new address[](1);
        adminArray[0] = address(this);

        Escrow newEscrow = new Escrow(adminArray, _payee, _payer, _duration);
        escrows[id] = newEscrow;
        payeesOfPayer[_payer].push(_payee);
        emit EscrowRegistered(id, _payee, _payer);
        return id;
    }
}