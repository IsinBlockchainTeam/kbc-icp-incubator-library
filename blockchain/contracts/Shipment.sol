// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DocumentManager.sol";
import "./Escrow.sol";

library DocumentLibrary {
    enum DocumentType {
        INSURANCE_CERTIFICATE,
        BOOKING_CONFIRMATION,
        SHIPPING_NOTE,
        WEIGHT_CERTIFICATE,
        BILL_OF_LADING,
        PHYTOSANITARY_CERTIFICATE,
        SINGLE_EXPORT_DECLARATION,
        OTHER
    }
    enum DocumentStatus {
        NOT_EVALUATED,
        APPROVED,
        NOT_APPROVED
    }
    struct DocumentInfo {
        uint id;
        DocumentType dType;
        DocumentStatus status;
        address uploader;
        bool exists;
    }
}
contract Shipment is AccessControl, KBCAccessControl {
    enum Phase {
        APPROVAL,
        LAND_TRANSPORTATION,
        SEA_TRANSPORTATION,
        COMPARISON
    }
    enum ComparisonStatus { NOT_EVALUATED, CONFIRMED, ARBITRATION }
    enum FundsStatus { NOT_LOCKED, LOCKED, RELEASED }

    // Attributes
    bool private _approved;
    uint256 private _expirationDate;
    uint256 private _quantity;
    uint256 private _weight;
    uint256 private _price;
    ComparisonStatus private _comparisonStatus;
    uint256[] private _documentsIds;
    mapping(uint256 => DocumentLibrary.DocumentInfo) private _documentsInfo;
    FundsStatus private _fundsStatus;

    address private _supplier;
    address private _commissioner;
    DocumentManager internal _documentManager;
    Escrow internal _escrow;
    string private _externalUrl;

    DocumentLibrary.DocumentType[] private _landTransportationRequiredDocuments;
    DocumentLibrary.DocumentType[] private _seaTransportationRequiredDocuments;

    constructor(
        RoleProof memory roleProof,
        address delegateManagerAddress,
        uint256 expirationDate,
        uint256 quantity,
        uint256 weight,
        uint256 price,
        address supplier,
        address commissioner,
        address documentManagerAddress,
        address escrowAddress,
        string memory externalUrl,
        DocumentLibrary.DocumentType[] memory landTransportationRequiredDocuments,
        DocumentLibrary.DocumentType[] memory seaTransportationRequiredDocuments
    ) KBCAccessControl(delegateManagerAddress) {
        require(_isAtLeastEditor(roleProof), "KBCAccessControl: Caller doesn't have role 'Editor' or higher");
        _approved = false;
        _expirationDate = expirationDate;
        _quantity = quantity;
        _weight = weight;
        _price = price;
        _comparisonStatus = ComparisonStatus.NOT_EVALUATED;
        _fundsStatus = FundsStatus.NOT_LOCKED;

        _supplier = supplier;
        _commissioner = commissioner;

        _documentManager = DocumentManager(documentManagerAddress);
        _escrow = Escrow(escrowAddress);

        _externalUrl = externalUrl;

        _landTransportationRequiredDocuments = landTransportationRequiredDocuments;
        _seaTransportationRequiredDocuments = seaTransportationRequiredDocuments;
    }

    // Modifiers
    modifier shipmentApproved() {
        require(_approved, "ShipmentManager: Shipment not approved yet");
        _;
    }
    modifier onlySupplier() {
        require(_msgSender() == _supplier, "ShipmentManager: Caller is not the supplier");
        _;
    }
    modifier onlyCommissioner() {
        require(_msgSender() == _commissioner, "ShipmentManager: Caller is not the commissioner");
        _;
    }
    modifier onlySupplierOrCommissioner() {
        require(_msgSender() == _supplier || _msgSender() == _commissioner, "ShipmentManager: Caller is not the supplier or commissioner");
        _;
    }

    // Events
    event ShipmentCreated();
    event ShipmentUpdated();
    event ShipmentApproved();
    event ShipmentConfirmed();
    event ShipmentArbitrationStarted();
    event DocumentAdded(uint256 documentId);
    event DocumentUpdated(uint256 documentId);
    event DocumentApproved(uint256 documentId);
    event DocumentRejected(uint256 documentId);

    // Getters
    function getShipment(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (bool, uint256, uint256, uint256, uint256, ComparisonStatus, uint256[] memory, FundsStatus, string memory, DocumentLibrary.DocumentType[] memory, DocumentLibrary.DocumentType[] memory) {
        return (
            _approved,
            _expirationDate,
            _quantity,
            _weight,
            _price,
            _comparisonStatus,
            _documentsIds,
            _fundsStatus,
            _externalUrl,
            _landTransportationRequiredDocuments,
            _seaTransportationRequiredDocuments
        );
    }
    function getPhase(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (Phase) {
        if(!_approved)
            return Phase.APPROVAL;

        // check if all required documents for land transportation are uploaded and approved
        for(uint256 i = 0; i < _landTransportationRequiredDocuments.length; i++) {
            uint256[] memory documentsIds = getDocumentsIdsByType(roleProof, _landTransportationRequiredDocuments[i]);
            if(documentsIds.length == 0 || !_areDocumentsApproved(documentsIds))
                return Phase.LAND_TRANSPORTATION;
        }
        if (_fundsStatus == FundsStatus.NOT_LOCKED)
            return Phase.LAND_TRANSPORTATION;

        // check if all required documents for sea transportation are uploaded and approved
        for(uint256 i = 0; i < _seaTransportationRequiredDocuments.length; i++) {
            uint256[] memory documentsIds = getDocumentsIdsByType(roleProof, _seaTransportationRequiredDocuments[i]);
            if(documentsIds.length == 0 || !_areDocumentsApproved(documentsIds))
                return Phase.SEA_TRANSPORTATION;
        }

        return Phase.COMPARISON;
    }
    function getDocumentInfo(RoleProof memory roleProof, uint256 documentId) public view atLeastViewer(roleProof) returns (DocumentLibrary.DocumentInfo memory) {
        require(_documentsInfo[documentId].exists, "ShipmentManager: Document does not exist");
        return _documentsInfo[documentId];
    }
    function _areDocumentsApproved(uint256[] memory documentIds) private view returns (bool) {
        for (uint i = 0; i < documentIds.length; i++)
            if (_documentsInfo[documentIds[i]].exists && _documentsInfo[documentIds[i]].status == DocumentLibrary.DocumentStatus.APPROVED) return true;
        return false;
    }
    function getDocumentsIdsByType(RoleProof memory roleProof, DocumentLibrary.DocumentType documentType) public view atLeastViewer(roleProof) returns (uint256[] memory filteredDocumentsIds) {
        uint256 documentsIdsCount = _documentsIds.length;
        uint256[] memory documentsIdsTemp = new uint256[](documentsIdsCount);
        uint256 count = 0;
        for(uint256 i = 0; i < documentsIdsCount; i++) {
            uint256 documentId = _documentsIds[i];
            if (_documentsInfo[documentId].dType == documentType) {
                documentsIdsTemp[count] = _documentsIds[i];
                count++;
            }
        }

        filteredDocumentsIds = new uint256[](count);
        for(uint256 i = 0; i < count; i++) {
            filteredDocumentsIds[i] = documentsIdsTemp[i];
        }
    }
    function getAllDocumentIds(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (uint256[] memory) {
        return _documentsIds;
    }

    // Functions
    function updateShipment(RoleProof memory roleProof, uint256 expirationDate, uint256 quantity, uint256 weight, uint256 price) public onlySupplier atLeastEditor(roleProof) {
        require(!_approved, "ShipmentManager: Shipment already approved");

        _expirationDate = expirationDate;
        _quantity = quantity;
        _weight = weight;
        _price = price;
        _comparisonStatus = ComparisonStatus.NOT_EVALUATED;
        _fundsStatus = FundsStatus.NOT_LOCKED;

        emit ShipmentUpdated();
    }
    function approveShipment(RoleProof memory roleProof) public onlyCommissioner atLeastEditor(roleProof) {
        require(!_approved, "ShipmentManager: Shipment already approved");

        _approved = true;
        emit ShipmentApproved();
    }
    function depositFunds(RoleProof memory roleProof, uint256 amount) public shipmentApproved atLeastEditor(roleProof) {
        require(_fundsStatus == FundsStatus.NOT_LOCKED, "ShipmentManager: Funds already locked");
        require(getPhase(roleProof) == Phase.LAND_TRANSPORTATION, "ShipmentManager: Shipment is not in land transportation phase");

        _escrow.deposit(amount, _msgSender());

        uint256 totalLockedFunds = _escrow.getLockedAmount();
        uint256 requiredAmount = _price;
        if(_escrow.getTotalDepositedAmount() >= totalLockedFunds + requiredAmount) {
            _escrow.lockFunds(requiredAmount);
            _fundsStatus = FundsStatus.LOCKED;
        }
    }
    function addDocument(RoleProof memory roleProof, DocumentLibrary.DocumentType documentType, string memory externalUrl, string memory contentHash) public onlySupplierOrCommissioner shipmentApproved atLeastEditor(roleProof) {
        uint256 documentId = _documentManager.registerDocument(roleProof, externalUrl, contentHash, _msgSender());
        _documentsIds.push(documentId);
        _documentsInfo[documentId] = DocumentLibrary.DocumentInfo(documentId, documentType, DocumentLibrary.DocumentStatus.NOT_EVALUATED, _msgSender(), true);
        emit DocumentAdded(documentId);
    }
    function updateDocument(RoleProof memory roleProof, uint256 documentId, string memory externalUrl, string memory contentHash) public onlySupplierOrCommissioner shipmentApproved atLeastEditor(roleProof) {
        require(_documentsInfo[documentId].exists, "ShipmentManager: Document does not exist");
//        require(_documentsInfo[documentId].uploader == _msgSender(), "ShipmentManager: Caller is not the uploader");
        require(_documentsInfo[documentId].status != DocumentLibrary.DocumentStatus.APPROVED, "ShipmentManager: Document already approved");

        _documentManager.updateDocument(roleProof, documentId, externalUrl, contentHash, _msgSender());
        _documentsInfo[documentId].status = DocumentLibrary.DocumentStatus.NOT_EVALUATED;
        emit DocumentUpdated(documentId);
    }
    function approveDocument(RoleProof memory roleProof, uint256 documentId) public onlySupplierOrCommissioner shipmentApproved atLeastEditor(roleProof) {
        require(_documentsInfo[documentId].exists, "ShipmentManager: Document does not exist");
        require(_documentsInfo[documentId].uploader != _msgSender(), "ShipmentManager: Caller is the uploader");
        require(_documentsInfo[documentId].status == DocumentLibrary.DocumentStatus.NOT_EVALUATED, "ShipmentManager: Document already evaluated");

        _documentsInfo[documentId].status = DocumentLibrary.DocumentStatus.APPROVED;
        emit DocumentApproved(documentId);

        // Unlock funds if all required documents are approved
        if(getPhase(roleProof) == Phase.COMPARISON && _fundsStatus == FundsStatus.LOCKED) {
            _escrow.releaseFunds(_price);
            _fundsStatus = FundsStatus.RELEASED;
        }
    }
    function rejectDocument(RoleProof memory roleProof, uint256 documentId) public onlySupplierOrCommissioner shipmentApproved atLeastEditor(roleProof) {
        require(_documentsInfo[documentId].exists, "ShipmentManager: Document does not exist");
        require(_documentsInfo[documentId].status == DocumentLibrary.DocumentStatus.NOT_EVALUATED, "ShipmentManager: Document already evaluated");

        _documentsInfo[documentId].status = DocumentLibrary.DocumentStatus.NOT_APPROVED;
        emit DocumentRejected(documentId);
    }
    function confirmShipment(RoleProof memory roleProof) public onlyCommissioner shipmentApproved atLeastEditor(roleProof) {
        require(getPhase(roleProof) == Phase.COMPARISON, "ShipmentManager: Shipment is not in comparison phase");
        require(_comparisonStatus == ComparisonStatus.NOT_EVALUATED, "ShipmentManager: Shipment already evaluated");

        _comparisonStatus = ComparisonStatus.CONFIRMED;
        emit ShipmentConfirmed();
    }
    function startShipmentArbitration(RoleProof memory roleProof) public onlyCommissioner shipmentApproved atLeastEditor(roleProof) {
        require(getPhase(roleProof) == Phase.COMPARISON, "ShipmentManager: Shipment is not in comparison phase");
        require(_comparisonStatus == ComparisonStatus.NOT_EVALUATED, "ShipmentManager: Shipment already evaluated");

        _comparisonStatus = ComparisonStatus.ARBITRATION;
        emit ShipmentArbitrationStarted();
    }
}
