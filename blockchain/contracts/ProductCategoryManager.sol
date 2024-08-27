// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./KBCAccessControl.sol";

contract ProductCategoryManager is AccessControl, KBCAccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "ProductCategoryManager: Caller is not the admin");
        _;
    }

    event ProductCategoryRegistered(uint256 indexed id, string name, uint8 quality);
    event ProductCategoryUpdated(uint256 indexed id);

    struct ProductCategory {
        uint256 id;
        string name;
        uint8 quality;
        string description;
        bool exists;
    }

    Counters.Counter private _counter;
    mapping(uint256 => ProductCategory) private productCategories;

    constructor(address delegateManagerAddress) KBCAccessControl(delegateManagerAddress) {
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        grantRole(ADMIN_ROLE, _msgSender());
    }

    function getProductCategoriesCounter(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (uint256) {
        return _counter.current();
    }

    function getProductCategoryExists(RoleProof memory roleProof, uint256 id) public view atLeastViewer(roleProof) returns (bool) {
        return productCategories[id].exists;
    }

    function getProductCategory(RoleProof memory roleProof, uint256 id) public view atLeastViewer(roleProof) returns (ProductCategory memory) {
        return productCategories[id];
    }

    function registerProductCategory(RoleProof memory roleProof, string memory name, uint8 quality, string memory description) public atLeastEditor(roleProof) {
        uint256 productCategoryId = _counter.current() + 1;
        _counter.increment();
        productCategories[productCategoryId] = ProductCategory(productCategoryId, name, quality, description, true);
        emit ProductCategoryRegistered(productCategoryId, name, quality);
    }

    function updateProductCategory(RoleProof memory roleProof, uint256 id, string memory name, uint8 quality, string memory description) public atLeastEditor(roleProof) {
        require(productCategories[id].exists, "ProductCategoryManager: Product category does not exist");
        productCategories[id].name = name;
        productCategories[id].quality = quality;
        productCategories[id].description = description;

        emit ProductCategoryUpdated(id);
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
