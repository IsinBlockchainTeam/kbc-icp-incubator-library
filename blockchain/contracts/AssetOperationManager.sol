// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./MaterialManager.sol";

contract AssetOperationManager is AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    enum AssetOperationType { CONSOLIDATION, TRANSFORMATION }

    event AssetOperationRegistered(uint256 indexed id, string name, uint256 outputMaterialId);
    event AssetOperationUpdated(uint256 indexed id);

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, _msgSender()), "AssetOperationManager: Caller is not the admin");
        _;
    }

    struct AssetOperation {
        uint256 id;
        string name;
        uint256[] inputMaterialIds;
        uint256 outputMaterialId;
        bool exists;
    }

    Counters.Counter private _counter;
    mapping(address => uint256[]) private _assetOperationIdsOfOwner;
    mapping(uint256 => AssetOperation) private _assetOperations;

    MaterialManager private _materialManager;

    constructor(address materialManagerAddress) {
        _setupRole(ADMIN_ROLE, _msgSender());
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        grantRole(ADMIN_ROLE, _msgSender());

        _materialManager = MaterialManager(materialManagerAddress);
    }

    function getAssetOperationsCounter() public view returns (uint256) {
        return _counter.current();
    }

    function getAssetOperationExists(uint256 id) public view returns (bool) {
        return _assetOperations[id].exists;
    }

    function getAssetOperationIdsOfCreator(address creator) public view returns (uint256[] memory) {
        return _assetOperationIdsOfOwner[creator];
    }

    function getAssetOperation(uint256 id) public view returns (AssetOperation memory) {
        return _assetOperations[id];
    }

    function getAssetOperationType(uint256 id) public view returns (AssetOperationType) {
        require(getAssetOperationExists(id), "AssetOperationManager: Asset operation does not exist");
        return _assetOperations[id].inputMaterialIds.length == 1 ? AssetOperationType.CONSOLIDATION : AssetOperationType.TRANSFORMATION;
    }

    function registerAssetOperation(string memory name, uint256[] memory inputMaterialsIds, uint256 outputMaterialId) public {
        require(_materialManager.getMaterialExists(outputMaterialId), "AssetOperationManager: Output material does not exist");
        require(inputMaterialsIds.length > 0, "AssetOperationManager: inputMaterialsIds array must specify at least one material");
        for(uint256 i = 0; i < inputMaterialsIds.length; i++) {
            require(_materialManager.getMaterialExists(inputMaterialsIds[i]), "AssetOperationManager: Input material does not exist");
        }

        uint256 assetOperationId = _counter.current() + 1;
        _counter.increment();
        AssetOperation memory newAssetOperation = AssetOperation(assetOperationId, name, inputMaterialsIds, outputMaterialId, true);
        _assetOperations[assetOperationId] = newAssetOperation;
        _assetOperationIdsOfOwner[_msgSender()].push(assetOperationId);
        emit AssetOperationRegistered(assetOperationId, name, outputMaterialId);
    }

    function updateAssetOperation(uint256 id, string memory name, uint256[] memory inputMaterialsIds, uint256 outputMaterialId) public {
        require(_assetOperations[id].exists, "AssetOperationManager: Asset operation does not exist");
        require(_materialManager.getMaterialExists(outputMaterialId), "AssetOperationManager: Output material does not exist");
        require(inputMaterialsIds.length > 0, "AssetOperationManager: inputMaterialsIds array must specify at least one material");
        for(uint256 i = 0; i < inputMaterialsIds.length; i++) {
            require(_materialManager.getMaterialExists(inputMaterialsIds[i]), "AssetOperationManager: Input material does not exist");
        }

        _assetOperations[id].name = name;
        _assetOperations[id].inputMaterialIds = inputMaterialsIds;
        _assetOperations[id].outputMaterialId = outputMaterialId;
        emit AssetOperationUpdated(id);
    }

    // ROLES
    function addAdmin(address admin) public onlyAdmin {
        grantRole(ADMIN_ROLE, admin);
    }

    function removeAdmin(address admin) public onlyAdmin {
        revokeRole(ADMIN_ROLE, admin);
    }
}
