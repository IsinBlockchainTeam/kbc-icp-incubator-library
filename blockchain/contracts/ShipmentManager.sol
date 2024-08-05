// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./DocumentManager.sol";
import "./Escrow.sol";

contract ShipmentManager{
    using Counters for Counters.Counter;

    enum ShipmentStatus {
        PENDING,
        SHIPPING,
        TRANSPORTATION,
        ONBOARDED,
        ARBITRATION,
        CONFIRMED
    }
    enum DocumentType {
        INSURANCE_CERTIFICATE,
        WEIGHT_CERTIFICATE,
        PREFERENTIAL_ENTRY_CERTIFICATE,
        BILL_OF_LADING
    }
    enum DocumentStatus { NOT_EVALUATED, APPROVED, NOT_APPROVED }
    enum ShipmentEvaluationStatus { NOT_EVALUATED, CONFIRMED, ARBITRATION }
    enum FundsStatus { NOT_LOCKED, LOCKED, RELEASED }

    struct DocumentInfo {
        uint id;
        DocumentType dType;
        DocumentStatus status;
        address uploader;
        bool exists;
    }
    struct Shipment {
        uint256 id;
        bool approved;
        uint256 date;
        uint256 quantity;
        uint256 weight;
        uint256 price;
        ShipmentEvaluationStatus evaluationStatus;
        uint256[] documentsIds;
        mapping(uint256 => DocumentInfo) documentsInfo;
        FundsStatus fundsStatus;
        bool exists;
    }

    Counters.Counter private _counter;
    mapping(uint256 => Shipment) private _shipments;
    address private _supplier;
    address private _commissioner;
    DocumentManager internal _documentManager;
    Escrow internal _escrow;

    constructor(
        address supplier,
        address commissioner,
        address documentManagerAddress,
        address escrowAddress) {
        _supplier = supplier;
        _commissioner = commissioner;

        _documentManager = DocumentManager(documentManagerAddress);
        _escrow = Escrow(escrowAddress);
    }

    // Modifiers
    modifier onlySupplier() {
        require(msg.sender == _supplier, "ShipmentManager: Caller is not the supplier");
        _;
    }
    modifier onlyCommissioner() {
        require(msg.sender == _commissioner, "ShipmentManager: Caller is not the commissioner");
        _;
    }

    // Events
    event ShipmentAdded(uint256 shipmentId);
    event ShipmentApproved(uint256 shipmentId);
    event ShipmentConfirmed(uint256 shipmentId);
    event ShipmentArbitrationStarted(uint256 shipmentId);
    event DocumentAdded(uint256 shipmentId, uint256 documentId);
    event DocumentUpdated(uint256 shipmentId, uint256 documentId);
    event DocumentApproved(uint256 shipmentId, uint256 documentId);
    event DocumentRejected(uint256 shipmentId, uint256 documentId);

    // Getters
    function getShipmentCounter() public view returns (uint256) {
        return _counter.current();
    }
    function getShipment(uint256 id) public view returns (uint256, bool, uint256, uint256, uint256, uint256, ShipmentEvaluationStatus, uint256[] memory, FundsStatus) {
        require(_shipments[id].exists, "ShipmentManager: Shipment does not exist");
        return (
            _shipments[id].id,
            _shipments[id].approved,
            _shipments[id].date,
            _shipments[id].quantity,
            _shipments[id].weight,
            _shipments[id].price,
            _shipments[id].evaluationStatus,
            _shipments[id].documentsIds,
            _shipments[id].fundsStatus
        );
    }
    function getShipmentStatus(uint256 shipmentId) public view returns (ShipmentStatus) {
        require(_shipments[shipmentId].exists, "ShipmentManager: Shipment does not exist");

        if(!_shipments[shipmentId].approved)
            return ShipmentStatus.PENDING;

        if (_shipments[shipmentId].fundsStatus == FundsStatus.NOT_LOCKED)
            return ShipmentStatus.SHIPPING;

        uint256[] memory icDocumentsIds = getDocumentsIdsByType(shipmentId, DocumentType.INSURANCE_CERTIFICATE);
        uint256[] memory wcDocumentsIds = getDocumentsIdsByType(shipmentId, DocumentType.WEIGHT_CERTIFICATE);
        uint256[] memory peDocumentIds = getDocumentsIdsByType(shipmentId, DocumentType.PREFERENTIAL_ENTRY_CERTIFICATE);
        uint256[] memory bolDocumentIds = getDocumentsIdsByType(shipmentId, DocumentType.BILL_OF_LADING);
        if(!(icDocumentsIds.length > 0 && wcDocumentsIds.length > 0 && peDocumentIds.length > 0 && bolDocumentIds.length > 0 &&
        _areDocumentsApproved(shipmentId, icDocumentsIds) &&
        _areDocumentsApproved(shipmentId, wcDocumentsIds) &&
        _areDocumentsApproved(shipmentId, peDocumentIds) &&
            _areDocumentsApproved(shipmentId, bolDocumentIds)))
            return ShipmentStatus.TRANSPORTATION;

        if(_shipments[shipmentId].evaluationStatus == ShipmentEvaluationStatus.NOT_EVALUATED)
            return ShipmentStatus.ONBOARDED;

        if(_shipments[shipmentId].evaluationStatus == ShipmentEvaluationStatus.ARBITRATION)
            return ShipmentStatus.ARBITRATION;

        return ShipmentStatus.CONFIRMED;
    }
    function getDocumentsIds(uint256 shipmentId) public view returns (uint256[] memory) {
        require(_shipments[shipmentId].exists, "ShipmentManager: Shipment does not exist");
        return _shipments[shipmentId].documentsIds;
    }
    function getDocumentInfo(uint256 shipmentId, uint256 documentId) public view returns (DocumentInfo memory) {
        require(_shipments[shipmentId].exists, "ShipmentManager: Shipment does not exist");
        require(_shipments[shipmentId].documentsInfo[documentId].exists, "ShipmentManager: Document does not exist");
        return _shipments[shipmentId].documentsInfo[documentId];
    }
    function _areDocumentsApproved(uint256 shipmentId, uint256[] memory documentIds) private view returns (bool) {
        for (uint i = 0; i < documentIds.length; i++)
            if (_shipments[shipmentId].documentsInfo[documentIds[i]].status == DocumentStatus.APPROVED) return true;
        return false;
    }
    function getDocumentsIdsByType(uint256 shipmentId, DocumentType documentType) public view returns (uint256[] memory filteredDocumentsIds) {
        require(_shipments[shipmentId].exists, "ShipmentManager: Shipment does not exist");

        uint256 documentsIdsCount = _shipments[shipmentId].documentsIds.length;
        uint256[] memory documentsIdsTemp = new uint256[](documentsIdsCount);
        uint256 count = 0;
        for(uint256 i = 0; i < documentsIdsCount; i++) {
            uint256 documentId = _shipments[shipmentId].documentsIds[i];
            if (_shipments[shipmentId].documentsInfo[documentId].dType == documentType) {
                documentsIdsTemp[count] = _shipments[shipmentId].documentsIds[i];
                count++;
            }
        }

        filteredDocumentsIds = new uint256[](count);
        for(uint256 i = 0; i < count; i++) {
            filteredDocumentsIds[i] = documentsIdsTemp[i];
        }
    }

    // Functions
    function addShipment(uint256 date, uint256 quantity, uint256 weight, uint256 price) public onlySupplier {
        _counter.increment();
        uint256 id = _counter.current();
        Shipment storage shipment = _shipments[id];
        shipment.id = id;
        shipment.date = date;
        shipment.quantity = quantity;
        shipment.weight = weight;
        shipment.price = price;
        shipment.evaluationStatus = ShipmentEvaluationStatus.NOT_EVALUATED;
        shipment.fundsStatus = FundsStatus.NOT_LOCKED;
        shipment.exists = true;
        emit ShipmentAdded(id);
    }
    function approveShipment(uint256 shipmentId) public onlyCommissioner {
        require(_shipments[shipmentId].exists, "ShipmentManager: Shipment does not exist");
        require(getShipmentStatus(shipmentId) == ShipmentStatus.PENDING, "ShipmentManager: Shipment is not in pending phase");

        _shipments[shipmentId].approved = true;
        emit ShipmentApproved(shipmentId);
    }
    function lockFunds(uint256 shipmentId) public onlyCommissioner {
        require(_shipments[shipmentId].exists, "ShipmentManager: Shipment does not exist");
        require(getShipmentStatus(shipmentId) == ShipmentStatus.SHIPPING, "ShipmentManager: Shipment is not in shipping phase");
        require(_shipments[shipmentId].fundsStatus == FundsStatus.NOT_LOCKED, "ShipmentManager: Funds already locked");
        uint256 totalLockedFunds = _escrow.getLockedAmount();
        uint256 amountToLock = _shipments[shipmentId].price;
        require(_escrow.getTotalDepositedAmount() >= totalLockedFunds + amountToLock, "ShipmentManager: Not enough funds to lock");

        _shipments[shipmentId].fundsStatus = FundsStatus.LOCKED;
        _escrow.lockFunds(amountToLock);
    }
    function _releaseFunds(uint256 shipmentId) private {
        require(_shipments[shipmentId].exists, "ShipmentManager: Shipment does not exist");
        require(getShipmentStatus(shipmentId) == ShipmentStatus.ONBOARDED, "ShipmentManager: Shipment is not in onboarded phase");
        require(_shipments[shipmentId].fundsStatus == FundsStatus.LOCKED, "ShipmentManager: Funds are not locked");

        uint256 amountToUnlock = _shipments[shipmentId].price;

        _shipments[shipmentId].fundsStatus = FundsStatus.RELEASED;
        _escrow.releaseFunds(amountToUnlock);
    }
    function confirmShipment(uint256 shipmentId) public onlyCommissioner {
        require(_shipments[shipmentId].exists, "ShipmentManager: Shipment does not exist");
        require(getShipmentStatus(shipmentId) == ShipmentStatus.ONBOARDED, "ShipmentManager: Shipment is not onboarded");
        require(_shipments[shipmentId].evaluationStatus == ShipmentEvaluationStatus.NOT_EVALUATED, "ShipmentManager: Shipment already evaluated");

        _shipments[shipmentId].evaluationStatus = ShipmentEvaluationStatus.CONFIRMED;
        emit ShipmentConfirmed(shipmentId);
    }
    function startShipmentArbitration(uint256 shipmentId) public onlyCommissioner {
        require(_shipments[shipmentId].exists, "ShipmentManager: Shipment does not exist");
        require(getShipmentStatus(shipmentId) == ShipmentStatus.ONBOARDED, "ShipmentManager: Shipment is not onboarded");
        require(_shipments[shipmentId].evaluationStatus == ShipmentEvaluationStatus.NOT_EVALUATED, "ShipmentManager: Shipment already evaluated");

        _shipments[shipmentId].evaluationStatus = ShipmentEvaluationStatus.ARBITRATION;
        emit ShipmentArbitrationStarted(shipmentId);
    }
    function addDocument(uint256 shipmentId, DocumentType documentType, string memory externalUrl, string memory contentHash) public onlySupplier {
        require(_shipments[shipmentId].exists, "ShipmentManager: Shipment does not exist");

        uint256 documentId = _documentManager.registerDocument(externalUrl, contentHash, tx.origin);
        _shipments[shipmentId].documentsIds.push(documentId);
        _shipments[shipmentId].documentsInfo[documentId] = DocumentInfo(documentId, documentType, DocumentStatus.NOT_EVALUATED, msg.sender, true);
        emit DocumentAdded(shipmentId, documentId);
    }
    function updateDocument(uint256 shipmentId, uint256 documentId, string memory externalUrl, string memory contentHash) public onlySupplier {
        require(_shipments[shipmentId].exists, "ShipmentManager: Shipment does not exist");
        require(_shipments[shipmentId].documentsInfo[documentId].exists, "ShipmentManager: Document does not exist");
        require(_shipments[shipmentId].documentsInfo[documentId].status != DocumentStatus.APPROVED, "ShipmentManager: Document already approved");

        _documentManager.updateDocument(documentId, externalUrl, contentHash, msg.sender);
        _shipments[shipmentId].documentsInfo[documentId].status = DocumentStatus.NOT_EVALUATED;
        emit DocumentUpdated(shipmentId, documentId);
    }
    function _evaluateDocument(uint256 shipmentId, uint256 documentId, DocumentStatus status) private {
        require(_shipments[shipmentId].exists, "ShipmentManager: Shipment does not exist");
        require(_shipments[shipmentId].documentsInfo[documentId].exists, "ShipmentManager: Document does not exist");

        _shipments[shipmentId].documentsInfo[documentId].status = status;
    }
    function approveDocument(uint256 shipmentId, uint256 documentId) public onlyCommissioner {
        _evaluateDocument(shipmentId, documentId, DocumentStatus.APPROVED);
        // Unlock funds if all required documents are approved
        if(getShipmentStatus(shipmentId) == ShipmentStatus.ONBOARDED)
            _releaseFunds(shipmentId);
        emit DocumentApproved(shipmentId, documentId);
    }
    function rejectDocument(uint256 shipmentId, uint256 documentId) public onlyCommissioner {
        _evaluateDocument(shipmentId, documentId, DocumentStatus.NOT_APPROVED);
        emit DocumentRejected(shipmentId, documentId);
    }
}
