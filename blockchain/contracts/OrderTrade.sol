// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Trade.sol";
import "./Escrow.sol";
import "hardhat/console.sol";

contract OrderTrade is Trade {
    using Counters for Counters.Counter;

    enum NegotiationStatus { INITIALIZED, PENDING, COMPLETED }

    event OrderLineAdded(uint256 orderLineId);
    event OrderLineUpdated(uint256 orderLineId);
    event OrderSignatureAffixed(address signer);
    event OrderConfirmed();

    modifier onlyOrdersInNegotiation() {
        require(getNegotiationStatus() != NegotiationStatus.COMPLETED, "OrderTrade: The order has already been confirmed, therefore it cannot be changed");
        _;
    }

    struct OrderLinePrice {
        uint256 amount;
        uint256 decimals;
        string fiat;
    }

    struct OrderLine {
        uint256 quantity;
        OrderLinePrice price;
        bool exists;
    }

    // TODO: OldTradeManager -> pensare ad un map (supplier -> sign) per le firme (permetterebbe la gestione di firme da parte di più entità)
    // TODO: OldTradeManager -> capire se l'incoterm è definito a livello di ordine o di linea

    bool private _hasSupplierSigned;
    bool private _hasCommissionerSigned;

    uint256 private _paymentDeadline;
    uint256 private _documentDeliveryDeadline;
    address private _arbiter;
    uint256 private _shippingDeadline;
    uint256 private _deliveryDeadline;

    // Additional mapping to Trade._lines
    mapping(uint256 => OrderLine) private _orderLines;

    Escrow private _escrow;

    EnumerableType private _fiatManager;

    constructor(uint256 tradeId, address productCategoryAddress, address documentManagerAddress, address supplier, address customer, address commissioner, string memory externalUrl, uint256 paymentDeadline, uint256 documentDeliveryDeadline, address arbiter, uint256 shippingDeadline, uint256 deliveryDeadline, address escrowAddress, address fiatManagerAddress) Trade(tradeId, productCategoryAddress, documentManagerAddress, supplier, customer, commissioner, externalUrl) {
        _tradeId = tradeId;
        _paymentDeadline = paymentDeadline;
        _documentDeliveryDeadline = documentDeliveryDeadline;
        _arbiter = arbiter;
        _shippingDeadline = shippingDeadline;
        _deliveryDeadline = deliveryDeadline;
        _escrow = Escrow(escrowAddress);
        _fiatManager = EnumerableType(fiatManagerAddress);

        _hasSupplierSigned = false;
        _hasCommissionerSigned = false;
    }

    function getTradeType() public override view returns (TradeType) {
        return TradeType.ORDER;
    }

    function getOrderTrade() public view returns (uint256, address, address, address, string memory, uint256[] memory, bool, bool, uint256, uint256, address, uint256, uint256, Escrow) {
        return (_tradeId, _supplier, _customer, _commissioner, _externalUrl, _lineIds, _hasSupplierSigned, _hasCommissionerSigned, _paymentDeadline, _documentDeliveryDeadline, _arbiter, _shippingDeadline, _deliveryDeadline, _escrow);
    }

    function getOrderLines() public view returns (OrderLine[] memory) {
        OrderLine[] memory orderLines = new OrderLine[](_lineIds.length);
        for (uint256 i = 0; i < _lineIds.length; i++) {
            orderLines[i] = _orderLines[_lineIds[i]];
        }
        return orderLines;
    }

    function getOrderLine(uint256 id) public view returns (OrderLine memory) {
        require(getOrderLineExists(id), "OrderTrade: Order line does not exist");
        return _orderLines[id];
    }

    function getOrderLineExists(uint256 id) public view returns (bool) {
        return _orderLines[id].exists;
    }

    // TODO: override addLine and make it empty

    function addOrderLine(uint256[2] memory materialIds, string memory productCategory, uint256 quantity, OrderLinePrice memory price) public onlyAdminOrContractPart onlyOrdersInNegotiation {
        require(_fiatManager.contains(price.fiat), "OrderTrade: Fiat has not been registered");

        uint256 tradeLineId = _linesCounter.current();
        addLine(materialIds, productCategory);
        _orderLines[tradeLineId] = OrderLine(quantity, price, true);

        emit OrderLineAdded(tradeLineId);
        _updateSignatures(_msgSender());
    }

    // TODO: add update line logic here
    function updateOrderLine(uint256 id, uint256 quantity, OrderLinePrice memory price) public onlyAdminOrContractPart onlyOrdersInNegotiation {
        require(getOrderLineExists(id), "OrderTrade: Order line does not exist");
        require(getNegotiationStatus() != NegotiationStatus.COMPLETED, "OrderTrade: The order has been confirmed, it cannot be changed");
        require(_fiatManager.contains(price.fiat), "OrderTrade: Fiat has not been registered");

        _orderLines[id] = OrderLine(quantity, price, true);

        emit OrderLineUpdated(id);
        _updateSignatures(_msgSender());
    }

    function getNegotiationStatus() public view returns (NegotiationStatus) {
        if (!_hasCommissionerSigned && !_hasSupplierSigned) {
            return NegotiationStatus.INITIALIZED;
        } else if (_hasCommissionerSigned && _hasSupplierSigned) {
            return NegotiationStatus.COMPLETED;
        } else {
            return NegotiationStatus.PENDING;
        }
    }

    function updatePaymentDeadline(uint256 paymentDeadline) public onlyAdminOrContractPart onlyOrdersInNegotiation {
        _paymentDeadline = paymentDeadline;
        _updateSignatures(_msgSender());
    }

    function updateDocumentDeliveryDeadline(uint256 documentDeliveryDeadline) public onlyAdminOrContractPart onlyOrdersInNegotiation {
        _documentDeliveryDeadline = documentDeliveryDeadline;
        _updateSignatures(_msgSender());
    }

    function updateArbiter(address arbiter) public onlyAdminOrContractPart onlyOrdersInNegotiation {
        _arbiter = arbiter;
        _updateSignatures(_msgSender());
    }

    function updateShippingDeadline(uint256 shippingDeadline) public onlyAdminOrContractPart onlyOrdersInNegotiation {
        _shippingDeadline = shippingDeadline;
        _updateSignatures(_msgSender());
    }

    function updateDeliveryDeadline(uint256 deliveryDeadline) public onlyAdminOrContractPart onlyOrdersInNegotiation {
        _deliveryDeadline = deliveryDeadline;
        _updateSignatures(_msgSender());
    }

    function confirmOrder() public onlyAdminOrContractPart {
        require(getNegotiationStatus() != NegotiationStatus.COMPLETED, "OrderTrade: The order has already been confirmed");
        if(_msgSender() == _supplier) {
            _hasSupplierSigned = true;
        } else if(_msgSender() == _commissioner) {
            _hasCommissionerSigned = true;
        }
        emit OrderSignatureAffixed(_msgSender());

        if(_hasSupplierSigned && _hasCommissionerSigned) {
            // TODO: should escrow be created here?
            emit OrderConfirmed();
        }
    }

    function _updateSignatures(address sender) private {
        if (sender == _supplier) {
            _hasSupplierSigned = true;
            _hasCommissionerSigned = false;
            emit OrderSignatureAffixed(sender);
        } else if (sender == _commissioner) {
            _hasSupplierSigned = false;
            _hasCommissionerSigned = true;
            emit OrderSignatureAffixed(sender);
        } else {
            _hasSupplierSigned = false;
            _hasCommissionerSigned = false;
        }
    }
}
