// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";

contract DocumentManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORDER_MANAGER_ROLE = keccak256("ORDER_MANAGER_ROLE");

    event DocumentRegistered(uint256 indexed id, uint256 transactionId);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    struct Document {
        uint256 id;
        uint256 transactionId;
        string name;
        string documentType;
        string externalUrl;

        bool exists;
    }

    // transaction id => transaction type => document counter
    mapping(uint256 => mapping(string => Counters.Counter)) private documentsCounter;
    // TODO: si potrebbe cambiare nella seguente struttura e rimuovere il counter (la ricerca non verrà più fatta tramite id, ma direttamente a seconda del tipo di documento interessato)
    // transaction id => transaction type => document type => documents
//    mapping(uint256 => mapping(string => mapping(string => Document[]))) private documents;
    // transaction id => transaction type => document id => document
    mapping(uint256 => mapping(string => mapping(uint256 => Document))) private documents;

    EnumerableType documentTypeManager;
    EnumerableType transactionTypeManager;

    constructor(address[] memory admins, address documentTypeManagerAddress, address transactionTypeAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(ORDER_MANAGER_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        documentTypeManager = EnumerableType(documentTypeManagerAddress);
        transactionTypeManager = EnumerableType(transactionTypeAddress);
    }

    function registerDocument(uint256 transactionId, string memory transactionType, string memory name, string memory documentType, string memory externalUrl) public {
        require(hasRole(ADMIN_ROLE, msg.sender) || hasRole(ORDER_MANAGER_ROLE, msg.sender), "Sender has no permissions");
        require(transactionTypeManager.contains(transactionType), "The transaction type specified isn't registered");
        require(documentTypeManager.contains(documentType), "The document type isn't registered");

        Counters.Counter storage documentCounter = documentsCounter[transactionId][transactionType];
        uint256 documentId = documentCounter.current() + 1;
        documentCounter.increment();

        Document storage newDocument = documents[transactionId][transactionType][documentId];
        newDocument.id = documentId;
        newDocument.transactionId = transactionId;
        newDocument.name = name;
        newDocument.documentType = documentType;
        newDocument.externalUrl = externalUrl;
        newDocument.exists = true;

        emit DocumentRegistered(documentId, transactionId);
    }

    function getDocumentsCounterByTransactionIdAndType(uint256 transactionId, string memory transactionType) public view returns (uint256 counter) {
        require(transactionTypeManager.contains(transactionType), "The transaction type specified isn't registered");
        return documentsCounter[transactionId][transactionType].current();
    }

    function documentExists(uint256 transactionId, string memory transactionType, uint256 documentId) public view returns (bool) {
        require(transactionTypeManager.contains(transactionType), "The transaction type specified isn't registered");
        return documents[transactionId][transactionType][documentId].exists;
    }

    function getDocument(uint256 transactionId, string memory transactionType, uint256 documentId) public view returns (Document memory) {
        require(transactionTypeManager.contains(transactionType), "The transaction type specified isn't registered");
        Document memory document = documents[transactionId][transactionType][documentId];
        require(document.exists, "Document does not exist");

        return document;
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }

    function addOrderManager(address orderManager) public onlyAdmin {
        grantRole(ORDER_MANAGER_ROLE, orderManager);
    }

    function removeOrderManager(address orderManager) public onlyAdmin {
        revokeRole(ORDER_MANAGER_ROLE, orderManager);
    }
}
