// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Trade.sol";
import "./EscrowManager.sol";
import {BasicTrade} from "./BasicTrade.sol";
import {OrderTrade} from "./OrderTrade.sol";

contract TradeManager is AccessControl {
    using Counters for Counters.Counter;
    Counters.Counter private _counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event BasicTradeRegistered(uint256 indexed id, address contractAddress, address supplier, address customer, address commissioner);
    event OrderTradeRegistered(uint256 indexed id, address contractAddress, address supplier, address customer, address commissioner);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "TradeManager: caller is not the admin");
        _;
    }

    mapping(uint256 => Trade) private _trades;
    // mapping(supplier => Trade_id[])
    mapping(address => uint256[]) private _tradeIdsOfSupplier;
    // mapping(commissioner => Trade_id[])
    mapping(address => uint256[]) private _tradeIdsOfCommissioner;

    address private _productCategoryManagerAddress;
    address private _materialManagerAddress;
    address private _documentManagerAddress;
    address private _fiatManagerAddress;
    address private _unitManagerAddress;
    EscrowManager private _escrowManager;

    constructor(address productCategoryManagerAddress, address materialManagerAddress, address documentManagerAddress, address fiatManagerAddress, address unitManagerAddress, address escrowManagerAddress) {
        require(productCategoryManagerAddress != address(0), "TradeManager: product category manager address is the zero address");
        require(materialManagerAddress != address(0), "TradeManager: material manager address is the zero address");
        require(documentManagerAddress != address(0), "TradeManager: document category manager address is the zero address");
        require(fiatManagerAddress != address(0), "TradeManager: fiat manager address is the zero address");
        require(unitManagerAddress != address(0), "TradeManager: unit manager address is the zero address");
        require(escrowManagerAddress != address(0), "TradeManager: escrow manager address is the zero address");

        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        _productCategoryManagerAddress = productCategoryManagerAddress;
        _materialManagerAddress = materialManagerAddress;
        _documentManagerAddress = documentManagerAddress;
        _fiatManagerAddress = fiatManagerAddress;
        _unitManagerAddress = unitManagerAddress;
        _escrowManager = EscrowManager(escrowManagerAddress);
    }

    function getTradeCounter() public view returns (uint256) {
        return _counter.current();
    }

    function getTrade(uint256 id) public view returns (Trade) {
        return _trades[id];
    }

    function getTradeType(uint256 id) public view returns (Trade.TradeType) {
        return _trades[id].getTradeType();
    }

    function getTradeIdsOfSupplier(address supplier) public view returns (uint256[] memory) {
        return _tradeIdsOfSupplier[supplier];
    }

    function getTradeIdsOfCommissioner(address commissioner) public view returns (uint256[] memory) {
        return _tradeIdsOfCommissioner[commissioner];
    }

    function registerBasicTrade(address supplier, address customer, address commissioner, string memory externalUrl, string memory name) public returns(uint256) {
        require(supplier != address(0), "TradeManager: supplier is the zero address");
        require(customer != address(0), "TradeManager: customer is the zero address");
        require(commissioner != address(0), "TradeManager: commissioner is the zero address");

        uint256 id = _counter.current() + 1;
        _counter.increment();

        BasicTrade newTrade = new BasicTrade(id, _productCategoryManagerAddress, _materialManagerAddress, _documentManagerAddress, _unitManagerAddress, supplier, customer, commissioner, externalUrl, name);
        _trades[id] = newTrade;
        _tradeIdsOfSupplier[supplier].push(id);
        _tradeIdsOfCommissioner[commissioner].push(id);

        emit BasicTradeRegistered(id, address(newTrade), supplier, customer, commissioner);
        return id;
    }

    function registerOrderTrade(address supplier, address customer, address commissioner, string memory externalUrl, uint256 paymentDeadline, uint256 documentDeliveryDeadline, address arbiter, uint256 shippingDeadline, uint256 deliveryDeadline, uint256 agreedAmount, address tokenAddress) public returns(uint256) {
        require(supplier != address(0), "TradeManager: supplier is the zero address");
        require(customer != address(0), "TradeManager: customer is the zero address");
        require(commissioner != address(0), "TradeManager: commissioner is the zero address");
        require(arbiter != address(0), "TradeManager: arbiter is the zero address");
        require(paymentDeadline > block.timestamp, "TradeManager: payment deadline must be in the future");

        uint256 id = _counter.current() + 1;
        _counter.increment();

        Escrow escrow = _escrowManager.registerEscrow(supplier, commissioner, agreedAmount, paymentDeadline - block.timestamp, tokenAddress);
        OrderTrade newTrade = new OrderTrade(id, _productCategoryManagerAddress, _materialManagerAddress, _documentManagerAddress, _unitManagerAddress, supplier, customer, commissioner, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, address(escrow), _fiatManagerAddress);
        _trades[id] = newTrade;
        _tradeIdsOfSupplier[supplier].push(id);
        _tradeIdsOfCommissioner[commissioner].push(id);

        emit OrderTradeRegistered(id, address(newTrade), supplier, customer, commissioner);
        return id;
    }
}
