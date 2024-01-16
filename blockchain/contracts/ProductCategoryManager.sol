// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ProductCategoryManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "ProductCategoryManager: Caller is not the admin");
        _;
    }

    event ProductCategoryRegistered(uint256 indexed id, string name, uint8 quality);

    struct ProductCategory {
        uint256 id;
        string name;
        uint8 quality;
        string description;
        bool exists;
    }

    Counters.Counter private _counter;
    mapping(uint256 => ProductCategory) private productCategories;

    constructor() {
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        grantRole(ADMIN_ROLE, _msgSender());
    }

    function getProductCategoriesCounter() public view returns (uint256) {
        return _counter.current();
    }

    function getProductCategoryExists(uint256 id) public view returns (bool) {
        return productCategories[id].exists;
    }

    function getProductCategory(uint256 id) public view returns (ProductCategory memory) {
        return productCategories[id];
    }

    function registerProductCategory(string memory name, uint8 quality, string memory description) public {
        uint256 productCategoryId = _counter.current() + 1;
        _counter.increment();
        productCategories[productCategoryId] = ProductCategory(productCategoryId, name, quality, description, true);
        emit ProductCategoryRegistered(productCategoryId, name, quality);
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}