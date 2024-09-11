// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./DocumentManager.sol";
import "./Escrow.sol";
import "./KBCShipmentLibrary.sol";

library DocumentLibrary {
    enum DocumentType {
        SERVICE_GUIDE,
        SENSORY_EVALUATION_ANALYSIS_REPORT,
        SUBJECT_TO_APPROVAL_OF_SAMPLE,
        PRE_SHIPMENT_SAMPLE,
        SHIPPING_INSTRUCTIONS,
        SHIPPING_NOTE,
        BOOKING_CONFIRMATION,
        CARGO_COLLECTION_ORDER,
        EXPORT_INVOICE,
        TRANSPORT_CONTRACT,
        TO_BE_FREED_SINGLE_EXPORT_DECLARATION,
        EXPORT_CONFIRMATION,
        FREED_SINGLE_EXPORT_DECLARATION,
        CONTAINER_PROOF_OF_DELIVERY,
        PHYTOSANITARY_CERTIFICATE,
        BILL_OF_LADING,
        ORIGIN_CERTIFICATE_ICO,
        WEIGHT_CERTIFICATE,
        GENERIC
    }
    enum DocumentEvaluationStatus {
        NOT_EVALUATED,
        APPROVED,
        NOT_APPROVED
    }
    struct DocumentInfo {
        uint id;
        DocumentType dType;
        DocumentEvaluationStatus status;
        address uploader;
        bool exists;
    }
}
contract Shipment is AccessControl, KBCAccessControl {
    enum Phase { PHASE_1, PHASE_2, PHASE_3, PHASE_4, PHASE_5, CONFIRMED, ARBITRATION }
    enum EvaluationStatus { NOT_EVALUATED, APPROVED, NOT_APPROVED }
    enum FundsStatus { NOT_LOCKED, LOCKED, RELEASED }

    // Attributes
    address private _supplier;
    address private _commissioner;
    string private _externalUrl;
    Escrow internal _escrow;
    DocumentManager internal _documentManager;

    EvaluationStatus private _sampleEvaluationStatus;
    EvaluationStatus private _detailsEvaluationStatus;
    EvaluationStatus private _qualityEvaluationStatus;
    FundsStatus private _fundsStatus;

    bool private _sampleEvaluationRequired;
    bool private _detailsSet;
    uint256 private _shipmentNumber;
    // TODO: date by witch the 4th phase should be completed
    uint256 private _expirationDate;
    uint256 private _fixingDate;
    string private _targetExchange;
    uint256 private _differentialApplied;
    uint256 private _price;
    uint256 private _quantity;
    uint256 private _containersNumber;
    uint256 private _netWeight;
    uint256 private _grossWeight;

    // For non-generic documents only one document of each type is allowed
    mapping(DocumentLibrary.DocumentType => uint256[]) private _documentsIdsByType;
    mapping(uint256 => DocumentLibrary.DocumentInfo) private _documentsInfoById;

    constructor(
        RoleProof memory roleProof,
        address delegateManagerAddress,
        address supplier,
        address commissioner,
        string memory externalUrl,
        address escrow,
        address documentManager,
        bool sampleApprovalRequired
    ) KBCAccessControl(delegateManagerAddress) {
        require(_isAtLeastEditor(roleProof), "KBCAccessControl: Caller doesn't have role 'Editor' or higher");
        _supplier = supplier;
        _commissioner = commissioner;
        _externalUrl = externalUrl;
        _escrow = Escrow(escrow);
        _documentManager = DocumentManager(documentManager);

        _sampleEvaluationStatus = EvaluationStatus.NOT_EVALUATED;
        _detailsEvaluationStatus = EvaluationStatus.NOT_EVALUATED;
        _qualityEvaluationStatus = EvaluationStatus.NOT_EVALUATED;
        _fundsStatus = FundsStatus.NOT_LOCKED;

        _sampleEvaluationRequired = sampleApprovalRequired;
        _detailsSet = false;
    }

    // Modifiers
    modifier onlySupplier() {
        require(_msgSender() == _supplier, "Shipment: Caller is not the supplier");
        _;
    }
    modifier onlyCommissioner() {
        require(_msgSender() == _commissioner, "Shipment: Caller is not the commissioner");
        _;
    }
    modifier onlySupplierOrCommissioner() {
        require(_msgSender() == _supplier || _msgSender() == _commissioner, "Shipment: Caller is not the supplier or commissioner");
        _;
    }

    // Getters
    function getShipment(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (address supplier, address commissioner, string memory externalUrl, Escrow escrow, DocumentManager documentManager, EvaluationStatus sampleEvaluationStatus, EvaluationStatus detailsEvaluationStatus, EvaluationStatus qualityEvaluationStatus, FundsStatus fundsStatus, bool detailsSet, uint256 shipmentNumber, uint256 expirationDate, uint256 fixingDate, string memory targetExchange, uint256 differentialApplied, uint256 price, uint256 quantity, uint256 containersNumber, uint256 netWeight, uint256 grossWeight) {
        return (_supplier, _commissioner, _externalUrl, _escrow, _documentManager, _sampleEvaluationStatus, _detailsEvaluationStatus, _qualityEvaluationStatus, _fundsStatus, _detailsSet, _shipmentNumber, _expirationDate, _fixingDate, _targetExchange, _differentialApplied, _price, _quantity, _containersNumber, _netWeight, _grossWeight);
    }
    function _areDocumentsUploadedAndApproved(RoleProof memory roleProof, DocumentLibrary.DocumentType[] memory requiredDocuments) private view returns (bool) {
        for(uint256 i = 0; i < requiredDocuments.length; i++) {
            uint256[] memory documentsIds = getDocumentsIds(roleProof, requiredDocuments[i]);
            if(documentsIds.length == 0)
                return false;
            DocumentLibrary.DocumentInfo memory documentInfo = getDocumentInfo(roleProof, documentsIds[0]);
            if(documentInfo.status != DocumentLibrary.DocumentEvaluationStatus.APPROVED)
                return false;
        }
        return true;
    }
    function getPhase(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (Phase) {
        if(!_areDocumentsUploadedAndApproved(roleProof, KBCShipmentLibrary.getPhase1RequiredDocuments()))
            return Phase.PHASE_1;
        if(_sampleEvaluationRequired && _sampleEvaluationStatus != EvaluationStatus.APPROVED)
            return Phase.PHASE_1;

        if(!_areDocumentsUploadedAndApproved(roleProof, KBCShipmentLibrary.getPhase2RequiredDocuments()))
            return Phase.PHASE_2;
        if(_detailsEvaluationStatus != EvaluationStatus.APPROVED)
            return Phase.PHASE_2;

        if(!_areDocumentsUploadedAndApproved(roleProof, KBCShipmentLibrary.getPhase3RequiredDocuments()))
            return Phase.PHASE_3;
        if(_fundsStatus == FundsStatus.NOT_LOCKED)
            return Phase.PHASE_3;

        if(!_areDocumentsUploadedAndApproved(roleProof, KBCShipmentLibrary.getPhase4RequiredDocuments()))
            return Phase.PHASE_4;

        if(!_areDocumentsUploadedAndApproved(roleProof, KBCShipmentLibrary.getPhase5RequiredDocuments()))
            return Phase.PHASE_5;
        if(_qualityEvaluationStatus == EvaluationStatus.NOT_EVALUATED)
            return Phase.PHASE_5;

        if(_qualityEvaluationStatus == EvaluationStatus.APPROVED)
            return Phase.CONFIRMED;

        return Phase.ARBITRATION;
    }
    function getDocumentsIds(RoleProof memory roleProof, DocumentLibrary.DocumentType documentType) public view atLeastViewer(roleProof) returns (uint256[] memory) {
        return _documentsIdsByType[documentType];
    }
    function getDocumentInfo(RoleProof memory roleProof, uint256 documentId) public view atLeastViewer(roleProof) returns (DocumentLibrary.DocumentInfo memory) {
        return _documentsInfoById[documentId];
    }

    // Setters
    function setDetails(RoleProof memory roleProof, uint256 shipmentNumber, uint256 expirationDate, uint256 fixingDate, string memory targetExchange, uint256 differentialApplied, uint256 price, uint256 quantity, uint256 containersNumber, uint256 netWeight, uint256 grossWeight) public onlySupplier atLeastEditor(roleProof) {
        require(getPhase(roleProof) == Phase.PHASE_2, "Shipment: Shipment in wrong phase");
        require(_detailsEvaluationStatus != EvaluationStatus.APPROVED, "Shipment: Details already approved");

        _shipmentNumber = shipmentNumber;
        _expirationDate = expirationDate;
        _fixingDate = fixingDate;
        _targetExchange = targetExchange;
        _differentialApplied = differentialApplied;
        _price = price;
        _quantity = quantity;
        _containersNumber = containersNumber;
        _netWeight = netWeight;
        _grossWeight = grossWeight;
        _detailsSet = true;
    }
    function evaluateSample(RoleProof memory roleProof, EvaluationStatus evaluationStatus) public onlyCommissioner atLeastEditor(roleProof) {
        require(getPhase(roleProof) == Phase.PHASE_1, "Shipment: Shipment in wrong phase");
        require(_sampleEvaluationStatus != EvaluationStatus.APPROVED, "Shipment: Sample already approved");

        _sampleEvaluationStatus = evaluationStatus;
    }
    function evaluateDetails(RoleProof memory roleProof, EvaluationStatus evaluationStatus) public onlyCommissioner atLeastEditor(roleProof) {
        require(getPhase(roleProof) == Phase.PHASE_2, "Shipment: Shipment in wrong phase");
        require(_detailsSet, "Shipment: Details not set");
        require(_detailsEvaluationStatus != EvaluationStatus.APPROVED, "Shipment: Details already approved");

        _detailsEvaluationStatus = evaluationStatus;
    }
    function evaluateQuality(RoleProof memory roleProof, EvaluationStatus evaluationStatus) public onlyCommissioner atLeastEditor(roleProof) {
        require(getPhase(roleProof) == Phase.PHASE_5, "Shipment: Shipment in wrong phase");
        require(_qualityEvaluationStatus != EvaluationStatus.APPROVED, "Shipment: Quality already approved");

        _qualityEvaluationStatus = evaluationStatus;
    }
    function depositFunds(RoleProof memory roleProof, uint256 amount) public atLeastEditor(roleProof) {
        require(getPhase(roleProof) == Phase.PHASE_3, "Shipment: Shipment in wrong phase");
        require(_fundsStatus == FundsStatus.NOT_LOCKED, "Shipment: Funds already locked");

        _escrow.deposit(amount, _msgSender());

        uint256 totalLockedFunds = _escrow.getLockedAmount();
        uint256 requiredAmount = _price;
        if(_escrow.getTotalDepositedAmount() >= totalLockedFunds + requiredAmount) {
            _escrow.lockFunds(requiredAmount);
            _fundsStatus = FundsStatus.LOCKED;
        }
    }
    function addDocument(RoleProof memory roleProof, DocumentLibrary.DocumentType documentType, string memory externalUrl, string memory contentHash) public onlySupplierOrCommissioner atLeastEditor(roleProof) {
        require(documentType == DocumentLibrary.DocumentType.GENERIC || _documentsIdsByType[documentType].length == 0 || _documentsInfoById[_documentsIdsByType[documentType][0]].status != DocumentLibrary.DocumentEvaluationStatus.APPROVED, "Shipment: Document of this type already approved");
        uint256 documentId = _documentManager.registerDocument(roleProof, externalUrl, contentHash, _msgSender());
        if(documentType == DocumentLibrary.DocumentType.GENERIC)
            _documentsIdsByType[documentType].push(documentId);
        else
            _documentsIdsByType[documentType] = [documentId];
        _documentsInfoById[documentId] = DocumentLibrary.DocumentInfo(documentId, documentType, DocumentLibrary.DocumentEvaluationStatus.NOT_EVALUATED, _msgSender(), true);
    }
    function updateDocument(RoleProof memory roleProof, uint256 documentId, string memory externalUrl, string memory contentHash) public onlySupplierOrCommissioner atLeastEditor(roleProof) {
        require(_documentsInfoById[documentId].exists, "Shipment: Document does not exist");
        require(_documentsInfoById[documentId].status != DocumentLibrary.DocumentEvaluationStatus.APPROVED, "Shipment: Document already approved");

        _documentManager.updateDocument(roleProof, documentId, externalUrl, contentHash, _msgSender());
        _documentsInfoById[documentId].uploader = _msgSender();
        _documentsInfoById[documentId].status = DocumentLibrary.DocumentEvaluationStatus.NOT_EVALUATED;
    }
    function evaluateDocument(RoleProof memory roleProof, uint256 documentId, DocumentLibrary.DocumentEvaluationStatus documentEvaluationStatus) public onlySupplierOrCommissioner atLeastEditor(roleProof) {
        require(_documentsInfoById[documentId].exists, "Shipment: Document does not exist");
        require(_documentsInfoById[documentId].uploader != _msgSender(), "Shipment: Caller is the uploader");
        require(_documentsInfoById[documentId].status != DocumentLibrary.DocumentEvaluationStatus.APPROVED, "Shipment: Document already approved");

        _documentsInfoById[documentId].status = documentEvaluationStatus;

        // Unlock funds if all required documents are approved
        if(getPhase(roleProof) == Phase.PHASE_5 && _fundsStatus == FundsStatus.LOCKED) {
            _escrow.releaseFunds(_price);
            _fundsStatus = FundsStatus.RELEASED;
        }
    }

    function getUploadableDocuments(Phase phase) public view returns (DocumentLibrary.DocumentType[] memory) {
        if(phase == Phase.PHASE_1) {
            return KBCShipmentLibrary.getPhase1Documents();
        }
        if(phase == Phase.PHASE_2) {
            return KBCShipmentLibrary.getPhase2Documents();
        }
        if(phase == Phase.PHASE_3) {
            return KBCShipmentLibrary.getPhase3Documents();
        }
        if(phase == Phase.PHASE_4) {
            return KBCShipmentLibrary.getPhase4Documents();
        }
        return KBCShipmentLibrary.getPhase5Documents();
    }
    function getRequiredDocuments(Phase phase) public view returns (DocumentLibrary.DocumentType[] memory) {
        if(phase == Phase.PHASE_1) {
            return KBCShipmentLibrary.getPhase1RequiredDocuments();
        }
        if(phase == Phase.PHASE_2) {
            return KBCShipmentLibrary.getPhase2RequiredDocuments();
        }
        if(phase == Phase.PHASE_3) {
            return KBCShipmentLibrary.getPhase3RequiredDocuments();
        }
        if(phase == Phase.PHASE_4) {
            return KBCShipmentLibrary.getPhase4RequiredDocuments();
        }
        return KBCShipmentLibrary.getPhase5RequiredDocuments();
    }
}
