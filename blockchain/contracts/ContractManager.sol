// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@blockchain-lib/blockchain-common/contracts/EnumerableType.sol";

contract ContractManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORDER_MANAGER_ROLE = keccak256("ORDER_MANAGER_ROLE");

    enum ContractStatus{INITIALIZED, PENDING, COMPLETED}

    event ContractRegistered(uint256 indexed id, address supplier);
    event ContractLineAdded(uint256 indexed id, address supplier, uint256 contractLineId);
    event ContractLineUpdated(uint256 indexed id, address supplier, uint256 contractLineId);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "Caller is not the admin");
        _;
    }

    struct ContractLinePrice {
        uint256 amount;
        uint256 decimals;
        string fiat;
    }

    struct ContractLine {
        uint256 id;
        string productCategory;
        uint256 quantity;
        ContractLinePrice price;
        bool exists;
    }

    struct Contract {
        uint256 id;
        uint256[] lineIds;
        mapping(uint256 => ContractLine) lines;
        address supplier;
        address customer;
        address offeror;
        //        TODO: pensare ad un map (supplier -> sign) per le firme (permetterebbe la gestione di firme da parte di più entità)
        bool offerorSigned;
        address offeree;
        bool offereeSigned;
        string externalUrl;
        bool exists;
    }

    // supplier => contract id => contract
    mapping(address => mapping(uint256 => Contract)) private contracts;
    // supplier => contract id counter (the ids are different per each supplier, not unique in general)
    mapping(address => Counters.Counter) private contractsCounter;
    // supplier => contract line id counter
    mapping(address => Counters.Counter) private contractLinesCounter;

    EnumerableType fiatManager;
    EnumerableType productCategoryManager;

    constructor(address[] memory admins, address fiatManagerAddress, address productCategoryAddress) {
        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(ORDER_MANAGER_ROLE, ADMIN_ROLE);

        for (uint256 i = 0; i < admins.length; ++i) {
            grantRole(ADMIN_ROLE, admins[i]);
        }

        fiatManager = EnumerableType(fiatManagerAddress);
        productCategoryManager = EnumerableType(productCategoryAddress);
    }

    function registerContract(address supplier, address customer, address offeree, string memory externalUrl) public {
        require(supplier == msg.sender || customer == msg.sender, "Sender is neither supplier nor customer");

        Counters.Counter storage contractCounter = contractsCounter[supplier];
        uint256 contractId = contractCounter.current() + 1;
        contractCounter.increment();

        Contract storage newContract = contracts[supplier][contractId];
        newContract.id = contractId;
        newContract.externalUrl = externalUrl;
        newContract.supplier = supplier;
        newContract.customer = customer;
        newContract.offeror = msg.sender;
        newContract.offeree = offeree;
        newContract.exists = true;

        emit ContractRegistered(contractId, supplier);
    }

    function getContractCounter(address supplier) public view returns (uint256 counter) {
        return contractsCounter[supplier].current();
    }

    function confirmContract(address supplier, uint256 contractId) public {
        Contract storage c = contracts[supplier][contractId];
        require(msg.sender == c.offeree || msg.sender == c.offeror, "Only an offeree or an offeror can confirm the contract");

        if (msg.sender == c.offeror) {
            c.offerorSigned = true;
        }
        else {
            c.offereeSigned = true;
        }
    }

    function contractExists(address supplier, uint256 contractId) public view returns (bool) {
        return contracts[supplier][contractId].exists;
    }

    function getContractStatus(address supplier, uint256 contractId) public view returns (ContractStatus contractStatus) {
        require(contracts[supplier][contractId].exists, "Contract does not exist");

        if (!contracts[supplier][contractId].offereeSigned && !contracts[supplier][contractId].offerorSigned) {
            return ContractStatus.INITIALIZED;
        } else if (contracts[supplier][contractId].offerorSigned && contracts[supplier][contractId].offereeSigned) {
            return ContractStatus.COMPLETED;
        } else {
            return ContractStatus.PENDING;
        }
    }

    function getContractInfo(address contractSupplier, uint256 contractId) public view returns (uint256 id, address supplier, address customer, address offeree, address offeror, string memory externalUrl, uint256[] memory lineIds) {
        require(contracts[contractSupplier][contractId].exists, "Contract does not exist");

        return (contracts[contractSupplier][contractId].id, contracts[contractSupplier][contractId].supplier, contracts[contractSupplier][contractId].customer,
            contracts[contractSupplier][contractId].offeree, contracts[contractSupplier][contractId].offeror, contracts[contractSupplier][contractId].externalUrl, contracts[contractSupplier][contractId].lineIds);
    }

    function isSupplierOrCustomer(address supplier, uint256 contractId, address sender) public view returns (bool) {
        return contracts[supplier][contractId].supplier == sender || contracts[supplier][contractId].customer == sender;
    }

    function getContractLine(address supplier, uint256 contractId, uint256 contractLineId) public view returns (ContractLine memory contractLine) {
        require(contracts[supplier][contractId].exists, "Contract does not exist");

        ContractLine memory cL = contracts[supplier][contractId].lines[contractLineId];
        require(cL.exists, "Contract line does not exist");

        return (cL);
    }

    function contractLineExists(address supplier, uint256 contractId, uint256 contractLineId) public view returns (bool) {
        return contracts[supplier][contractId].lines[contractLineId].exists;
    }

    function updateContractLine(address supplier, uint256 contractId, uint256 contractLineId, ContractLine memory contractLine) public {
        Contract storage c = contracts[supplier][contractId];
        require(c.exists, "Contract does not exist");
        require(c.offeree == msg.sender || c.offeror == msg.sender, "Sender is neither offeree nor offeror");
        require(getContractStatus(supplier, contractId) != ContractStatus.COMPLETED, "The contract has been confirmed, it cannot be changed");
        require(fiatManager.contains(contractLine.price.fiat), "The fiat of the contract line isn't registered");

        contractLine.id = c.lines[contractLineId].id;
        c.lines[contractLineId] = contractLine;

        _updateSignatures(msg.sender, c);

        emit ContractLineUpdated(contractId, supplier, contractLineId);
    }

    function addContractLine(address supplier, uint256 contractId, ContractLine memory contractLine) public {
        Contract storage c = contracts[supplier][contractId];
        require(c.exists, "Contract does not exist");
        require(c.offeree == msg.sender || c.offeror == msg.sender, "Sender is neither offeree nor offeror");
        require(getContractStatus(supplier, contractId) != ContractStatus.COMPLETED, "The contract has been confirmed, it cannot be changed");
        require(fiatManager.contains(contractLine.price.fiat), "The fiat of the contract line isn't registered");

        Counters.Counter storage contractLineCounter = contractLinesCounter[supplier];
        uint256 contractLineId = contractLineCounter.current() + 1;
        contractLineCounter.increment();
        contractLine.id = contractLineId;
        c.lineIds.push(contractLineId);
        c.lines[contractLineId] = contractLine;

        _updateSignatures(msg.sender, c);

        emit ContractLineAdded(contractId, supplier, contractLineId);
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }

    function _updateSignatures(address sender, Contract storage c) private {
        if (sender == c.offeree) {
            c.offereeSigned = true;
            c.offerorSigned = false;
        }
        else {
            c.offereeSigned = false;
            c.offerorSigned = true;
        }
    }
}
