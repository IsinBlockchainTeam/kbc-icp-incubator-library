// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Trade.sol";
import "./Escrow.sol";
import "./EscrowManager.sol";
import "./KBCShipmentLibrary.sol";
import "./Shipment.sol";

contract OrderTrade is Trade {
    using Counters for Counters.Counter;

    enum NegotiationStatus {INITIALIZED, PENDING, CONFIRMED}
    enum OrderStatus { CONTRACTING, PRODUCTION, PAYED, EXPORTED, SHIPPED, COMPLETED }

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
    address private _shipmentAddress;

    constructor(RoleProof memory roleProof, uint256 tradeId, address delegateManagerAddress,  address productCategoryAddress, address materialManagerAddress, address documentManagerAddress,
        address unitManagerAddress, address supplier, address customer, address commissioner, string memory externalUrl,
        string memory metadataHash, uint256 paymentDeadline, uint256 documentDeliveryDeadline, address arbiter,
        uint256 shippingDeadline, uint256 deliveryDeadline, uint256 agreedAmount, address tokenAddress,
        address fiatManagerAddress, address escrowManagerAddress)
    Trade(roleProof, tradeId, delegateManagerAddress, productCategoryAddress, materialManagerAddress, documentManagerAddress, unitManagerAddress, supplier,
    customer, commissioner, externalUrl, metadataHash) {
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

    function getTrade(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (uint256, address, address, address, string memory, uint256[] memory, bool, bool, uint256, uint256, address, uint256, uint256, NegotiationStatus, uint256, address) {
        (uint256 tradeId, address supplier, address customer, address commissioner, string memory externalUrl, uint256[] memory lineIds) = _getTrade();
        return (tradeId, supplier, customer, commissioner, externalUrl, lineIds, _hasSupplierSigned, _hasCommissionerSigned, _paymentDeadline, _documentDeliveryDeadline, _arbiter, _shippingDeadline, _deliveryDeadline, getNegotiationStatus(), _agreedAmount, _tokenAddress);
    }

    function getTradeType(RoleProof memory roleProof) public override view atLeastViewer(roleProof) returns (TradeType) {
        return TradeType.ORDER;
    }

    function getLine(RoleProof memory roleProof, uint256 id) public view atLeastViewer(roleProof) returns (Line memory, OrderLine memory) {
        Line memory line = _getLine(roleProof, id);
        return (line, _orderLines[id]);
    }

    function addLine(RoleProof memory roleProof, uint256 productCategoryId, uint256 quantity, string memory unit, OrderLinePrice memory price) public onlyContractPart onlyOrdersInNegotiation atLeastEditor(roleProof) returns(uint256) {
        require(_fiatManager.contains(price.fiat), "OrderTrade: Fiat has not been registered");

        uint256 tradeLineId = _addLine(roleProof, productCategoryId, quantity, unit);
        _orderLines[tradeLineId] = OrderLine(price);

        emit OrderLineAdded(tradeLineId);
        _updateSignatures(_msgSender());
        return tradeLineId;
    }

    function updateLine(RoleProof memory roleProof, uint256 id, uint256 productCategoryId, uint256 quantity, string memory unit, OrderLinePrice memory price) public onlyContractPart onlyOrdersInNegotiation atLeastEditor(roleProof) {
        require(_fiatManager.contains(price.fiat), "OrderTrade: Fiat has not been registered");

        _updateLine(roleProof, id, productCategoryId, quantity, unit);
        _orderLines[id] = OrderLine(price);

        emit OrderLineUpdated(id);
        _updateSignatures(_msgSender());
    }

    function assignMaterial(RoleProof memory roleProof, uint256 lineId, uint256 materialId) public onlyContractPart atLeastEditor(roleProof) {
        _assignMaterial(roleProof, lineId, materialId);
        emit MaterialAssigned(lineId);
    }

    function getNegotiationStatus() public view returns (NegotiationStatus) {
        if (!_hasCommissionerSigned && !_hasSupplierSigned) {
            return NegotiationStatus.INITIALIZED;
        } else if (_hasCommissionerSigned && _hasSupplierSigned) {
            return NegotiationStatus.CONFIRMED;
        } else {
            return NegotiationStatus.PENDING;
        }
    }

    function updatePaymentDeadline(RoleProof memory roleProof, uint256 paymentDeadline) public onlyContractPart onlyOrdersInNegotiation atLeastEditor(roleProof) {
        _paymentDeadline = paymentDeadline;
        _updateSignatures(_msgSender());
    }

    function updateDocumentDeliveryDeadline(RoleProof memory roleProof, uint256 documentDeliveryDeadline) public onlyContractPart onlyOrdersInNegotiation atLeastEditor(roleProof) {
        _documentDeliveryDeadline = documentDeliveryDeadline;
        _updateSignatures(_msgSender());
    }

    function updateArbiter(RoleProof memory roleProof, address arbiter) public onlyContractPart onlyOrdersInNegotiation atLeastEditor(roleProof) {
        _arbiter = arbiter;
        _updateSignatures(_msgSender());
    }

    function updateShippingDeadline(RoleProof memory roleProof, uint256 shippingDeadline) public onlyContractPart onlyOrdersInNegotiation atLeastEditor(roleProof) {
        _shippingDeadline = shippingDeadline;
        _updateSignatures(_msgSender());
    }

    function updateDeliveryDeadline(RoleProof memory roleProof, uint256 deliveryDeadline) public onlyContractPart onlyOrdersInNegotiation atLeastEditor(roleProof) {
        _deliveryDeadline = deliveryDeadline;
        _updateSignatures(_msgSender());
    }

    function updateAgreedAmount(RoleProof memory roleProof, uint256 agreedAmount) public onlyContractPart onlyOrdersInNegotiation atLeastEditor(roleProof) {
        _agreedAmount = agreedAmount;
        _updateSignatures(_msgSender());
    }

    function updateTokenAddress(RoleProof memory roleProof, address tokenAddress) public onlyContractPart onlyOrdersInNegotiation atLeastEditor(roleProof) {
        _tokenAddress = tokenAddress;
        _updateSignatures(_msgSender());
    }

    function haveDeadlinesExpired() public view returns (bool) {
        if (getNegotiationStatus() == NegotiationStatus.CONFIRMED) {
            if ((block.timestamp > _paymentDeadline && _documentsByType[DocumentType.PAYMENT_INVOICE].length == 0) ||
                (block.timestamp > _documentDeliveryDeadline && _documentsByType[DocumentType.ORIGIN_SWISS_DECODE].length == 0 && _documentsByType[DocumentType.WEIGHT_CERTIFICATE].length == 0 && _documentsByType[DocumentType.FUMIGATION_CERTIFICATE].length == 0 && _documentsByType[DocumentType.PHYTOSANITARY_CERTIFICATE].length == 0 && _documentsByType[DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE].length == 0 && _documentsByType[DocumentType.INSURANCE_CERTIFICATE].length == 0) ||
                (block.timestamp > _shippingDeadline && _documentsByType[DocumentType.BILL_OF_LADING].length == 0) ||
                (block.timestamp > _deliveryDeadline && _documentsByType[DocumentType.COMPARISON_SWISS_DECODE].length == 0)
            ) {
                return true;
            }
        }
        return false;
    }

    function enforceDeadlines() public {
        if(haveDeadlinesExpired()) {
            _hasOrderExpired = true;
            // TODO: Refund _escrow
            emit OrderExpired();
        }
    }

    function getWhoSigned(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (address[] memory) {
        address[] memory signers = new address[](2);
        if (_hasSupplierSigned) {
            signers[0] = _supplier;
        }
        if (_hasCommissionerSigned) {
            signers[1] = _commissioner;
        }
        return signers;
    }

    function confirmOrder(RoleProof memory roleProof) public onlyContractPart onlyOrdersInNegotiation atLeastSigner(roleProof) {
        if (_msgSender() == _supplier) {
            _hasSupplierSigned = true;
        } else {
            _hasCommissionerSigned = true;
        }
        emit OrderSignatureAffixed(_msgSender());

        if (_hasSupplierSigned && _hasCommissionerSigned) {
            emit OrderConfirmed();
            _createShipment(roleProof);
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

    function _createShipment(RoleProof memory roleProof) private {
        require(_hasSupplierSigned && _hasCommissionerSigned, "OrderTrade: The order has not been confirmed yet");
        require(_shipmentAddress == address(0), "OrderTrade: Shipment already created");

        _escrow = _escrowManager.registerEscrow(roleProof, address(this), _supplier, _paymentDeadline - block.timestamp, _tokenAddress);

        // TODO: sampleApprovalRequired true if sample is required
        _shipmentAddress = address(new Shipment(roleProof, address(_delegateManager), _supplier, _commissioner, _externalUrl, address(_escrow), address(_documentManager), true));
        _escrow.addAdmin(_shipmentAddress);
    }
    function getShipment(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (address) {
        return _shipmentAddress;
    }

    function getEscrow(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (Escrow) {
        return _escrow;
    }
}
