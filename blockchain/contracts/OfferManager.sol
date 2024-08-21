// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";
import "./ProductCategoryManager.sol";
import "./KBCAccessControl.sol";

contract OfferManager is AccessControl, KBCAccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event OfferRegistered(uint256 indexed id, address owner);
    event OfferUpdated(uint256 indexed id, address owner);
    event OfferDeleted(uint256 indexed id, address owner);
    event OfferSupplierRegistered(address indexed addr, string name);
    event OfferSupplierUpdated(address indexed addr, string name);
    event OfferSupplierDeleted(address indexed addr);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    struct Offer {
        uint256 id;
        address owner;
        uint256 productCategoryId;

        bool exists;
    }

    Counters.Counter private offersIdCounter;
    // supplier => offer ids
    mapping(address => uint256[]) private offerIds;
    // offer id => offer
    mapping(uint256 => Offer) private offers;
    // supplier => name
    mapping(address=> string) private suppliersNames;

    ProductCategoryManager private productCategoryManager;

    constructor(address delegateManagerAddress, address[] memory admins, address productCategoryAddress) KBCAccessControl(delegateManagerAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        productCategoryManager = ProductCategoryManager(productCategoryAddress);
    }

    function registerSupplier(address addr, string memory name) public {
        require(bytes(suppliersNames[addr]).length == 0, "Offer's supplier already registered");

        suppliersNames[addr] = name;

        emit OfferSupplierRegistered(addr, name);
    }

    function registerOffer(
        RoleProof memory roleProof,
        address owner,
        uint256 productCategoryId
    ) public atLeastEditor(roleProof) {
        require(productCategoryManager.getProductCategoryExists(roleProof, productCategoryId), "OfferManager: Product category does not exist");
        require(bytes(suppliersNames[owner]).length != 0, "OfferManager: Offer's supplier not registered");
        uint256 offerId = offersIdCounter.current() + 1;
        offersIdCounter.increment();

        Offer storage offer = offers[offerId];
        offer.id = offerId;
        offer.owner = owner;
        offer.productCategoryId = productCategoryId;
        offer.exists = true;

        offerIds[owner].push(offerId);

        emit OfferRegistered(offerId, owner);
    }

    function getLastId(RoleProof memory roleProof) public view atLeastViewer(roleProof) returns (uint256) {
        return offersIdCounter.current();
    }

    function getOfferIdsByCompany(
        RoleProof memory roleProof,
        address owner
    ) public view atLeastViewer(roleProof) returns (uint256[] memory) {
        return offerIds[owner];
    }

    function getSupplierName(
        RoleProof memory roleProof,
        address addr
    ) public view atLeastViewer(roleProof) returns (string memory) {
        return suppliersNames[addr];
    }

    function getOffer(
        RoleProof memory roleProof,
        uint256 offerId
    ) public view atLeastViewer(roleProof) returns (Offer memory) {
        Offer storage offer = offers[offerId];
        require(offer.exists, "Offer does not exist");

        return offer;
    }

    function updateSupplier(
        RoleProof memory roleProof,
        address addr,
        string memory newName
    ) public atLeastEditor(roleProof) {
        require(bytes(suppliersNames[addr]).length != 0, "Offer's supplier not registered");

        suppliersNames[addr] = newName;

        emit OfferSupplierUpdated(addr, newName);
    }

    function updateOffer(
        RoleProof memory roleProof,
        uint256 offerId,
        uint256 productCategoryId
    ) public atLeastEditor(roleProof) {
        require(productCategoryManager.getProductCategoryExists(roleProof, productCategoryId), "OfferManager: Product category does not exist");
        Offer storage offer = offers[offerId];
        require(offer.exists, "Offer does not exist");

        offer.productCategoryId = productCategoryId;

        emit OfferUpdated(offerId, offer.owner);
    }

    function deleteSupplier(
        RoleProof memory roleProof,
        address addr
    ) public atLeastEditor(roleProof) {
        require(bytes(suppliersNames[addr]).length != 0, "Offer's supplier not registered");
        require(offerIds[addr].length == 0, "A supplier cannot be deleted if it still has active offers");

        delete suppliersNames[addr];

        emit OfferSupplierDeleted(addr);
    }

    function deleteOffer(
        RoleProof memory roleProof,
        uint256 offerId
    ) public atLeastEditor(roleProof) {
        Offer memory offer = offers[offerId];
        require(offer.exists, "Offer does not exist");

        uint256 offerIndexToRemove;
        for (uint256 i = 0; i < offerIds[offer.owner].length; i++) {
            if (offerIds[offer.owner][i] == offerId) {
                offerIndexToRemove = i;
                break;
            }
        }
        offerIds[offer.owner][offerIndexToRemove] = offerIds[offer.owner][offerIds[offer.owner].length - 1];
        offerIds[offer.owner].pop();

        delete offers[offerId];

        emit OfferDeleted(offerId, offer.owner);
    }


    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
