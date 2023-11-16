// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MaterialManager is AccessControl{
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    event MaterialRegistered(uint256 indexed id, address owner);
    event MaterialUpdated(uint256 indexed id);

    struct Material {
        uint256 id;
        string name;
        address owner;
        bool exists;
    }

    Counters.Counter private materialsCounter;
    // company => resource ids
    mapping(address => uint256[]) private materialIds;
    // resource id  => resource
    mapping(uint256 => Material) private materials;

    constructor(address[] memory admins) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }
    }

    function registerMaterial(address company, string memory name) public {
        uint256 materialId = materialsCounter.current() + 1;
        materialsCounter.increment();
        materials[materialId] = Material(materialId, name, company, true);

        materialIds[company].push(materialId);
        emit MaterialRegistered(materialId, company);
    }

    function updateMaterial(uint256 id, string memory name) public {
        materials[id].name = name;
        emit MaterialUpdated(id);
    }

    function getMaterialsCounter() public view returns (uint256) {
        return materialsCounter.current();
    }

    function getMaterialIds(address owner) public view returns (uint256[] memory) {
        return materialIds[owner];
    }

    function getMaterial(uint256 id) public view returns (Material memory) {
        return materials[id];
    }


    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}