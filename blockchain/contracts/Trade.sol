// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./DocumentManager.sol";
import "./ProductCategoryManager.sol";
import "./MaterialManager.sol";
import "./DocumentManager.sol";
import "./KBCAccessControl.sol";

abstract contract Trade is AccessControl, KBCAccessControl {
    using Counters for Counters.Counter;

    enum DocumentType {
        METADATA,
        DELIVERY_NOTE,
        BILL_OF_LADING,
        PAYMENT_INVOICE,
        ORIGIN_SWISS_DECODE,
        WEIGHT_CERTIFICATE,
        FUMIGATION_CERTIFICATE,
        PREFERENTIAL_ENTRY_CERTIFICATE,
        PHYTOSANITARY_CERTIFICATE,
        INSURANCE_CERTIFICATE,
        COMPARISON_SWISS_DECODE
    }

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum DocumentStatus { NOT_EVALUATED, APPROVED, NOT_APPROVED }
    enum TradeType { BASIC, ORDER }

    event TradeLineAdded(uint256 tradeLineId);
    event TradeLineUpdated(uint256 tradeLineId);
    event MaterialAssigned(uint256 tradeLineId);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Trade: Caller is not an admin");
        _;
    }

    modifier onlyContractPart() {
        require(_isContractPart(_msgSender()), "Trade: Caller is not a contract party");
        _;
    }

    struct Line {
        uint256 id;
        uint256 productCategoryId;
        uint256 quantity;
        string unit;
        uint256 materialId;
        bool exists;
    }

    uint256 internal _tradeId;

    // Who exports the goods
    address internal _supplier;
    // Who the goods are shipped to
    address internal _customer;
    // Who pays for the goods
    address internal _commissioner;

    string internal _externalUrl;

    mapping(uint256 => Line) internal _lines;
    uint256[] internal _lineIds;
    Counters.Counter internal _lineCounter;

    uint256[] private _documentIds;
    // document type => document ids
    mapping(DocumentType => uint256[]) internal _documentsByType;

    struct IsValidated {
        DocumentStatus status;
        bool exists;
    }
    mapping(uint256 => IsValidated) internal _documentsStatus;

    ProductCategoryManager internal _productCategoryManager;
    MaterialManager internal _materialManager;
    DocumentManager internal _documentManager;
    EnumerableType internal _unitManager;

    constructor(RoleProof memory roleProof, address delegateManagerAddress, uint256 tradeId, address productCategoryAddress, address materialManagerAddress, address documentManagerAddress, address unitManagerAddress, address supplier, address customer, address commissioner, string memory externalUrl, string memory metadataHash)  KBCAccessControl(delegateManagerAddress) {
        require(productCategoryAddress != address(0), "Trade: product category manager address is the zero address");
        require(materialManagerAddress != address(0), "Trade: material manager address is the zero address");
        require(documentManagerAddress != address(0), "Trade: document category manager address is the zero address");
        require(unitManagerAddress != address(0), "Trade: unit manager address is the zero address");
        require(_isAtLeastEditor(roleProof), "KBCAccessControl: Caller doesn't have role 'Editor' or higher");

        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        _tradeId = tradeId;
        _productCategoryManager = ProductCategoryManager(productCategoryAddress);
        _materialManager = MaterialManager(materialManagerAddress);
        _documentManager = DocumentManager(documentManagerAddress);
        _unitManager = EnumerableType(unitManagerAddress);
        _supplier = supplier;
        _customer = customer;
        _commissioner = commissioner;
        _externalUrl = string.concat(externalUrl, Strings.toString(tradeId));

        addDocument(roleProof, DocumentType.METADATA, string.concat(_externalUrl, "/files/metadata.json"), metadataHash);
    }

    function getLineCounter(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (uint256) {
        return _lineCounter.current();
    }

    function _getTrade() internal view returns (uint256, address, address, address, string memory, uint256[] memory) {
        return (_tradeId, _supplier, _customer, _commissioner, _externalUrl, _lineIds);
    }

    function getTradeType(RoleProof memory roleProof) virtual public view returns (TradeType);

    function _getLine(RoleProof memory roleProof, uint256 id) internal view returns (Line memory) {
        require(getLineExists(roleProof, id), "Trade: Line does not exist");
        return _lines[id];
    }

    function getLineExists(
        RoleProof memory roleProof,
        uint256 id
    ) public view atLeastViewer(roleProof) returns (bool) {
        return _lines[id].exists;
    }

    function _addLine(RoleProof memory roleProof, uint256 productCategoryId, uint256 quantity, string memory unit) internal returns (uint256) {
        require(_productCategoryManager.getProductCategoryExists(roleProof, productCategoryId), "Trade: Product category does not exist");
        require(_unitManager.contains(unit), "Trade: Unit has not been registered");

        uint256 tradeLineId = _lineCounter.current() + 1;
        _lineCounter.increment();

        _lines[tradeLineId] = Line(tradeLineId, productCategoryId, quantity, unit, 0, true);
        _lineIds.push(tradeLineId);

        return tradeLineId;
    }

    function _updateLine(RoleProof memory roleProof, uint256 id, uint256 productCategoryId, uint256 quantity, string memory unit) internal {
        require(_lines[id].exists, "Trade: Line does not exist");
        require(_productCategoryManager.getProductCategoryExists(roleProof, productCategoryId), "Trade: Product category does not exist");
        require(_unitManager.contains(unit), "Trade: Unit has not been registered");

        if(_lines[id].productCategoryId != productCategoryId)
            _lines[id].productCategoryId = productCategoryId;
        if (_lines[id].quantity != quantity)
            _lines[id].quantity = quantity;
        _lines[id].unit = unit;

    }

    function _assignMaterial(RoleProof memory roleProof, uint256 lineId, uint256 materialId) internal {
        require(_lines[lineId].exists, "Trade: Line does not exist");
        require(_materialManager.getMaterialExists(roleProof, materialId), "Trade: Material does not exist");
        require(_lines[lineId].productCategoryId == _materialManager.getMaterial(roleProof, materialId).productCategoryId, "Trade: Product category of material must match already specified product category of line");

        _lines[lineId].materialId = materialId;
    }

    function addDocument(RoleProof memory roleProof, DocumentType documentType, string memory externalUrl, string memory contentHash) public onlyContractPart atLeastEditor(roleProof) {
//        require(_lines[lineId].exists, "Trade: Line does not exist");
//        require(_lines[lineId].materialId != 0, "Trade: A material must be assigned before adding a document for a line");
        uint256 documentId = _documentManager.registerDocument(roleProof, externalUrl, contentHash, tx.origin);
        _documentIds.push(documentId);
        _documentsByType[documentType].push(documentId);
        _documentsStatus[documentId] = IsValidated(DocumentStatus.NOT_EVALUATED, true);
    }

//    TODO: il documento dovrebbe poter essere validato solamente dalla controparte. Chi ha immesso il documento non può approvare o rifiutare da solo
    // Una volta validato il documento, il documento non può essere più modificato?
    function validateDocument(
        RoleProof memory roleProof,
        uint256 documentId,
        DocumentStatus status
    ) public atLeastEditor(roleProof) {
        require(_documentsStatus[documentId].exists, "Trade: Document does not exist");
        require(status != DocumentStatus.NOT_EVALUATED, "Trade: Document status must be different from NOT_EVALUATED");

        _documentsStatus[documentId].status = status;
    }

    function updateDocument(RoleProof memory roleProof, uint256 documentId, string memory externalUrl, string memory contentHash) public onlyContractPart atLeastEditor(roleProof) {
        _documentManager.updateDocument(roleProof, documentId, externalUrl, contentHash, _msgSender());
    }

    function getAllDocumentIds(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (uint256[] memory) {
        return _documentIds;
    }

    function getDocumentIdsByType(
        RoleProof memory roleProof,
        DocumentType documentType
    ) public view atLeastViewer(roleProof) returns (uint256[] memory) {
        return _documentsByType[documentType];
    }

    function getDocumentStatus(
        RoleProof memory roleProof,
        uint256 documentId
    ) public view atLeastViewer(roleProof) returns (DocumentStatus) {
        return _documentsStatus[documentId].status;
    }

    function addAdmin(address account) public onlyAdmin {
        grantRole(ADMIN_ROLE, account);
    }

    function removeAdmin(address account) public onlyAdmin {
        revokeRole(ADMIN_ROLE, account);
    }

    function _isContractPart(address account) internal view returns (bool) {
        return account == _supplier || account == _commissioner;
    }
}
