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
    bool exists;
}

struct Transformation {
    uint256 id;
    string name;
    Material[] inputMaterials;
    uint256 outputMaterialId;
    address owner;
    bool exists;
}


contract SupplyChainManager {
    using Counters for Counters.Counter;

    Counters.Counter private materialsCounter;
    Counters.Counter private transformationsCounter;
    // company => resource ids
    mapping(address => uint256[]) private materialIds;
    mapping(address => uint256[]) private transformationIds;
    // resource id  => resource
    mapping(uint256 => Material) private materials;
    mapping(uint256 => Transformation) private transformations;

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


    function registerTransformation(address company, string memory name, uint256[] memory inputMaterialsIds, uint256 outputMaterialId) public {
        uint256 transformationId = transformationsCounter.current() + 1;
        Material[] memory inputMaterials = new Material[](inputMaterialsIds.length);
        transformationsCounter.increment();
        for (uint256 i = 0; i < inputMaterialsIds.length; ++i) {
            Material memory m = getMaterial(inputMaterialsIds[i]);
            require(m.exists, "Material does not exist");
            materials[i] = m;
        }
        transformations[transformationId] = Transformation(transformationId, name, inputMaterials, outputMaterialId, company, true);

        transformationIds[company].push(transformationId);
        emit ResourceRegistered("transformation", company, transformationId);
    }

    function updateMaterial(uint256 id, string memory name) public {
        materials[id].name = name;
        emit ResourceUpdated("material", id);
    }

    function updateTransformation(uint256 id, string memory name, uint256[] memory inputMaterialsIds, uint256 outputMaterialId) public {
        transformations[id].name = name;
        // erase the old element inside the inputMaterials array of a transformation
        transformations[id].inputMaterials = new Material[](inputMaterialsIds.length);
        for (uint256 i = 0; i < inputMaterialsIds.length; ++i) {
            Material memory m = getMaterial(inputMaterialsIds[i]);
            require(m.exists, "Material does not exist");
            transformations[id].inputMaterials.push(m);
        }
        transformations[id].outputMaterialId = outputMaterialId;
        emit ResourceUpdated("transformation", id);
    }

    // --------------------------------------------------------------------------
    // Getters
    // --------------------------------------------------------------------------
    function getMaterialsCounter() public view returns (uint256) {
        return materialsCounter.current();
    }

    function getTransformationsCounter() public view returns (uint256) {
        return transformationsCounter.current();
    }

    function getMaterialIds(address company) public view returns (uint256[] memory) {
        return materialIds[company];
    }


    function getTransformationIds(address company) public view returns (uint256[] memory) {
        return transformationIds[company];
    }

    function getMaterial(uint256 id) public view returns (Material memory) {
        return materials[id];
    }

    function getTransformation(uint256 id) public view returns (Transformation memory) {
        return transformations[id];
    }

}
