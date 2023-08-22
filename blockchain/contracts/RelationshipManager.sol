// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RelationshipManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event RelationshipRegistered(uint256 indexed id, address companyA, address companyB);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    struct Relationship {
        uint256 id;
        address companyA;
        address companyB;
        uint256 validFrom;
        uint256 validUntil;
        bool exists;
    }

    // relationship id => relationship
    mapping(uint256 => Relationship) private relationships;
    // relationship id counter
    Counters.Counter private relationshipCounter;
    // company => relationship ids
    mapping(address => uint256[]) private companyRelationships;

    constructor(address[] memory admins) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }
    }

    function registerRelationship(address companyA, address companyB, uint256 validFrom, uint256 validUntil) public {
        require(companyA == msg.sender || companyB == msg.sender, "Sender is not one of the two entities involved in the relationship");
        require(companyA != companyB, "Fields 'companyA' and 'companyB' must be different");

        uint256 id = relationshipCounter.current() + 1;
        relationshipCounter.increment();

        Relationship storage newRelationship = relationships[id];
        newRelationship.id = id;
        newRelationship.companyA = companyA;
        newRelationship.companyB = companyB;
        newRelationship.validFrom = validFrom;
        newRelationship.validUntil = validUntil;
        newRelationship.exists = true;

        companyRelationships[companyA].push(id);
        companyRelationships[companyB].push(id);

        emit RelationshipRegistered(id, companyA, companyB);
    }

    function getRelationshipCounter() public view returns (uint256 counter) {
        return relationshipCounter.current();
    }

    function getRelationshipInfo(uint256 relationshipId) public view returns (Relationship memory) {
        require(relationships[relationshipId].exists, "Relationship does not exist");

        return (relationships[relationshipId]);
    }

    function getRelationshipIdsByCompany(address company) public view returns (uint256[] memory) {
        return companyRelationships[company];
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
