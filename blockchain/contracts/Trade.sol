// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";
import "./DocumentManager.sol";

abstract contract Trade is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum TradeStatus { SHIPPED, ON_BOARD, CONTRACTING }
    enum TradeType { BASIC, ORDER }

    event TradeLineAdded(uint256 tradeLineId);
    event TradeLineUpdated(uint256 tradeLineId);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Trade: Caller is not the admin");
        _;
    }

    modifier onlyContractParty() {
        require(_msgSender() == _supplier || _msgSender() == _commissioner, "Trade: Caller is not a contract party");
        _;
    }

    modifier onlyAdminOrContractPart() {
        require(_msgSender() == _supplier || _msgSender() == _commissioner || hasRole(ADMIN_ROLE, _msgSender()), "Trade: Caller is not a contract party or admin");
        _;
    }

    struct Line {
        uint256 id;
        uint256[2] materialsId;
        string productCategory;
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
    Counters.Counter internal _linesCounter;

    EnumerableType internal productCategoryManager;
    DocumentManager internal documentManager;

    constructor(uint256 tradeId, address productCategoryAddress, address documentManagerAddress, address supplier, address customer, address commissioner, string memory externalUrl) {
        _setupRole(ADMIN_ROLE, _msgSender());
        _setupRole(ADMIN_ROLE, _msgSender());

        _tradeId = tradeId;
        productCategoryManager = EnumerableType(productCategoryAddress);
        documentManager = DocumentManager(documentManagerAddress);
        _supplier = supplier;
        _customer = customer;
        _commissioner = commissioner;
        _externalUrl = externalUrl;
    }

    function getTrade() public view returns (uint256, address, address, address, string memory, uint256[] memory) {
        return (_tradeId, _supplier, _customer, _commissioner, _externalUrl, _lineIds);
    }

    function getTradeType() virtual public view returns (TradeType);

    function getLines() public view returns (Line[] memory) {
        Line[] memory lines = new Line[](_lineIds.length);
        for (uint256 i = 0; i < _lineIds.length; i++) {
            lines[i] = _lines[_lineIds[i]];
        }
        return lines;
    }

    function getLine(uint256 id) public view returns (Line memory) {
        require(getLineExists(id), "Trade: Line does not exist");
        return _lines[id];
    }

    function getLineExists(uint256 id) public view returns (bool) {
        return _lines[id].exists;
    }

    function addLine(uint256[2] memory materialIds, string memory productCategory) public onlyAdminOrContractPart {
        require(productCategoryManager.contains(productCategory), "Trade: Product category does not exist");

        uint256 tradeLineId = _linesCounter.current();
        _linesCounter.increment();

        _lines[tradeLineId] = Line(tradeLineId, materialIds, productCategory, true);
        _lineIds.push(tradeLineId);

        emit TradeLineAdded(tradeLineId);
    }

    function updateLine(uint256 id, uint256[2] memory materialIds, string memory productCategory) public onlyAdminOrContractPart {
        require(_lines[id].exists, "Trade: Line does not exist");
        require(productCategoryManager.contains(productCategory), "Trade: Product category does not exist");

        _lines[id].materialsId = materialIds;
        _lines[id].productCategory = productCategory;

        emit TradeLineUpdated(id);
    }

    function getTradeStatus() public view returns (TradeStatus) {
        uint256 documentsCounter = documentManager.getDocumentsCounterByTransactionIdAndType(_tradeId, "trade");
        //require(documentsCounter > 0, "Trade: There are no documents related to this trade");
        if (documentsCounter == 0) return TradeStatus.CONTRACTING;

        if ((documentManager.getDocumentsByDocumentType(_tradeId, "trade", DocumentManager.DocumentType.BILL_OF_LADING)).length > 0) return TradeStatus.ON_BOARD;
        if ((documentManager.getDocumentsByDocumentType(_tradeId, "trade", DocumentManager.DocumentType.DELIVERY_NOTE)).length > 0) return TradeStatus.SHIPPED;
        revert("Trade: There are no documents with correct document type");
    }

    function addDocument(string memory name, DocumentManager.DocumentType documentType, string memory externalUrl) public onlyAdminOrContractPart {
        documentManager.registerDocument(_tradeId, "trade", name, documentType, externalUrl);
    }

    function addAdmin(address account) public onlyAdmin {
        grantRole(ADMIN_ROLE, account);
    }

    function removeAdmin(address account) public onlyAdmin {
        revokeRole(ADMIN_ROLE, account);
    }
}