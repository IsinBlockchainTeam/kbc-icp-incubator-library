// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ContractManager.sol";

contract OrderManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event OrderRegistered(uint256 indexed id, address supplier);
    event OrderLineAdded(uint256 indexed id, address supplier, uint256 orderLineId);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    struct OrderLine {
        uint256 id;
        uint256 contractLineId;
        uint256 quantity;
        bool exists;
    }

    struct Order {
        uint256 id;
        uint256[] lineIds;
        mapping(uint256 => OrderLine) lines;
        uint256 contractId;
        string externalUrl;
        bool exists;
    }

    // supplier => order id => order
    mapping(address => mapping(uint256 => Order)) private orders;
    // supplier => order id counter (the ids are different per each supplier, but not unique in general)
    mapping(address => Counters.Counter) private ordersCounter;
    // supplier => order line id counter
    mapping(address => Counters.Counter) private orderLinesCounter;

    ContractManager contractManager;

    constructor(address[] memory admins, address contractManagerAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        contractManager = ContractManager(contractManagerAddress);
    }

    function registerOrder(address supplier, uint256 contractId, string memory externalUrl) public {
        require(contractManager.contractExists(supplier, contractId), "Contract does not exist");
        require(contractManager.isSupplierOrCustomer(supplier, contractId, msg.sender), "Sender is neither supplier nor customer of the relative contract");

        Counters.Counter storage orderCounter = ordersCounter[supplier];
        uint256 orderId = orderCounter.current() + 1;
        orderCounter.increment();
        Order storage newOrder = orders[supplier][orderId];
        newOrder.id = orderId;
        newOrder.contractId = contractId;
        newOrder.externalUrl = externalUrl;
        newOrder.exists = true;

        emit OrderRegistered(orderId, supplier);
    }

    function getOrderCounter(address supplier) public view returns (uint256 counter) {
        return ordersCounter[supplier].current();
    }

    function orderExists(address supplier, uint256 orderId) public view returns (bool) {
        return orders[supplier][orderId].exists;
    }

    function getOrderInfo(address orderSupplier, uint256 orderId) public view returns (uint256 id, uint256 contractId, string memory externalUrl, uint256[] memory lineIds) {
        require(orders[orderSupplier][orderId].exists, "Order does not exist");

        return (orders[orderSupplier][orderId].id, orders[orderSupplier][orderId].contractId, orders[orderSupplier][orderId].externalUrl, orders[orderSupplier][orderId].lineIds);
    }

    function getOrderLine(address supplier, uint256 orderId, uint256 orderLineId) public view returns (OrderLine memory orderLine) {
        require(orders[supplier][orderId].exists, "Order does not exist");
        require(orders[supplier][orderId].lines[orderLineId].exists, "Order line does not exist");

        return orders[supplier][orderId].lines[orderLineId];
    }

    function orderLineExists(address supplier, uint256 orderId, uint256 orderLineId) public view returns(bool) {
        return orders[supplier][orderId].lines[orderLineId].exists;
    }

    function addOrderLine(address supplier, uint256 orderId, OrderLine memory orderLine) public {
        require(orders[supplier][orderId].exists, "Order does not exist");
        require(contractManager.isSupplierOrCustomer(supplier, orders[supplier][orderId].contractId, msg.sender), "Sender is neither supplier nor customer of the relative contract");
        require(contractManager.contractLineExists(supplier, orders[supplier][orderId].contractId, orderLine.contractLineId),
            "Trying to set an order line that doesn't refer to the correct contract line");

        Counters.Counter storage orderLineCounter = orderLinesCounter[supplier];
        uint256 orderLineId = orderLineCounter.current() + 1;
        orderLineCounter.increment();
        orderLine.id = orderLineId;
        orders[supplier][orderId].lineIds.push(orderLineId);
        orders[supplier][orderId].lines[orderLineId] = orderLine;

        emit OrderLineAdded(orderId, supplier, orderLineId);
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
