// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Trade.sol";
import "./Escrow.sol";
import "hardhat/console.sol";
import "./EscrowManager.sol";
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
    Shipment private _shipment;

    constructor(uint256 tradeId, address productCategoryAddress, address materialManagerAddress, address documentManagerAddress,
        address unitManagerAddress, address supplier, address customer, address commissioner, string memory externalUrl,
        string memory metadataHash, uint256 paymentDeadline, uint256 documentDeliveryDeadline, address arbiter,
        uint256 shippingDeadline, uint256 deliveryDeadline, uint256 agreedAmount, address tokenAddress,
        address fiatManagerAddress, address escrowManagerAddress)
    Trade(tradeId, productCategoryAddress, materialManagerAddress, documentManagerAddress, unitManagerAddress, supplier,
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

    function getTrade() public view returns (uint256, address, address, address, string memory, uint256[] memory, bool, bool, uint256, uint256, address, uint256, uint256, NegotiationStatus, uint256, address, Escrow) {
        (uint256 tradeId, address supplier, address customer, address commissioner, string memory externalUrl, uint256[] memory lineIds) = _getTrade();
        return (tradeId, supplier, customer, commissioner, externalUrl, lineIds, _hasSupplierSigned, _hasCommissionerSigned, _paymentDeadline, _documentDeliveryDeadline, _arbiter, _shippingDeadline, _deliveryDeadline, getNegotiationStatus(), _agreedAmount, _tokenAddress, _escrow);
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
        if (!_hasCommissionerSigned && !_hasSupplierSigned) {
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

    function updateAgreedAmount(uint256 agreedAmount) public onlyAdminOrContractPart onlyOrdersInNegotiation {
        _agreedAmount = agreedAmount;
        _updateSignatures(_msgSender());
    }

    function updateTokenAddress(address tokenAddress) public onlyAdminOrContractPart onlyOrdersInNegotiation {
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
            _escrow.refundFunds(100);
            emit OrderExpired();
        }
    }

    function getWhoSigned() public view returns (address[] memory) {
        address[] memory signers = new address[](2);
        if (_hasSupplierSigned) {
            signers[0] = _supplier;
        }
        if (_hasCommissionerSigned) {
            signers[1] = _commissioner;
        }
        return signers;
    }

    function confirmOrder() public onlyContractPart onlyOrdersInNegotiation {
        if (_msgSender() == _supplier) {
            _hasSupplierSigned = true;
        } else {
            _hasCommissionerSigned = true;
        }
        emit OrderSignatureAffixed(_msgSender());

        if (_hasSupplierSigned && _hasCommissionerSigned) {
            emit OrderConfirmed();
        }
    }

    function getOrderStatus() public view returns (OrderStatus) {
        OrderStatus status = OrderStatus.CONTRACTING;

//        TODO: va valutato anche la DELIVERY_NOTE per gli ordini o solamente per i basic trade?
        if (getNegotiationStatus() == NegotiationStatus.CONFIRMED) status = OrderStatus.PRODUCTION;
        // TODO: gestire lo stato di trade "pagato". Capire se risulta pagato solamente nel momento in cui sono stati sbloccati tutti i fondi e l'intera transazione si è conclusa
        if (_documentsByType[DocumentType.PAYMENT_INVOICE].length > 0 && _areDocumentsApproved(_documentsByType[DocumentType.PAYMENT_INVOICE])) status = OrderStatus.PAYED;
        if (_documentsByType[DocumentType.ORIGIN_SWISS_DECODE].length > 0 && _documentsByType[DocumentType.WEIGHT_CERTIFICATE].length > 0 && _documentsByType[DocumentType.FUMIGATION_CERTIFICATE].length > 0 &&
            _documentsByType[DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE].length > 0 && _documentsByType[DocumentType.PHYTOSANITARY_CERTIFICATE].length > 0 && _documentsByType[DocumentType.INSURANCE_CERTIFICATE].length > 0 &&
            _areDocumentsApproved(_documentsByType[DocumentType.ORIGIN_SWISS_DECODE]) && _areDocumentsApproved(_documentsByType[DocumentType.WEIGHT_CERTIFICATE]) && _areDocumentsApproved(_documentsByType[DocumentType.FUMIGATION_CERTIFICATE]) &&
            _areDocumentsApproved(_documentsByType[DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE]) && _areDocumentsApproved(_documentsByType[DocumentType.PHYTOSANITARY_CERTIFICATE]) && _areDocumentsApproved(_documentsByType[DocumentType.INSURANCE_CERTIFICATE])
        ) status = OrderStatus.EXPORTED;
        if (_documentsByType[DocumentType.BILL_OF_LADING].length > 0 && _areDocumentsApproved(_documentsByType[DocumentType.BILL_OF_LADING])) status = OrderStatus.SHIPPED;
        if (_documentsByType[DocumentType.COMPARISON_SWISS_DECODE].length > 0 && _areDocumentsApproved(_documentsByType[DocumentType.COMPARISON_SWISS_DECODE])) status = OrderStatus.COMPLETED;

        return status;
    }

    function completeTransaction() public {
        require(getOrderStatus() == OrderStatus.COMPLETED, "Transaction is not completed until the goods have not been imported and the quality is the expected one");

        _escrow.releaseFunds(100);
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

    function _areDocumentsApproved(uint256[] memory documentIds) private view returns (bool) {
//        TODO: capire se bisogna mantenere più documenti per ogni tipo o se ne basta solo uno. Nel primo caso bisogna fare in modo allora che i documenti ricaricati dopo essere stati rifiutati non vengano considerati nel controllo (es. il rifiuto li rimuove da questa lista)
//        for (uint i = 0; i < documentIds.length; i++)
//            if (_documentsStatus[documentIds[i]].status != DocumentStatus.APPROVED) return false;
//        return true;
        for (uint i = 0; i < documentIds.length; i++)
            if (_documentsStatus[documentIds[i]].status == DocumentStatus.APPROVED) return true;
        return false;
    }

    function createShipment(uint256 expirationDate, uint256 quantity, uint256 weight, uint256 price) public {
        require(_hasSupplierSigned && _hasCommissionerSigned, "OrderTrade: The order has not been confirmed yet");
        require(_msgSender() == _supplier, "OrderTrade: Only the supplier can create the shipment");
        require(_shipment == Shipment(address(0)), "OrderTrade: Shipment already created");

        _escrow = _escrowManager.registerEscrow(address(this), _supplier, _paymentDeadline - block.timestamp, _tokenAddress);
        DocumentLibrary.DocumentType[] memory landTransportationRequiredDocuments = new DocumentLibrary.DocumentType[](3);
        landTransportationRequiredDocuments[0] = DocumentLibrary.DocumentType.INSURANCE_CERTIFICATE;
        landTransportationRequiredDocuments[1] = DocumentLibrary.DocumentType.BOOKING_CONFIRMATION;
        landTransportationRequiredDocuments[2] = DocumentLibrary.DocumentType.SHIPPING_NOTE;
        DocumentLibrary.DocumentType[] memory seaTransportationRequiredDocuments = new DocumentLibrary.DocumentType[](4);
        seaTransportationRequiredDocuments[0] = DocumentLibrary.DocumentType.WEIGHT_CERTIFICATE;
        seaTransportationRequiredDocuments[1] = DocumentLibrary.DocumentType.BILL_OF_LADING;
        seaTransportationRequiredDocuments[2] = DocumentLibrary.DocumentType.PHYTOSANITARY_CERTIFICATE;
        seaTransportationRequiredDocuments[3] = DocumentLibrary.DocumentType.SINGLE_EXPORT_DECLARATION;
        _shipment = new Shipment(
            expirationDate,
            quantity,
            weight,
            price,
            _supplier,
            _commissioner,
            address(_documentManager),
            address(_escrow),
            _externalUrl,
            landTransportationRequiredDocuments,
            seaTransportationRequiredDocuments
        );
        _escrow.addAdmin(address(_shipment));
    }
    function getShipment() public view returns (Shipment) {
        return _shipment;
    }

    function getEscrow() public view returns (Escrow) {
        return _escrow;
    }
}
