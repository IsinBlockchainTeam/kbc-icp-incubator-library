// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";
import "hardhat/console.sol";

contract DocumentManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TRADE_MANAGER_ROLE = keccak256("TRADE_MANAGER_ROLE");

    enum DocumentType { DELIVERY_NOTE, BILL_OF_LADING }

    event DocumentRegistered(uint256 indexed id, uint256 transactionId);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    struct Document {
        uint256 id;
        uint256 transactionId;
        string name;
        DocumentType documentType;
        string externalUrl;

        bool exists;
    }

    // transaction id => transaction type => document counter
    mapping(uint256 => mapping(string => Counters.Counter)) private documentsCounter;
    // TODO: si potrebbe cambiare nella seguente struttura e rimuovere il counter (la ricerca non verrà più fatta tramite id, ma direttamente a seconda del tipo di documento interessato)
    // transaction id => transaction type => document type => documents
    mapping(uint256 => mapping(string => mapping(DocumentType => Document[]))) private documents;
    // transaction id => transaction type => document id => document
//    mapping(uint256 => mapping(string => mapping(uint256 => Document))) private documents;

    EnumerableType transactionTypeManager;

    constructor(address[] memory admins, address transactionTypeAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(TRADE_MANAGER_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        transactionTypeManager = EnumerableType(transactionTypeAddress);
    }

    function registerDocument(uint256 transactionId, string memory transactionType, string memory name, DocumentType documentType, string memory externalUrl) public {
        //require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(TRADE_MANAGER_ROLE, msg.sender), "Sender has no permissions");
        require(transactionTypeManager.contains(transactionType), "The transaction type specified isn't registered");

        Counters.Counter storage documentCounter = documentsCounter[transactionId][transactionType];
        uint256 documentId = documentCounter.current() + 1;
        documentCounter.increment();

        documents[transactionId][transactionType][documentType].push(Document(documentId, transactionId, name, documentType, externalUrl, true));

        emit DocumentRegistered(documentId, transactionId);
    }

    function getDocumentsCounterByTransactionIdAndType(uint256 transactionId, string memory transactionType) public view returns (uint256 counter) {
        require(transactionTypeManager.contains(transactionType), "The transaction type specified isn't registered");
        return documentsCounter[transactionId][transactionType].current();
    }

    function getDocumentsByDocumentType(uint256 transactionId, string memory transactionType, DocumentType documentType) public view returns (Document[] memory) {
        require(transactionTypeManager.contains(transactionType), "The transaction type specified isn't registered");
        return documents[transactionId][transactionType][documentType];
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }

    function addTradeManager(address tradeManager) public onlyAdmin {
        grantRole(TRADE_MANAGER_ROLE, tradeManager);
    }

    function removeTradeManager(address tradeManager) public onlyAdmin {
        revokeRole(TRADE_MANAGER_ROLE, tradeManager);
    }
}
