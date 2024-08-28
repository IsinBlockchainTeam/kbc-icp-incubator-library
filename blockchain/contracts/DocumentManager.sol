// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";
import "hardhat/console.sol";
import "./KBCAccessControl.sol";

contract DocumentManager is AccessControl, KBCAccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant TRADE_MANAGER_ROLE = keccak256("TRADE_MANAGER_ROLE");

    event DocumentRegistered(uint256 indexed id, string contentHash);
    event DocumentUpdated(uint256 indexed id, string contentHash);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "DocumentManager: Caller is not the admin");
        _;
    }

    struct Document {
        uint256 id;
        string externalUrl;
        string contentHash;
        address uploadedBy;

        bool exists;
    }

    Counters.Counter private documentCounter;
    // document id => document
    mapping(uint256 => Document) private documents;

    constructor(address delegateManagerAddress, address[] memory admins) KBCAccessControl(delegateManagerAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(TRADE_MANAGER_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }
    }

    function registerDocument(
        RoleProof memory roleProof,
        string memory externalUrl,
        string memory contentHash,
        address uploadedBy
    ) public atLeastEditor(roleProof) returns (uint256) {
        uint256 documentId = documentCounter.current() + 1;
        documentCounter.increment();

        documents[documentId] = Document(documentId, externalUrl, contentHash, uploadedBy, true);

        emit DocumentRegistered(documentId, contentHash);
        return documentId;
    }

    function updateDocument(
        RoleProof memory roleProof,
        uint256 documentId,
        string memory externalUrl,
        string memory contentHash,
        address uploadedBy
    ) public atLeastEditor(roleProof) {
        require(documents[documentId].exists, "DocumentManager: Document does not exist");
        require(documents[documentId].uploadedBy == uploadedBy, "DocumentManager: Can't update the uploader");
        // if the caller is not a smart contract and the document was not uploaded by the caller. If the caller is a wallet, it must be the uploader
        require(_msgSender() == tx.origin && documents[documentId].uploadedBy == tx.origin, "DocumentManager: Caller is not the uploader");

        documents[documentId].externalUrl = externalUrl;
        documents[documentId].contentHash = contentHash;
        emit DocumentUpdated(documentId, contentHash);
    }

    function getDocumentById(
        RoleProof memory roleProof,
        uint256 documentId
    ) public view atLeastViewer(roleProof) returns (Document memory) {
        return documents[documentId];
    }

    function getDocumentsCounter(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (uint256 counter) {
        return documentCounter.current();
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
