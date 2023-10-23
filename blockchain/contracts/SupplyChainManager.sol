// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";
// --------------------------------------------------------------------------
// STRUCTS
// --------------------------------------------------------------------------
struct Material {
    uint256 id;
    string name;
    address owner;
    bool exists;
}


contract SupplyChainManager {
    using Counters for Counters.Counter;

    Counters.Counter private materialsCounter;
    // company => resource ids
    mapping(address => uint256[]) private materialIds;
    // resource id  => resource
    mapping(uint256 => Material) private materials;

    // --------------------------------------------------------------------------
    // Events
    // --------------------------------------------------------------------------
    event ResourceRegistered(string resourceType, address indexed owner, uint256 id);
    event ResourceUpdated(string resourceType, uint256 id);

    // --------------------------------------------------------------------------
    // Setters
    // --------------------------------------------------------------------------
    function registerMaterial(address company, string memory name) public {
        uint256 materialId = materialsCounter.current() + 1;
        materialsCounter.increment();
        materials[materialId] = Material(materialId, name, company, true);

        materialIds[company].push(materialId);
        emit ResourceRegistered("material", company, materialId);
    }

    function updateMaterial(uint256 id, string memory name) public {
        materials[id].name = name;
        emit ResourceUpdated("material", id);
    }

    // --------------------------------------------------------------------------
    // Getters
    // --------------------------------------------------------------------------
    function getMaterialsCounter() public view returns (uint256) {
        return materialsCounter.current();
    }

    function getMaterialIds(address owner) public view returns (uint256[] memory) {
        return materialIds[owner];
    }

    function getMaterial(uint256 id) public view returns (Material memory) {
        return materials[id];
    }

}
