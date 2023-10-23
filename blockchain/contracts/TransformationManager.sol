// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./MaterialManager.sol";

contract TransformationManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event TransformationRegistered(uint256 indexed id, address owner);
    event TransformationUpdated(uint256 indexed id);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    struct Transformation {
        uint256 id;
        string name;
        MaterialManager.Material[] inputMaterials;
        uint256 outputMaterialId;
        address owner;
        bool exists;
    }

    Counters.Counter private transformationsCounter;
    // company => resource ids
    mapping(address => uint256[]) private transformationIds;
    // resource id  => resource
    mapping(uint256 => Transformation) private transformations;

    MaterialManager materialManager;

    constructor(address[] memory admins, address materialManagerAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        materialManager = MaterialManager(materialManagerAddress);
    }


    function registerTransformation(address company, string memory name, uint256[] memory inputMaterialsIds, uint256 outputMaterialId) public {
        uint256 transformationId = transformationsCounter.current() + 1;
        MaterialManager.Material[] memory inputMaterials = new MaterialManager.Material[](inputMaterialsIds.length);
        transformationsCounter.increment();
        for (uint256 i = 0; i < inputMaterialsIds.length; i++) {
            MaterialManager.Material memory m = materialManager.getMaterial(inputMaterialsIds[i]);
            require(m.exists, "Material does not exist");
            inputMaterials[i] = m;
        }

        transformations[transformationId] = Transformation(transformationId, name, inputMaterials, outputMaterialId, company, true);

        transformationIds[company].push(transformationId);
        emit TransformationRegistered(transformationId, company);
    }

    function updateTransformation(uint256 id, string memory name, uint256[] memory inputMaterialsIds, uint256 outputMaterialId) public {
        transformations[id].name = name;
        // erase the old element inside the inputMaterials array of a transformation
        transformations[id].inputMaterials = new MaterialManager.Material[](inputMaterialsIds.length);
        for (uint256 i = 0; i < inputMaterialsIds.length; i++) {
            MaterialManager.Material memory m = materialManager.getMaterial(inputMaterialsIds[i]);
            require(m.exists, "Material does not exist");
            transformations[id].inputMaterials[i] = m;
        }
        transformations[id].outputMaterialId = outputMaterialId;
        emit TransformationUpdated(id);
    }

    function getTransformationsCounter() public view returns (uint256) {
        return transformationsCounter.current();
    }

    function getTransformationIds(address owner) public view returns (uint256[] memory) {
        return transformationIds[owner];
    }

    function getTransformation(uint256 id) public view returns (Transformation memory) {
        return transformations[id];
    }


    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
