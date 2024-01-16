// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./ProductCategoryManager.sol";

contract MaterialManager is AccessControl{
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "MaterialManager: Caller is not the admin");
        _;
    }

    event MaterialRegistered(uint256 indexed id, uint256 productCategoryId);

    struct Material {
        uint256 id;
        uint256 productCategoryId;
        bool exists;
    }

    Counters.Counter private _counter;
    mapping(uint256 => Material) private materials;

    ProductCategoryManager private _productCategoryManager;

    constructor(address productCategoryManagerAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        grantRole(ADMIN_ROLE, _msgSender());


        _productCategoryManager = ProductCategoryManager(productCategoryManagerAddress);
    }

    function getMaterialsCounter() public view returns (uint256) {
        return _counter.current();
    }

    function getMaterialExists(uint256 id) public view returns (bool) {
        return materials[id].exists;
    }

    function getMaterial(uint256 id) public view returns (Material memory) {
        return materials[id];
    }

    function registerMaterial(uint256 productCategoryId) public {
        require(_productCategoryManager.getProductCategoryExists(productCategoryId), "MaterialManager: Product category does not exist");

        uint256 materialId = _counter.current() + 1;
        _counter.increment();
        materials[materialId] = Material(materialId, productCategoryId, true);
        emit MaterialRegistered(materialId, productCategoryId);
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}