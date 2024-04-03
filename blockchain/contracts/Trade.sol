// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";
import "./DocumentManager.sol";
import "./ProductCategoryManager.sol";
import "./MaterialManager.sol";

abstract contract Trade is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum TradeStatus { SHIPPED, ON_BOARD, CONTRACTING }
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

    modifier onlyAdminOrContractPart() {
        require(_isContractPart(_msgSender()) || hasRole(ADMIN_ROLE, _msgSender()), "Trade: Caller is not a contract party or admin");
        _;
    }

    struct Line {
        uint256 id;
        uint256 productCategoryId;
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

    ProductCategoryManager internal _productCategoryManager;
    MaterialManager internal _materialManager;
    DocumentManager internal _documentManager;

    constructor(uint256 tradeId, address productCategoryAddress, address materialManagerAddress, address documentManagerAddress, address supplier, address customer, address commissioner, string memory externalUrl) {
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        _tradeId = tradeId;
        _productCategoryManager = ProductCategoryManager(productCategoryAddress);
        _materialManager = MaterialManager(materialManagerAddress);
        _documentManager = DocumentManager(documentManagerAddress);
        _supplier = supplier;
        _customer = customer;
        _commissioner = commissioner;
        _externalUrl = externalUrl;
    }

    function getLineCounter() public view returns (uint256) {
        return _lineCounter.current();
    }

    function _getTrade() internal view returns (uint256, address, address, address, string memory, uint256[] memory) {
        return (_tradeId, _supplier, _customer, _commissioner, _externalUrl, _lineIds);
    }

    function getTradeType() virtual public pure returns (TradeType);

    function _getLine(uint256 id) internal view returns (Line memory) {
        require(getLineExists(id), "Trade: Line does not exist");
        return _lines[id];
    }

    function getLineExists(uint256 id) public view returns (bool) {
        return _lines[id].exists;
    }

    function _addLine(uint256 productCategoryId) internal returns (uint256) {
        require(_productCategoryManager.getProductCategoryExists(productCategoryId), "Trade: Product category does not exist");

        uint256 tradeLineId = _lineCounter.current() + 1;
        _lineCounter.increment();

        _lines[tradeLineId] = Line(tradeLineId, productCategoryId, 0, true);
        _lineIds.push(tradeLineId);

        return tradeLineId;
    }

    function _updateLine(uint256 id, uint256 productCategoryId) internal {
        require(_lines[id].exists, "Trade: Line does not exist");
        require(_productCategoryManager.getProductCategoryExists(productCategoryId), "Trade: Product category does not exist");

        if(_lines[id].productCategoryId != productCategoryId)
            _lines[id].productCategoryId = productCategoryId;
    }

    function _assignMaterial(uint256 lineId, uint256 materialId) internal {
        require(_lines[lineId].exists, "Trade: Line does not exist");
        require(_materialManager.getMaterialExists(materialId), "Trade: Material does not exist");
        require(_lines[lineId].productCategoryId == _materialManager.getMaterial(materialId).productCategoryId, "Trade: Product category of material must match already specified product category of line");

        _lines[lineId].materialId = materialId;
    }

    function getTradeStatus() public view returns (TradeStatus) {
        uint256 documentsCounter = _documentManager.getDocumentsCounterByTransactionIdAndType(_tradeId, "trade");
        //require(documentsCounter > 0, "Trade: There are no documents related to this trade");
        if (documentsCounter == 0) return TradeStatus.CONTRACTING;

        if ((_documentManager.getDocumentsByDocumentType(_tradeId, "trade", DocumentManager.DocumentType.BILL_OF_LADING)).length > 0) return TradeStatus.ON_BOARD;
        if ((_documentManager.getDocumentsByDocumentType(_tradeId, "trade", DocumentManager.DocumentType.DELIVERY_NOTE)).length > 0) return TradeStatus.SHIPPED;
        revert("Trade: There are no documents with correct document type");
    }

    function addDocument(uint256 lineId, string memory name, DocumentManager.DocumentType documentType, string memory externalUrl, string memory contentHash) public onlyAdminOrContractPart {
        require(_lines[lineId].exists, "Trade: Line does not exist");
        require(_lines[lineId].materialId != 0, "Trade: A material must be assigned before adding a document for a line");
        _documentManager.registerDocument(_tradeId, "trade", name, documentType, externalUrl, contentHash);
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
