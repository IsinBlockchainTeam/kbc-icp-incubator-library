// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ProductCategoryManager.sol";
import "./KBCAccessControl.sol";

contract MaterialManager is AccessControl, KBCAccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "MaterialManager: Caller is not the admin");
        _;
    }

    event MaterialRegistered(uint256 indexed id, uint256 productCategoryId);
    event MaterialUpdated(uint256 indexed id);

    struct Material {
        uint256 id;
        uint256 productCategoryId;
        bool exists;
    }

    Counters.Counter private _counter;
    mapping(uint256 => Material) private _materials;
    mapping(address => uint256[]) private _createdMaterialIds;

    ProductCategoryManager private _productCategoryManager;

    constructor(address delegateManagerAddress, address productCategoryManagerAddress) KBCAccessControl(delegateManagerAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        grantRole(ADMIN_ROLE, _msgSender());

        _productCategoryManager = ProductCategoryManager(productCategoryManagerAddress);
    }

    function getMaterialsCounter(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (uint256) {
        return _counter.current();
    }

    function getMaterialExists(RoleProof memory roleProof, uint256 id) public view atLeastViewer(roleProof) returns (bool) {
        return _materials[id].exists;
    }

    function getMaterial(RoleProof memory roleProof, uint256 id) public view atLeastViewer(roleProof) returns (Material memory) {
        return _materials[id];
    }

    function getMaterialIdsOfCreator(RoleProof memory roleProof, address creator) public view atLeastViewer(roleProof) returns (uint256[] memory) {
        return _createdMaterialIds[creator];
    }

    function registerMaterial(RoleProof memory roleProof, uint256 productCategoryId) public atLeastEditor(roleProof) {
        require(_productCategoryManager.getProductCategoryExists(roleProof, productCategoryId), "MaterialManager: Product category does not exist");

        uint256 materialId = _counter.current() + 1;
        _counter.increment();
        Material memory newMaterial = Material(materialId, productCategoryId, true);
        _materials[materialId] = newMaterial;
        _createdMaterialIds[_msgSender()].push(materialId);

        emit MaterialRegistered(materialId, productCategoryId);
    }

    function updateMaterial(RoleProof memory roleProof, uint256 id, uint256 productCategoryId) public atLeastEditor(roleProof) {
        require(_materials[id].exists, "MaterialManager: Material does not exist");
        require(_productCategoryManager.getProductCategoryExists(roleProof, productCategoryId), "MaterialManager: Product category does not exist");

        _materials[id].productCategoryId = productCategoryId;
        emit MaterialUpdated(id);
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
