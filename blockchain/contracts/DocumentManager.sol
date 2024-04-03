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

    event DocumentRegistered(uint256 indexed id, string contentHash);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    struct Document {
        uint256 id;
        string externalUrl;
        string contentHash;

        bool exists;
    }

    Counters.Counter private documentCounter;
    // document id => document
    mapping(uint256 => Document) private documents;

    constructor(address[] memory admins) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(TRADE_MANAGER_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }
    }

    function registerDocument(string memory externalUrl, string memory contentHash) public returns (uint256){
        uint256 documentId = documentCounter.current() + 1;
        documentCounter.increment();

        documents[documentId] = Document(documentId, externalUrl, contentHash, true);

        emit DocumentRegistered(documentId, contentHash);
        return documentId;
    }

    function getDocumentById(uint256 documentId) public view returns (Document memory) {
        return documents[documentId];
    }

    function getDocumentsCounter() public view returns (uint256 counter) {
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
