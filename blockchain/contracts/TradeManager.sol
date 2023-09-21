// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";
import "./DocumentManager.sol";

contract TradeManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum TradeType { TRADE, ORDER }
    enum NegotiationStatus { INITIALIZED, PENDING, COMPLETED }

    event TradeRegistered(uint256 indexed id, address supplier);
    event TradeLineAdded(uint256 indexed id, address supplier, uint256 tradeLineId);
    event TradeLineUpdated(uint256 indexed id, address supplier, uint256 tradeLineId);
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

    struct TradeLine {
        // -------- BASIC TRADE LINE INFORMATION -------------
        uint256 id;
        uint256[2] materialIds; // [consigneeMaterialInId, contractorMaterialOutId]
        string productCategory;
        // -----------------------------------------------------

        // -------- ORDER TRADE LINE INFORMATION ----------------
        uint256 quantity;
        OrderLinePrice price;
        // ------------------------------------------------------

        bool exists;
    }

    struct Trade {
        // -------- GENERAL TRADE INFORMATION -------------
        uint256 id;
        TradeType tradeType; // { TRADE, ORDER }
        address supplier;
        address customer;
        string externalUrl;
        uint256[] lineIds;
        mapping(uint256 => TradeLine) lines;
        // -------------------------------------------------

        // -------- BASIC TRADE INFORMATION ----------------
        string name;
        // -------------------------------------------------

        // -------- ORDER TRADE INFORMATION ----------------
        address offeror;
        //        TODO: pensare ad un map (supplier -> sign) per le firme (permetterebbe la gestione di firme da parte di più entità)
        bool offerorSigned;
        address offeree;
        bool offereeSigned;
        // constraints
        // TODO: capire se questo vincolo è definito a livello di ordine o di linea

        uint256 paymentDeadline;
        uint256 documentDeliveryDeadline;
        string arbiter;
        uint256 shippingDeadline;
        uint256 deliveryDeadline;

//        TODO: mettere su IPFS
//        string incoterms;
//        string shipper;
//        string shippingPort;
//        string deliveryPort;

        // -------------------------------------------------

        bool exists;
    }

    // supplier => trade id => trade
    mapping(address => mapping(uint256 => Trade)) private trades;
    // supplier => trade id counter (the ids are different per each supplier, not unique in general)
    mapping(address => Counters.Counter) private tradesCounter;
    // supplier => trade line id counter
    mapping(address => Counters.Counter) private tradeLinesCounter;

    EnumerableType fiatManager;
    EnumerableType productCategoryManager;
    DocumentManager documentManager;

    constructor(address[] memory admins, address fiatManagerAddress, address productCategoryAddress, address documentManagerAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        fiatManager = EnumerableType(fiatManagerAddress);
        productCategoryManager = EnumerableType(productCategoryAddress);
        documentManager = DocumentManager(documentManagerAddress);
    }

    function registerTrade(TradeType tradeType, address supplier, address customer, string memory externalUrl) public {
        require(supplier == msg.sender || customer == msg.sender, "Sender is neither supplier nor customer");

        Counters.Counter storage tradeCounter = tradesCounter[supplier];
        uint256 tradeId = tradeCounter.current() + 1;
        tradeCounter.increment();

        Trade storage newTrade = trades[supplier][tradeId];
        newTrade.id = tradeId;
        newTrade.supplier = supplier;
        newTrade.customer = customer;
        newTrade.externalUrl = externalUrl;
        newTrade.tradeType = tradeType;
        newTrade.exists = true;

        emit TradeRegistered(tradeId, supplier);
    }

    function addTradeName(address supplier, uint256 tradeId, string memory name) public {
        Trade storage t = trades[supplier][tradeId];
        require(t.exists, "Trade does not exist");
        require(t.tradeType == TradeType.TRADE, "Can't perform this operation if not TRADE");

        t.name = name;
    }

    function tradeExists(address supplier, uint256 tradeId) public view returns (bool) {
        return trades[supplier][tradeId].exists;
    }

    function getTradeInfo(address tradeSupplier, uint256 tradeId) public view returns (
        uint256 id, string memory name,
        address supplier, address customer, string memory externalUrl, uint256[] memory lineIds
    ) {
        Trade storage t = trades[tradeSupplier][tradeId];
        require(t.exists, "Trade does not exist");
        require(t.tradeType == TradeType.TRADE, "Can't perform this operation if not TRADE");

        return (t.id, t.name, t.supplier, t.customer, t.externalUrl, t.lineIds);
    }

    function getTradeCounter(address supplier) public view returns (uint256) {
        return tradesCounter[supplier].current();
    }

    function addTradeLine(address supplier, uint256 tradeId, uint256[2] memory materialIds, string memory productCategory) public {
        Trade storage t = trades[supplier][tradeId];
        require(t.exists, "Trade does not exist");
        require(t.tradeType == TradeType.TRADE, "Can't perform this operation if not TRADE");
        require(productCategoryManager.contains(productCategory), "The product category specified isn't registered");

        Counters.Counter storage tradeLineCounter = tradeLinesCounter[supplier];
        uint256 tradeLineId = tradeLineCounter.current() + 1;
        tradeLineCounter.increment();
        TradeLine memory tradeLine;
        tradeLine.id = tradeLineId;
        tradeLine.materialIds = materialIds;
        tradeLine.productCategory = productCategory;
        tradeLine.exists = true;

        t.lineIds.push(tradeLineId);
        t.lines[tradeLineId] = tradeLine;

        emit TradeLineAdded(tradeId, supplier, tradeLineId);
    }

    function updateTradeLine(address supplier, uint256 tradeId, uint256 tradeLineId, uint256[2] memory materialIds, string memory productCategory) public {
        Trade storage t = trades[supplier][tradeId];

        require(t.exists, "Trade does not exist");
        require(t.lines[tradeLineId].exists, "Trade line does not exist");
        require(productCategoryManager.contains(productCategory), "The product category specified isn't registered");

        TradeLine storage tradeLine = t.lines[tradeLineId];
        tradeLine.id = tradeLineId;
        tradeLine.materialIds = materialIds;
        tradeLine.productCategory = productCategory;

        emit TradeLineUpdated(tradeId, supplier, tradeLineId);
    }

    function getTradeLine(address supplier, uint256 tradeId, uint256 tradeLineId) public view returns (TradeLine memory) {
        Trade storage t = trades[supplier][tradeId];
        require(t.exists, "Trade does not exist");
        require(t.tradeType == TradeType.TRADE, "Only a TRADE has trade lines");

        TradeLine memory tL = t.lines[tradeLineId];
        require(tL.exists, "Trade line does not exist");

        return tL;
    }

    function tradeLineExists(address supplier, uint256 tradeId, uint256 tradeLineId) public view returns (bool) {
        return trades[supplier][tradeId].lines[tradeLineId].exists;
    }

    function addOrderOfferee(address supplier, uint256 orderId, address offeree) public {
        Trade storage o = trades[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.tradeType == TradeType.ORDER, "Can't perform this operation if not ORDER");

        o.offeror = msg.sender;
        o.offeree = offeree;
    }

    function setOrderPaymentDeadline(address supplier, uint256 orderId, uint256 paymentDeadline) public {
        Trade storage o = trades[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.tradeType == TradeType.ORDER, "Can't perform this operation if not ORDER");

        o.paymentDeadline = paymentDeadline;
        _updateSignatures(msg.sender, o);
    }

    function setOrderDocumentDeliveryDeadline(address supplier, uint256 orderId, uint256 documentDeliveryDeadline) public {
        Trade storage o = trades[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.tradeType == TradeType.ORDER, "Can't perform this operation if not ORDER");

        o.documentDeliveryDeadline = documentDeliveryDeadline;
        _updateSignatures(msg.sender, o);
    }

    function setOrderArbiter(address supplier, uint256 orderId, string memory arbiter) public {
        Trade storage o = trades[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.tradeType == TradeType.ORDER, "Can't perform this operation if not ORDER");

        o.arbiter = arbiter;
        _updateSignatures(msg.sender, o);
    }

    function setOrderShippingDeadline(address supplier, uint256 orderId, uint256 shippingDeadline) public {
        Trade storage o = trades[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.tradeType == TradeType.ORDER, "Can't perform this operation if not ORDER");

        o.shippingDeadline = shippingDeadline;
        _updateSignatures(msg.sender, o);
    }

    function setOrderDeliveryDeadline(address supplier, uint256 orderId, uint256 deliveryDeadline) public {
        Trade storage o = trades[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.tradeType == TradeType.ORDER, "Can't perform this operation if not ORDER");

        o.deliveryDeadline = deliveryDeadline;
        _updateSignatures(msg.sender, o);
    }

    function confirmOrder(address supplier, uint256 orderId) public {
        Trade storage o = trades[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.tradeType == TradeType.ORDER, "Can't perform this operation if not ORDER");
        require(msg.sender == o.offeree || msg.sender == o.offeror, "Only an offeree or an offeror can confirm the order");
        require(o.paymentDeadline != 0 && o.documentDeliveryDeadline != 0 &&
                bytes(o.arbiter).length != 0 && o.shippingDeadline != 0 && o.deliveryDeadline != 0,
            "Cannot confirm an order if all constraints have not been defined");

        if (msg.sender == o.offeror) {
            o.offerorSigned = true;
        }
        else {
            o.offereeSigned = true;
        }
    }

    function addDocument(address supplier, uint256 tradeId, string memory name, string memory documentType, string memory externalUrl) public {
        require(trades[supplier][tradeId].exists, "Trade does not exist");
        require(getNegotiationStatus(supplier, tradeId) == NegotiationStatus.COMPLETED, "The order is not already confirmed, cannot add document");

        documentManager.registerDocument(supplier, tradeId, name, documentType, externalUrl);
    }


    function getNegotiationStatus(address supplier, uint256 orderId) public view returns (NegotiationStatus orderStatus) {
        Trade storage o = trades[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.tradeType == TradeType.ORDER, "Can't perform this operation if not ORDER");

        if (!o.offereeSigned && !o.offerorSigned) {
            return NegotiationStatus.INITIALIZED;
        } else if (o.offerorSigned && o.offereeSigned) {
            return NegotiationStatus.COMPLETED;
        } else {
            return NegotiationStatus.PENDING;
        }
    }

    function getOrderInfo(address orderSupplier, uint256 orderId) public view returns (
        uint256 id, string memory name, address supplier, address customer, address offeree, address offeror, string memory externalUrl, uint256[] memory lineIds,
        uint256 paymentDeadline, uint256 documentDeliveryDeadline, string memory arbiter, uint256 shippingDeadline, uint256 deliveryDeadline
    ) {
        Trade storage o = trades[orderSupplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.tradeType == TradeType.ORDER, "Can't perform this operation if not ORDER");

        return (o.id, o.name, o.supplier, o.customer, o.offeree, o.offeror, o.externalUrl, o.lineIds,
                o.paymentDeadline, o.documentDeliveryDeadline, o.arbiter, o.shippingDeadline, o.deliveryDeadline
        );
    }

    function isSupplierOrCustomer(address supplier, uint256 orderId, address sender) public view returns (bool) {
        Trade storage o = trades[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.tradeType == TradeType.ORDER, "Can't perform this operation if not ORDER");

        return o.supplier == sender || o.customer == sender;
    }

    function addOrderLine(address supplier, uint256 orderId, uint256[2] memory materialIds, string memory productCategory, uint256 quantity, OrderLinePrice memory price) public {
        Trade storage o = trades[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.tradeType == TradeType.ORDER, "Can't perform this operation if not ORDER");
        require(o.offeree == msg.sender || o.offeror == msg.sender, "Sender is neither offeree nor offeror");
        require(getNegotiationStatus(supplier, orderId) != NegotiationStatus.COMPLETED, "The order has been confirmed, it cannot be changed");
        require(fiatManager.contains(price.fiat), "The fiat of the order line isn't registered");
        require(productCategoryManager.contains(productCategory), "The product category specified isn't registered");

        Counters.Counter storage orderLineCounter = tradeLinesCounter[supplier];
        uint256 orderLineId = orderLineCounter.current() + 1;
        orderLineCounter.increment();
        TradeLine memory orderLine = TradeLine(orderLineId, materialIds, productCategory, quantity, price, true);
        o.lineIds.push(orderLineId);
        o.lines[orderLineId] = orderLine;

        _updateSignatures(msg.sender, o);

        emit OrderLineAdded(orderId, supplier, orderLineId);
    }

    function updateOrderLine(address supplier, uint256 orderId, uint256 orderLineId, uint256[2] memory materialIds, string memory productCategory, uint256 quantity, OrderLinePrice memory price) public {
        Trade storage o = trades[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.lines[orderLineId].exists, "Order line does not exist");
        require(o.offeree == msg.sender || o.offeror == msg.sender, "Sender is neither offeree nor offeror");
        require(getNegotiationStatus(supplier, orderId) != NegotiationStatus.COMPLETED, "The order has been confirmed, it cannot be changed");
        require(fiatManager.contains(price.fiat), "The fiat of the order line isn't registered");
        require(productCategoryManager.contains(productCategory), "The product category specified isn't registered");

        TradeLine memory orderLine = TradeLine(orderLineId, materialIds, productCategory, quantity, price, true);
        o.lines[orderLineId] = orderLine;

        _updateSignatures(msg.sender, o);

        emit OrderLineUpdated(orderId, supplier, orderLineId);
    }

    function getOrderLine(address supplier, uint256 orderId, uint256 orderLineId) public view returns (TradeLine memory) {
        Trade storage o = trades[supplier][orderId];
        require(o.exists, "Order does not exist");
        require(o.tradeType == TradeType.ORDER, "Only an ORDER has order lines");

        TradeLine memory oL = o.lines[orderLineId];
        require(oL.exists, "Order line does not exist");

        return oL;
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }

    function _updateSignatures(address sender, Trade storage c) private {
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
