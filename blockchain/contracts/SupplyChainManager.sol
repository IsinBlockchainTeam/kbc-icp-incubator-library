// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/Counters.sol";

// --------------------------------------------------------------------------
// STRUCTS
// --------------------------------------------------------------------------
struct Material {
    uint256 id;
    string name;
    address owner;
}

struct Transformation {
    uint256 id;
    string name;
    uint256[] inputMaterialsIds;
    uint256 outputMaterialId;
    address owner;
}


contract SupplyChainManager {
    using Counters for Counters.Counter;

    mapping(address => Counters.Counter) private materialsCounter;
    mapping(address => Counters.Counter) private transformationsCounter;
    // company => resource id => resource
    mapping(address => mapping(uint256 => Material)) private materials;
    mapping(address => mapping(uint256 => Transformation)) private transformations;

    // --------------------------------------------------------------------------
    // Events
    // --------------------------------------------------------------------------
    event ResourceRegistered(string resourceType, address indexed owner, uint256 id);
    event ResourceUpdated(string resourceType, address indexed owner, uint256 id);

    // --------------------------------------------------------------------------
    // Setters
    // --------------------------------------------------------------------------
    function registerMaterial(address company, string memory name) public {
        uint256 materialId = materialsCounter[company].current() + 1;
        materials[company][materialId] = Material(materialId, name, company);
        emit ResourceRegistered("material", company, materialId);
        materialsCounter[company].increment();
    }


    function registerTransformation(address company, string memory name, uint256[] memory inputMaterialsIds, uint256 outputMaterialId) public {
        uint256 transformationId = transformationsCounter[company].current() + 1;
        transformations[company][transformationId] = Transformation(transformationId, name, inputMaterialsIds, outputMaterialId, company);
        emit ResourceRegistered("transformation", company, transformationId);
        transformationsCounter[company].increment();
    }

    function updateMaterial(address company, uint256 id, string memory name) public {
        materials[company][id].name = name;
        emit ResourceUpdated("material", company, id);
    }

    function updateTransformation(address company, uint256 id, string memory name, uint256[] memory inputMaterialsIds, uint256 outputMaterialId) public {
        transformations[company][id].name = name;
        transformations[company][id].inputMaterialsIds = inputMaterialsIds;
        transformations[company][id].outputMaterialId = outputMaterialId;
        emit ResourceUpdated("transformation", company, id);
    }

    // --------------------------------------------------------------------------
    // Getters
    // --------------------------------------------------------------------------
    function getMaterialsCounter(address company) public view returns (uint256) {
        return materialsCounter[company].current();
    }


    function getTransformationsCounter(address company) public view returns (uint256) {
        return transformationsCounter[company].current();
    }

    function getMaterial(address company, uint256 id) public view returns (Material memory) {
        return materials[company][id];
    }

    function getTransformation(address company, uint256 id) public view returns (Transformation memory) {
        return transformations[company][id];
    }

}
