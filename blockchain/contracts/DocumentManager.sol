// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";

//TODO: verificare in quale occasione va verificato se il sender ha il ruolo "ADMIN_ROLE"
contract DocumentManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event DocumentRegistered(uint256 indexed id, address owner, uint256 transactionId);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    struct Document {
        uint256 id;
        address owner;
        uint256 transactionId;
        string name;
        string documentType;
        string externalUrl;

        bool exists;
    }

    // owner => transaction id => document id => document
    mapping(address => mapping(uint256 => mapping(uint256 => Document))) private documents;
    // owner => document counter
    mapping(address => Counters.Counter) private documentsCounter;
    // owner => transaction id => document ids
    mapping(address => mapping(uint256 => uint256[])) private transactionDocuments;

    EnumerableType documentTypeManager;

    constructor(address[] memory admins, address documentTypeManagerAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        documentTypeManager = EnumerableType(documentTypeManagerAddress);
    }

    function registerDocument(address owner, uint256 transactionId, string memory name, string memory documentType, string memory externalUrl) public {
        require(owner == msg.sender, "Sender is not the owner of the document");
        require(documentTypeManager.contains(documentType), "The document type isn't registered");

        Counters.Counter storage documentCounter = documentsCounter[owner];
        uint256 documentId = documentCounter.current() + 1;
        documentCounter.increment();

        Document storage newDocument = documents[owner][transactionId][documentId];
        newDocument.id = documentId;
        newDocument.owner = owner;
        newDocument.transactionId = transactionId;
        newDocument.name = name;
        newDocument.documentType = documentType;
        newDocument.externalUrl = externalUrl;
        newDocument.exists = true;

        transactionDocuments[owner][transactionId].push(documentId);

        emit DocumentRegistered(documentId, owner, transactionId);
    }

    function getDocumentCounter(address owner) public view returns (uint256 counter) {
        return documentsCounter[owner].current();
    }

    function documentExists(address owner, uint256 transactionId, uint256 documentId) public view returns (bool) {
        return documents[owner][transactionId][documentId].exists;
    }

    function getDocumentInfo(address owner, uint256 transactionId, uint256 documentId) public view returns (Document memory) {
        Document memory document = documents[owner][transactionId][documentId];
        require(document.exists, "Document does not exist");

        return document;
    }

    function getTransactionDocumentIds(address owner, uint256 transactionId) public view returns (uint256[] memory) {
        return transactionDocuments[owner][transactionId];
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
