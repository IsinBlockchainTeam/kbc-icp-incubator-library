// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";

contract OrderManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum OrderStatus{INITIALIZED, PENDING, COMPLETED}

    event OrderRegistered(uint256 indexed id, address supplier);
    event OrderLineAdded(uint256 indexed id, address supplier, uint256 orderLineId);
    event OrderLineUpdated(uint256 indexed id, address supplier, uint256 orderLineId);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    struct OrderLinePrice {
        uint256 amount;
        uint256 decimals;
        string fiat;
    }

    struct OrderLine {
        uint256 id;
        string productCategory;
        uint256 quantity;
        OrderLinePrice price;
        bool exists;
    }

    struct Order {
        uint256 id;
        uint256[] lineIds;
        mapping(uint256 => OrderLine) lines;
        address supplier;
        address customer;
        address offeror;
        //        TODO: pensare ad un map (supplier -> sign) per le firme (permetterebbe la gestione di firme da parte di più entità)
        bool offerorSigned;
        address offeree;
        bool offereeSigned;
        string externalUrl;

        // constraints
//        TODO: capire se questo vincolo è definito a livello di ordine o di linea
        string incoterms;
        uint256 paymentDeadline;
        uint256 documentDeliveryDeadline;
        string shipper;
        string arbiter;
        string shippingPort;
        uint256 shippingDeadline;
        string deliveryPort;
        uint256 deliveryDeadline;

        bool exists;
    }

    // supplier => order id => order
    mapping(address => mapping(uint256 => Order)) private orders;
    // supplier => order id counter (the ids are different per each supplier, not unique in general)
    mapping(address => Counters.Counter) private ordersCounter;
    // supplier => order line id counter
    mapping(address => Counters.Counter) private orderLinesCounter;

    EnumerableType fiatManager;
    EnumerableType productCategoryManager;

    constructor(address[] memory admins, address fiatManagerAddress, address productCategoryAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        fiatManager = EnumerableType(fiatManagerAddress);
        productCategoryManager = EnumerableType(productCategoryAddress);
    }

    function registerOrder(address supplier, address customer, address offeree, string memory externalUrl) public {
        require(supplier == msg.sender || customer == msg.sender, "Sender is neither supplier nor customer");

        Counters.Counter storage orderCounter = ordersCounter[supplier];
        uint256 orderId = orderCounter.current() + 1;
        orderCounter.increment();

        Order storage newOrder = orders[supplier][orderId];
        newOrder.id = orderId;
        newOrder.externalUrl = externalUrl;
        newOrder.supplier = supplier;
        newOrder.customer = customer;
        newOrder.offeror = msg.sender;
        newOrder.offeree = offeree;
        newOrder.exists = true;

        emit OrderRegistered(orderId, supplier);
    }

    function getOrderCounter(address supplier) public view returns (uint256 counter) {
        return ordersCounter[supplier].current();
    }

    function setOrderIncoterms(address supplier, uint256 orderId, string memory incoterms) public {
        Order storage o = orders[supplier][orderId];
        require(o.exists, "Order does not exist");

        o.incoterms = incoterms;
        _updateSignatures(msg.sender, o);
    }

    function setOrderPaymentDeadline(address supplier, uint256 orderId, uint256 paymentDeadline) public {
        Order storage o = orders[supplier][orderId];
        require(o.exists, "Order does not exist");

        o.paymentDeadline = paymentDeadline;
        _updateSignatures(msg.sender, o);
    }

    function setOrderDocumentDeliveryDeadline(address supplier, uint256 orderId, uint256 documentDeliveryDeadline) public {
        Order storage o = orders[supplier][orderId];
        require(o.exists, "Order does not exist");

        o.documentDeliveryDeadline = documentDeliveryDeadline;
        _updateSignatures(msg.sender, o);
    }

    function setOrderShipper(address supplier, uint256 orderId, string memory shipper) public {
        Order storage o = orders[supplier][orderId];
        require(o.exists, "Order does not exist");

        o.shipper = shipper;
        _updateSignatures(msg.sender, o);
    }

    function setOrderArbiter(address supplier, uint256 orderId, string memory arbiter) public {
        Order storage o = orders[supplier][orderId];
        require(o.exists, "Order does not exist");

        o.arbiter = arbiter;
        _updateSignatures(msg.sender, o);
    }

    function setOrderShippingPort(address supplier, uint256 orderId, string memory shippingPort) public {
        Order storage o = orders[supplier][orderId];
        require(o.exists, "Order does not exist");

        o.shippingPort = shippingPort;
        _updateSignatures(msg.sender, o);
    }

    function setOrderShippingDeadline(address supplier, uint256 orderId, uint256 shippingDeadline) public {
        Order storage o = orders[supplier][orderId];
        require(o.exists, "Order does not exist");

        o.shippingDeadline = shippingDeadline;
        _updateSignatures(msg.sender, o);
    }

    function setOrderDeliveryPort(address supplier, uint256 orderId, string memory deliveryPort) public {
        Order storage o = orders[supplier][orderId];
        require(o.exists, "Order does not exist");

        o.deliveryPort = deliveryPort;
        _updateSignatures(msg.sender, o);
    }

    function setOrderDeliveryDeadline(address supplier, uint256 orderId, uint256 deliveryDeadline) public {
        Order storage o = orders[supplier][orderId];
        require(o.exists, "Order does not exist");

        o.deliveryDeadline = deliveryDeadline;
        _updateSignatures(msg.sender, o);
    }

    function confirmOrder(address supplier, uint256 orderId) public {
        Order storage o = orders[supplier][orderId];
        require(msg.sender == o.offeree || msg.sender == o.offeror, "Only an offeree or an offeror can confirm the order");
        require((bytes(o.incoterms).length != 0 && o.paymentDeadline != 0 && o.documentDeliveryDeadline != 0 &&
                bytes(o.shipper).length != 0 && bytes(o.arbiter).length != 0 && bytes(o.shippingPort).length != 0 &&
                o.shippingDeadline != 0 && bytes(o.deliveryPort).length != 0 && o.deliveryDeadline != 0),
            "Cannot confirm an order if all constraints have not been defined");

        if (msg.sender == o.offeror) {
            o.offerorSigned = true;
        }
        else {
            o.offereeSigned = true;
        }
    }

    function orderExists(address supplier, uint256 orderId) public view returns (bool) {
        return orders[supplier][orderId].exists;
    }

    function getOrderStatus(address supplier, uint256 orderId) public view returns (OrderStatus orderStatus) {
        require(orders[supplier][orderId].exists, "Order does not exist");

        if (!orders[supplier][orderId].offereeSigned && !orders[supplier][orderId].offerorSigned) {
            return OrderStatus.INITIALIZED;
        } else if (orders[supplier][orderId].offerorSigned && orders[supplier][orderId].offereeSigned) {
            return OrderStatus.COMPLETED;
        } else {
            return OrderStatus.PENDING;
        }
    }

    function getOrderInfo(address orderSupplier, uint256 orderId) public view returns (
        uint256 id, address supplier, address customer, address offeree, address offeror, string memory externalUrl, uint256[] memory lineIds,
        string memory incoterms, uint256 paymentDeadline, uint256 documentDeliveryDeadline, string memory shipper, string memory arbiter,
        string memory shippingPort, uint256 shippingDeadline, string memory deliveryPort, uint256 deliveryDeadline
    ) {
        Order storage order = orders[orderSupplier][orderId];
        require(order.exists, "Order does not exist");

        return (order.id, order.supplier, order.customer, order.offeree, order.offeror, order.externalUrl, order.lineIds,
                order.incoterms, order.paymentDeadline, order.documentDeliveryDeadline, order.shipper, order.arbiter,
                order.shippingPort, order.shippingDeadline, order.deliveryPort, order.deliveryDeadline
        );
    }

    function isSupplierOrCustomer(address supplier, uint256 orderId, address sender) public view returns (bool) {
        return orders[supplier][orderId].supplier == sender || orders[supplier][orderId].customer == sender;
    }

    function getOrderLine(address supplier, uint256 orderId, uint256 orderLineId) public view returns (OrderLine memory orderLine) {
        require(orders[supplier][orderId].exists, "Order does not exist");

        OrderLine memory cL = orders[supplier][orderId].lines[orderLineId];
        require(cL.exists, "Order line does not exist");

        return (cL);
    }

    function orderLineExists(address supplier, uint256 orderId, uint256 orderLineId) public view returns (bool) {
        return orders[supplier][orderId].lines[orderLineId].exists;
    }

    function updateOrderLine(address supplier, uint256 orderId, uint256 orderLineId, string memory productCategory, uint256 quantity, OrderLinePrice memory price) public {
        Order storage o = orders[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.offeree == msg.sender || o.offeror == msg.sender, "Sender is neither offeree nor offeror");
        require(getOrderStatus(supplier, orderId) != OrderStatus.COMPLETED, "The order has been confirmed, it cannot be changed");
        require(fiatManager.contains(price.fiat), "The fiat of the order line isn't registered");

        OrderLine memory orderLine = OrderLine(orderLineId, productCategory, quantity, price, true);
        o.lines[orderLineId] = orderLine;

        _updateSignatures(msg.sender, o);

        emit OrderLineUpdated(orderId, supplier, orderLineId);
    }

    function addOrderLine(address supplier, uint256 orderId, string memory productCategory, uint256 quantity, OrderLinePrice memory price) public {
        Order storage o = orders[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.offeree == msg.sender || o.offeror == msg.sender, "Sender is neither offeree nor offeror");
        require(getOrderStatus(supplier, orderId) != OrderStatus.COMPLETED, "The order has been confirmed, it cannot be changed");
        require(fiatManager.contains(price.fiat), "The fiat of the order line isn't registered");

        Counters.Counter storage orderLineCounter = orderLinesCounter[supplier];
        uint256 orderLineId = orderLineCounter.current() + 1;
        orderLineCounter.increment();
        OrderLine memory orderLine = OrderLine(orderLineId, productCategory, quantity, price, true);
        o.lineIds.push(orderLineId);
        o.lines[orderLineId] = orderLine;

        _updateSignatures(msg.sender, o);

        emit OrderLineAdded(orderId, supplier, orderLineId);
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }

    function _updateSignatures(address sender, Order storage c) private {
        if (sender == c.offeree) {
            c.offereeSigned = true;
            c.offerorSigned = false;
        }
        else {
            c.offereeSigned = false;
            c.offerorSigned = true;
        }
    }
}
