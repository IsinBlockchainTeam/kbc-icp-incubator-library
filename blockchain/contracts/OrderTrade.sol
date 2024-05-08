// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Trade.sol";
import "./Escrow.sol";
import "hardhat/console.sol";
import "./EscrowManager.sol";

contract OrderTrade is Trade {
    using Counters for Counters.Counter;

    enum NegotiationStatus {INITIALIZED, PENDING, CONFIRMED, EXPIRED}

    event OrderLineAdded(uint256 orderLineId);
    event OrderLineUpdated(uint256 orderLineId);
    event OrderSignatureAffixed(address signer);
    event OrderConfirmed();
    event OrderExpired();

    modifier onlyOrdersInNegotiation() {
        require(getNegotiationStatus() != NegotiationStatus.CONFIRMED, "OrderTrade: The order has already been confirmed, therefore it cannot be changed");
        _;
    }

    struct OrderLinePrice {
        uint256 amount;
        uint256 decimals;
        string fiat;
    }

    struct OrderLine {
        OrderLinePrice price;
    }

    // TODO: OldTradeManager -> pensare ad un map (supplier -> sign) per le firme (permetterebbe la gestione di firme da parte di più entità)
    // TODO: OldTradeManager -> capire se l'incoterm è definito a livello di ordine o di linea

    bool private _hasSupplierSigned;
    bool private _hasCommissionerSigned;
    bool private _hasOrderExpired;

    uint256 private _paymentDeadline;
    uint256 private _documentDeliveryDeadline;
    address private _arbiter;
    uint256 private _shippingDeadline;
    uint256 private _deliveryDeadline;

    // Additional mapping to Trade._lines
    mapping(uint256 => OrderLine) private _orderLines;

    Escrow private _escrow;
    // property used to construct the Escrow contract
    address private _tokenAddress;
    uint256 private _agreedAmount;

    EnumerableType private _fiatManager;
    EscrowManager private _escrowManager;

    constructor(uint256 tradeId, address productCategoryAddress, address materialManagerAddress, address documentManagerAddress, address supplier, address customer, address commissioner, string memory externalUrl, uint256 paymentDeadline, uint256 documentDeliveryDeadline, address arbiter, uint256 shippingDeadline, uint256 deliveryDeadline, uint256 agreedAmount, address tokenAddress, address fiatManagerAddress, address escrowManagerAddress) Trade(tradeId, productCategoryAddress, materialManagerAddress, documentManagerAddress, supplier, customer, commissioner, externalUrl) {
        require(escrowManagerAddress != address(0), "TradeManager: escrow manager address is the zero address");
        _tradeId = tradeId;
        _paymentDeadline = paymentDeadline;
        _documentDeliveryDeadline = documentDeliveryDeadline;
        _arbiter = arbiter;
        _shippingDeadline = shippingDeadline;
        _deliveryDeadline = deliveryDeadline;
        _fiatManager = EnumerableType(fiatManagerAddress);
        _escrowManager = EscrowManager(escrowManagerAddress);

        _tokenAddress = tokenAddress;
        _agreedAmount = agreedAmount;

        _hasSupplierSigned = false;
        _hasCommissionerSigned = false;
        _hasOrderExpired = false;
    }

    function getTrade() public view returns (uint256, address, address, address, string memory, uint256[] memory, bool, bool, uint256, uint256, address, uint256, uint256, Escrow, NegotiationStatus, uint256, address) {
        (uint256 tradeId, address supplier, address customer, address commissioner, string memory externalUrl, uint256[] memory lineIds) = _getTrade();
        return (tradeId, supplier, customer, commissioner, externalUrl, lineIds, _hasSupplierSigned, _hasCommissionerSigned, _paymentDeadline, _documentDeliveryDeadline, _arbiter, _shippingDeadline, _deliveryDeadline, _escrow, getNegotiationStatus(), _agreedAmount, _tokenAddress);
    }

    function getTradeType() public override pure returns (TradeType) {
        return TradeType.ORDER;
    }

    function getLine(uint256 id) public view returns (Line memory, OrderLine memory) {
        Line memory line = _getLine(id);
        return (line, _orderLines[id]);
    }

    function addLine(uint256 productCategoryId, uint256 quantity, string memory unit, OrderLinePrice memory price) public onlyAdminOrContractPart onlyOrdersInNegotiation returns(uint256) {
        require(_fiatManager.contains(price.fiat), "OrderTrade: Fiat has not been registered");

        uint256 tradeLineId = _addLine(productCategoryId, quantity, unit);
        _orderLines[tradeLineId] = OrderLine(price);

        emit OrderLineAdded(tradeLineId);
        _updateSignatures(_msgSender());
        return tradeLineId;
    }

    function updateLine(uint256 id, uint256 productCategoryId, uint256 quantity, string memory unit, OrderLinePrice memory price) public onlyAdminOrContractPart onlyOrdersInNegotiation {
        require(_fiatManager.contains(price.fiat), "OrderTrade: Fiat has not been registered");

        _updateLine(id, productCategoryId, quantity, unit);
        _orderLines[id] = OrderLine(price);

        emit OrderLineUpdated(id);
        _updateSignatures(_msgSender());
    }

    function assignMaterial(uint256 lineId, uint256 materialId) public onlyAdminOrContractPart {
        _assignMaterial(lineId, materialId);
        emit MaterialAssigned(lineId);
    }

    function getNegotiationStatus() public view returns (NegotiationStatus) {
        if(_hasOrderExpired) {
            return NegotiationStatus.EXPIRED;
        } else if (!_hasCommissionerSigned && !_hasSupplierSigned) {
            return NegotiationStatus.INITIALIZED;
        } else if (_hasCommissionerSigned && _hasSupplierSigned) {
            return NegotiationStatus.CONFIRMED;
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

    function haveDeadlinesExpired() public view returns (bool) {
        return getNegotiationStatus() == NegotiationStatus.CONFIRMED && (block.timestamp > _paymentDeadline || block.timestamp > _documentDeliveryDeadline || block.timestamp > _shippingDeadline || block.timestamp > _deliveryDeadline);
    }

    function enforceDeadlines() public {
        if(haveDeadlinesExpired()) {
            _hasOrderExpired = true;
            emit OrderExpired();
        }
    }

    function confirmOrder() public onlyContractPart onlyOrdersInNegotiation {
        if (_msgSender() == _supplier) {
            _hasSupplierSigned = true;
        } else {
            _hasCommissionerSigned = true;
        }
        emit OrderSignatureAffixed(_msgSender());

        if (_hasSupplierSigned && _hasCommissionerSigned) {
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
