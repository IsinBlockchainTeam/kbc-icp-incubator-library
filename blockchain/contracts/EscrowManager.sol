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

    event EscrowRegistered(uint256 indexed id, address payable payee, address payable purchaser, uint256 agreedAmount);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "EscrowManager: caller is not the admin");
        _;
    }


    mapping(uint256 => Escrow) private escrows;

    //mapping(payer => Escrow_id[])
    mapping(address => uint256[]) private escrowsOfPurchaser;

    constructor(address[] memory admins) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }
    }

    function registerEscrow(address payable payee, address payable purchaser, uint256 agreedAmount, uint256 duration, address tokenAddress) public  {
        require(payee != address(0), "EscrowManager: payee is the zero address");
        require(purchaser != address(0), "EscrowManager: purchaser is the zero address");
        require(tokenAddress != address(0), "EscrowManager: token address is the zero address");
        uint256 id = _counter.current();
        _counter.increment();

        address[] memory adminArray = new address[](1);
        adminArray[0] = address(this);

        Escrow newEscrow = new Escrow(adminArray, payee, purchaser, agreedAmount, duration, tokenAddress);
        escrows[id] = newEscrow;
        escrowsOfPurchaser[purchaser].push(id);
        emit EscrowRegistered(id, payee, purchaser, agreedAmount);
    }

    function getEscrow(uint256 id) public view returns (Escrow) {
        return escrows[id];
    }

    function getEscrowsId(address purchaser) public view returns (uint256[] memory) {
        return escrowsOfPurchaser[purchaser];
    }
}