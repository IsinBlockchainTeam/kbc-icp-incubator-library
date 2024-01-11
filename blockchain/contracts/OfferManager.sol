// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";

contract OfferManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    event OfferRegistered(uint256 indexed id, address owner);
    event OfferUpdated(uint256 indexed id, address owner);
    event OfferDeleted(uint256 indexed id, address owner);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    struct Offer {
        uint256 id;
        address owner;
        string productCategory;

        bool exists;
    }

    Counters.Counter private offersIdCounter;
    // supplier => offer ids
    mapping(address => uint256[]) private offerIds;
    // offer id => offer
    mapping(uint256 => Offer) private offers;

    EnumerableType private productCategoryManager;

    constructor(address[] memory admins, address productCategoryAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        productCategoryManager = EnumerableType(productCategoryAddress);
    }

    function registerOffer(address owner, string memory productCategory) public {
        require(productCategoryManager.contains(productCategory), "The product category specified isn't registered");

        uint256 offerId = offersIdCounter.current() + 1;
        offersIdCounter.increment();

        Offer storage offer = offers[offerId];
        offer.id = offerId;
        offer.owner = owner;
        offer.productCategory = productCategory;
        offer.exists = true;

        offerIds[owner].push(offerId);

        emit OfferRegistered(offerId, owner);
    }

    function getLastId() public view returns (uint256) {
        return offersIdCounter.current();
    }

    function getOfferIdsByCompany(address owner) public view returns (uint256[] memory) {
        return offerIds[owner];
    }

    function getOffer(uint256 offerId) public view returns (Offer memory) {
        Offer storage offer = offers[offerId];
        require(offer.exists, "Offer does not exist");

        return offer;
    }

    function updateOffer(uint256 offerId, string memory productCategory) public {
        Offer storage offer = offers[offerId];
        require(productCategoryManager.contains(productCategory), "The product category specified isn't registered");
        require(offer.exists, "Offer does not exist");

        offer.productCategory = productCategory;

        emit OfferUpdated(offerId, offer.owner);
    }

    function deleteOffer(uint256 offerId) public {
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
